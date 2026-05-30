from django.urls import include, path

from apps.challenges.api.views import ChallengesView


urlpatterns = [
    path("api/v1/auth/", include("apps.accounts.api.urls")),
    path("api/v1/achievements/", include("apps.achievements.api.urls")),
    path("api/v1/friends/", include("apps.friends.api.urls")),
    path("api/v1/groups/", include("apps.groups.api.urls")),
    path("api/v1/challenges", ChallengesView.as_view(), name="challenges-no-slash"),
    path("api/v1/challenges/", include("apps.challenges.api.urls")),
    path("", include("apps.platform.api.urls")),
]
