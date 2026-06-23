from .models import ScanLog


def log_scan(scan_type, input_value, result='', is_threat=False, request=None):
    ip = None
    if request:
        ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
    ScanLog.objects.create(
        scan_type=scan_type,
        input_value=input_value[:2000],
        result=result[:2000],
        is_threat=is_threat,
        ip_address=ip,
    )
