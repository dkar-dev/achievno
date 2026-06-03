from django.urls import path

from apps.groups.api.views import (
    DemoGroupJoinView,
    GroupAchievementsView,
    GroupDetailView,
    GroupInviteAcceptView,
    GroupInviteDetailView,
    GroupInvitesView,
    GroupJoinView,
    GroupMembersView,
    GroupsView,
)


urlpatterns = [
    path("", GroupsView.as_view(), name="groups"),
    path("join-demo", DemoGroupJoinView.as_view(), name="groups-join-demo"),
    path("invites/<str:token>", GroupInviteDetailView.as_view(), name="group-invite-detail"),
    path("invites/<str:token>/accept", GroupInviteAcceptView.as_view(), name="group-invite-accept"),
    path("<uuid:group_id>", GroupDetailView.as_view(), name="group-detail"),
    path("<uuid:group_id>/join", GroupJoinView.as_view(), name="group-join"),
    path("<uuid:group_id>/members", GroupMembersView.as_view(), name="group-members"),
    path("<uuid:group_id>/invites", GroupInvitesView.as_view(), name="group-invites"),
    path("<uuid:group_id>/achievements", GroupAchievementsView.as_view(), name="group-achievements"),
]
