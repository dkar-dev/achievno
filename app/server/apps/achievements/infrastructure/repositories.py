from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID, uuid4

from django.db import IntegrityError, transaction
from django.utils import timezone


def load_model_graph() -> None:
    from apps.platform.infrastructure.main_selectors import load_unmanaged_model_graph

    load_unmanaged_model_graph()


@dataclass(frozen=True)
class CreateAchievementData:
    base_type: str
    title: str
    short_definition: str
    description: str | None
    progress_target: Decimal | None
    unit_label: str | None
    deadline_at: object | None
    primary_category_id: UUID | None
    rank_id: UUID | None


class PersonalAchievementRepository:
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

    def list_personal(
        self,
        *,
        profile_id: UUID,
        status_filter: str | None,
        limit: int,
    ) -> tuple[list[object], int]:
        owner_context = self.ensure_personal_owner_context(profile_id=profile_id)
        queryset = self._personal_queryset(profile_id=profile_id).filter(owner_context=owner_context)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        total_count = queryset.count()
        achievements = list(
            queryset.select_related("primary_category", "rank", "owner_context")
            .order_by("-updated_at", "-created_at")[:limit]
        )
        return achievements, total_count

    def get_personal(self, *, profile_id: UUID, achievement_id: UUID):
        return (
            self._personal_queryset(profile_id=profile_id)
            .select_related("primary_category", "rank", "owner_context")
            .filter(achievement_id=achievement_id)
            .first()
        )

    def recent_logs(self, *, achievement_id: UUID, limit: int = 10) -> list[object]:
        load_model_graph()
        from apps.achievements.infrastructure.models import AchievementLog

        return list(
            AchievementLog.objects.filter(achievement_id=achievement_id)
            .order_by("-created_at")[:limit]
        )

    def get_log(self, *, achievement_log_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import AchievementLog

        return AchievementLog.objects.get(achievement_log_id=achievement_log_id)

    @transaction.atomic
    def create_personal(self, *, profile_id: UUID, data: CreateAchievementData):
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        owner_context = self.ensure_personal_owner_context(profile_id=profile_id)
        now = timezone.now()
        achievement = Achievement.objects.create(
            achievement_id=uuid4(),
            created_by_profile_id=profile_id,
            owner_context=owner_context,
            base_type=data.base_type,
            assignment_mode="self",
            title=data.title,
            short_definition=data.short_definition,
            description=data.description,
            primary_category_id=data.primary_category_id,
            rank_id=data.rank_id,
            status="in_progress",
            deadline_at=data.deadline_at,
            progress_current=Decimal("0.00"),
            progress_target=data.progress_target,
            unit_label=data.unit_label,
            allow_negative_progress=False,
            approval_policy_id=None,
            completed_at=None,
            archived_at=None,
            created_at=now,
            updated_at=now,
        )
        return self.get_personal(profile_id=profile_id, achievement_id=achievement.achievement_id) or achievement

    def save_basic_fields(self, *, achievement, fields: dict[str, object]):
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        if not fields:
            return achievement
        for field_name, value in fields.items():
            setattr(achievement, field_name, value)
        achievement.updated_at = timezone.now()
        achievement.save(update_fields=[*fields.keys(), "updated_at"])
        return Achievement.objects.select_related("primary_category", "rank", "owner_context").get(
            achievement_id=achievement.achievement_id
        )

    def archive(self, *, achievement):
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        now = timezone.now()
        achievement.status = "archived"
        achievement.archived_at = now
        achievement.updated_at = now
        achievement.save(update_fields=["status", "archived_at", "updated_at"])
        return Achievement.objects.select_related("primary_category", "rank", "owner_context").get(
            achievement_id=achievement.achievement_id
        )

    def _personal_queryset(self, *, profile_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        return Achievement.objects.filter(
            owner_context__context_type="personal",
            owner_context__personal_profile_id=profile_id,
        )
