from __future__ import annotations

from uuid import UUID

from apps.achievements.application.personal_query import datetime_to_iso
from apps.notifications.infrastructure.repositories import NotificationRepository


def notification_to_dto(notification) -> dict:
    return {
        "notification_id": str(notification.notification_id),
        "type": notification.type,
        "title": notification.title,
        "body": notification.body,
        "action_url": notification.action_url,
        "payload_json": notification.payload_json,
        "is_read": notification.is_read,
        "created_at": datetime_to_iso(notification.created_at),
        "read_at": datetime_to_iso(notification.read_at),
        "notification_status": notification.notification_status,
        "acted_at": datetime_to_iso(notification.acted_at),
        "achievement_id": str(notification.achievement_id) if notification.achievement_id else None,
        "approval_request_id": (
            str(notification.approval_request_id)
            if notification.approval_request_id
            else None
        ),
        "group_id": str(notification.group_id) if notification.group_id else None,
        "friend_connection_id": (
            str(notification.friend_connection_id)
            if notification.friend_connection_id
            else None
        ),
    }


class NotificationService:
    def __init__(self, repository: NotificationRepository | None = None):
        self.repository = repository or NotificationRepository()

    def list(self, *, profile_id: UUID, limit: int = 100) -> dict:
        notifications = self.repository.list_for_profile(profile_id=profile_id, limit=limit)
        return {
            "items": [notification_to_dto(notification) for notification in notifications],
            "unread_count": sum(1 for notification in notifications if not notification.is_read),
        }

    def mark_read(self, *, profile_id: UUID, notification_id: UUID) -> dict | None:
        notification = self.repository.get_for_profile(
            profile_id=profile_id,
            notification_id=notification_id,
        )
        if notification is None:
            return None
        return {"notification": notification_to_dto(self.repository.mark_read(notification=notification))}
