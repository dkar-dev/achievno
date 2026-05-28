from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID, uuid4

from django.db import IntegrityError, transaction
from django.db.models import Count, Q
from django.utils import timezone


def load_model_graph() -> None:
    from apps.platform.infrastructure.main_selectors import load_unmanaged_model_graph

    load_unmanaged_model_graph()


@dataclass(frozen=True)
class CreateChallengeData:
    title: str
    description: str | None
    goal_title: str | None
    target_value: Decimal | None
    unit_label: str | None
    starts_at: object | None
    ends_at: object | None


class ChallengeRepository:
    def ensure_personal_owner_context(self, *, profile_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import OwnerContext

        owner_context = OwnerContext.objects.filter(
            context_type="personal",
            personal_profile_id=profile_id,
        ).first()
        if owner_context is not None:
            return owner_context

        try:
            return OwnerContext.objects.create(
                owner_context_id=uuid4(),
                context_type="personal",
                personal_profile_id=profile_id,
                friend_connection_id=None,
                group_id=None,
                created_at=timezone.now(),
            )
        except IntegrityError:
            return OwnerContext.objects.get(
                context_type="personal",
                personal_profile_id=profile_id,
            )

    def list_visible(
        self,
        *,
        profile_id: UUID,
        status_filter: str | None,
        limit: int,
    ) -> tuple[list[object], int, dict[UUID, int]]:
        queryset = self._visible_queryset(profile_id=profile_id)
        if status_filter:
            queryset = queryset.filter(lifecycle_state=status_filter)
        total_count = queryset.count()
        challenges = list(queryset.order_by("-updated_at", "-created_at")[:limit])
        participant_counts = self._participant_counts([challenge.challenge_id for challenge in challenges])
        return challenges, total_count, participant_counts

    def get_visible(self, *, profile_id: UUID, challenge_id: UUID):
        return self._visible_queryset(profile_id=profile_id).filter(challenge_id=challenge_id).first()

    def participant_count(self, *, challenge_id: UUID) -> int:
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeParticipant

        return ChallengeParticipant.objects.filter(
            challenge_id=challenge_id,
        ).exclude(state="left").count()

    def get_participant(self, *, challenge_id: UUID, profile_id: UUID):
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeParticipant

        return ChallengeParticipant.objects.filter(
            challenge_id=challenge_id,
            profile_id=profile_id,
        ).first()

    def recent_completion_events(
        self,
        *,
        challenge_id: UUID,
        profile_id: UUID,
        limit: int = 10,
    ) -> list[object]:
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeCompletionEvent

        return list(
            ChallengeCompletionEvent.objects.filter(
                challenge_id=challenge_id,
                profile_id=profile_id,
            ).order_by("-created_at")[:limit]
        )

    def get_event(self, *, event_id: UUID):
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeCompletionEvent

        return ChallengeCompletionEvent.objects.get(challenge_completion_event_id=event_id)

    @transaction.atomic
    def create_personal(self, *, profile_id: UUID, data: CreateChallengeData):
        load_model_graph()
        from apps.challenges.infrastructure.models import Challenge

        owner_context = self.ensure_personal_owner_context(profile_id=profile_id)
        now = timezone.now()
        challenge = Challenge.objects.create(
            challenge_id=uuid4(),
            created_by_profile_id=profile_id,
            owner_context=owner_context,
            challenge_type="top_by_progress" if data.target_value is not None else "done_with_history",
            title=data.title,
            short_definition=data.goal_title or data.title,
            description=data.description,
            rules_text=None,
            primary_category_id=None,
            rank_id=None,
            start_at=data.starts_at,
            end_at=data.ends_at,
            progress_target=data.target_value,
            unit_label=data.unit_label,
            lifecycle_state="active",
            winner_profile_id=None,
            archived_at=None,
            created_at=now,
            updated_at=now,
        )
        self.ensure_participant(challenge_id=challenge.challenge_id, profile_id=profile_id)
        return self.get_visible(profile_id=profile_id, challenge_id=challenge.challenge_id) or challenge

    def ensure_participant(self, *, challenge_id: UUID, profile_id: UUID):
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeParticipant

        participant = self.get_participant(challenge_id=challenge_id, profile_id=profile_id)
        if participant is None:
            return ChallengeParticipant.objects.create(
                challenge_id=challenge_id,
                profile_id=profile_id,
                state="joined",
                current_progress=Decimal("0.00"),
                current_rank=None,
                joined_at=timezone.now(),
                left_at=None,
                completed_at=None,
                winner_position=None,
            )
        if participant.state == "left":
            ChallengeParticipant.objects.filter(
                challenge_id=challenge_id,
                profile_id=profile_id,
            ).update(state="joined", left_at=None)
            return self.get_participant(challenge_id=challenge_id, profile_id=profile_id)
        return participant

    def add_progress_event(
        self,
        *,
        challenge_id: UUID,
        profile_id: UUID,
        delta_value: Decimal,
        note_text: str | None,
    ):
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeCompletionEvent

        return ChallengeCompletionEvent.objects.create(
            challenge_completion_event_id=uuid4(),
            challenge_id=challenge_id,
            profile_id=profile_id,
            event_type="progress_recorded",
            payload_json={
                "delta_value": str(delta_value),
                "note_text": note_text,
            },
            created_at=timezone.now(),
        )

    def add_completion_event(
        self,
        *,
        challenge_id: UUID,
        profile_id: UUID,
        delta_value: Decimal,
        note_text: str | None,
    ):
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeCompletionEvent

        return ChallengeCompletionEvent.objects.create(
            challenge_completion_event_id=uuid4(),
            challenge_id=challenge_id,
            profile_id=profile_id,
            event_type="completed",
            payload_json={
                "delta_value": str(delta_value),
                "note_text": note_text,
            },
            created_at=timezone.now(),
        )

    def save_participant_progress(self, *, participant, delta_value: Decimal):
        next_progress = participant.current_progress + delta_value
        self._participant_queryset(participant=participant).update(current_progress=next_progress)
        return self.get_participant(
            challenge_id=participant.challenge_id,
            profile_id=participant.profile_id,
        )

    def mark_participant_completed(self, *, participant, target_value: Decimal | None):
        now = timezone.now()
        next_progress = participant.current_progress
        if target_value is not None and participant.current_progress < target_value:
            next_progress = target_value
        self._participant_queryset(participant=participant).update(
            state="completed",
            current_progress=next_progress,
            completed_at=now,
        )
        return self.get_participant(
            challenge_id=participant.challenge_id,
            profile_id=participant.profile_id,
        )

    def _participant_queryset(self, *, participant):
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeParticipant

        return ChallengeParticipant.objects.filter(
            challenge_id=participant.challenge_id,
            profile_id=participant.profile_id,
        )

    def _visible_queryset(self, *, profile_id: UUID):
        load_model_graph()
        from apps.challenges.infrastructure.models import Challenge
        from apps.challenges.infrastructure.models import ChallengeParticipant

        participated_challenge_ids = ChallengeParticipant.objects.filter(
            profile_id=profile_id,
        ).values("challenge_id")

        return (
            Challenge.objects.filter(
                Q(created_by_profile_id=profile_id)
                | Q(owner_context__context_type="personal", owner_context__personal_profile_id=profile_id)
                | Q(challenge_id__in=participated_challenge_ids)
            )
            .select_related("owner_context")
            .distinct()
        )

    def _participant_counts(self, challenge_ids: list[UUID]) -> dict[UUID, int]:
        if not challenge_ids:
            return {}
        load_model_graph()
        from apps.challenges.infrastructure.models import ChallengeParticipant

        rows = (
            ChallengeParticipant.objects.filter(challenge_id__in=challenge_ids)
            .exclude(state="left")
            .values("challenge_id")
            .annotate(count=Count("profile_id"))
        )
        return {row["challenge_id"]: row["count"] for row in rows}
