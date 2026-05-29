from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from django.db import DatabaseError

from apps.achievements.application.personal_query import achievement_to_dto
from apps.groups.application.group_query import group_to_dto
from apps.groups.domain.errors import GroupNotFound, GroupPersistenceError, GroupValidationError
from apps.groups.infrastructure.repositories import (
    CreateGroupAchievementData,
    CreateGroupData,
    GroupRepository,
)


@dataclass(frozen=True)
class CreateGroupCommand:
    title: str
    description: str | None = None
    visibility_type: str = "public"


@dataclass(frozen=True)
class JoinDemoGroupCommand:
    template_id: str
    title: str
    description: str | None = None
    visibility_type: str = "public"


@dataclass(frozen=True)
class CreateGroupAchievementCommand:
    base_type: str
    title: str
    short_definition: str | None = None
    description: str | None = None
    progress_target: Decimal | None = None
    unit_label: str | None = None
    deadline_at: object | None = None


class GroupService:
    def __init__(self, repository: GroupRepository | None = None):
        self.repository = repository or GroupRepository()

    def create(self, *, profile_id: UUID, command: CreateGroupCommand) -> dict:
        try:
            group, membership = self.repository.create_group(
                profile_id=profile_id,
                data=CreateGroupData(
                    title=command.title,
                    description=command.description,
                    visibility_type=command.visibility_type,
                ),
            )
        except DatabaseError as exc:
            raise GroupPersistenceError() from exc
        return {"group": self._group_payload(group, membership)}

    def join_demo(self, *, profile_id: UUID, command: JoinDemoGroupCommand) -> dict:
        try:
            group, membership = self.repository.join_demo_group(
                profile_id=profile_id,
                data=CreateGroupData(
                    title=command.title,
                    description=command.description,
                    visibility_type=command.visibility_type,
                ),
            )
        except DatabaseError as exc:
            raise GroupPersistenceError() from exc
        return {"group": self._group_payload(group, membership)}

    def join(self, *, profile_id: UUID, group_id: UUID) -> dict:
        try:
            visible = self.repository.join_public_group(profile_id=profile_id, group_id=group_id)
        except DatabaseError as exc:
            raise GroupPersistenceError() from exc
        if visible is None:
            raise GroupNotFound()
        group, membership = visible
        return {"group": self._group_payload(group, membership)}

    def create_achievement(
        self,
        *,
        profile_id: UUID,
        group_id: UUID,
        command: CreateGroupAchievementCommand,
    ) -> dict:
        self._validate_achievement(command)
        try:
            achievement = self.repository.create_group_achievement(
                profile_id=profile_id,
                group_id=group_id,
                data=CreateGroupAchievementData(
                    base_type=command.base_type,
                    title=command.title,
                    short_definition=command.short_definition or command.title,
                    description=command.description,
                    progress_target=command.progress_target,
                    unit_label=command.unit_label,
                    deadline_at=command.deadline_at,
                ),
            )
        except DatabaseError as exc:
            raise GroupPersistenceError() from exc
        if achievement is None:
            raise GroupNotFound()
        return {"achievement": achievement_to_dto(achievement)}

    def _group_payload(self, group, membership) -> dict:
        return group_to_dto(
            group,
            membership,
            member_count=self.repository.member_count(group_id=group.group_id),
            achievement_counts=self.repository.achievement_counts(group_id=group.group_id),
        )

    def _validate_achievement(self, command: CreateGroupAchievementCommand) -> None:
        if command.base_type == "done" and command.progress_target is not None:
            raise GroupValidationError({"progress_target": ["Progress target must be null for done achievements."]})
        if command.base_type == "progress" and (command.progress_target is None or command.progress_target <= 0):
            raise GroupValidationError(
                {"progress_target": ["Progress target is required and must be positive for progress achievements."]}
            )
