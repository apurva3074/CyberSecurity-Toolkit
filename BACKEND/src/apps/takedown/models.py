from django.db import models


class TakedownRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        EMAIL_SENT = 'email_sent', 'Email Sent to Host'
        RESOLVED = 'resolved', 'Website Removed'

    malicious_url = models.URLField(max_length=2048)
    description = models.TextField()
    screenshot = models.ImageField(upload_to='takedown_screenshots/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    hosting_provider = models.CharField(max_length=255, blank=True, default='')
    abuse_email = models.EmailField(blank=True, default='')
    admin_notes = models.TextField(blank=True, default='')
    email_body = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_status_display()}] {self.malicious_url}"