from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from apps.accounts.infrastructure.authentication import AuthPrincipal


class FriendsApiTests(SimpleTestCase):
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

    def test_friends_list_requires_authentication(self):
        response = APIClient().get("/api/v1/friends/")

        self.assertEqual(response.status_code, 403)

    @patch("apps.friends.api.views.FriendQuery")
    def test_friends_list_returns_accepted_relations(self, query_class):
        query_class.return_value.list.return_value = {"items": [], "total_count": 0}

        response = self.client.get("/api/v1/friends/?limit=10")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"items": [], "total_count": 0})
        query_class.return_value.list.assert_called_once_with(profile_id=self.profile_id, limit=10)

    @patch("apps.friends.api.views.FriendQuery")
    def test_friend_detail_returns_404_for_inaccessible_relation(self, query_class):
        relation_id = uuid4()
        query_class.return_value.detail.return_value = None

        response = self.client.get(f"/api/v1/friends/{relation_id}")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["error"]["code"], "friend_relation_not_found")

    @patch("apps.friends.api.views.FriendService")
    def test_create_invite_returns_shareable_token(self, service_class):
        invite_id = uuid4()
        service_class.return_value.create_invite.return_value = {
            "invite": {
                "invite_id": str(invite_id),
                "status": "pending",
                "token": "demo-token",
                "url": "http://127.0.0.1:3000/app/invites/demo-token",
            }
        }

        response = self.client.post("/api/v1/friends/invites", {}, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["invite"]["token"], "demo-token")
        service_class.return_value.create_invite.assert_called_once_with(profile_id=self.profile_id)

    @patch("apps.friends.api.views.FriendQuery")
    def test_invite_detail_returns_invite_by_token(self, query_class):
        query_class.return_value.invite_detail.return_value = {"invite": {"token": "demo-token"}}

        response = self.client.get("/api/v1/friends/invites/demo-token")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"invite": {"token": "demo-token"}})
        query_class.return_value.invite_detail.assert_called_once_with(token="demo-token")

    @patch("apps.friends.api.views.FriendService")
    def test_accept_invite_returns_real_relation(self, service_class):
        relation_id = uuid4()
        service_class.return_value.accept_invite.return_value = {
            "relation": {"friend_connection_id": str(relation_id), "status": "active"}
        }

        response = self.client.post("/api/v1/friends/invites/demo-token/accept", {}, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["relation"]["friend_connection_id"], str(relation_id))
        service_class.return_value.accept_invite.assert_called_once_with(
            token="demo-token",
            profile_id=self.profile_id,
        )

    @patch("apps.friends.api.views.FriendService")
    def test_create_friend_achievement_validates_progress_target(self, service_class):
        relation_id = uuid4()
        achievement_id = uuid4()
        service_class.return_value.create_achievement.return_value = {
            "achievement": {
                "achievement_id": str(achievement_id),
                "base_type": "progress",
                "assignment_mode": "all_members",
                "title": "Run together",
            }
        }

        response = self.client.post(
            f"/api/v1/friends/{relation_id}/achievements",
            {"base_type": "progress", "title": "Run together", "progress_target": "10.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        command = service_class.return_value.create_achievement.call_args.kwargs["command"]
        self.assertEqual(command.base_type, "progress")
        self.assertEqual(command.progress_target, Decimal("10.00"))

    def test_create_friend_progress_achievement_requires_positive_target(self):
        relation_id = uuid4()

        response = self.client.post(
            f"/api/v1/friends/{relation_id}/achievements",
            {"base_type": "progress", "title": "Run together"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("progress_target", response.json()["error"]["fields"])

