from django.urls import include, path


urlpatterns = [
    path("api/v1/auth/", include("apps.accounts.api.urls")),
    path("api/v1/achievements/", include("apps.achievements.api.urls")),
    path("", include("apps.platform.api.urls")),
]
