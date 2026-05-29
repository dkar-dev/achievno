from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from importlib import import_module
from uuid import UUID

from django.db.models import Count, Q


PREVIEW_LIMIT = 5
UNMANAGED_MODEL_MODULES = (
    "apps.accounts.infrastructure.models",
    "apps.profiles.infrastructure.models",
    "apps.friends.infrastructure.models",
    "apps.groups.infrastructure.models",
    "apps.achievements.infrastructure.models",
    "apps.challenges.infrastructure.models",
    "apps.platform.infrastructure.models",
    "apps.notifications.infrastructure.models",
)


def load_unmanaged_model_graph() -> None:
    for module_name in UNMANAGED_MODEL_MODULES:
        import_module(module_name)


@dataclass(frozen=True)
class MainAggregateSelectors:
    profile_id: UUID
    account_id: UUID

    def profile(self) -> dict:
        load_unmanaged_model_graph()
        from apps.profiles.infrastructure.models import UserProfile

        profile = UserProfile.objects.filter(
            profile_id=self.profile_id,
            account_id=self.account_id,
            deactivated_at__isnull=True,
            deleted_at__isnull=True,
        ).first()
        if profile is None:
            return {
                "profile_id": str(self.profile_id),
                "account_id": str(self.account_id),
                "display_name": "",
                "username": None,
                "avatar_url": None,
                "rank": None,
            }

        return {
            "profile_id": str(profile.profile_id),
            "account_id": str(profile.account_id),
            "display_name": profile.display_name,
            "username": profile.username,
            "avatar_url": profile.avatar_url,
            "rank": None,
        }

    def personal_space(self) -> dict:
        load_unmanaged_model_graph()
        from apps.achievements.infrastructure.models import Achievement, AchievementLog, OwnerContext

        owner_context = OwnerContext.objects.filter(
            context_type="personal",
            personal_profile_id=self.profile_id,
        ).first()
        if owner_context is None:
            return {
                "owner_context_id": None,
                "active_achievements_count": 0,
                "completed_achievements_count": 0,
                "recent_logs_count": 0,
                "recent_achievements": [],
            }

        achievement_counts = Achievement.objects.filter(owner_context=owner_context).aggregate(
            active=Count("achievement_id", filter=Q(status__in=["in_progress", "overdue", "in_review"])),
            completed=Count("achievement_id", filter=Q(status="completed")),
        )
        recent_logs_count = AchievementLog.objects.filter(
            achievement__owner_context=owner_context,
            actor_profile_id=self.profile_id,
        ).count()
        recent_achievements = [
            achievement_to_dto(achievement)
            for achievement in Achievement.objects.filter(owner_context=owner_context)
            .order_by("-updated_at", "-created_at")[:PREVIEW_LIMIT]
        ]

        return {
            "owner_context_id": str(owner_context.owner_context_id),
            "active_achievements_count": achievement_counts["active"] or 0,
            "completed_achievements_count": achievement_counts["completed"] or 0,
            "recent_logs_count": recent_logs_count,
            "recent_achievements": recent_achievements,
        }

    def friends(self) -> dict:
        load_unmanaged_model_graph()
        from apps.friends.infrastructure.models import FriendConnection, FriendConnectionSide

        connections = (
            FriendConnection.objects.filter(
                Q(profile_a_id=self.profile_id) | Q(profile_b_id=self.profile_id),
                tombstoned_at__isnull=True,
            )
            .select_related("profile_a", "profile_b")
            .order_by("-updated_at", "-created_at")
        )
        active_connections = connections.filter(status="active")
        counts = connections.aggregate(
            total=Count("friend_connection_id"),
            active=Count("friend_connection_id", filter=Q(status="active")),
        )
        side_statuses = {
            side.friend_connection_id: side.side_status
            for side in FriendConnectionSide.objects.filter(
                profile_id=self.profile_id,
                friend_connection_id__in=active_connections.values("friend_connection_id")[:PREVIEW_LIMIT],
            )
        }

        return {
            "total_count": counts["total"] or 0,
            "active_count": counts["active"] or 0,
            "pending_count": (counts["total"] or 0) - (counts["active"] or 0),
            "preview": [
                friend_connection_to_dto(connection, self.profile_id, side_statuses)
                for connection in active_connections[:PREVIEW_LIMIT]
            ],
        }

    def groups(self) -> dict:
        load_unmanaged_model_graph()
        from apps.groups.infrastructure.models import GroupMembership

        memberships = (
            GroupMembership.objects.filter(
                profile_id=self.profile_id,
                membership_status="active",
                left_at__isnull=True,
            )
            .select_related("group")
            .order_by("-updated_at", "-joined_at")
        )
        counts = memberships.aggregate(
            total=Count("group_membership_id"),
            owned=Count("group_membership_id", filter=Q(role="owner")),
            member=Count("group_membership_id", filter=~Q(role="owner")),
        )

        return {
            "total_count": counts["total"] or 0,
            "owned_count": counts["owned"] or 0,
            "member_count": counts["member"] or 0,
            "preview": [group_membership_to_dto(membership) for membership in memberships[:PREVIEW_LIMIT]],
        }

    def notifications(self) -> dict:
        load_unmanaged_model_graph()
        from apps.notifications.infrastructure.models import Notification

        notifications = Notification.objects.filter(recipient_profile_id=self.profile_id).order_by("-created_at")
        unread_count = notifications.filter(is_read=False).count()

        return {
            "unread_count": unread_count,
            "preview": [
                notification_to_dto(notification)
                for notification in notifications[:PREVIEW_LIMIT]
            ],
        }


