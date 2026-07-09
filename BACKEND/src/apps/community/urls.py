from django.urls import path
from .views import QuestionListCreateView, AnswerCreateView, QuestionDeleteView, AnswerDeleteView

urlpatterns = [
    path('questions/', QuestionListCreateView.as_view(), name='question-list-create'),
    path('questions/<int:pk>/', QuestionDeleteView.as_view(), name='question-delete'),
    path('answers/', AnswerCreateView.as_view(), name='answer-create'),
    path('answers/<int:pk>/', AnswerDeleteView.as_view(), name='answer-delete'),
]
