from django.contrib.auth import get_user_model  # type: ignore
from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from .models import Question, Answer
from .serializers import QuestionSerializer, AnswerSerializer

User = get_user_model()


class CommunityPagination(PageNumberPagination):
    page_size = 10


class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CommunityPagination

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else User.objects.get_or_create(username='guest')[0]
        serializer.save(author=user)


class AnswerCreateView(generics.CreateAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        question_id = self.request.data.get('question')
        try:
            question = Question.objects.get(id=question_id)
        except (Question.DoesNotExist, ValueError, TypeError):
            raise NotFound('Question not found.')
        user = self.request.user if self.request.user.is_authenticated else User.objects.get_or_create(username='guest')[0]
        serializer.save(author=user, question=question)