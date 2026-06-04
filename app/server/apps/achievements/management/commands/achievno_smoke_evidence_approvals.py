from __future__ import annotations

from uuid import uuid4

from django.core.management.base import BaseCommand, CommandError
from django.test import override_settings
from rest_framework.test import APIClient

from apps.accounts.management.commands.achievno_smoke_auth import (
    AuthSmokeFailure,
    ensure_live_postgresql_database,
    expect_status,
    safe_json,
)
from apps.achievements.management.commands.achievno_smoke_personal_achievements import (
    PersonalAchievementsSmokeFailure,
    sign_in_smoke_user,
)


class EvidenceApprovalsSmokeFailure(Exception):
    pass


def run_evidence_approvals_smoke(stdout) -> None:
    user_a_client = APIClient()
    user_a = sign_in_smoke_user(user_a_client, stdout)

    user_b_client = APIClient()
    user_b = sign_in_smoke_user(user_b_client, stdout)
    if user_a.profile_id == user_b.profile_id:
        raise EvidenceApprovalsSmokeFailure("auth setup returned duplicate profiles")

    create_invite_response = user_a_client.post("/api/v1/friends/invites", {}, format="json")
    expect_status("create invite", create_invite_response, 201)
    token = safe_json(create_invite_response, "create invite")["invite"]["token"]

    accept_response = user_b_client.post(f"/api/v1/friends/invites/{token}/accept", {}, format="json")
    expect_status("accept invite", accept_response, 201)
    relation_id = safe_json(accept_response, "accept invite")["relation"]["friend_connection_id"]
    stdout.write("shared relation ok")

    suffix = uuid4().hex[:8]
    create_achievement_response = user_a_client.post(
        f"/api/v1/friends/{relation_id}/achievements",
        {
            "base_type": "done",
            "title": f"Smoke approval {suffix}",
            "short_definition": "Complete with evidence and approval.",
            "description": "Created by evidence approvals smoke command.",
        },
        format="json",
    )
    expect_status("create shared achievement", create_achievement_response, 201)
    achievement_id = safe_json(create_achievement_response, "create shared achievement")["achievement"][
        "achievement_id"
    ]
    stdout.write("create shared achievement ok")

    evidence_response = user_a_client.post(
        f"/api/v1/achievements/{achievement_id}/evidence",
        {
            "kind": "link",
            "url": "https://example.com/proof",
            "note_text": "smoke proof link",
        },
        format="json",
    )
    expect_status("attach evidence", evidence_response, 201)
    if safe_json(evidence_response, "attach evidence")["evidence"].get("kind") != "link":
        raise EvidenceApprovalsSmokeFailure("attach evidence returned unexpected payload")
    stdout.write("attach evidence ok")

    list_evidence_response = user_a_client.get(f"/api/v1/achievements/{achievement_id}/evidence")
    expect_status("list evidence", list_evidence_response, 200)
    if not safe_json(list_evidence_response, "list evidence").get("items"):
        raise EvidenceApprovalsSmokeFailure("list evidence returned no items")
    stdout.write("list evidence ok")

    complete_response = user_a_client.post(
        f"/api/v1/achievements/{achievement_id}/complete",
        {"note_text": "ready for approval"},
        format="json",
    )
    expect_status("complete shared achievement", complete_response, 200)
    complete_body = safe_json(complete_response, "complete shared achievement")
    approval_request = complete_body.get("approval_request")
    if not isinstance(approval_request, dict) or approval_request.get("request_status") != "pending":
        raise EvidenceApprovalsSmokeFailure("complete did not create pending approval request")
    approval_request_id = approval_request["approval_request_id"]
    if complete_body.get("achievement", {}).get("status") != "in_review":
        raise EvidenceApprovalsSmokeFailure("shared achievement did not enter review")
    stdout.write("complete shared achievement created approval ok")

    approvals_response = user_b_client.get("/api/v1/approvals?status=pending", format="json")
    expect_status("list approvals", approvals_response, 200)
    approval_items = safe_json(approvals_response, "list approvals").get("items")
    if not any(item.get("approval_request_id") == approval_request_id for item in approval_items or []):
        raise EvidenceApprovalsSmokeFailure("approver did not see pending request")
    stdout.write("list approvals ok")

    approve_response = user_b_client.post(
        f"/api/v1/approvals/{approval_request_id}/approve",
        {"note_text": "approved by smoke"},
        format="json",
    )
    expect_status("approve request", approve_response, 200)
    approved_request = safe_json(approve_response, "approve request")["approval_request"]
    if approved_request.get("request_status") != "approved":
        raise EvidenceApprovalsSmokeFailure("approval request did not become approved")
    if approved_request.get("achievement", {}).get("status") != "completed":
        raise EvidenceApprovalsSmokeFailure("achievement did not become completed after approval")
    stdout.write("approve request ok")

    notifications_response = user_b_client.get("/api/v1/notifications/", format="json")
    expect_status("list notifications", notifications_response, 200)
    notifications = safe_json(notifications_response, "list notifications").get("items")
    matching = [
        notification
        for notification in notifications or []
        if notification.get("approval_request_id") == approval_request_id
    ]
    if not matching:
        raise EvidenceApprovalsSmokeFailure("approval notification was not listed")
    notification_id = matching[0]["notification_id"]
    stdout.write("list notifications ok")

    read_response = user_b_client.post(f"/api/v1/notifications/{notification_id}/read", {}, format="json")
    expect_status("mark notification read", read_response, 200)
    if not safe_json(read_response, "mark notification read")["notification"].get("is_read"):
        raise EvidenceApprovalsSmokeFailure("notification did not become read")
    stdout.write("mark notification read ok")
    stdout.write("evidence approvals smoke ok")


class Command(BaseCommand):
    help = "Run live PostgreSQL evidence, approval-lite, and notifications smoke flow."

    def handle(self, *args, **options):
        try:
            ensure_live_postgresql_database()
            with override_settings(
                ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN=True,
                ACHIEVNO_SEND_VERIFICATION_EMAIL=False,
            ):
                run_evidence_approvals_smoke(self.stdout)
        except (AuthSmokeFailure, PersonalAchievementsSmokeFailure, EvidenceApprovalsSmokeFailure) as exc:
            raise CommandError(str(exc)) from exc
