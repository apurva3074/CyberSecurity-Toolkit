from rest_framework import serializers
from .models import Question, Answer

class AnswerSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    class Meta:
        model = Answer
        fields = ['id', 'body', 'author_username', 'created_at']

class QuestionSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'title', 'body', 'author_username', 'created_at', 'answers']
