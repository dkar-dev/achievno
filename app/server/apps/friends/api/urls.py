from django.urls import path

from apps.friends.api.views import (
    FriendAchievementsView,
    FriendDetailView,
    FriendInviteAcceptView,
    FriendInviteDetailView,
    FriendInvitesView,
    FriendsView,
)


urlpatterns = [
    path("", FriendsView.as_view(), name="friends"),
    path("invites", FriendInvitesView.as_view(), name="friend-invites"),
    path("invites/<str:token>", FriendInviteDetailView.as_view(), name="friend-invite-detail"),
    path("invites/<str:token>/accept", FriendInviteAcceptView.as_view(), name="friend-invite-accept"),
    path("<uuid:friend_connection_id>", FriendDetailView.as_view(), name="friend-detail"),
    path("<uuid:friend_connection_id>/achievements", FriendAchievementsView.as_view(), name="friend-achievements"),
]
