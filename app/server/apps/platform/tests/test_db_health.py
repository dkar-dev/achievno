from io import StringIO
from unittest.mock import Mock, patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, override_settings

from apps.platform.infrastructure.db_health import (
    OPTIONAL_READ_MODELS,
    REQUIRED_TABLES,
    DatabaseHealthResult,
    check_database_health,
)


EXPECTED_REQUIRED_TABLES = (
    "accounts",
    "user_profiles",
    "account_auth_methods",
    "auth_sessions",
    "auth_verification_tokens",
    "achievements",
    "achievement_logs",
    "achievement_assignees",
    "approval_policies",
    "approval_policy_approvers",
    "approval_requests",
    "approval_request_approvers",
    "approval_decisions",
    "evidence_assets",
    "evidence_links",
    "groups",
    "group_memberships",
    "friend_connections",
    "friend_connection_sides",
    "invites",
    "invite_usages",
    "challenges",
    "challenge_participants",
    "challenge_completion_events",
    "notifications",
    "outbox_events",
    "owner_contexts",
    "profile_preferences",
    "rank_definitions",
    "taxonomy_categories",
)

EXPECTED_OPTIONAL_READ_MODELS = (
    "achievement_approval_overview",
    "achievement_overview",
    "approval_decisions_overview",
    "challenge_winners_history",
    "connected_signin_methods",
    "friend_connections_overview",
    "group_membership_overview",
    "notifications_overview",
    "pending_approval_requests",
    "unified_invites_overview",
)


class DatabaseHealthResultTests(SimpleTestCase):
    def test_database_payload_contains_structured_status(self):
        result = DatabaseHealthResult(
            connected=True,
            vendor="postgresql",
            server_version="17.5",
            required_tables_ok=True,
            warnings=["optional read model missing: achievement_overview"],
        )

        self.assertTrue(result.ok)
        self.assertEqual(
            result.as_database_payload(),
            {
                "connected": True,
                "vendor": "postgresql",
                "required_tables_ok": True,
                "missing_required_tables": [],
                "server_version": "17.5",
                "warnings": ["optional read model missing: achievement_overview"],
            },
        )


class DatabaseHealthCheckerTests(SimpleTestCase):
    def test_schema_object_contract_matches_current_baseline(self):
        self.assertEqual(REQUIRED_TABLES, EXPECTED_REQUIRED_TABLES)
        self.assertEqual(OPTIONAL_READ_MODELS, EXPECTED_OPTIONAL_READ_MODELS)

    @override_settings(DATABASE_URL="postgres://example.invalid/achievno")
    @patch("apps.platform.infrastructure.db_health._server_version", return_value="17.5")
    @patch("apps.platform.infrastructure.db_health._schema_object_names")
    @patch("apps.platform.infrastructure.db_health.connections")
    def test_check_database_health_success(
        self,
        connections_mock,
        schema_object_names_mock,
        server_version_mock,
    ):
        db_connection = Mock(vendor="postgresql")
        connections_mock.__getitem__.return_value = db_connection
        schema_object_names_mock.return_value = (
            set(REQUIRED_TABLES),
            set(OPTIONAL_READ_MODELS),
        )

        result = check_database_health()

        db_connection.ensure_connection.assert_called_once_with()
        server_version_mock.assert_called_once_with(db_connection)
        self.assertTrue(result.ok)
        self.assertEqual(result.vendor, "postgresql")
        self.assertEqual(result.server_version, "17.5")
        self.assertEqual(result.missing_required_tables, [])
        self.assertEqual(result.warnings, [])

    @override_settings(DATABASE_URL="postgres://example.invalid/achievno")
    @patch("apps.platform.infrastructure.db_health._server_version", return_value="17.5")
    @patch("apps.platform.infrastructure.db_health._schema_object_names")
    @patch("apps.platform.infrastructure.db_health.connections")
    def test_check_database_health_reports_missing_required_tables(
        self,
        connections_mock,
        schema_object_names_mock,
        server_version_mock,
    ):
        db_connection = Mock(vendor="postgresql")
        connections_mock.__getitem__.return_value = db_connection
        schema_object_names_mock.return_value = (
            set(REQUIRED_TABLES) - {"accounts"},
            set(OPTIONAL_READ_MODELS),
        )

        result = check_database_health()

        self.assertFalse(result.ok)
        self.assertEqual(result.missing_required_tables, ["accounts"])
        self.assertEqual(result.error, None)

    @override_settings(DATABASE_URL="postgres://example.invalid/achievno")
    @patch("apps.platform.infrastructure.db_health._server_version", return_value="17.5")
    @patch("apps.platform.infrastructure.db_health._schema_object_names")
    @patch("apps.platform.infrastructure.db_health.connections")
    def test_check_database_health_warns_for_missing_optional_read_models(
        self,
        connections_mock,
        schema_object_names_mock,
        server_version_mock,
    ):
        db_connection = Mock(vendor="postgresql")
        connections_mock.__getitem__.return_value = db_connection
        schema_object_names_mock.return_value = (set(REQUIRED_TABLES), set())

        result = check_database_health()

        self.assertTrue(result.ok)
        self.assertEqual(
            result.missing_optional_read_models,
            sorted(OPTIONAL_READ_MODELS),
        )
        self.assertEqual(
            result.warnings,
            [
                "optional read model missing: achievement_approval_overview",
                "optional read model missing: achievement_overview",
                "optional read model missing: approval_decisions_overview",
                "optional read model missing: challenge_winners_history",
                "optional read model missing: connected_signin_methods",
                "optional read model missing: friend_connections_overview",
                "optional read model missing: group_membership_overview",
                "optional read model missing: notifications_overview",
                "optional read model missing: pending_approval_requests",
                "optional read model missing: unified_invites_overview",
            ],
        )

    @override_settings(DATABASE_URL="postgres://example.invalid/achievno")
    @patch("apps.platform.infrastructure.db_health.connections")
    def test_check_database_health_reports_unreachable_database(self, connections_mock):
        db_connection = Mock()
        db_connection.ensure_connection.side_effect = RuntimeError("boom")
        connections_mock.__getitem__.return_value = db_connection

        result = check_database_health()

        self.assertFalse(result.ok)
        self.assertFalse(result.connected)
        self.assertEqual(
            result.error,
            "RuntimeError: database connection or schema check failed",
        )

    @override_settings(DATABASE_URL="postgres://example.invalid/achievno")
    @patch("apps.platform.infrastructure.db_health._server_version", return_value=None)
    @patch("apps.platform.infrastructure.db_health._schema_object_names")
    @patch("apps.platform.infrastructure.db_health.connections")
    def test_check_database_health_rejects_non_postgresql_database_url(
        self,
        connections_mock,
        schema_object_names_mock,
        server_version_mock,
    ):
        db_connection = Mock(vendor="sqlite")
        connections_mock.__getitem__.return_value = db_connection
        schema_object_names_mock.return_value = (set(REQUIRED_TABLES), set())

        result = check_database_health()

        self.assertFalse(result.ok)
        self.assertEqual(result.vendor, "sqlite")
        self.assertEqual(
            result.error,
            "DATABASE_URL must point to a PostgreSQL database.",
        )


