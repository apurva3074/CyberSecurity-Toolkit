from django.urls import path
from .views import ScanLogListView, ScanLogStatsView

urlpatterns = [
    path('list/', ScanLogListView.as_view(), name='scanlog-list'),
    path('stats/', ScanLogStatsView.as_view(), name='scanlog-stats'),
]
