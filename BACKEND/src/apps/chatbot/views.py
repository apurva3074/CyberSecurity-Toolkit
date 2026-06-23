from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.conf import settings
import google.generativeai as genai

SYSTEM_PROMPT = (
    "You are SecBot, a friendly and knowledgeable cybersecurity assistant for the Zentrya platform. "
    "You help users understand cybersecurity concepts, guide them through the platform's tools "
    "(URL Scanner, Email Scanner, Metadata Fetcher, Takedown Request), and answer security-related questions. "
    "Keep responses concise (2-4 sentences), helpful, and easy to understand. "
    "If a question is not related to cybersecurity, politely redirect the user."
)


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return Response(
                {'error': 'Gemini API key not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name='gemini-2.0-flash',
                system_instruction=SYSTEM_PROMPT,
            )
            response = model.generate_content(user_message)
            return Response({'response': response.text})
        except Exception as exc:
            return Response(
                {'error': 'Failed to get response from AI', 'detail': str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )