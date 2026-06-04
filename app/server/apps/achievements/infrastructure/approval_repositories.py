from __future__ import annotations

from uuid import UUID

from django.db import models

from apps.achievements.infrastructure.repositories import load_model_graph


class ApprovalRepository:
    def visible_requests(self, *, profile_id: UUID, status_filter: str | None = None) -> list[object]:
        queryset = self._visible_request_queryset(profile_id=profile_id)
        if status_filter:
            queryset = queryset.filter(request_status=status_filter)
        return list(queryset.order_by("-created_at")[:100])

    def get_visible_request(self, *, profile_id: UUID, approval_request_id: UUID):
        return (
            self._visible_request_queryset(profile_id=profile_id)
            .filter(approval_request_id=approval_request_id)
            .first()
        )

    def get_assigned_pending_request(self, *, profile_id: UUID, approval_request_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import ApprovalRequest, ApprovalRequestApprover

        assigned_request_ids = ApprovalRequestApprover.objects.filter(
            approver_profile_id=profile_id,
        ).values("approval_request_id")

        return (
            ApprovalRequest.objects.select_related(
                "achievement",
                "achievement__owner_context",
                "origin_progress_log",
            )
            .filter(
                approval_request_id=approval_request_id,
                request_status="pending",
                approval_request_id__in=assigned_request_ids,
            )
            .first()
        )

    def approvers_for_request(self, *, approval_request_id: UUID) -> list[object]:
        load_model_graph()
        from apps.achievements.infrastructure.models import ApprovalRequestApprover

        return list(
            ApprovalRequestApprover.objects.filter(approval_request_id=approval_request_id)
            .order_by("assigned_at")
        )

    def decisions_for_request(self, *, approval_request_id: UUID) -> list[object]:
        load_model_graph()
        from apps.achievements.infrastructure.models import ApprovalDecision

        return list(
            ApprovalDecision.objects.filter(approval_request_id=approval_request_id)
            .order_by("decided_at")
        )

    def _visible_request_queryset(self, *, profile_id: UUID):
        load_model_graph()
        from apps.achievements.infrastructure.models import ApprovalRequest, ApprovalRequestApprover
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
        assigned_request_ids = ApprovalRequestApprover.objects.filter(
            approver_profile_id=profile_id,
        ).values("approval_request_id")

        return (
            ApprovalRequest.objects.select_related(
                "achievement",
                "achievement__owner_context",
                "origin_progress_log",
            )
            .filter(
                models.Q(origin_progress_log__actor_profile_id=profile_id)
                | models.Q(approval_request_id__in=assigned_request_ids)
                | (
                    models.Q(achievement__owner_context__context_type="personal")
                    & models.Q(achievement__owner_context__personal_profile_id=profile_id)
                )
                | (
                    models.Q(achievement__owner_context__context_type="group")
                    & models.Q(achievement__owner_context__group_id__in=active_group_ids)
                )
                | (
                    models.Q(achievement__owner_context__context_type="friend_connection")
                    & models.Q(achievement__owner_context__friend_connection_id__in=active_friend_connection_ids)
                )
            )
            .distinct()
        )
