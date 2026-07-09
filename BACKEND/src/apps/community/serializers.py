from rest_framework import serializers
from .models import Question, Answer


class AnswerSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ['id', 'body', 'author_username', 'created_at', 'can_delete']

    def get_can_delete(self, obj):
        if self.context.get('is_admin'):
            return True
        viewer_email = (self.context.get('viewer_email') or '').strip().lower()
        return bool(viewer_email) and viewer_email == (obj.author_email or '').strip().lower()


class QuestionSerializer(serializers.ModelSerializer):
    # Regular users may only delete their own answers, not questions —
    # deleting a question is admin-only.
    author_username = serializers.CharField(source='author.username', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'title', 'body', 'author_username', 'created_at', 'answers', 'can_delete']

    def get_can_delete(self, obj):
        return bool(self.context.get('is_admin'))
