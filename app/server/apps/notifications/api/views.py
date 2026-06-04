from __future__ import annotations

from uuid import UUID

from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.infrastructure.authentication import CookieJWTAuthentication
from apps.notifications.application.notification_service import NotificationService


class NotificationListSerializer(serializers.Serializer):
    limit = serializers.IntegerField(required=False, min_value=1, max_value=100, default=100)


class NotificationsView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = NotificationListSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(
                {
                    "error": {
                        "code": "validation_error",
                        "message": "Invalid request.",
                        "fields": serializer.errors,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            NotificationService().list(
                profile_id=request.user.profile_id,
                limit=serializer.validated_data["limit"],
            )
        )


class NotificationReadView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notification_id: UUID):
        payload = NotificationService().mark_read(
            profile_id=request.user.profile_id,
            notification_id=notification_id,
        )
        if payload is None:
            return Response(
                {"error": {"code": "not_found", "message": "Notification not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(payload)
