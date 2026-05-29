from django.urls import path

from apps.groups.api.views import (
    DemoGroupJoinView,
    GroupAchievementsView,
    GroupDetailView,
    GroupJoinView,
    GroupsView,
)


urlpatterns = [
    path("", GroupsView.as_view(), name="groups"),
    path("join-demo", DemoGroupJoinView.as_view(), name="groups-join-demo"),
    path("<uuid:group_id>", GroupDetailView.as_view(), name="group-detail"),
    path("<uuid:group_id>/join", GroupJoinView.as_view(), name="group-join"),
    path("<uuid:group_id>/achievements", GroupAchievementsView.as_view(), name="group-achievements"),
]
