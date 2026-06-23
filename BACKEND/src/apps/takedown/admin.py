from django.contrib import admin
from .models import TakedownRequest


@admin.register(TakedownRequest)
class TakedownRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'malicious_url', 'status', 'hosting_provider', 'abuse_email', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['malicious_url', 'description', 'hosting_provider']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['status']
    ordering = ['-created_at']

    fieldsets = (
        ('Request Details', {
            'fields': ('malicious_url', 'description', 'screenshot', 'status')
        }),
        ('Hosting Info', {
            'fields': ('hosting_provider', 'abuse_email')
        }),
        ('Admin Actions', {
            'fields': ('admin_notes', 'email_body')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )