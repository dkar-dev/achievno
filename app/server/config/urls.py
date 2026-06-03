from django.urls import include, path

from apps.challenges.api.views import ChallengesView
from apps.groups.api.views import GroupInviteAcceptView, GroupInviteDetailView


urlpatterns = [
    path("api/v1/auth/", include("apps.accounts.api.urls")),
    path("api/v1/achievements/", include("apps.achievements.api.urls")),
    path("api/v1/friends/", include("apps.friends.api.urls")),
    path("api/v1/groups/", include("apps.groups.api.urls")),
    path("api/v1/group-invites/<str:token>", GroupInviteDetailView.as_view(), name="group-invite-detail-root"),
    path("api/v1/group-invites/<str:token>/accept", GroupInviteAcceptView.as_view(), name="group-invite-accept-root"),
    path("api/v1/challenges", ChallengesView.as_view(), name="challenges-no-slash"),
    path("api/v1/challenges/", include("apps.challenges.api.urls")),
    path("", include("apps.platform.api.urls")),
]
