from __future__ import annotations

from uuid import UUID

from apps.achievements.application.personal_query import achievement_to_dto
from apps.groups.infrastructure.repositories import GroupRepository, group_invite_url_for_token


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


def profile_to_dto(profile) -> dict:
    return {
        "profile_id": str(profile.profile_id),
        "display_name": profile.display_name,
        "username": profile.username,
        "avatar_url": profile.avatar_url,
    }


def member_to_dto(membership) -> dict:
    return {
        "membership_id": str(membership.group_membership_id),
        "profile_id": str(membership.profile_id),
        "display_name": membership.profile.display_name,
        "username": membership.profile.username,
        "avatar_url": membership.profile.avatar_url,
        "role": membership.role,
        "status": membership.membership_status,
        "joined_at": datetime_to_iso(membership.joined_at),
        "created_at": datetime_to_iso(membership.created_at),
    }


def group_invite_to_dto(invite) -> dict:
    token = invite.link_token or ""
    return {
        "invite_id": str(invite.invite_id),
        "invite_kind": invite.invite_kind,
        "delivery_mode": invite.delivery_mode,
        "status": invite.invite_status,
        "token": token,
        "url": group_invite_url_for_token(token) if token else None,
        "link_expires_at": datetime_to_iso(invite.link_expires_at),
        "accepted_at": datetime_to_iso(invite.accepted_at),
        "created_at": datetime_to_iso(invite.created_at),
        "sender_profile": profile_to_dto(invite.sender_profile),
        "group": {
            "group_id": str(invite.group.group_id),
            "title": invite.group.title,
            "description": invite.group.description,
            "avatar_url": invite.group.avatar_url,
            "visibility_type": invite.group.visibility_type,
        },
        "resolved_group_membership_id": (
            str(invite.resolved_group_membership_id)
            if invite.resolved_group_membership_id
            else None
        ),
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
        members = self.repository.list_group_members(profile_id=profile_id, group_id=group_id) or []
        return {
            "group": self._group_to_dto(group, membership),
            "members": [member_to_dto(member) for member in members[:20]],
            "achievements": [achievement_to_dto(achievement) for achievement in achievements],
        }

    def members(self, *, profile_id: UUID, group_id: UUID) -> dict | None:
        members = self.repository.list_group_members(profile_id=profile_id, group_id=group_id)
        if members is None:
            return None
        return {
            "items": [member_to_dto(member) for member in members],
            "total_count": len(members),
        }

    def invite_detail(self, *, token: str) -> dict | None:
        invite = self.repository.get_invite_by_token(token=token)
        if invite is None:
            return None
        return {"invite": group_invite_to_dto(invite)}

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
