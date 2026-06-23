from django.urls import path
from .views import predict_spam

urlpatterns = [
    path('predict/', predict_spam, name='predict_spam'),
]
