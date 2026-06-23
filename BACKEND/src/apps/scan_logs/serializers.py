from rest_framework import serializers
from .models import ScanLog


class ScanLogSerializer(serializers.ModelSerializer):
    scan_type_display = serializers.CharField(source='get_scan_type_display', read_only=True)

    class Meta:
        model = ScanLog
        fields = ['id', 'scan_type', 'scan_type_display', 'input_value', 'result', 'is_threat', 'ip_address', 'created_at']
