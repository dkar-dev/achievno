from django.urls import path

from apps.challenges.api.views import (
    ChallengeCompleteView,
    ChallengeDetailView,
    ChallengeJoinView,
    ChallengeProgressView,
    ChallengesView,
)


urlpatterns = [
    path("", ChallengesView.as_view(), name="challenges"),
    path("<uuid:challenge_id>", ChallengeDetailView.as_view(), name="challenge-detail"),
    path("<uuid:challenge_id>/join", ChallengeJoinView.as_view(), name="challenge-join"),
    path("<uuid:challenge_id>/progress", ChallengeProgressView.as_view(), name="challenge-progress"),
    path("<uuid:challenge_id>/complete", ChallengeCompleteView.as_view(), name="challenge-complete"),
]
