from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from django.db import DatabaseError, transaction

from apps.achievements.application.personal_query import achievement_to_dto, log_to_dto
from apps.achievements.domain.errors import (
    PersonalAchievementArchived,
    PersonalAchievementNotFound,
    PersonalAchievementProgressError,
    PersonalAchievementValidationError,
)
from apps.achievements.infrastructure.procedures import AchievementProgressProcedure
from apps.achievements.infrastructure.repositories import (
    CreateAchievementData,
    PersonalAchievementRepository,
)


@dataclass(frozen=True)
class CreatePersonalAchievementCommand:
    base_type: str
    title: str
    short_definition: str | None = None
    description: str | None = None
    progress_target: Decimal | None = None
    unit_label: str | None = None
    deadline_at: object | None = None
    primary_category_id: UUID | None = None
    rank_id: UUID | None = None


class PersonalAchievementService:
    def __init__(
        self,
        repository: PersonalAchievementRepository | None = None,
        progress_procedure: AchievementProgressProcedure | None = None,
    ):
        self.repository = repository or PersonalAchievementRepository()
        self.progress_procedure = progress_procedure or AchievementProgressProcedure()

    def create(self, *, profile_id: UUID, command: CreatePersonalAchievementCommand) -> dict:
        self._validate_base_type_progress_target(
            base_type=command.base_type,
            progress_target=command.progress_target,
        )
        achievement = self.repository.create_personal(
            profile_id=profile_id,
            data=CreateAchievementData(
                base_type=command.base_type,
                title=command.title,
                short_definition=command.short_definition or command.title,
                description=command.description,
                progress_target=command.progress_target,
                unit_label=command.unit_label,
                deadline_at=command.deadline_at,
                primary_category_id=command.primary_category_id,
                rank_id=command.rank_id,
            ),
        )
        return {"achievement": achievement_to_dto(achievement)}

    def update_basic(self, *, profile_id: UUID, achievement_id: UUID, fields: dict[str, object]) -> dict:
        achievement = self._get_editable(profile_id=profile_id, achievement_id=achievement_id)
        if achievement.base_type == "done" and fields.get("progress_target") is not None:
            raise PersonalAchievementValidationError(
                {"progress_target": ["Progress target must be null for done achievements."]}
            )
        if achievement.base_type == "progress" and "progress_target" in fields:
            target = fields["progress_target"]
            if target is None or target <= 0:
                raise PersonalAchievementValidationError(
                    {"progress_target": ["Progress target must be positive for progress achievements."]}
                )
        updated = self.repository.save_basic_fields(achievement=achievement, fields=fields)
        return {"achievement": achievement_to_dto(updated)}

    def log_progress(
        self,
        *,
        profile_id: UUID,
        achievement_id: UUID,
        delta_value: Decimal,
        note_text: str | None,
    ) -> dict:
        if delta_value == 0:
            raise PersonalAchievementValidationError(
                {"delta_value": ["Delta value must be non-zero."]}
            )
        achievement = self._get_editable(profile_id=profile_id, achievement_id=achievement_id)
        with transaction.atomic():
            log_id = self._submit_progress(
                achievement_id=achievement.achievement_id,
                profile_id=profile_id,
                delta_value=delta_value,
                note_text=note_text,
            )
            updated = self.repository.get_visible(
                profile_id=profile_id,
                achievement_id=achievement.achievement_id,
            )
            log = self.repository.get_log(achievement_log_id=log_id)
        return {"achievement": achievement_to_dto(updated), "log": log_to_dto(log)}

    def complete(self, *, profile_id: UUID, achievement_id: UUID, note_text: str | None) -> dict:
        achievement = self._get_editable(profile_id=profile_id, achievement_id=achievement_id)
        if achievement.base_type == "progress" and achievement.progress_target is not None:
            delta_value = max(achievement.progress_target - achievement.progress_current, Decimal("0.00"))
        else:
            delta_value = Decimal("1.00")
        with transaction.atomic():
            log_id = self._submit_progress(
                achievement_id=achievement.achievement_id,
                profile_id=profile_id,
                delta_value=delta_value,
                note_text=note_text,
            )
            updated = self.repository.get_visible(
                profile_id=profile_id,
                achievement_id=achievement.achievement_id,
            )
            log = self.repository.get_log(achievement_log_id=log_id)
        return {"achievement": achievement_to_dto(updated), "log": log_to_dto(log)}

    def archive(self, *, profile_id: UUID, achievement_id: UUID) -> dict:
        achievement = self.repository.get_visible(profile_id=profile_id, achievement_id=achievement_id)
        if achievement is None:
            raise PersonalAchievementNotFound()
        if achievement.status == "archived":
            return {"achievement": achievement_to_dto(achievement)}
        updated = self.repository.archive(achievement=achievement)
        return {"achievement": achievement_to_dto(updated)}

    def _get_editable(self, *, profile_id: UUID, achievement_id: UUID):
        achievement = self.repository.get_visible(profile_id=profile_id, achievement_id=achievement_id)
        if achievement is None:
            raise PersonalAchievementNotFound()
        if achievement.status == "archived":
            raise PersonalAchievementArchived()
        return achievement

    def _submit_progress(
        self,
        *,
        achievement_id: UUID,
        profile_id: UUID,
        delta_value: Decimal,
        note_text: str | None,
    ) -> UUID:
        try:
            return self.progress_procedure.submit(
                achievement_id=achievement_id,
                actor_profile_id=profile_id,
                delta_value=delta_value,
                note_text=note_text,
            )
        except DatabaseError as exc:
            raise PersonalAchievementProgressError() from exc

    def _validate_base_type_progress_target(self, *, base_type: str, progress_target: Decimal | None) -> None:
        if base_type == "done" and progress_target is not None:
            raise PersonalAchievementValidationError(
                {"progress_target": ["Progress target must be null for done achievements."]}
            )
        if base_type == "progress" and (progress_target is None or progress_target <= 0):
            raise PersonalAchievementValidationError(
                {"progress_target": ["Progress target is required and must be positive for progress achievements."]}
            )
