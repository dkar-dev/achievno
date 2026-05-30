from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from apps.achievements.application.personal_query import achievement_to_dto
from apps.friends.infrastructure.repositories import FriendRepository, invite_url_for_token


def decimal_to_number(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(value)


def datetime_to_iso(value) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def profile_to_dto(profile) -> dict:
    return {
        "profile_id": str(profile.profile_id),
        "display_name": profile.display_name,
        "username": profile.username,
        "avatar_url": profile.avatar_url,
    }


def relation_to_dto(relation, profile_id: UUID, *, side_status: str | None, achievement_counts: dict[str, int]) -> dict:
    other_profile = relation.profile_b if relation.profile_a_id == profile_id else relation.profile_a
    return {
        "relation_id": str(relation.friend_connection_id),
        "friend_connection_id": str(relation.friend_connection_id),
        "status": relation.status,
        "side_status": side_status,
        "profile": profile_to_dto(other_profile),
        "active_achievements_count": achievement_counts["active"],
        "completed_achievements_count": achievement_counts["completed"],
        "created_at": datetime_to_iso(relation.created_at),
        "updated_at": datetime_to_iso(relation.updated_at),
    }


def invite_to_dto(invite) -> dict:
    token = invite.link_token or ""
    return {
        "invite_id": str(invite.invite_id),
        "invite_kind": invite.invite_kind,
        "delivery_mode": invite.delivery_mode,
        "status": invite.invite_status,
        "token": token,
        "url": invite_url_for_token(token) if token else None,
        "link_expires_at": datetime_to_iso(invite.link_expires_at),
        "accepted_at": datetime_to_iso(invite.accepted_at),
        "created_at": datetime_to_iso(invite.created_at),
        "sender_profile": profile_to_dto(invite.sender_profile),
        "resolved_friend_connection_id": (
            str(invite.resolved_friend_connection_id)
            if invite.resolved_friend_connection_id
            else None
        ),
    }


class FriendQuery:
    def __init__(self, repository: FriendRepository | None = None):
        self.repository = repository or FriendRepository()

    def list(self, *, profile_id: UUID, limit: int = 50) -> dict:
        relations, total_count = self.repository.list_relations(profile_id=profile_id, limit=limit)
        side_statuses = self.repository.side_statuses(
            profile_id=profile_id,
            relation_ids=[relation.friend_connection_id for relation in relations],
        )
        return {
            "items": [
                relation_to_dto(
                    relation,
                    profile_id,
                    side_status=side_statuses.get(relation.friend_connection_id),
                    achievement_counts=self.repository.achievement_counts(
                        friend_connection_id=relation.friend_connection_id
                    ),
                )
                for relation in relations
            ],
            "total_count": total_count,
        }

    def detail(self, *, profile_id: UUID, friend_connection_id: UUID) -> dict | None:
        relation = self.repository.get_visible_relation(
            profile_id=profile_id,
            friend_connection_id=friend_connection_id,
        )
        if relation is None:
            return None
        side_statuses = self.repository.side_statuses(
            profile_id=profile_id,
            relation_ids=[relation.friend_connection_id],
        )
        achievements = self.repository.list_friend_achievements(
            profile_id=profile_id,
            friend_connection_id=friend_connection_id,
        ) or []
        return {
            "relation": relation_to_dto(
                relation,
                profile_id,
                side_status=side_statuses.get(relation.friend_connection_id),
                achievement_counts=self.repository.achievement_counts(
                    friend_connection_id=relation.friend_connection_id
                ),
            ),
            "achievements": [achievement_to_dto(achievement) for achievement in achievements],
        }

    def invite_detail(self, *, token: str) -> dict | None:
        invite = self.repository.get_invite_by_token(token=token)
        if invite is None:
            return None
        return {"invite": invite_to_dto(invite)}

    def achievements(self, *, profile_id: UUID, friend_connection_id: UUID) -> dict | None:
        achievements = self.repository.list_friend_achievements(
            profile_id=profile_id,
            friend_connection_id=friend_connection_id,
        )
        if achievements is None:
            return None
        return {
            "items": [achievement_to_dto(achievement) for achievement in achievements],
            "total_count": len(achievements),
        }

