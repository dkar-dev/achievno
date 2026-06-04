from __future__ import annotations

from uuid import UUID

from django.utils import timezone


class NotificationRepository:
    def list_for_profile(self, *, profile_id: UUID, limit: int = 100) -> list[object]:
        from apps.notifications.infrastructure.models import Notification

        return list(
            Notification.objects.filter(recipient_profile_id=profile_id)
            .order_by("-created_at")[:limit]
        )

    def get_for_profile(self, *, profile_id: UUID, notification_id: UUID):
        from apps.notifications.infrastructure.models import Notification

        return Notification.objects.filter(
            recipient_profile_id=profile_id,
            notification_id=notification_id,
        ).first()

    def mark_read(self, *, notification) -> object:
        if notification.is_read:
            return notification
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at"])
        return notification
