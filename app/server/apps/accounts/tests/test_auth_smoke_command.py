from http.cookies import SimpleCookie
from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, override_settings

from apps.accounts.management.commands.achievno_smoke_auth import (
    AuthSmokeFailure,
    SmokeIdentity,
    ensure_live_postgresql_database,
    run_auth_smoke,
)


class FakeResponse:
    def __init__(
        self,
        status_code: int,
        body: dict | None = None,
        cookies: dict[str, tuple[str, bool]] | None = None,
    ):
        self.status_code = status_code
        self._body = body or {}
        self.cookies = SimpleCookie()
        for name, (value, httponly) in (cookies or {}).items():
            self.cookies[name] = value
            if httponly:
                self.cookies[name]["httponly"] = True

    def json(self):
        return self._body


class FakeClient:
    def __init__(self, responses: list[FakeResponse]):
        self.responses = responses
        self.calls: list[tuple[str, str]] = []

    def post(self, path: str, *args, **kwargs):
        self.calls.append(("POST", path))
        return self.responses.pop(0)

    def get(self, path: str, *args, **kwargs):
        self.calls.append(("GET", path))
        return self.responses.pop(0)


class CapturingStdout:
    def __init__(self):
        self.lines: list[str] = []

    def write(self, message: str) -> None:
        self.lines.append(message)

    def text(self) -> str:
        return "\n".join(self.lines)


class AuthSmokeCommandTests(SimpleTestCase):
    def test_refuses_absent_database_url(self):
        with patch.dict("os.environ", {"DATABASE_URL": ""}):
            with self.assertRaisesMessage(
                AuthSmokeFailure,
                "auth smoke requires DATABASE_URL for live PostgreSQL",
            ):
                ensure_live_postgresql_database()

    def test_refuses_sqlite_database(self):
        with override_settings(
            DATABASES={
                "default": {
                    "ENGINE": "django.db.backends.sqlite3",
                    "NAME": ":memory:",
                }
            }
        ):
            with patch.dict("os.environ", {"DATABASE_URL": "postgres://example"}):
                with self.assertRaisesMessage(
                    AuthSmokeFailure,
                    "auth smoke requires live PostgreSQL; sqlite fallback is not allowed",
                ):
                    ensure_live_postgresql_database()

    def test_run_auth_smoke_reports_success_without_secrets(self):
        client = FakeClient(
            [
                FakeResponse(
                    201,
                    {
                        "account_id": "account-id",
                        "profile_id": "profile-id",
                        "dev_verification_token": "secret-dev-token",
                    },
                ),
                FakeResponse(200, {"verified": True}),
                FakeResponse(
                    200,
                    {"authenticated": True},
                    {
                        "achievno_access": ("secret-jwt", True),
                        "achievno_refresh": ("secret-refresh", True),
                    },
                ),
                FakeResponse(
                    200,
                    {
                        "authenticated": True,
                        "account": {"account_id": "account-id"},
                        "profile": {"profile_id": "profile-id"},
                    },
                ),
                FakeResponse(
                    200,
                    {"refreshed": True},
                    {"achievno_access": ("secret-refreshed-jwt", True)},
                ),
                FakeResponse(
                    200,
                    {"signed_out": True},
                    {
                        "achievno_access": ("", False),
                        "achievno_refresh": ("", False),
                    },
                ),
                FakeResponse(403, {"detail": "Authentication credentials were not provided."}),
            ]
        )
        stdout = CapturingStdout()

        run_auth_smoke(
            client,
            SmokeIdentity(
                email="auth-smoke@example.test",
                password="auth-smoke-password",
                display_name="Auth Smoke",
                username="auth_smoke",
            ),
            stdout,
        )

        output = stdout.text()
        self.assertIn("sign-up ok", output)
        self.assertIn("verify-email ok", output)
        self.assertIn("sign-in ok", output)
        self.assertIn("me ok", output)
        self.assertIn("refresh ok", output)
        self.assertIn("sign-out ok", output)
        self.assertIn("post-sign-out auth rejected ok", output)
        self.assertIn("auth smoke ok", output)
        self.assertNotIn("secret-dev-token", output)
        self.assertNotIn("secret-jwt", output)
        self.assertNotIn("secret-refresh", output)
        self.assertNotIn("secret-refreshed-jwt", output)

    def test_run_auth_smoke_stops_on_failed_step(self):
        client = FakeClient([FakeResponse(500, {"error": "boom"})])
        stdout = CapturingStdout()

        with self.assertRaisesMessage(AuthSmokeFailure, "sign-up failed with HTTP 500"):
            run_auth_smoke(
                client,
                SmokeIdentity(
                    email="auth-smoke@example.test",
                    password="auth-smoke-password",
                    display_name="Auth Smoke",
                    username="auth_smoke",
                ),
                stdout,
            )

        self.assertEqual(stdout.text(), "")

    @patch("apps.accounts.management.commands.achievno_smoke_auth.ensure_live_postgresql_database")
    @patch("apps.accounts.management.commands.achievno_smoke_auth.run_auth_smoke")
    def test_command_exits_non_zero_on_failed_step(self, run_smoke, ensure_database):
        run_smoke.side_effect = AuthSmokeFailure("sign-in failed with HTTP 401")

        with self.assertRaisesMessage(CommandError, "sign-in failed with HTTP 401"):
            call_command("achievno_smoke_auth", stdout=StringIO())

        ensure_database.assert_called_once_with()
