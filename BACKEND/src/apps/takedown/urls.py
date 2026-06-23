from django.urls import path
from .views import (
    TakedownSubmitView,
    TakedownListView,
    TakedownDetailView,
    TakedownApproveView,
    TakedownRejectView,
    TakedownSendEmailView,
    TakedownResolveView,
)

urlpatterns = [
    path('request/', TakedownSubmitView.as_view(), name='takedown-submit'),
    path('list/', TakedownListView.as_view(), name='takedown-list'),
    path('<int:pk>/', TakedownDetailView.as_view(), name='takedown-detail'),
    path('<int:pk>/approve/', TakedownApproveView.as_view(), name='takedown-approve'),
    path('<int:pk>/reject/', TakedownRejectView.as_view(), name='takedown-reject'),
    path('<int:pk>/send-email/', TakedownSendEmailView.as_view(), name='takedown-send-email'),
    path('<int:pk>/resolve/', TakedownResolveView.as_view(), name='takedown-resolve'),
]