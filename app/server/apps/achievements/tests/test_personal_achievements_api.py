from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from apps.accounts.infrastructure.authentication import AuthPrincipal


class PersonalAchievementsApiTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()
        self.account_id = uuid4()
        self.profile_id = uuid4()
        self.session_id = uuid4()
        self.client.force_authenticate(
            user=AuthPrincipal(
                account_id=self.account_id,
                profile_id=self.profile_id,
                session_id=self.session_id,
            )
        )

    def test_personal_list_requires_authentication(self):
        client = APIClient()

        response = client.get("/api/v1/achievements/personal")

        self.assertEqual(response.status_code, 403)

    @patch("apps.achievements.api.views.PersonalAchievementQuery")
    def test_personal_list_returns_stable_payload(self, query_class):
        query_class.return_value.list.return_value = {"items": [], "total_count": 0}

        response = self.client.get("/api/v1/achievements/personal?status=in_progress&limit=10")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"items": [], "total_count": 0})
        query_class.return_value.list.assert_called_once_with(
            profile_id=self.profile_id,
            status_filter="in_progress",
            limit=10,
        )

    @patch("apps.achievements.api.views.PersonalAchievementService")
    def test_create_personal_done_achievement(self, service_class):
        achievement_id = uuid4()
        service_class.return_value.create.return_value = {
            "achievement": {
                "achievement_id": str(achievement_id),
                "base_type": "done",
                "assignment_mode": "self",
                "status": "in_progress",
                "title": "Ship P1",
                "short_definition": "Finish personal achievements",
            }
        }

        response = self.client.post(
            "/api/v1/achievements/personal",
            {
                "base_type": "done",
                "title": "Ship P1",
                "short_definition": "Finish personal achievements",
                "description": "Backend and frontend flow",
                "progress_target": None,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["achievement"]["assignment_mode"], "self")
        command = service_class.return_value.create.call_args.kwargs["command"]
        self.assertEqual(command.base_type, "done")
        self.assertEqual(command.progress_target, None)

    def test_create_rejects_progress_without_positive_target(self):
        response = self.client.post(
            "/api/v1/achievements/personal",
            {
                "base_type": "progress",
                "title": "Read",
                "short_definition": "Read books",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"]["code"], "validation_error")
        self.assertIn("progress_target", response.json()["error"]["fields"])

    @patch("apps.achievements.api.views.PersonalAchievementQuery")
    def test_detail_returns_achievement_and_recent_logs(self, query_class):
        achievement_id = uuid4()
        query_class.return_value.detail.return_value = {
            "achievement": {"achievement_id": str(achievement_id), "title": "Read"},
            "recent_logs": [],
            "approval_request": None,
        }

        response = self.client.get(f"/api/v1/achievements/{achievement_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["achievement"]["achievement_id"], str(achievement_id))
        query_class.return_value.detail.assert_called_once_with(
            profile_id=self.profile_id,
            achievement_id=achievement_id,
        )

    @patch("apps.achievements.api.views.PersonalAchievementQuery")
    def test_detail_returns_404_for_inaccessible_id(self, query_class):
        achievement_id = uuid4()
        query_class.return_value.detail.return_value = None

        response = self.client.get(f"/api/v1/achievements/{achievement_id}")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["error"]["code"], "not_found")

    @patch("apps.achievements.api.views.PersonalAchievementService")
    def test_patch_updates_basic_fields(self, service_class):
        achievement_id = uuid4()
        service_class.return_value.update_basic.return_value = {
            "achievement": {"achievement_id": str(achievement_id), "title": "Updated"}
        }

        response = self.client.patch(
            f"/api/v1/achievements/{achievement_id}",
            {"title": "Updated", "progress_target": "5.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        service_class.return_value.update_basic.assert_called_once_with(
            profile_id=self.profile_id,
            achievement_id=achievement_id,
            fields={"title": "Updated", "progress_target": Decimal("5.00")},
        )

    @patch("apps.achievements.api.views.PersonalAchievementService")
    def test_progress_logs_delta(self, service_class):
        achievement_id = uuid4()
        service_class.return_value.log_progress.return_value = {
            "achievement": {"achievement_id": str(achievement_id), "progress_current": 2.0},
            "log": {"delta_value": 2.0},
        }

        response = self.client.post(
            f"/api/v1/achievements/{achievement_id}/progress",
            {"delta_value": "2.00", "note_text": "Two more"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        service_class.return_value.log_progress.assert_called_once_with(
            profile_id=self.profile_id,
            achievement_id=achievement_id,
            delta_value=Decimal("2.00"),
            note_text="Two more",
        )

    @patch("apps.achievements.api.views.PersonalAchievementService")
    def test_archive_sets_archived_status(self, service_class):
        achievement_id = uuid4()
        service_class.return_value.archive.return_value = {
            "achievement": {"achievement_id": str(achievement_id), "status": "archived"}
        }

        response = self.client.post(f"/api/v1/achievements/{achievement_id}/archive", {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["achievement"]["status"], "archived")
        service_class.return_value.archive.assert_called_once_with(
            profile_id=self.profile_id,
            achievement_id=achievement_id,
        )

    @patch("apps.achievements.api.views.EvidenceService")
    def test_evidence_list_returns_visible_achievement_evidence(self, service_class):
        achievement_id = uuid4()
        service_class.return_value.list_for_achievement.return_value = {"items": []}

        response = self.client.get(f"/api/v1/achievements/{achievement_id}/evidence")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"items": []})
        service_class.return_value.list_for_achievement.assert_called_once_with(
            profile_id=self.profile_id,
            achievement_id=achievement_id,
        )

    @patch("apps.achievements.api.views.EvidenceService")
    def test_evidence_attach_accepts_link_and_note(self, service_class):
        achievement_id = uuid4()
        service_class.return_value.attach_to_achievement.return_value = {
            "evidence": {"kind": "link", "url": "https://example.com/proof"}
        }

        response = self.client.post(
            f"/api/v1/achievements/{achievement_id}/evidence",
            {"kind": "link", "url": "https://example.com/proof", "note_text": "Proof"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        command = service_class.return_value.attach_to_achievement.call_args.kwargs["command"]
        self.assertEqual(command.kind, "link")
        self.assertEqual(command.url, "https://example.com/proof")
        self.assertEqual(command.note_text, "Proof")

    def test_evidence_attach_rejects_link_without_url(self):
        achievement_id = uuid4()

        response = self.client.post(
            f"/api/v1/achievements/{achievement_id}/evidence",
            {"kind": "link", "note_text": "Missing URL"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("url", response.json()["error"]["fields"])

    @patch("apps.achievements.api.views.ApprovalService")
    def test_approval_list_uses_current_profile(self, service_class):
        service_class.return_value.list.return_value = {"items": []}

        response = self.client.get("/api/v1/approvals?status=pending")

        self.assertEqual(response.status_code, 200)
        service_class.return_value.list.assert_called_once_with(
            profile_id=self.profile_id,
            status_filter="pending",
        )

    @patch("apps.achievements.api.views.ApprovalService")
    def test_approval_decision_uses_assigned_profile(self, service_class):
        approval_request_id = uuid4()
        service_class.return_value.decide.return_value = {
            "approval_request": {
                "approval_request_id": str(approval_request_id),
                "request_status": "approved",
            }
        }

        response = self.client.post(
            f"/api/v1/approvals/{approval_request_id}/approve",
            {"note_text": "Looks good"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        service_class.return_value.decide.assert_called_once_with(
            profile_id=self.profile_id,
            approval_request_id=approval_request_id,
            decision="approve",
            note_text="Looks good",
        )
