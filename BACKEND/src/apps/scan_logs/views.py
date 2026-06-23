from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import ScanLog
from .serializers import ScanLogSerializer


class ScanLogListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        scan_type = request.query_params.get('type')
        qs = ScanLog.objects.all()
        if scan_type:
            qs = qs.filter(scan_type=scan_type)
        qs = qs[:200]
        serializer = ScanLogSerializer(qs, many=True)
        return Response(serializer.data)


class ScanLogStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db.models import Count, Q
        stats = ScanLog.objects.aggregate(
            total=Count('id'),
            url_scans=Count('id', filter=Q(scan_type='url')),
            email_scans=Count('id', filter=Q(scan_type='email')),
            metadata_scans=Count('id', filter=Q(scan_type='metadata')),
            spam_scans=Count('id', filter=Q(scan_type='spam')),
            threats_found=Count('id', filter=Q(is_threat=True)),
        )
        return Response(stats)
