from django.conf import settings
from django.db import models


class GmailCredentials(models.Model):
    """Stores Gmail OAuth refresh token per session identifier."""

    session_key = models.CharField(max_length=255, unique=True)
    refresh_token = models.TextField()
    token_uri = models.CharField(max_length=255, default="https://oauth2.googleapis.com/token")
    scopes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"GmailCredentials(session={self.session_key[:8]}...)"