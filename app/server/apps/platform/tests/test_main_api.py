from unittest.mock import patch
from uuid import uuid4

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from apps.accounts.infrastructure.authentication import AuthPrincipal


class MainAggregateApiTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_main_requires_authentication(self):
        response = self.client.get("/api/v1/main")

        self.assertEqual(response.status_code, 403)

    @patch("apps.platform.api.main.MainAggregateQuery")
    def test_main_returns_screen_oriented_payload(self, query_class):
        account_id = uuid4()
        profile_id = uuid4()
        session_id = uuid4()
        query_class.return_value.execute.return_value = {
            "authenticated": True,
            "profile": {
                "profile_id": str(profile_id),
                "account_id": str(account_id),
                "display_name": "Ada",
                "username": "ada",
                "avatar_url": None,
                "rank": None,
            },
            "personal_space": {
                "owner_context_id": None,
                "active_achievements_count": 0,
                "completed_achievements_count": 0,
                "recent_logs_count": 0,
                "recent_achievements": [],
            },
            "friends": {
                "total_count": 0,
                "active_count": 0,
                "pending_count": 0,
                "preview": [],
            },
            "groups": {
                "total_count": 0,
                "owned_count": 0,
                "member_count": 0,
                "preview": [],
            },
            "notifications": {
                "unread_count": 0,
                "preview": [],
            },
            "server_time": "2026-05-28T00:00:00+00:00",
        }
        self.client.force_authenticate(
            user=AuthPrincipal(
                account_id=account_id,
                profile_id=profile_id,
                session_id=session_id,
            ),
        )

        response = self.client.get("/api/v1/main")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), query_class.return_value.execute.return_value)
        query_class.return_value.execute.assert_called_once_with(
            account_id=account_id,
            profile_id=profile_id,
        )
