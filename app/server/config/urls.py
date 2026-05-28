from django.urls import include, path


urlpatterns = [
    path("", include("apps.platform.api.urls")),
]
