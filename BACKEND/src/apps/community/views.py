from django.contrib.auth import get_user_model  # type: ignore
from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from .models import Question, Answer
from .serializers import QuestionSerializer, AnswerSerializer

User = get_user_model()


class CommunityPagination(PageNumberPagination):
    page_size = 10


def _truthy(value):
    return str(value).lower() in ('1', 'true', 'yes')


class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = CommunityPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['viewer_email'] = self.request.query_params.get('viewer_email', '')
        context['is_admin'] = _truthy(self.request.query_params.get('is_admin', ''))
        return context

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else User.objects.get_or_create(username='guest')[0]
        author_email = (self.request.data.get('author_email') or '').strip().lower()
        serializer.save(author=user, author_email=author_email)


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
        author_email = (self.request.data.get('author_email') or '').strip().lower()
        serializer.save(author=user, question=question, author_email=author_email)


class QuestionDeleteView(generics.DestroyAPIView):
    queryset = Question.objects.all()
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        # Deleting a question is admin-only.
        if not _truthy(self.request.query_params.get('is_admin', '')):
            raise PermissionDenied('Only an admin can delete a question.')
        instance.delete()


class AnswerDeleteView(generics.DestroyAPIView):
    queryset = Answer.objects.all()
    permission_classes = [permissions.AllowAny]

    def perform_destroy(self, instance):
        is_admin = _truthy(self.request.query_params.get('is_admin', ''))
        requester_email = (self.request.query_params.get('requester_email') or '').strip().lower()
        owns_answer = bool(requester_email) and requester_email == (instance.author_email or '').strip().lower()
        if not (is_admin or owns_answer):
            raise PermissionDenied('You can only delete your own answers.')
        instance.delete()
