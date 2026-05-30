from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from decimal import Decimal
from secrets import token_urlsafe
from uuid import UUID, uuid4

from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models import Count, Q
from django.utils import timezone


def load_model_graph() -> None:
    from apps.platform.infrastructure.main_selectors import load_unmanaged_model_graph

    load_unmanaged_model_graph()


@dataclass(frozen=True)
class CreateFriendAchievementData:
    base_type: str
    title: str
    short_definition: str
    description: str | None
    progress_target: Decimal | None
    unit_label: str | None
    deadline_at: object | None


class FriendRepository:
    def list_relations(self, *, profile_id: UUID, limit: int) -> tuple[list[object], int]:
        queryset = self._active_relation_queryset(profile_id=profile_id)
        return list(queryset.order_by("-updated_at", "-created_at")[:limit]), queryset.count()

    def get_visible_relation(self, *, profile_id: UUID, friend_connection_id: UUID):
        return (
            self._active_relation_queryset(profile_id=profile_id)
            .filter(friend_connection_id=friend_connection_id)
            .first()
        )

    def side_statuses(self, *, profile_id: UUID, relation_ids) -> dict[UUID, str]:
        load_model_graph()
        from apps.friends.infrastructure.models import FriendConnectionSide

        return {
            side.friend_connection_id: side.side_status
            for side in FriendConnectionSide.objects.filter(
                profile_id=profile_id,
                friend_connection_id__in=relation_ids,
            )
        }

    def achievement_counts(self, *, friend_connection_id: UUID) -> dict[str, int]:
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        counts = Achievement.objects.filter(
            owner_context__context_type="friend_connection",
            owner_context__friend_connection_id=friend_connection_id,
        ).aggregate(
            active=Count("achievement_id", filter=Q(status__in=["in_progress", "overdue", "in_review"])),
            completed=Count("achievement_id", filter=Q(status="completed")),
        )
        return {
            "active": counts["active"] or 0,
            "completed": counts["completed"] or 0,
        }

    @transaction.atomic
    def create_invite(self, *, profile_id: UUID):
        load_model_graph()
        from apps.platform.infrastructure.models import Invite

        now = timezone.now()
        return Invite.objects.create(
            invite_id=uuid4(),
            invite_kind="friend_request",
            delivery_mode="link",
            sender_profile_id=profile_id,
            target_profile_id=None,
            target_email=None,
            link_token=self._generate_token(),
            link_expires_at=now + timedelta(days=7),
            group_id=None,
            friend_connection_id=None,
            invite_status="pending",
            accepted_at=None,
            declined_at=None,
            revoked_at=None,
            expired_at=None,
            created_at=now,
            resolved_group_membership_id=None,
            resolved_friend_connection_id=None,
        )

    def get_invite_by_token(self, *, token: str):
        load_model_graph()
        from apps.platform.infrastructure.models import Invite

        return (
            Invite.objects.select_related("sender_profile", "target_profile", "resolved_friend_connection")
            .filter(link_token=token, invite_kind="friend_request", delivery_mode="link")
            .first()
        )

    @transaction.atomic
    def accept_invite(self, *, token: str, profile_id: UUID):
        load_model_graph()
        from apps.platform.infrastructure.models import Invite, InviteUsage

        invite = (
            Invite.objects.select_for_update()
            .filter(link_token=token, invite_kind="friend_request", delivery_mode="link")
            .first()
        )
        if invite is None:
            return None, "not_found"
        if invite.sender_profile_id == profile_id:
            return invite, "self_accept"
        if invite.target_profile_id is not None and invite.target_profile_id != profile_id:
            return invite, "target_mismatch"
        if invite.invite_status != "pending" or invite.accepted_at is not None:
            return invite, "already_used"

        now = timezone.now()
        if invite.link_expires_at is not None and invite.link_expires_at <= now:
            invite.invite_status = "expired"
            invite.expired_at = invite.expired_at or now
            invite.save(update_fields=["invite_status", "expired_at"])
            return invite, "expired"

        relation = self._find_existing_relation(
            left_profile_id=invite.sender_profile_id,
            right_profile_id=profile_id,
        )
        if relation is None:
            relation = self._create_relation(
                left_profile_id=invite.sender_profile_id,
                right_profile_id=profile_id,
                now=now,
            )

        invite.invite_status = "accepted"
        invite.accepted_at = now
        invite.resolved_friend_connection = relation
        invite.save(update_fields=["invite_status", "accepted_at", "resolved_friend_connection"])
        InviteUsage.objects.create(
            invite_usage_id=uuid4(),
            invite=invite,
            accepted_by_profile_id=profile_id,
            usage_status="accepted",
            used_at=now,
            resolved_group_membership_id=None,
            resolved_friend_connection=relation,
        )
        self.ensure_friend_owner_context(friend_connection_id=relation.friend_connection_id)
        return relation, "accepted"

    def list_friend_achievements(
        self,
        *,
        profile_id: UUID,
        friend_connection_id: UUID,
        limit: int = 100,
    ) -> list[object] | None:
        relation = self.get_visible_relation(
            profile_id=profile_id,
            friend_connection_id=friend_connection_id,
        )
        if relation is None:
            return None
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        return list(
            Achievement.objects.filter(
                owner_context__context_type="friend_connection",
                owner_context__friend_connection_id=friend_connection_id,
            )
            .select_related("primary_category", "rank", "owner_context")
            .order_by("-updated_at", "-created_at")[:limit]
        )

    @transaction.atomic
    def create_friend_achievement(
        self,
        *,
        profile_id: UUID,
        friend_connection_id: UUID,
        data: CreateFriendAchievementData,
    ):
        relation = self.get_visible_relation(
            profile_id=profile_id,
            friend_connection_id=friend_connection_id,
        )
        if relation is None:
            return None
        load_model_graph()
        from apps.achievements.infrastructure.models import Achievement

        owner_context = self.ensure_friend_owner_context(friend_connection_id=friend_connection_id)
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

    def ensure_friend_owner_context(self, *, friend_connection_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import OwnerContext

        owner_context = OwnerContext.objects.filter(
            context_type="friend_connection",
            friend_connection_id=friend_connection_id,
        ).first()
        if owner_context is not None:
            return owner_context

        try:
            return OwnerContext.objects.create(
                owner_context_id=uuid4(),
                context_type="friend_connection",
                personal_profile_id=None,
                friend_connection_id=friend_connection_id,
                group_id=None,
                created_at=timezone.now(),
            )
        except IntegrityError:
            return OwnerContext.objects.get(
                context_type="friend_connection",
                friend_connection_id=friend_connection_id,
            )

    def _active_relation_queryset(self, *, profile_id: UUID):
        load_model_graph()
        from apps.friends.infrastructure.models import FriendConnection
        from apps.friends.infrastructure.models import FriendConnectionSide

        active_relation_ids = FriendConnectionSide.objects.filter(
            profile_id=profile_id,
            side_status="active",
            removed_at__isnull=True,
        ).values("friend_connection_id")
        return (
            FriendConnection.objects.filter(
                Q(profile_a_id=profile_id) | Q(profile_b_id=profile_id),
                friend_connection_id__in=active_relation_ids,
                status="active",
                tombstoned_at__isnull=True,
            )
            .select_related("profile_a", "profile_b")
        )

    def _find_existing_relation(self, *, left_profile_id: UUID, right_profile_id: UUID):
        load_model_graph()
        from apps.friends.infrastructure.models import FriendConnection

        profile_a_id, profile_b_id = self._canonical_pair(left_profile_id, right_profile_id)
        return FriendConnection.objects.filter(
            profile_a_id=profile_a_id,
            profile_b_id=profile_b_id,
            status="active",
            tombstoned_at__isnull=True,
        ).first()

    def _create_relation(self, *, left_profile_id: UUID, right_profile_id: UUID, now):
        load_model_graph()
        from apps.friends.infrastructure.models import FriendConnection, FriendConnectionSide

        profile_a_id, profile_b_id = self._canonical_pair(left_profile_id, right_profile_id)
        relation = FriendConnection.objects.create(
            friend_connection_id=uuid4(),
            profile_a_id=profile_a_id,
            profile_b_id=profile_b_id,
            status="active",
            tombstoned_at=None,
            created_at=now,
            updated_at=now,
        )
        FriendConnectionSide.objects.create(
            friend_connection=relation,
            profile_id=profile_a_id,
            side_status="active",
            notifications_enabled=True,
            removed_at=None,
            updated_at=now,
            restored_at=None,
        )
        FriendConnectionSide.objects.create(
            friend_connection=relation,
            profile_id=profile_b_id,
            side_status="active",
            notifications_enabled=True,
            removed_at=None,
            updated_at=now,
            restored_at=None,
        )
        return relation

    def _generate_token(self) -> str:
        load_model_graph()
        from apps.platform.infrastructure.models import Invite

        for _ in range(5):
            token = token_urlsafe(24)
            if not Invite.objects.filter(link_token=token).exists():
                return token
        return token_urlsafe(32)

    def _canonical_pair(self, left_profile_id: UUID, right_profile_id: UUID) -> tuple[UUID, UUID]:
        left, right = sorted((left_profile_id, right_profile_id), key=str)
        return left, right


def invite_url_for_token(token: str) -> str:
    base_url = settings.ACHIEVNO_PUBLIC_APP_URL.rstrip("/")
    return f"{base_url}/app/invites/{token}"
