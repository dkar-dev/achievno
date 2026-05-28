from __future__ import annotations

from uuid import UUID

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.infrastructure.authentication import CookieJWTAuthentication
from apps.challenges.api.serializers import (
    ChallengeCreateSerializer,
    ChallengeListSerializer,
    ChallengeNoteSerializer,
    ChallengeProgressSerializer,
)
from apps.challenges.application.challenge_query import ChallengeQuery
from apps.challenges.application.challenge_service import (
    ChallengeService,
    CreateChallengeCommand,
)
from apps.challenges.domain.errors import (
    ChallengeError,
    ChallengeNotFound,
    ChallengeValidationError,
)


def validation_error_response(serializer) -> Response:
    return Response(
        {"error": {"code": "validation_error", "message": "Invalid request.", "fields": serializer.errors}},
        status=status.HTTP_400_BAD_REQUEST,
    )


def challenge_error_response(exc: ChallengeError) -> Response:
    payload = {"code": exc.code, "message": exc.message}
    if isinstance(exc, ChallengeValidationError):
        payload["fields"] = exc.fields
    return Response({"error": payload}, status=exc.status_code)


class ChallengesView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = ChallengeListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        payload = ChallengeQuery().list(
            profile_id=request.user.profile_id,
            status_filter=serializer.validated_data.get("status"),
            limit=serializer.validated_data["limit"],
        )
        return Response(payload)

    def post(self, request):
        serializer = ChallengeCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = ChallengeService().create(
                profile_id=request.user.profile_id,
                command=CreateChallengeCommand(**serializer.validated_data),
            )
        except ChallengeError as exc:
            return challenge_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class ChallengeDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, challenge_id: UUID):
        payload = ChallengeQuery().detail(
            profile_id=request.user.profile_id,
            challenge_id=challenge_id,
        )
        if payload is None:
            return challenge_error_response(ChallengeNotFound())
        return Response(payload)


class ChallengeJoinView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id: UUID):
        try:
            payload = ChallengeService().join(
                profile_id=request.user.profile_id,
                challenge_id=challenge_id,
            )
        except ChallengeError as exc:
            return challenge_error_response(exc)
        return Response(payload)


class ChallengeProgressView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id: UUID):
        serializer = ChallengeProgressSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = ChallengeService().progress(
                profile_id=request.user.profile_id,
                challenge_id=challenge_id,
                **serializer.validated_data,
            )
        except ChallengeError as exc:
            return challenge_error_response(exc)
        return Response(payload)


class ChallengeCompleteView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id: UUID):
        serializer = ChallengeNoteSerializer(data=request.data or {})
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = ChallengeService().complete(
                profile_id=request.user.profile_id,
                challenge_id=challenge_id,
                note_text=serializer.validated_data.get("note_text"),
            )
        except ChallengeError as exc:
            return challenge_error_response(exc)
        return Response(payload)
