from django.urls import path

from apps.platform.api.health import DatabaseHealthView, HealthView
from apps.platform.api.main import MainAggregateView


urlpatterns = [
    path("api/v1/main", MainAggregateView.as_view(), name="main-aggregate"),
    path("health", HealthView.as_view(), name="health"),
    path("health/db", DatabaseHealthView.as_view(), name="health-db"),
]
