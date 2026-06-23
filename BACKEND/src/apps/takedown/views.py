from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TakedownRequest
from .serializers import TakedownSubmitSerializer, TakedownDetailSerializer
from .utils import identify_hosting_provider, generate_abuse_email


class TakedownSubmitView(APIView):
    """User submits a takedown request with URL, description, and optional screenshot."""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = TakedownSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            instance = serializer.save()
        except Exception as exc:
            return Response({'error': f'Failed to save request: {exc}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            hosting_info = identify_hosting_provider(instance.malicious_url)
            instance.hosting_provider = hosting_info.get('hosting_provider', '')
            instance.abuse_email = hosting_info.get('abuse_email', '')
            instance.save(update_fields=['hosting_provider', 'abuse_email'])
        except Exception:
            pass

        return Response({
            'message': 'Takedown request submitted successfully. It will be reviewed by our admin team.',
            'id': instance.id,
            'status': instance.status,
            'hosting_provider': instance.hosting_provider,
            'abuse_email': instance.abuse_email,
        }, status=status.HTTP_201_CREATED)


class TakedownListView(APIView):
    """List all takedown requests (public: user sees their own overview)."""
    permission_classes = [AllowAny]

    def get(self, request):
        requests_qs = TakedownRequest.objects.all()
        serializer = TakedownSubmitSerializer(requests_qs, many=True)
        return Response(serializer.data)


class TakedownDetailView(APIView):
    """Get details of a single takedown request."""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            obj = TakedownRequest.objects.get(pk=pk)
        except TakedownRequest.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TakedownDetailSerializer(obj)
        return Response(serializer.data)


class TakedownApproveView(APIView):
    """Admin approves a takedown request and generates the abuse email."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            obj = TakedownRequest.objects.get(pk=pk)
        except TakedownRequest.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        obj.status = TakedownRequest.Status.APPROVED
        obj.admin_notes = request.data.get('admin_notes', '')
        obj.email_body = generate_abuse_email(obj)
        obj.save(update_fields=['status', 'admin_notes', 'email_body'])

        return Response({
            'message': 'Request approved. Abuse email generated.',
            'email_body': obj.email_body,
            'abuse_email': obj.abuse_email,
        })


class TakedownRejectView(APIView):
    """Admin rejects a takedown request."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            obj = TakedownRequest.objects.get(pk=pk)
        except TakedownRequest.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        obj.status = TakedownRequest.Status.REJECTED
        obj.admin_notes = request.data.get('admin_notes', '')
        obj.save(update_fields=['status', 'admin_notes'])

        return Response({'message': 'Request rejected.'})


class TakedownSendEmailView(APIView):
    """Send the generated abuse email to the hosting provider."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            obj = TakedownRequest.objects.get(pk=pk)
        except TakedownRequest.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if obj.status != TakedownRequest.Status.APPROVED:
            return Response({'error': 'Request must be approved before sending email.'}, status=status.HTTP_400_BAD_REQUEST)

        if not obj.abuse_email:
            return Response({'error': 'No abuse email found for this hosting provider.'}, status=status.HTTP_400_BAD_REQUEST)

        email_body = request.data.get('email_body', obj.email_body)

        try:
            send_mail(
                subject=f'Abuse Report — Takedown Request for {obj.malicious_url}',
                message=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@zentrya.com',
                recipient_list=[obj.abuse_email],
                fail_silently=False,
            )
            obj.status = TakedownRequest.Status.EMAIL_SENT
            obj.email_body = email_body
            obj.save(update_fields=['status', 'email_body'])

            return Response({'message': f'Abuse email sent to {obj.abuse_email}.'})
        except Exception as exc:
            return Response({'error': f'Failed to send email: {exc}'}, status=status.HTTP_502_BAD_GATEWAY)


class TakedownResolveView(APIView):
    """Mark a takedown request as resolved (website removed)."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            obj = TakedownRequest.objects.get(pk=pk)
        except TakedownRequest.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if obj.status != TakedownRequest.Status.EMAIL_SENT:
            return Response({'error': 'Request must have email sent before resolving.'}, status=status.HTTP_400_BAD_REQUEST)

        obj.status = TakedownRequest.Status.RESOLVED
        obj.save(update_fields=['status'])

        return Response({'message': 'Request marked as resolved. Website takedown confirmed.'})