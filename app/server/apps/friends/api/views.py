from __future__ import annotations

from uuid import UUID

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.infrastructure.authentication import CookieJWTAuthentication
from apps.friends.api.serializers import FriendAchievementCreateSerializer, FriendListSerializer
from apps.friends.application.friend_query import FriendQuery
from apps.friends.application.friend_service import CreateFriendAchievementCommand, FriendService
from apps.friends.domain.errors import (
    FriendError,
    FriendInviteNotFound,
    FriendRelationNotFound,
    FriendValidationError,
)


def validation_error_response(serializer) -> Response:
    return Response(
        {"error": {"code": "validation_error", "message": "Invalid request.", "fields": serializer.errors}},
        status=status.HTTP_400_BAD_REQUEST,
    )


def friend_error_response(exc: FriendError) -> Response:
    payload = {"code": exc.code, "message": exc.message}
    if isinstance(exc, FriendValidationError):
        payload["fields"] = exc.fields
    return Response({"error": payload}, status=exc.status_code)


class FriendsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = FriendListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        payload = FriendQuery().list(
            profile_id=request.user.profile_id,
            limit=serializer.validated_data["limit"],
        )
        return Response(payload)


class FriendDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, friend_connection_id: UUID):
        payload = FriendQuery().detail(
            profile_id=request.user.profile_id,
            friend_connection_id=friend_connection_id,
        )
        if payload is None:
            return friend_error_response(FriendRelationNotFound())
        return Response(payload)


class FriendInvitesView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        payload = FriendService().create_invite(profile_id=request.user.profile_id)
        return Response(payload, status=status.HTTP_201_CREATED)


class FriendInviteDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, token: str):
        payload = FriendQuery().invite_detail(token=token)
        if payload is None:
            return friend_error_response(FriendInviteNotFound())
        return Response(payload)


class FriendInviteAcceptView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, token: str):
        try:
            payload = FriendService().accept_invite(token=token, profile_id=request.user.profile_id)
        except FriendError as exc:
            return friend_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class FriendAchievementsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, friend_connection_id: UUID):
        payload = FriendQuery().achievements(
            profile_id=request.user.profile_id,
            friend_connection_id=friend_connection_id,
        )
        if payload is None:
            return friend_error_response(FriendRelationNotFound())
        return Response(payload)

    def post(self, request, friend_connection_id: UUID):
        serializer = FriendAchievementCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = FriendService().create_achievement(
                profile_id=request.user.profile_id,
                friend_connection_id=friend_connection_id,
                command=CreateFriendAchievementCommand(**serializer.validated_data),
            )
        except FriendError as exc:
            return friend_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)
