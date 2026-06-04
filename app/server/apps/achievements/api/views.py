from __future__ import annotations

from uuid import UUID

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.infrastructure.authentication import CookieJWTAuthentication
from apps.achievements.api.serializers import (
    ApprovalDecisionSerializer,
    ApprovalListSerializer,
    EvidenceAttachSerializer,
    PersonalAchievementCreateSerializer,
    PersonalAchievementListSerializer,
    PersonalAchievementNoteSerializer,
    PersonalAchievementPatchSerializer,
    PersonalAchievementProgressSerializer,
)
from apps.achievements.application.approval_service import ApprovalService
from apps.achievements.application.evidence_service import EvidenceAttachCommand, EvidenceService
from apps.achievements.application.personal_query import PersonalAchievementQuery
from apps.achievements.application.personal_service import (
    CreatePersonalAchievementCommand,
    PersonalAchievementService,
)
from apps.achievements.domain.errors import (
    PersonalAchievementError,
    PersonalAchievementNotFound,
    PersonalAchievementValidationError,
)


def validation_error_response(serializer) -> Response:
    return Response(
        {"error": {"code": "validation_error", "message": "Invalid request.", "fields": serializer.errors}},
        status=status.HTTP_400_BAD_REQUEST,
    )


def personal_error_response(exc: PersonalAchievementError) -> Response:
    payload = {"code": exc.code, "message": exc.message}
    if isinstance(exc, PersonalAchievementValidationError):
        payload["fields"] = exc.fields
    return Response({"error": payload}, status=exc.status_code)


class PersonalAchievementsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = PersonalAchievementListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        payload = PersonalAchievementQuery().list(
            profile_id=request.user.profile_id,
            status_filter=serializer.validated_data.get("status"),
            limit=serializer.validated_data["limit"],
        )
        return Response(payload)

    def post(self, request):
        serializer = PersonalAchievementCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = PersonalAchievementService().create(
                profile_id=request.user.profile_id,
                command=CreatePersonalAchievementCommand(**serializer.validated_data),
            )
        except PersonalAchievementError as exc:
            return personal_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class PersonalAchievementDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, achievement_id: UUID):
        payload = PersonalAchievementQuery().detail(
            profile_id=request.user.profile_id,
            achievement_id=achievement_id,
        )
        if payload is None:
            return personal_error_response(PersonalAchievementNotFound())
        return Response(payload)

    def patch(self, request, achievement_id: UUID):
        serializer = PersonalAchievementPatchSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = PersonalAchievementService().update_basic(
                profile_id=request.user.profile_id,
                achievement_id=achievement_id,
                fields=serializer.validated_data,
            )
        except PersonalAchievementError as exc:
            return personal_error_response(exc)
        return Response(payload)


class PersonalAchievementProgressView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, achievement_id: UUID):
        serializer = PersonalAchievementProgressSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = PersonalAchievementService().log_progress(
                profile_id=request.user.profile_id,
                achievement_id=achievement_id,
                **serializer.validated_data,
            )
        except PersonalAchievementError as exc:
            return personal_error_response(exc)
        return Response(payload)


class PersonalAchievementCompleteView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, achievement_id: UUID):
        serializer = PersonalAchievementNoteSerializer(data=request.data or {})
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = PersonalAchievementService().complete(
                profile_id=request.user.profile_id,
                achievement_id=achievement_id,
                note_text=serializer.validated_data.get("note_text"),
            )
        except PersonalAchievementError as exc:
            return personal_error_response(exc)
        return Response(payload)


class PersonalAchievementArchiveView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, achievement_id: UUID):
        serializer = PersonalAchievementNoteSerializer(data=request.data or {})
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = PersonalAchievementService().archive(
                profile_id=request.user.profile_id,
                achievement_id=achievement_id,
            )
        except PersonalAchievementError as exc:
            return personal_error_response(exc)
        return Response(payload)


class AchievementEvidenceView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, achievement_id: UUID):
        payload = EvidenceService().list_for_achievement(
            profile_id=request.user.profile_id,
            achievement_id=achievement_id,
        )
        if payload is None:
            return personal_error_response(PersonalAchievementNotFound())
        return Response(payload)

    def post(self, request, achievement_id: UUID):
        serializer = EvidenceAttachSerializer(data=request.data)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        uploaded_file = serializer.validated_data.get("file")
        try:
            payload = EvidenceService().attach_to_achievement(
                profile_id=request.user.profile_id,
                achievement_id=achievement_id,
                command=EvidenceAttachCommand(
                    kind=serializer.validated_data["kind"],
                    url=serializer.validated_data.get("url"),
                    note_text=serializer.validated_data.get("note_text"),
                    file_name=getattr(uploaded_file, "name", None),
                    mime_type=getattr(uploaded_file, "content_type", None),
                    content=uploaded_file.read() if uploaded_file is not None else None,
                ),
            )
        except PersonalAchievementError as exc:
            return personal_error_response(exc)
        return Response(payload, status=status.HTTP_201_CREATED)


class ApprovalRequestsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = ApprovalListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return validation_error_response(serializer)
        payload = ApprovalService().list(
            profile_id=request.user.profile_id,
            status_filter=serializer.validated_data.get("status"),
        )
        return Response(payload)


class ApprovalRequestDetailView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, approval_request_id: UUID):
        payload = ApprovalService().detail(
            profile_id=request.user.profile_id,
            approval_request_id=approval_request_id,
        )
        if payload is None:
            return personal_error_response(PersonalAchievementNotFound())
        return Response(payload)


class ApprovalRequestDecisionView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    decision: str

    def post(self, request, approval_request_id: UUID):
        serializer = ApprovalDecisionSerializer(data=request.data or {})
        if not serializer.is_valid():
            return validation_error_response(serializer)
        try:
            payload = ApprovalService().decide(
                profile_id=request.user.profile_id,
                approval_request_id=approval_request_id,
                decision=self.decision,
                note_text=serializer.validated_data.get("note_text"),
            )
        except PersonalAchievementError as exc:
            return personal_error_response(exc)
        return Response(payload)


class ApprovalRequestApproveView(ApprovalRequestDecisionView):
    decision = "approve"


class ApprovalRequestRejectView(ApprovalRequestDecisionView):
    decision = "reject"
