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
class CreateGroupData:
    title: str
    description: str | None
    visibility_type: str


@dataclass(frozen=True)
class CreateGroupAchievementData:
    base_type: str
    title: str
    short_definition: str
    description: str | None
    progress_target: Decimal | None
    unit_label: str | None
    deadline_at: object | None


class GroupRepository:
    def list_memberships(self, *, profile_id: UUID, limit: int) -> tuple[list[object], int]:
        queryset = self._active_membership_queryset(profile_id=profile_id)
        return list(queryset.order_by("-updated_at", "-joined_at")[:limit]), queryset.count()

    def get_visible_group(self, *, profile_id: UUID, group_id: UUID):
        membership = (
            self._active_membership_queryset(profile_id=profile_id)
            .filter(group_id=group_id)
            .first()
        )
        if membership is None:
            return None
        return membership.group, membership

    def member_count(self, *, group_id: UUID) -> int:
        load_model_graph()
        from apps.groups.infrastructure.models import GroupMembership

        return GroupMembership.objects.filter(
            group_id=group_id,
            left_at__isnull=True,
            membership_status="active",
        ).count()

    def achievement_counts(self, *, group_id: UUID) -> dict[str, int]:
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        counts = Achievement.objects.filter(
            owner_context__context_type="group",
            owner_context__group_id=group_id,
        ).aggregate(
            active=Count("achievement_id", filter=Q(status__in=["in_progress", "overdue", "in_review"])),
            completed=Count("achievement_id", filter=Q(status="completed")),
        )
        return {
            "active": counts["active"] or 0,
            "completed": counts["completed"] or 0,
        }

    @transaction.atomic
    def create_group(self, *, profile_id: UUID, data: CreateGroupData, role: str = "owner"):
        load_model_graph()
        from apps.groups.infrastructure.models import Group, GroupMembership

        now = timezone.now()
        group = Group.objects.create(
            group_id=uuid4(),
            title=data.title,
            description=data.description,
            avatar_url=None,
            visibility_type=data.visibility_type,
            base_permission="member",
            created_by_profile_id=profile_id,
            created_at=now,
            updated_at=now,
            deactivated_at=None,
        )
        membership = GroupMembership.objects.create(
            group_membership_id=uuid4(),
            group=group,
            profile_id=profile_id,
            role=role,
            membership_status="active",
            notifications_enabled=True,
            joined_at=now,
            left_at=None,
            invited_by_profile_id=None,
            created_at=now,
            updated_at=now,
        )
        self.ensure_group_owner_context(group_id=group.group_id)
        return group, membership

    @transaction.atomic
    def join_demo_group(self, *, profile_id: UUID, data: CreateGroupData):
        existing = (
            self._active_membership_queryset(profile_id=profile_id)
            .filter(group__title=data.title, group__deactivated_at__isnull=True)
            .first()
        )
        if existing is not None:
            return existing.group, existing
        return self.create_group(profile_id=profile_id, data=data, role="member")

    @transaction.atomic
    def join_public_group(self, *, profile_id: UUID, group_id: UUID):
        load_model_graph()
        from apps.groups.infrastructure.models import Group, GroupMembership

        group = Group.objects.filter(
            group_id=group_id,
            visibility_type="public",
            deactivated_at__isnull=True,
        ).first()
        if group is None:
            return None

        membership = GroupMembership.objects.filter(
            group_id=group_id,
            profile_id=profile_id,
            left_at__isnull=True,
        ).first()
        if membership is not None:
            if membership.membership_status == "active":
                return group, membership
            membership.membership_status = "active"
            membership.left_at = None
            membership.joined_at = timezone.now()
            membership.updated_at = timezone.now()
            membership.save(update_fields=["membership_status", "left_at", "joined_at", "updated_at"])
            return group, membership

        now = timezone.now()
        try:
            membership = GroupMembership.objects.create(
                group_membership_id=uuid4(),
                group=group,
                profile_id=profile_id,
                role="member",
                membership_status="active",
                notifications_enabled=True,
                joined_at=now,
                left_at=None,
                invited_by_profile_id=None,
                created_at=now,
                updated_at=now,
            )
        except IntegrityError:
            membership = GroupMembership.objects.get(
                group_id=group_id,
                profile_id=profile_id,
                membership_status="active",
            )
        self.ensure_group_owner_context(group_id=group.group_id)
        return group, membership

    def list_group_achievements(self, *, profile_id: UUID, group_id: UUID, limit: int = 100) -> list[object] | None:
        visible = self.get_visible_group(profile_id=profile_id, group_id=group_id)
        if visible is None:
            return None
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        return list(
            Achievement.objects.filter(
                owner_context__context_type="group",
                owner_context__group_id=group_id,
            )
            .select_related("primary_category", "rank", "owner_context")
            .order_by("-updated_at", "-created_at")[:limit]
        )

    @transaction.atomic
    def create_group_achievement(self, *, profile_id: UUID, group_id: UUID, data: CreateGroupAchievementData):
        visible = self.get_visible_group(profile_id=profile_id, group_id=group_id)
        if visible is None:
            return None
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        owner_context = self.ensure_group_owner_context(group_id=group_id)
        now = timezone.now()
        achievement = Achievement.objects.create(
            achievement_id=uuid4(),
            created_by_profile_id=profile_id,
            owner_context=owner_context,
            base_type=data.base_type,
            assignment_mode="all_members",
            title=data.title,
            short_definition=data.short_definition,
            description=data.description,
            primary_category_id=None,
            rank_id=None,
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
        return Achievement.objects.select_related("primary_category", "rank", "owner_context").get(
            achievement_id=achievement.achievement_id
        )

    def ensure_group_owner_context(self, *, group_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import OwnerContext

        owner_context = OwnerContext.objects.filter(
            context_type="group",
            group_id=group_id,
        ).first()
        if owner_context is not None:
            return owner_context

        try:
            return OwnerContext.objects.create(
                owner_context_id=uuid4(),
                context_type="group",
                personal_profile_id=None,
                friend_connection_id=None,
                group_id=group_id,
                created_at=timezone.now(),
            )
        except IntegrityError:
            return OwnerContext.objects.get(context_type="group", group_id=group_id)

    def _active_membership_queryset(self, *, profile_id: UUID):
        load_model_graph()
        from apps.groups.infrastructure.models import GroupMembership

        return (
            GroupMembership.objects.filter(
                profile_id=profile_id,
                left_at__isnull=True,
            )
            .exclude(membership_status__in=["removed", "blocked", "left"])
            .filter(group__deactivated_at__isnull=True)
            .select_related("group")
        )
