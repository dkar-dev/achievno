from http.cookies import SimpleCookie
from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase

from apps.achievements.management.commands.achievno_smoke_personal_achievements import (
    PersonalAchievementsSmokeFailure,
    run_personal_achievements_smoke,
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


class PersonalAchievementsSmokeCommandTests(SimpleTestCase):
    def test_run_personal_achievements_smoke_reports_required_steps(self):
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
                    201,
                    {"achievement": {"achievement_id": "progress-id", "status": "in_progress"}},
                ),
                FakeResponse(200, {"items": [{"achievement_id": "progress-id"}], "total_count": 1}),
                FakeResponse(200, {"achievement": {"achievement_id": "progress-id"}, "recent_logs": []}),
                FakeResponse(
                    200,
                    {
                        "achievement": {"achievement_id": "progress-id", "progress_current": 1.0},
                        "log": {"achievement_log_id": "log-id"},
                    },
                ),
                FakeResponse(200, {"achievement": {"achievement_id": "progress-id", "status": "completed"}}),
                FakeResponse(
                    201,
                    {"achievement": {"achievement_id": "done-id", "status": "in_progress"}},
                ),
                FakeResponse(200, {"achievement": {"achievement_id": "done-id", "status": "completed"}}),
                FakeResponse(200, {"achievement": {"achievement_id": "done-id", "status": "archived"}}),
                FakeResponse(200, {"personal_space": {"completed_achievements_count": 1}}),
            ]
        )
        stdout = CapturingStdout()

        run_personal_achievements_smoke(client, stdout)

        output = stdout.text()
        self.assertIn("create progress achievement ok", output)
        self.assertIn("list personal achievements ok", output)
        self.assertIn("detail achievement ok", output)
        self.assertIn("log progress ok", output)
        self.assertIn("complete progress achievement ok", output)
        self.assertIn("create done achievement ok", output)
        self.assertIn("complete done achievement ok", output)
        self.assertIn("archive achievement ok", output)
        self.assertIn("main aggregate counts ok", output)
        self.assertIn("personal achievements smoke ok", output)
        self.assertNotIn("secret-dev-token", output)
        self.assertNotIn("secret-jwt", output)
        self.assertNotIn("secret-refresh", output)

    def test_run_personal_achievements_smoke_stops_on_failed_step(self):
        client = FakeClient([FakeResponse(500, {"error": "boom"})])

        with self.assertRaisesMessage(PersonalAchievementsSmokeFailure, "sign-up failed with HTTP 500"):
            run_personal_achievements_smoke(client, CapturingStdout())

    @patch(
        "apps.achievements.management.commands.achievno_smoke_personal_achievements.ensure_live_postgresql_database"
    )
    @patch(
        "apps.achievements.management.commands.achievno_smoke_personal_achievements.run_personal_achievements_smoke"
    )
    def test_command_exits_non_zero_on_failed_step(self, run_smoke, ensure_database):
        run_smoke.side_effect = PersonalAchievementsSmokeFailure("list personal achievements failed")

        with self.assertRaisesMessage(CommandError, "list personal achievements failed"):
            call_command("achievno_smoke_personal_achievements", stdout=StringIO())

        ensure_database.assert_called_once_with()
