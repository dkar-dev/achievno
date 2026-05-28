from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from apps.accounts.infrastructure.authentication import AuthPrincipal


class ChallengesApiTests(SimpleTestCase):
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

    def test_list_requires_authentication(self):
        client = APIClient()

        response = client.get("/api/v1/challenges")

        self.assertEqual(response.status_code, 403)

    @patch("apps.challenges.api.views.ChallengeQuery")
    def test_list_returns_stable_payload(self, query_class):
        query_class.return_value.list.return_value = {"items": [], "total_count": 0}

        response = self.client.get("/api/v1/challenges?status=active&limit=10")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"items": [], "total_count": 0})
        query_class.return_value.list.assert_called_once_with(
            profile_id=self.profile_id,
            status_filter="active",
            limit=10,
        )

    @patch("apps.challenges.api.views.ChallengeService")
    def test_create_minimal_personal_challenge(self, service_class):
        challenge_id = uuid4()
        service_class.return_value.create.return_value = {
            "challenge": {
                "challenge_id": str(challenge_id),
                "title": "Run 20 km",
                "status": "active",
                "target_value": 20.0,
            }
        }

        response = self.client.post(
            "/api/v1/challenges",
            {
                "title": "Run 20 km",
                "description": "Personal running challenge",
                "goal_title": "Run total distance",
                "target_value": "20.00",
                "unit_label": "km",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["challenge"]["challenge_id"], str(challenge_id))
        command = service_class.return_value.create.call_args.kwargs["command"]
        self.assertEqual(command.title, "Run 20 km")
        self.assertEqual(command.target_value, Decimal("20.00"))

    def test_create_rejects_short_title(self):
        response = self.client.post(
            "/api/v1/challenges",
            {"title": "A", "target_value": "5.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"]["code"], "validation_error")
        self.assertIn("title", response.json()["error"]["fields"])

    def test_create_rejects_non_positive_target(self):
        response = self.client.post(
            "/api/v1/challenges",
            {"title": "Read daily", "target_value": "0.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"]["code"], "validation_error")
        self.assertIn("target_value", response.json()["error"]["fields"])

    @patch("apps.challenges.api.views.ChallengeQuery")
    def test_detail_returns_challenge_participant_and_events(self, query_class):
        challenge_id = uuid4()
        query_class.return_value.detail.return_value = {
            "challenge": {"challenge_id": str(challenge_id), "title": "Run"},
            "participant": {"profile_id": str(self.profile_id), "status": "joined"},
            "recent_completion_events": [],
        }

        response = self.client.get(f"/api/v1/challenges/{challenge_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["challenge"]["challenge_id"], str(challenge_id))
        query_class.return_value.detail.assert_called_once_with(
            profile_id=self.profile_id,
            challenge_id=challenge_id,
        )

    @patch("apps.challenges.api.views.ChallengeQuery")
    def test_detail_returns_404_for_inaccessible_id(self, query_class):
        challenge_id = uuid4()
        query_class.return_value.detail.return_value = None

        response = self.client.get(f"/api/v1/challenges/{challenge_id}")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["error"]["code"], "not_found")

    @patch("apps.challenges.api.views.ChallengeService")
    def test_join_self_participates_current_profile(self, service_class):
        challenge_id = uuid4()
        service_class.return_value.join.return_value = {
            "challenge": {"challenge_id": str(challenge_id), "participant_count": 1},
            "participant": {"profile_id": str(self.profile_id), "status": "joined"},
        }

        response = self.client.post(f"/api/v1/challenges/{challenge_id}/join", {}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["participant"]["status"], "joined")
        service_class.return_value.join.assert_called_once_with(
            profile_id=self.profile_id,
            challenge_id=challenge_id,
        )

    @patch("apps.challenges.api.views.ChallengeService")
    def test_progress_records_delta(self, service_class):
        challenge_id = uuid4()
        service_class.return_value.progress.return_value = {
            "challenge": {"challenge_id": str(challenge_id)},
            "participant": {"profile_id": str(self.profile_id), "progress_value": 2.0},
            "event": {"delta_value": 2.0},
        }

        response = self.client.post(
            f"/api/v1/challenges/{challenge_id}/progress",
            {"delta_value": "2.00", "note_text": "Two more"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        service_class.return_value.progress.assert_called_once_with(
            profile_id=self.profile_id,
            challenge_id=challenge_id,
            delta_value=Decimal("2.00"),
            note_text="Two more",
        )

    def test_progress_rejects_zero_delta(self):
        response = self.client.post(
            f"/api/v1/challenges/{uuid4()}/progress",
            {"delta_value": "0.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"]["code"], "validation_error")
        self.assertIn("delta_value", response.json()["error"]["fields"])

    @patch("apps.challenges.api.views.ChallengeService")
    def test_complete_finishes_current_participant_flow(self, service_class):
        challenge_id = uuid4()
        service_class.return_value.complete.return_value = {
            "challenge": {"challenge_id": str(challenge_id)},
            "participant": {"profile_id": str(self.profile_id), "status": "completed"},
            "event": {"delta_value": 3.0},
        }

        response = self.client.post(
            f"/api/v1/challenges/{challenge_id}/complete",
            {"note_text": "Done"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["participant"]["status"], "completed")
        service_class.return_value.complete.assert_called_once_with(
            profile_id=self.profile_id,
            challenge_id=challenge_id,
            note_text="Done",
        )