class DatabaseHealthEndpointTests(SimpleTestCase):
    def test_health_db_returns_200_for_healthy_database(self):
        result = DatabaseHealthResult(
            connected=True,
            vendor="postgresql",
            server_version="17.5",
            required_tables_ok=True,
        )

        with patch("apps.platform.api.health.check_database_health", return_value=result):
            response = self.client.get("/health/db")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["service"], "achievno-api")
        self.assertEqual(
            response.json()["database"],
            {
                "connected": True,
                "vendor": "postgresql",
                "required_tables_ok": True,
                "missing_required_tables": [],
                "server_version": "17.5",
            },
        )

    def test_health_db_returns_503_for_schema_failure(self):
        result = DatabaseHealthResult(
            connected=True,
            vendor="postgresql",
            required_tables_ok=False,
            missing_required_tables=["accounts"],
        )

        with patch("apps.platform.api.health.check_database_health", return_value=result):
            response = self.client.get("/health/db")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["status"], "error")
        self.assertEqual(
            response.json()["database"]["missing_required_tables"],
            ["accounts"],
        )

    def test_health_endpoint_does_not_call_database_checker(self):
        with patch("apps.platform.api.health.check_database_health") as checker:
            response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        checker.assert_not_called()


class AchievnoCheckDbCommandTests(SimpleTestCase):
    def test_command_prints_success_summary(self):
        result = DatabaseHealthResult(
            connected=True,
            vendor="postgresql",
            server_version="17.5",
            required_tables_ok=True,
            warnings=["optional read model missing: achievement_overview"],
        )
        stdout = StringIO()
        stderr = StringIO()

        with patch(
            "apps.platform.management.commands.achievno_check_db.check_database_health",
            return_value=result,
        ):
            call_command("achievno_check_db", stdout=stdout, stderr=stderr)

        self.assertIn("database connection ok", stdout.getvalue())
        self.assertIn("database vendor: postgresql", stdout.getvalue())
        self.assertIn("database server version: 17.5", stdout.getvalue())
        self.assertIn("required tables ok", stdout.getvalue())
        self.assertIn("schema sanity ok", stdout.getvalue())
        self.assertIn(
            "warning: optional read model missing: achievement_overview",
            stderr.getvalue(),
        )

    def test_command_fails_for_unreachable_database(self):
        result = DatabaseHealthResult(
            connected=False,
            error="RuntimeError: database connection or schema check failed",
        )

        with patch(
            "apps.platform.management.commands.achievno_check_db.check_database_health",
            return_value=result,
        ):
            with self.assertRaises(CommandError):
                call_command("achievno_check_db", stdout=StringIO(), stderr=StringIO())

    def test_command_fails_for_missing_required_tables(self):
        result = DatabaseHealthResult(
            connected=True,
            vendor="postgresql",
            required_tables_ok=False,
            missing_required_tables=["accounts"],
        )
        stderr = StringIO()

        with patch(
            "apps.platform.management.commands.achievno_check_db.check_database_health",
            return_value=result,
        ):
            with self.assertRaises(CommandError):
                call_command("achievno_check_db", stdout=StringIO(), stderr=stderr)

        self.assertIn("missing required tables:", stderr.getvalue())
        self.assertIn("- accounts", stderr.getvalue())
