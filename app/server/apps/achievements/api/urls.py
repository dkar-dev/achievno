from django.urls import path

from apps.achievements.api.views import (
    PersonalAchievementArchiveView,
    PersonalAchievementCompleteView,
    PersonalAchievementDetailView,
    PersonalAchievementProgressView,
    PersonalAchievementsView,
)


urlpatterns = [
    path("personal", PersonalAchievementsView.as_view(), name="personal-achievements"),
    path("<uuid:achievement_id>", PersonalAchievementDetailView.as_view(), name="personal-achievement-detail"),
    path(
        "<uuid:achievement_id>/progress",
        PersonalAchievementProgressView.as_view(),
        name="personal-achievement-progress",
    ),
    path(
        "<uuid:achievement_id>/complete",
        PersonalAchievementCompleteView.as_view(),
        name="personal-achievement-complete",
    ),
    path(
        "<uuid:achievement_id>/archive",
        PersonalAchievementArchiveView.as_view(),
        name="personal-achievement-archive",
    ),
]
