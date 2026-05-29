from unittest.mock import patch
from uuid import uuid4

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from apps.accounts.infrastructure.authentication import AuthPrincipal


class GroupsApiTests(SimpleTestCase):
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

    def test_groups_list_requires_authentication(self):
        response = APIClient().get("/api/v1/groups/")

        self.assertEqual(response.status_code, 403)

    @patch("apps.groups.api.views.GroupQuery")
    def test_groups_list_returns_joined_groups(self, query_class):
        query_class.return_value.list.return_value = {"items": [], "total_count": 0}

        response = self.client.get("/api/v1/groups/?limit=10")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"items": [], "total_count": 0})
        query_class.return_value.list.assert_called_once_with(profile_id=self.profile_id, limit=10)

    @patch("apps.groups.api.views.GroupService")
    def test_create_group_materializes_membership(self, service_class):
        group_id = uuid4()
        service_class.return_value.create.return_value = {
            "group": {
                "group_id": str(group_id),
                "title": "Demo Team",
                "role": "owner",
                "member_count": 1,
                "active_achievements_count": 0,
                "completed_achievements_count": 0,
            }
        }

        response = self.client.post(
            "/api/v1/groups/",
            {"title": "Demo Team", "description": "", "visibility_type": "public"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["group"]["group_id"], str(group_id))
        command = service_class.return_value.create.call_args.kwargs["command"]
        self.assertEqual(command.title, "Demo Team")
        self.assertEqual(command.description, None)
        self.assertEqual(command.visibility_type, "public")

    @patch("apps.groups.api.views.GroupService")
    def test_join_demo_group_returns_real_group_id(self, service_class):
        group_id = uuid4()
        service_class.return_value.join_demo.return_value = {
            "group": {
                "group_id": str(group_id),
                "title": "Fitness Warriors",
                "role": "member",
                "member_count": 1,
                "active_achievements_count": 0,
                "completed_achievements_count": 0,
            }
        }

        response = self.client.post(
            "/api/v1/groups/join-demo",
            {
                "template_id": "fitness-warriors",
                "title": "Fitness Warriors",
                "description": "Daily workouts",
                "visibility_type": "public",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["group"]["group_id"], str(group_id))
        command = service_class.return_value.join_demo.call_args.kwargs["command"]
        self.assertEqual(command.template_id, "fitness-warriors")
        self.assertEqual(command.title, "Fitness Warriors")

    @patch("apps.groups.api.views.GroupQuery")
    def test_group_detail_returns_404_for_inaccessible_group(self, query_class):
        group_id = uuid4()
        query_class.return_value.detail.return_value = None

        response = self.client.get(f"/api/v1/groups/{group_id}")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["error"]["code"], "group_not_found")

    @patch("apps.groups.api.views.GroupService")
    def test_create_group_achievement_validates_done_without_target(self, service_class):
        group_id = uuid4()
        achievement_id = uuid4()
        service_class.return_value.create_achievement.return_value = {
            "achievement": {
                "achievement_id": str(achievement_id),
                "base_type": "done",
                "title": "Ship demo",
            }
        }

        response = self.client.post(
            f"/api/v1/groups/{group_id}/achievements",
            {"base_type": "done", "title": "Ship demo", "progress_target": None},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        command = service_class.return_value.create_achievement.call_args.kwargs["command"]
        self.assertEqual(command.base_type, "done")
        self.assertEqual(command.progress_target, None)

    def test_create_group_progress_achievement_requires_positive_target(self):
        group_id = uuid4()

        response = self.client.post(
            f"/api/v1/groups/{group_id}/achievements",
            {"base_type": "progress", "title": "Read docs"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("progress_target", response.json()["error"]["fields"])
