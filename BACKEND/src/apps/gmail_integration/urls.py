from django.urls import path

from . import views


urlpatterns = [
    path("oauth2/start/", views.connect_gmail, name="gmail_connect"),
    # Use callback without trailing slash to match GOOGLE_REDIRECT_URI exactly.
    path("oauth2/callback", views.gmail_oauth_callback, name="gmail_oauth_callback"),
    path("scan/", views.scan_gmail_senders, name="gmail_scan_senders"),
]
