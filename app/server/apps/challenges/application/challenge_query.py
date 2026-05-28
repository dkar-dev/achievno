from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from apps.challenges.infrastructure.repositories import ChallengeRepository


def decimal_to_number(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(value)


def datetime_to_iso(value) -> str | None:
    if value is None:
        return None
    return value.isoformat()


def challenge_to_dto(challenge, *, participant_count: int = 0) -> dict:
    return {
        "challenge_id": str(challenge.challenge_id),
        "title": challenge.title,
        "description": challenge.description,
        "status": challenge.lifecycle_state,
        "target_value": decimal_to_number(challenge.progress_target),
        "unit_label": challenge.unit_label,
        "starts_at": datetime_to_iso(challenge.start_at),
        "ends_at": datetime_to_iso(challenge.end_at),
        "created_at": datetime_to_iso(challenge.created_at),
        "updated_at": datetime_to_iso(challenge.updated_at),
        "participant_count": participant_count,
    }


def participant_to_dto(participant) -> dict | None:
    if participant is None:
        return None
    return {
        "profile_id": str(participant.profile_id),
        "status": participant.state,
        "progress_value": decimal_to_number(participant.current_progress),
        "completed_at": datetime_to_iso(participant.completed_at),
        "joined_at": datetime_to_iso(participant.joined_at),
    }


def event_to_dto(event) -> dict:
    payload = event.payload_json or {}
    return {
        "challenge_completion_event_id": str(event.challenge_completion_event_id),
        "profile_id": str(event.profile_id),
        "delta_value": decimal_to_number(_payload_decimal(payload.get("delta_value"))),
        "note_text": payload.get("note_text"),
        "created_at": datetime_to_iso(event.created_at),
    }


def _payload_decimal(value: object) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(value))


class ChallengeQuery:
    def __init__(self, repository: ChallengeRepository | None = None):
        self.repository = repository or ChallengeRepository()

    def list(self, *, profile_id: UUID, status_filter: str | None = None, limit: int = 50) -> dict:
        challenges, total_count, participant_counts = self.repository.list_visible(
            profile_id=profile_id,
            status_filter=status_filter,
            limit=limit,
        )
        return {
            "items": [
                challenge_to_dto(
                    challenge,
                    participant_count=participant_counts.get(challenge.challenge_id, 0),
                )
                for challenge in challenges
            ],
            "total_count": total_count,
        }

    def detail(self, *, profile_id: UUID, challenge_id: UUID) -> dict | None:
        challenge = self.repository.get_visible(profile_id=profile_id, challenge_id=challenge_id)
        if challenge is None:
            return None
        participant = self.repository.get_participant(
            challenge_id=challenge.challenge_id,
            profile_id=profile_id,
        )
        return {
            "challenge": challenge_to_dto(
                challenge,
                participant_count=self.repository.participant_count(challenge_id=challenge.challenge_id),
            ),
            "participant": participant_to_dto(participant),
            "recent_completion_events": [
                event_to_dto(event)
                for event in self.repository.recent_completion_events(
                    challenge_id=challenge.challenge_id,
                    profile_id=profile_id,
                )
            ],
        }
