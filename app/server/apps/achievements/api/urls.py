from django.urls import path

from apps.achievements.api.views import (
    AchievementEvidenceView,
    ApprovalRequestApproveView,
    ApprovalRequestDetailView,
    ApprovalRequestRejectView,
    ApprovalRequestsView,
    PersonalAchievementArchiveView,
    PersonalAchievementCompleteView,
    PersonalAchievementDetailView,
    PersonalAchievementProgressView,
    PersonalAchievementsView,
)


urlpatterns = [
    path("personal", PersonalAchievementsView.as_view(), name="personal-achievements"),
    path("approvals", ApprovalRequestsView.as_view(), name="approval-requests"),
    path(
        "approvals/<uuid:approval_request_id>",
        ApprovalRequestDetailView.as_view(),
        name="approval-request-detail",
    ),
    path(
        "approvals/<uuid:approval_request_id>/approve",
        ApprovalRequestApproveView.as_view(),
        name="approval-request-approve",
    ),
    path(
        "approvals/<uuid:approval_request_id>/reject",
        ApprovalRequestRejectView.as_view(),
        name="approval-request-reject",
    ),
    path("<uuid:achievement_id>", PersonalAchievementDetailView.as_view(), name="personal-achievement-detail"),
    path(
        "<uuid:achievement_id>/evidence",
        AchievementEvidenceView.as_view(),
        name="achievement-evidence",
    ),
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
