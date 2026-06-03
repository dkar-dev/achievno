from __future__ import annotations

from uuid import UUID

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.infrastructure.authentication import CookieJWTAuthentication
from apps.groups.api.serializers import (
    DemoGroupJoinSerializer,
    GroupAchievementCreateSerializer,
    GroupCreateSerializer,
    GroupListSerializer,
)
from apps.groups.application.group_query import GroupQuery
from apps.groups.application.group_service import (
    CreateGroupAchievementCommand,
    CreateGroupCommand,
    GroupService,
    JoinDemoGroupCommand,
)
from apps.groups.domain.errors import GroupError, GroupInviteNotFound, GroupNotFound, GroupValidationError


def validation_error_response(serializer) -> Response:
    return Response(
        {"error": {"code": "validation_error", "message": "Invalid request.", "fields": serializer.errors}},
        status=status.HTTP_400_BAD_REQUEST,
    )


def group_error_response(exc: GroupError) -> Response:
    payload = {"code": exc.code, "message": exc.message}
    if isinstance(exc, GroupValidationError):
        payload["fields"] = exc.fields
    return Response({"error": payload}, status=exc.status_code)


class GroupsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = GroupListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        payload = GroupQuery().list(
            profile_id=request.user.profile_id,
            limit=serializer.validated_data["limit"],
        )
        return Response(payload)

    def post(self, request):
        serializer = GroupCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = GroupService().create(
                profile_id=request.user.profile_id,
                command=CreateGroupCommand(**serializer.validated_data),
            )
        except GroupError as exc:
            return group_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class DemoGroupJoinView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DemoGroupJoinSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = GroupService().join_demo(
                profile_id=request.user.profile_id,
                command=JoinDemoGroupCommand(**serializer.validated_data),
            )
        except GroupError as exc:
            return group_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class GroupDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id: UUID):
        payload = GroupQuery().detail(profile_id=request.user.profile_id, group_id=group_id)
        if payload is None:
            return group_error_response(GroupNotFound())
        return Response(payload)


class GroupMembersView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id: UUID):
        payload = GroupQuery().members(profile_id=request.user.profile_id, group_id=group_id)
        if payload is None:
            return group_error_response(GroupNotFound())
        return Response(payload)


class GroupJoinView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id: UUID):
        try:
            payload = GroupService().join(profile_id=request.user.profile_id, group_id=group_id)
        except GroupError as exc:
            return group_error_response(exc)
        return Response(payload)


class GroupInvitesView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id: UUID):
        try:
            payload = GroupService().create_invite(profile_id=request.user.profile_id, group_id=group_id)
        except GroupError as exc:
            return group_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class GroupInviteDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, token: str):
        payload = GroupQuery().invite_detail(token=token)
        if payload is None:
            return group_error_response(GroupInviteNotFound())
        return Response(payload)


class GroupInviteAcceptView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, token: str):
        try:
            payload = GroupService().accept_invite(token=token, profile_id=request.user.profile_id)
        except GroupError as exc:
            return group_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class GroupAchievementsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id: UUID):
        payload = GroupQuery().achievements(profile_id=request.user.profile_id, group_id=group_id)
        if payload is None:
            return group_error_response(GroupNotFound())
        return Response(payload)

    def post(self, request, group_id: UUID):
        serializer = GroupAchievementCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = GroupService().create_achievement(
                profile_id=request.user.profile_id,
                group_id=group_id,
                command=CreateGroupAchievementCommand(**serializer.validated_data),
            )
        except GroupError as exc:
            return group_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)
