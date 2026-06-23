from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
from mistralai.client import Mistral

SYSTEM_PROMPT = (
    "You are SecBot, a friendly and knowledgeable cybersecurity assistant for the Zentrya platform. "
    "You help users understand cybersecurity concepts, guide them through the platform's tools "
    "(URL Scanner, Email Scanner, Metadata Fetcher, Takedown Request), and answer security-related questions. "
    "Keep responses concise (2-4 sentences), helpful, and easy to understand. "
    "If a question is not related to cybersecurity, politely redirect the user."
)


def get_fallback_reply(user_message):
    input_text = user_message.lower().strip()

    if input_text in {"hi", "hello", "hey", "greetings"}:
        return "Hello! How can I help you today? You can ask about our cybersecurity tools."

    if "what is phishing" in input_text:
        return (
            "Phishing is a scam where attackers pretend to be a trusted source to trick you into "
            "sharing passwords, card details, or other sensitive information."
        )

    if "what tools" in input_text or "available tools" in input_text:
        return (
            "We offer URL Scanner, Email Scanner, Metadata Fetcher, and Takedown Request. "
            "I can also explain what each one does."
        )

    if "scan a url" in input_text or "url scanner" in input_text:
        return (
            "Use the URL Scanner to paste a link and check whether it looks suspicious, phishing-related, "
            "or scam-like."
        )

    if "scan an email" in input_text or "email scanner" in input_text:
        return (
            "Use the Email Scanner to paste or upload an email and check for phishing signs, spoofing, "
            "or suspicious language."
        )

    return (
        "I'm having a temporary AI quota issue right now, but I can still help with cybersecurity basics "
        "or explain the platform tools."
    )


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = settings.MISTRAL_API_KEY
        if not api_key:
            return Response(
                {'error': 'Mistral API key not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            client = Mistral(api_key=api_key)
            response = client.chat.complete(
                model='mistral-small-latest',
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': user_message},
                ],
            )
            reply_text = response.choices[0].message.content
            if not reply_text:
                return Response(
                    {'response': get_fallback_reply(user_message)},
                    status=status.HTTP_200_OK,
                )
            return Response({'response': reply_text})
        except Exception as exc:
            error_text = str(exc)
            if "429" in error_text or "quota" in error_text.lower():
                return Response(
                    {'response': get_fallback_reply(user_message)},
                    status=status.HTTP_200_OK,
                )
            return Response(
                {'error': 'Failed to get response from AI', 'detail': str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
