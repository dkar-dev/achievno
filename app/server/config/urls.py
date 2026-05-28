from django.urls import path

from apps.platform.api.health import HealthView


urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
]
