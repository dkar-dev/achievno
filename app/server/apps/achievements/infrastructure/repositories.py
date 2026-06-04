from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID, uuid4

from django.db import IntegrityError, models, transaction
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

    def get_visible(self, *, profile_id: UUID, achievement_id: UUID):
        return (
            self._visible_queryset(profile_id=profile_id)
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

    def evidence_logs(self, *, achievement_id: UUID) -> list[object]:
        load_model_graph()
        from apps.achievements.infrastructure.models import AchievementLog

        return list(
            AchievementLog.objects.filter(achievement_id=achievement_id)
            .order_by("-created_at")
        )

    def get_log(self, *, achievement_log_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import AchievementLog

        return AchievementLog.objects.get(achievement_log_id=achievement_log_id)

    def create_evidence_log(self, *, achievement, profile_id: UUID, note_text: str | None):
        load_model_graph()
        from apps.achievements.infrastructure.models import AchievementLog

        return AchievementLog.objects.create(
            achievement_log_id=uuid4(),
            achievement=achievement,
            actor_profile_id=profile_id,
            action_type="evidence_attached",
            delta_value=Decimal("0.00"),
            resulting_value=achievement.progress_current,
            note_text=note_text,
            created_at=timezone.now(),
        )

    def create_evidence_asset(
        self,
        *,
        owner_profile_id: UUID,
        storage_provider: str,
        storage_key: str,
        file_name: str,
        mime_type: str,
        size_bytes: int,
        checksum_sha256: str,
    ):
        load_model_graph()
        from apps.achievements.infrastructure.models import EvidenceAsset

        return EvidenceAsset.objects.create(
            evidence_asset_id=uuid4(),
            owner_profile_id=owner_profile_id,
            storage_provider=storage_provider,
            storage_key=storage_key,
            file_name=file_name,
            mime_type=mime_type,
            size_bytes=size_bytes,
            checksum_sha256=checksum_sha256,
            created_at=timezone.now(),
        )

    def create_evidence_link(
        self,
        *,
        target_kind: str,
        target_id: UUID,
        asset,
        caption: str | None,
    ):
        load_model_graph()
        from apps.achievements.infrastructure.models import EvidenceLink

        return EvidenceLink.objects.create(
            evidence_link_id=uuid4(),
            target_kind=target_kind,
            target_id=target_id,
            asset=asset,
            caption=caption,
            created_at=timezone.now(),
        )

    def list_evidence_links(self, *, target_ids_by_kind: dict[str, list[UUID]]) -> list[object]:
        load_model_graph()
        from apps.achievements.infrastructure.models import EvidenceLink

        query = models.Q()
        for target_kind, target_ids in target_ids_by_kind.items():
            if target_ids:
                query |= models.Q(target_kind=target_kind, target_id__in=target_ids)
        if not query:
            return []
        return list(
            EvidenceLink.objects.select_related("asset")
            .filter(query)
            .order_by("-created_at")
        )

    def ensure_completion_approval_policy(self, *, achievement, profile_id: UUID):
        if achievement.owner_context.context_type == "personal" or achievement.approval_policy_id:
            return achievement

        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement, ApprovalPolicy

        now = timezone.now()
        policy = ApprovalPolicy.objects.create(
            approval_policy_id=uuid4(),
            mode="completion",
            min_approvals=1,
            require_evidence=False,
            allowed_approver_scope="all_members",
            created_by_profile_id=profile_id,
            owner_context=achievement.owner_context,
            created_at=now,
            updated_at=now,
        )
        achievement.approval_policy = policy
        achievement.updated_at = now
        achievement.save(update_fields=["approval_policy", "updated_at"])
        return Achievement.objects.select_related("primary_category", "rank", "owner_context").get(
            achievement_id=achievement.achievement_id
        )

    def latest_approval_request_for_log(self, *, achievement_id: UUID, achievement_log_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import ApprovalRequest

        return (
            ApprovalRequest.objects.select_related("achievement", "origin_progress_log")
            .filter(achievement_id=achievement_id, origin_progress_log_id=achievement_log_id)
            .order_by("-created_at")
            .first()
        )

    def latest_approval_request_for_achievement(self, *, achievement_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import ApprovalRequest

        return (
            ApprovalRequest.objects.select_related("achievement", "origin_progress_log")
            .filter(achievement_id=achievement_id)
            .order_by("-created_at")
            .first()
        )

    def approval_requests_for_achievement(self, *, achievement_id: UUID) -> list[object]:
        load_model_graph()
        from apps.achievements.infrastructure.models import ApprovalRequest

        return list(
            ApprovalRequest.objects.select_related("achievement", "origin_progress_log")
            .filter(achievement_id=achievement_id)
            .order_by("-created_at")
        )

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

    def _visible_queryset(self, *, profile_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement
        from apps.friends.infrastructure.models import FriendConnectionSide
        from apps.groups.infrastructure.models import GroupMembership

        active_group_ids = GroupMembership.objects.filter(
            profile_id=profile_id,
            membership_status="active",
            left_at__isnull=True,
        ).values("group_id")
        active_friend_connection_ids = FriendConnectionSide.objects.filter(
            profile_id=profile_id,
            side_status="active",
            removed_at__isnull=True,
            friend_connection__status="active",
            friend_connection__tombstoned_at__isnull=True,
        ).values("friend_connection_id")

        return Achievement.objects.filter(
            (
                models.Q(owner_context__context_type="personal")
                & models.Q(owner_context__personal_profile_id=profile_id)
            )
            | (
                models.Q(owner_context__context_type="group")
                & models.Q(owner_context__group_id__in=active_group_ids)
            )
            | (
                models.Q(owner_context__context_type="friend_connection")
                & models.Q(owner_context__friend_connection_id__in=active_friend_connection_ids)
            )
        )
