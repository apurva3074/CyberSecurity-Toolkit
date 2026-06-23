import uuid
from urllib.parse import urlencode
from email.utils import parseaddr

from django.conf import settings
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import redirect

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from .models import GmailCredentials
from .sender_model import predict_sender


FRONTEND_URL = 'http://localhost:5173'


def _build_flow(redirect_uri=None):
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "project_id": "toolkit-backend",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uris": [redirect_uri or settings.GOOGLE_REDIRECT_URI],
        }
    }
    scopes = settings.GOOGLE_GMAIL_SCOPE.split()
    return Flow.from_client_config(
        client_config,
        scopes=scopes,
        redirect_uri=redirect_uri or settings.GOOGLE_REDIRECT_URI,
        autogenerate_code_verifier=False,
    )


def connect_gmail(request: HttpRequest) -> HttpResponse:
    token = str(uuid.uuid4())
    request.session["gmail_oauth_state"] = token
    request.session["gmail_token"] = token

    flow = _build_flow()
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=token,
    )
    return redirect(authorization_url)


def gmail_oauth_callback(request: HttpRequest) -> HttpResponse:
    state = request.GET.get("state")
    stored_state = request.session.get("gmail_oauth_state")

    if not state or (stored_state and state != stored_state):
        return HttpResponseBadRequest("OAuth state mismatch")

    flow = _build_flow()
    try:
        flow.fetch_token(authorization_response=request.build_absolute_uri())
    except Exception as exc:
        return HttpResponseBadRequest(f"OAuth token exchange failed: {exc}")

    credentials = flow.credentials
    if not credentials.refresh_token:
        return HttpResponseBadRequest("No refresh token returned from Google")

    gmail_token = request.session.get("gmail_token", state)

    GmailCredentials.objects.update_or_create(
        session_key=gmail_token,
        defaults={
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "scopes": " ".join(credentials.scopes or []),
        },
    )

    request.session.pop("gmail_oauth_state", None)

    return redirect(f"{FRONTEND_URL}/dashboard?gmail_connected=1&gmail_token={gmail_token}")


def scan_gmail_senders(request: HttpRequest) -> HttpResponse:
    gmail_token = request.GET.get("token") or request.headers.get("X-Gmail-Token")
    if not gmail_token:
        return JsonResponse({"detail": "Gmail not connected. No token provided."}, status=400)

    try:
        creds_record = GmailCredentials.objects.get(session_key=gmail_token)
    except GmailCredentials.DoesNotExist:
        return JsonResponse({"detail": "Gmail not connected"}, status=400)

    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return JsonResponse({"detail": "Google OAuth not configured"}, status=500)

    scopes = settings.GOOGLE_GMAIL_SCOPE.split()
    creds = Credentials(
        None,
        refresh_token=creds_record.refresh_token,
        token_uri=creds_record.token_uri,
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=scopes,
    )

    try:
        service = build("gmail", "v1", credentials=creds)
    except Exception as exc:
        return JsonResponse({"detail": f"Failed to connect to Gmail: {exc}"}, status=502)

    try:
        max_results = min(int(request.GET.get("max_results", 20)), 50)
    except (ValueError, TypeError):
        max_results = 20

    try:
        messages_response = (
            service.users()
            .messages()
            .list(userId="me", maxResults=max_results)
            .execute()
        )
    except Exception as exc:
        return JsonResponse({"detail": f"Failed to fetch messages: {exc}"}, status=502)

    messages = messages_response.get("messages", [])
    results = []

    for message in messages:
        try:
            msg = (
                service.users()
                .messages()
                .get(
                    userId="me",
                    id=message["id"],
                    format="metadata",
                    metadataHeaders=["From", "Subject", "Return-Path", "Reply-To"],
                )
                .execute()
            )
            headers = {h["name"].lower(): h["value"] for h in msg.get("payload", {}).get("headers", [])}
            raw_from = headers.get("from", "")
            _, sender_email = parseaddr(raw_from)
            sender_email = sender_email or raw_from

            prediction = predict_sender(sender_email)

            results.append({
                "id": message["id"],
                "from": raw_from,
                "subject": headers.get("subject", ""),
                "sender_email": prediction.get("email"),
                "phishing_probability": prediction.get("phishing_probability"),
                "verdict": prediction.get("verdict"),
            })
        except Exception:
            continue

    return JsonResponse({"messages": results})