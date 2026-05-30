from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from apps.achievements.application.personal_query import achievement_to_dto
from apps.friends.application.friend_query import invite_to_dto, relation_to_dto
from apps.friends.domain.errors import (
    FriendInviteAlreadyUsed,
    FriendInviteInvalid,
    FriendInviteNotFound,
    FriendRelationNotFound,
    FriendSelfInvite,
    FriendValidationError,
)
from apps.friends.infrastructure.repositories import (
    CreateFriendAchievementData,
    FriendRepository,
)


@dataclass(frozen=True)
class CreateFriendAchievementCommand:
    base_type: str
    title: str
    short_definition: str | None = None
    description: str | None = None
    progress_target: Decimal | None = None
    unit_label: str | None = None
    deadline_at: object | None = None


class FriendService:
    def __init__(self, repository: FriendRepository | None = None):
        self.repository = repository or FriendRepository()

    def create_invite(self, *, profile_id: UUID) -> dict:
        invite = self.repository.create_invite(profile_id=profile_id)
        return {"invite": invite_to_dto(invite)}

    def accept_invite(self, *, token: str, profile_id: UUID) -> dict:
        result, state = self.repository.accept_invite(token=token, profile_id=profile_id)
        if state == "not_found":
            raise FriendInviteNotFound()
        if state == "self_accept":
            raise FriendSelfInvite()
        if state == "already_used":
            raise FriendInviteAlreadyUsed()
        if state in {"expired", "target_mismatch"}:
            raise FriendInviteInvalid()
        relation = result
        side_statuses = self.repository.side_statuses(
            profile_id=profile_id,
            relation_ids=[relation.friend_connection_id],
        )
        return {
            "relation": relation_to_dto(
                relation,
                profile_id,
                side_status=side_statuses.get(relation.friend_connection_id),
                achievement_counts=self.repository.achievement_counts(
                    friend_connection_id=relation.friend_connection_id
                ),
            )
        }

    def create_achievement(
        self,
        *,
        profile_id: UUID,
        friend_connection_id: UUID,
        command: CreateFriendAchievementCommand,
    ) -> dict:
        self._validate_base_type_progress_target(
            base_type=command.base_type,
            progress_target=command.progress_target,
        )
        achievement = self.repository.create_friend_achievement(
            profile_id=profile_id,
            friend_connection_id=friend_connection_id,
            data=CreateFriendAchievementData(
                base_type=command.base_type,
                title=command.title,
                short_definition=command.short_definition or command.title,
                description=command.description,
                progress_target=command.progress_target,
                unit_label=command.unit_label,
                deadline_at=command.deadline_at,
            ),
        )
        if achievement is None:
            raise FriendRelationNotFound()
        return {"achievement": achievement_to_dto(achievement)}

    def _validate_base_type_progress_target(self, *, base_type: str, progress_target: Decimal | None) -> None:
        if base_type == "done" and progress_target is not None:
            raise FriendValidationError(
                {"progress_target": ["Progress target must be null for done achievements."]}
            )
        if base_type == "progress" and (progress_target is None or progress_target <= 0):
            raise FriendValidationError(
                {"progress_target": ["Progress target is required and must be positive for progress achievements."]}
            )

