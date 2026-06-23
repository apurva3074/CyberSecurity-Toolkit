from django.urls import path
from .views import PhishingPredictView

urlpatterns = [
    path('predict/', PhishingPredictView.as_view(), name='phishing-predict'),
]
