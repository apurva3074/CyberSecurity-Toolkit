from django.urls import path
from .views import QuestionListCreateView, AnswerCreateView

urlpatterns = [
    path('questions/', QuestionListCreateView.as_view(), name='question-list-create'),
    path('answers/', AnswerCreateView.as_view(), name='answer-create'),
]
