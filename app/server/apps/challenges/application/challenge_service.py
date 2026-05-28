from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from django.db import DatabaseError, transaction

from apps.challenges.application.challenge_query import (
    challenge_to_dto,
    event_to_dto,
    participant_to_dto,
)
from apps.challenges.domain.errors import (
    ChallengeArchived,
    ChallengeNotFound,
    ChallengeProgressError,
    ChallengeValidationError,
)
from apps.challenges.infrastructure.repositories import (
    ChallengeRepository,
    CreateChallengeData,
)


@dataclass(frozen=True)
class CreateChallengeCommand:
    title: str
    description: str | None = None
    goal_title: str | None = None
    target_value: Decimal | None = None
    unit_label: str | None = None
    starts_at: object | None = None
    ends_at: object | None = None


class ChallengeService:
    def __init__(self, repository: ChallengeRepository | None = None):
        self.repository = repository or ChallengeRepository()

    def create(self, *, profile_id: UUID, command: CreateChallengeCommand) -> dict:
        self._validate_target(command.target_value)
        challenge = self.repository.create_personal(
            profile_id=profile_id,
            data=CreateChallengeData(
                title=command.title,
                description=command.description,
                goal_title=command.goal_title,
                target_value=command.target_value,
                unit_label=command.unit_label,
                starts_at=command.starts_at,
                ends_at=command.ends_at,
            ),
        )
        return {
            "challenge": challenge_to_dto(
                challenge,
                participant_count=self.repository.participant_count(challenge_id=challenge.challenge_id),
            )
        }

    def join(self, *, profile_id: UUID, challenge_id: UUID) -> dict:
        challenge = self._get_mutable(profile_id=profile_id, challenge_id=challenge_id)
        participant = self.repository.ensure_participant(challenge_id=challenge.challenge_id, profile_id=profile_id)
        return {
            "challenge": challenge_to_dto(
                challenge,
                participant_count=self.repository.participant_count(challenge_id=challenge.challenge_id),
            ),
            "participant": participant_to_dto(participant),
        }

    def progress(
        self,
        *,
        profile_id: UUID,
        challenge_id: UUID,
        delta_value: Decimal,
        note_text: str | None,
    ) -> dict:
        if delta_value == 0:
            raise ChallengeValidationError({"delta_value": ["Delta value must be non-zero."]})
        challenge = self._get_mutable(profile_id=profile_id, challenge_id=challenge_id)
        try:
            with transaction.atomic():
                participant = self.repository.ensure_participant(
                    challenge_id=challenge.challenge_id,
                    profile_id=profile_id,
                )
                participant = self.repository.save_participant_progress(
                    participant=participant,
                    delta_value=delta_value,
                )
                event = self.repository.add_progress_event(
                    challenge_id=challenge.challenge_id,
                    profile_id=profile_id,
                    delta_value=delta_value,
                    note_text=note_text,
                )
        except DatabaseError as exc:
            raise ChallengeProgressError() from exc
        return {
            "challenge": challenge_to_dto(
                challenge,
                participant_count=self.repository.participant_count(challenge_id=challenge.challenge_id),
            ),
            "participant": participant_to_dto(participant),
            "event": event_to_dto(event),
        }

    def complete(self, *, profile_id: UUID, challenge_id: UUID, note_text: str | None) -> dict:
        challenge = self._get_mutable(profile_id=profile_id, challenge_id=challenge_id)
        try:
            with transaction.atomic():
                participant = self.repository.ensure_participant(
                    challenge_id=challenge.challenge_id,
                    profile_id=profile_id,
                )
                delta_value = self._completion_delta(
                    current_progress=participant.current_progress,
                    target_value=challenge.progress_target,
                )
                participant = self.repository.mark_participant_completed(
                    participant=participant,
                    target_value=challenge.progress_target,
                )
                event = self.repository.add_completion_event(
                    challenge_id=challenge.challenge_id,
                    profile_id=profile_id,
                    delta_value=delta_value,
                    note_text=note_text,
                )
        except DatabaseError as exc:
            raise ChallengeProgressError() from exc
        return {
            "challenge": challenge_to_dto(
                challenge,
                participant_count=self.repository.participant_count(challenge_id=challenge.challenge_id),
            ),
            "participant": participant_to_dto(participant),
            "event": event_to_dto(event),
        }

    def _get_mutable(self, *, profile_id: UUID, challenge_id: UUID):
        challenge = self.repository.get_visible(profile_id=profile_id, challenge_id=challenge_id)
        if challenge is None:
            raise ChallengeNotFound()
        if challenge.lifecycle_state == "archived":
            raise ChallengeArchived()
        return challenge

    def _validate_target(self, target_value: Decimal | None) -> None:
        if target_value is not None and target_value <= 0:
            raise ChallengeValidationError({"target_value": ["Target value must be positive."]})

    def _completion_delta(self, *, current_progress: Decimal, target_value: Decimal | None) -> Decimal:
        if target_value is None:
            return Decimal("1.00")
        return max(target_value - current_progress, Decimal("0.00"))
