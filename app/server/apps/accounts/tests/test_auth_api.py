from unittest.mock import patch
from uuid import uuid4

from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIClient

from apps.accounts.application.auth_service import (
    AccountDTO,
    AuthenticatedResult,
    AuthTokens,
    CurrentUserResult,
    ProfileDTO,
    RefreshResult,
    SignUpResult,
)
from apps.accounts.infrastructure.authentication import AuthPrincipal


@override_settings(
    ACHIEVNO_ACCESS_TOKEN_TTL_SECONDS=900,
    ACHIEVNO_REFRESH_TOKEN_TTL_SECONDS=2592000,
    ACHIEVNO_AUTH_COOKIE_SECURE=False,
    ACHIEVNO_AUTH_COOKIE_SAMESITE="Lax",
    ACHIEVNO_AUTH_COOKIE_PATH="/",
)
class AuthApiTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("apps.accounts.api.views.AuthService")
    def test_sign_up_returns_account_profile_and_dev_verification_token(self, service_class):
        account_id = uuid4()
        profile_id = uuid4()
        service_class.return_value.sign_up.return_value = SignUpResult(
            account=AccountDTO(account_id=account_id),
            profile=ProfileDTO(profile_id=profile_id, display_name="Ada", username="ada"),
            dev_verification_token="dev-token",
        )

        response = self.client.post(
            "/api/v1/auth/sign-up",
            {
                "email": "ADA@Example.COM",
                "password": "correct horse",
                "display_name": " Ada ",
                "username": " Ada ",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.json(),
            {
                "account_id": str(account_id),
                "profile_id": str(profile_id),
                "email_verification_required": True,
                "verification_email_sent": False,
                "dev_verification_token": "dev-token",
            },
        )
        service_class.return_value.sign_up.assert_called_once_with(
            email="ada@example.com",
            password="correct horse",
            display_name="Ada",
            username="ada",
        )

    def test_sign_up_rejects_invalid_payload(self):
        response = self.client.post(
            "/api/v1/auth/sign-up",
            {
                "email": "not-an-email",
                "password": "short",
                "display_name": "A",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        body = response.json()
        self.assertEqual(body["error"]["code"], "validation_error")
        self.assertIn("email", body["error"]["fields"])
        self.assertIn("password", body["error"]["fields"])
        self.assertIn("display_name", body["error"]["fields"])

    @patch("apps.accounts.api.views.AuthService")
    def test_verify_email_returns_verified(self, service_class):
        response = self.client.post(
            "/api/v1/auth/verify-email",
            {"token": "verification-token"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"verified": True})
        service_class.return_value.verify_email.assert_called_once_with(token="verification-token")

    @patch("apps.accounts.api.views.AuthService")
    def test_sign_in_sets_http_only_access_and_refresh_cookies(self, service_class):
        account_id = uuid4()
        profile_id = uuid4()
        service_class.return_value.sign_in.return_value = AuthenticatedResult(
            account=AccountDTO(account_id=account_id),
            profile=ProfileDTO(profile_id=profile_id, display_name="Ada", username=None),
            tokens=AuthTokens(access_token="access-token", refresh_token="refresh-token"),
        )

        response = self.client.post(
            "/api/v1/auth/sign-in",
            {"email": "ada@example.com", "password": "correct horse"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["authenticated"], True)
        self.assertEqual(response.json()["account"], {"account_id": str(account_id)})
        self.assertEqual(response.json()["profile"]["profile_id"], str(profile_id))
        self.assertEqual(response.cookies["achievno_access"].value, "access-token")
        self.assertEqual(response.cookies["achievno_refresh"].value, "refresh-token")
        self.assertTrue(response.cookies["achievno_access"]["httponly"])
        self.assertTrue(response.cookies["achievno_refresh"]["httponly"])

    @patch("apps.accounts.api.views.AuthService")
    def test_refresh_sets_new_access_cookie_and_preserves_refresh_cookie(self, service_class):
        self.client.cookies["achievno_refresh"] = "refresh-token"
        service_class.return_value.refresh.return_value = RefreshResult(access_token="new-access-token")

        response = self.client.post("/api/v1/auth/refresh", format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"refreshed": True})
        self.assertEqual(response.cookies["achievno_access"].value, "new-access-token")
        self.assertNotIn("achievno_refresh", response.cookies)
        service_class.return_value.refresh.assert_called_once_with(refresh_token="refresh-token")

    def test_refresh_without_cookie_returns_authentication_error(self):
        response = self.client.post("/api/v1/auth/refresh", format="json")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"]["code"], "authentication_required")

    @patch("apps.accounts.api.views.AuthService")
    def test_sign_out_clears_cookies(self, service_class):
        self.client.cookies["achievno_refresh"] = "refresh-token"

        response = self.client.post("/api/v1/auth/sign-out", format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"signed_out": True})
        self.assertEqual(response.cookies["achievno_access"].value, "")
        self.assertEqual(response.cookies["achievno_refresh"].value, "")
        service_class.return_value.sign_out.assert_called_once_with(refresh_token="refresh-token")

    @patch("apps.accounts.api.views.AuthService")
    def test_me_returns_authenticated_account_and_profile(self, service_class):
        account_id = uuid4()
        profile_id = uuid4()
        session_id = uuid4()
        service_class.return_value.current_user.return_value = CurrentUserResult(
            account=AccountDTO(account_id=account_id),
            profile=ProfileDTO(profile_id=profile_id, display_name="Ada", username="ada"),
        )
        self.client.force_authenticate(
            user=AuthPrincipal(
                account_id=account_id,
                profile_id=profile_id,
                session_id=session_id,
            ),
        )

        response = self.client.get("/api/v1/auth/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "authenticated": True,
                "account": {"account_id": str(account_id)},
                "profile": {
                    "profile_id": str(profile_id),
                    "display_name": "Ada",
                    "username": "ada",
                },
            },
        )
        service_class.return_value.current_user.assert_called_once_with(
            account_id=account_id,
            profile_id=profile_id,
            session_id=session_id,
        )

    def test_me_without_access_cookie_fails(self):
        response = self.client.get("/api/v1/auth/me")

        self.assertEqual(response.status_code, 403)
