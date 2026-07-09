from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Question(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    # Real per-user auth isn't wired between Supabase and Django here, so
    # `author` above is always a shared "guest" account. Store the actual
    # Supabase account email so a user can be shown a delete option only on
    # their own posts.
    author_email = models.EmailField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    body = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    author_email = models.EmailField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer by {self.author} on {self.question}"