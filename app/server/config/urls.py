from django.urls import include, path


urlpatterns = [
    path("api/v1/auth/", include("apps.accounts.api.urls")),
    path("", include("apps.platform.api.urls")),
]
