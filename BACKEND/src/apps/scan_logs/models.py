from django.db import models


class ScanLog(models.Model):
    class ScanType(models.TextChoices):
        URL = 'url', 'URL Scan'
        EMAIL = 'email', 'Email Scan'
        METADATA = 'metadata', 'Metadata Fetch'
        SPAM = 'spam', 'Spam Detection'

    scan_type = models.CharField(max_length=20, choices=ScanType.choices)
    input_value = models.TextField()
    result = models.TextField(blank=True, default='')
    is_threat = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_scan_type_display()}] {self.input_value[:80]}"
