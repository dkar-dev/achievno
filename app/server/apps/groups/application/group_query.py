from __future__ import annotations

from uuid import UUID

from apps.achievements.application.personal_query import achievement_to_dto
from apps.groups.infrastructure.repositories import GroupRepository


def datetime_to_iso(value) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def group_to_dto(group, membership, *, member_count: int, achievement_counts: dict[str, int]) -> dict:
    return {
        "group_id": str(group.group_id),
        "title": group.title,
        "description": group.description,
        "avatar_url": group.avatar_url,
        "visibility_type": group.visibility_type,
        "base_permission": group.base_permission,
        "role": membership.role,
        "membership_status": membership.membership_status,
        "member_count": member_count,
        "active_achievements_count": achievement_counts["active"],
        "completed_achievements_count": achievement_counts["completed"],
        "created_at": datetime_to_iso(group.created_at),
        "updated_at": datetime_to_iso(group.updated_at),
        "joined_at": datetime_to_iso(membership.joined_at),
    }


class GroupQuery:
    def __init__(self, repository: GroupRepository | None = None):
        self.repository = repository or GroupRepository()

    def list(self, *, profile_id: UUID, limit: int = 50) -> dict:
        memberships, total_count = self.repository.list_memberships(profile_id=profile_id, limit=limit)
        return {
            "items": [self._membership_to_dto(membership) for membership in memberships],
            "total_count": total_count,
        }

    def detail(self, *, profile_id: UUID, group_id: UUID) -> dict | None:
        visible = self.repository.get_visible_group(profile_id=profile_id, group_id=group_id)
        if visible is None:
            return None
        group, membership = visible
        achievements = self.repository.list_group_achievements(profile_id=profile_id, group_id=group_id) or []
        return {
            "group": self._group_to_dto(group, membership),
            "achievements": [achievement_to_dto(achievement) for achievement in achievements],
        }

    def achievements(self, *, profile_id: UUID, group_id: UUID) -> dict | None:
        achievements = self.repository.list_group_achievements(profile_id=profile_id, group_id=group_id)
        if achievements is None:
            return None
        return {
            "items": [achievement_to_dto(achievement) for achievement in achievements],
            "total_count": len(achievements),
        }

    def _membership_to_dto(self, membership) -> dict:
        return self._group_to_dto(membership.group, membership)

    def _group_to_dto(self, group, membership) -> dict:
        return group_to_dto(
            group,
            membership,
            member_count=self.repository.member_count(group_id=group.group_id),
            achievement_counts=self.repository.achievement_counts(group_id=group.group_id),
        )
