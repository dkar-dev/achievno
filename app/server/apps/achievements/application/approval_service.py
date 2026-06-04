from __future__ import annotations

from uuid import UUID

from django.db import DatabaseError, transaction

from apps.achievements.application.personal_query import (
    achievement_to_dto,
    approval_request_to_summary_dto,
    datetime_to_iso,
    log_to_dto,
)
from apps.achievements.domain.errors import (
    PersonalAchievementNotFound,
    PersonalAchievementProgressError,
)
from apps.achievements.infrastructure.approval_repositories import ApprovalRepository
from apps.achievements.infrastructure.procedures import ApprovalDecisionProcedure


def approval_request_to_dto(request, *, approvers: list[object], decisions: list[object]) -> dict:
    payload = approval_request_to_summary_dto(request)
    payload.update(
        {
            "achievement": achievement_to_dto(request.achievement),
            "origin_log": log_to_dto(request.origin_progress_log),
            "approvers": [
                {
                    "profile_id": str(approver.approver_profile_id),
                    "assigned_at": datetime_to_iso(approver.assigned_at),
                }
                for approver in approvers
            ],
            "decisions": [
                {
                    "approval_decision_id": str(decision.approval_decision_id),
                    "approver_profile_id": str(decision.approver_profile_id),
                    "decision_type": decision.decision_type,
                    "note_text": decision.note_text,
                    "decided_at": datetime_to_iso(decision.decided_at),
                }
                for decision in decisions
            ],
        }
    )
    return payload


class ApprovalService:
    def __init__(
        self,
        repository: ApprovalRepository | None = None,
        decision_procedure: ApprovalDecisionProcedure | None = None,
    ):
        self.repository = repository or ApprovalRepository()
        self.decision_procedure = decision_procedure or ApprovalDecisionProcedure()

    def list(self, *, profile_id: UUID, status_filter: str | None = None) -> dict:
        requests = self.repository.visible_requests(profile_id=profile_id, status_filter=status_filter)
        return {
            "items": [
                approval_request_to_dto(
                    request,
                    approvers=self.repository.approvers_for_request(
                        approval_request_id=request.approval_request_id
                    ),
                    decisions=self.repository.decisions_for_request(
                        approval_request_id=request.approval_request_id
                    ),
                )
                for request in requests
            ]
        }

    def detail(self, *, profile_id: UUID, approval_request_id: UUID) -> dict | None:
        request = self.repository.get_visible_request(
            profile_id=profile_id,
            approval_request_id=approval_request_id,
        )
        if request is None:
            return None
        return {
            "approval_request": approval_request_to_dto(
                request,
                approvers=self.repository.approvers_for_request(
                    approval_request_id=request.approval_request_id
                ),
                decisions=self.repository.decisions_for_request(
                    approval_request_id=request.approval_request_id
                ),
            )
        }

    def decide(
        self,
        *,
        profile_id: UUID,
        approval_request_id: UUID,
        decision: str,
        note_text: str | None,
    ) -> dict:
        request = self.repository.get_assigned_pending_request(
            profile_id=profile_id,
            approval_request_id=approval_request_id,
        )
        if request is None:
            raise PersonalAchievementNotFound()
        try:
            with transaction.atomic():
                self.decision_procedure.register(
                    approval_request_id=approval_request_id,
                    approver_profile_id=profile_id,
                    decision=decision,
                    note_text=note_text,
                )
        except DatabaseError as exc:
            raise PersonalAchievementProgressError() from exc

        updated = self.repository.get_visible_request(
            profile_id=profile_id,
            approval_request_id=approval_request_id,
        )
        if updated is None:
            raise PersonalAchievementNotFound()
        return {
            "approval_request": approval_request_to_dto(
                updated,
                approvers=self.repository.approvers_for_request(
                    approval_request_id=updated.approval_request_id
                ),
                decisions=self.repository.decisions_for_request(
                    approval_request_id=updated.approval_request_id
                ),
            )
        }
