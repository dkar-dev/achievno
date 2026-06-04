from unittest.mock import patch
from uuid import uuid4

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from apps.accounts.infrastructure.authentication import AuthPrincipal


class NotificationsApiTests(SimpleTestCase):
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

    def test_notifications_require_authentication(self):
        client = APIClient()

        response = client.get("/api/v1/notifications/")

        self.assertEqual(response.status_code, 403)

    @patch("apps.notifications.api.views.NotificationService")
    def test_notification_list_uses_current_profile(self, service_class):
        service_class.return_value.list.return_value = {"items": [], "unread_count": 0}

        response = self.client.get("/api/v1/notifications/?limit=25")

        self.assertEqual(response.status_code, 200)
        service_class.return_value.list.assert_called_once_with(
            profile_id=self.profile_id,
            limit=25,
        )

    @patch("apps.notifications.api.views.NotificationService")
    def test_mark_notification_read_uses_current_profile(self, service_class):
        notification_id = uuid4()
        service_class.return_value.mark_read.return_value = {
            "notification": {"notification_id": str(notification_id), "is_read": True}
        }

        response = self.client.post(f"/api/v1/notifications/{notification_id}/read")

        self.assertEqual(response.status_code, 200)
        service_class.return_value.mark_read.assert_called_once_with(
            profile_id=self.profile_id,
            notification_id=notification_id,
        )
