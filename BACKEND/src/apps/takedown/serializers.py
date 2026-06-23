from rest_framework import serializers
from .models import TakedownRequest


class TakedownSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TakedownRequest
        fields = ['id', 'malicious_url', 'description', 'screenshot', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


class TakedownDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TakedownRequest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']