def decimal_to_float(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(value)


def datetime_to_iso(value) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def achievement_to_dto(achievement) -> dict:
    return {
        "achievement_id": str(achievement.achievement_id),
        "title": achievement.title,
        "status": achievement.status,
        "progress_current": decimal_to_float(achievement.progress_current),
        "progress_target": decimal_to_float(achievement.progress_target),
        "unit_label": achievement.unit_label,
        "updated_at": datetime_to_iso(achievement.updated_at),
    }


def friend_connection_to_dto(connection, profile_id: UUID, side_statuses: dict) -> dict:
    other_profile = connection.profile_b if connection.profile_a_id == profile_id else connection.profile_a
    return {
        "friend_connection_id": str(connection.friend_connection_id),
        "status": connection.status,
        "side_status": side_statuses.get(connection.friend_connection_id),
        "profile": {
            "profile_id": str(other_profile.profile_id),
            "display_name": other_profile.display_name,
            "username": other_profile.username,
            "avatar_url": other_profile.avatar_url,
        },
        "updated_at": datetime_to_iso(connection.updated_at),
    }


def group_membership_to_dto(membership) -> dict:
    load_unmanaged_model_graph()
    from apps.achievements.infrastructure.models import Achievement
    from apps.groups.infrastructure.models import GroupMembership

    member_count = GroupMembership.objects.filter(
        group_id=membership.group_id,
        membership_status="active",
        left_at__isnull=True,
    ).count()
    achievement_counts = Achievement.objects.filter(
        owner_context__context_type="group",
        owner_context__group_id=membership.group_id,
    ).aggregate(
        active=Count("achievement_id", filter=Q(status__in=["in_progress", "overdue", "in_review"])),
        completed=Count("achievement_id", filter=Q(status="completed")),
    )

    return {
        "group_id": str(membership.group.group_id),
        "title": membership.group.title,
        "avatar_url": membership.group.avatar_url,
        "visibility_type": membership.group.visibility_type,
        "role": membership.role,
        "membership_status": membership.membership_status,
        "member_count": member_count,
        "active_achievements_count": achievement_counts["active"] or 0,
        "completed_achievements_count": achievement_counts["completed"] or 0,
        "joined_at": datetime_to_iso(membership.joined_at),
    }


def notification_to_dto(notification) -> dict:
    return {
        "notification_id": str(notification.notification_id),
        "type": notification.type,
        "title": notification.title,
        "body": notification.body,
        "action_url": notification.action_url,
        "is_read": notification.is_read,
        "created_at": datetime_to_iso(notification.created_at),
    }
