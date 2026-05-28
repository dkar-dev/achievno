from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from django.conf import settings
from django.db import DEFAULT_DB_ALIAS, connections


REQUIRED_TABLES = (
    "accounts",
    "user_profiles",
    "auth_methods",
    "user_sessions",
    "achievements",
    "achievement_logs",
    "achievement_assignees",
    "achievement_approvals",
    "evidence_assets",
    "evidence_links",
    "groups",
    "group_memberships",
    "friend_connections",
    "invites",
    "invite_usages",
    "challenges",
    "challenge_participants",
    "challenge_progress",
    "notifications",
    "outbox_events",
)

OPTIONAL_READ_MODELS = (
    "report_activity_feed",
    "report_achievement_overview",
    "report_challenge_leaderboard",
)


@dataclass(frozen=True)
class DatabaseHealthResult:
    connected: bool
    vendor: str | None = None
    server_version: str | None = None
    required_tables_ok: bool = False
    missing_required_tables: list[str] = field(default_factory=list)
    missing_optional_read_models: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.connected and self.vendor_ok and self.required_tables_ok

    @property
    def vendor_ok(self) -> bool:
        if not getattr(settings, "DATABASE_URL", None):
            return True
        return self.vendor == "postgresql"

    def as_database_payload(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "connected": self.connected,
            "vendor": self.vendor,
            "required_tables_ok": self.required_tables_ok,
            "missing_required_tables": self.missing_required_tables,
        }
        if self.server_version:
            payload["server_version"] = self.server_version
        if self.missing_optional_read_models:
            payload["missing_optional_read_models"] = self.missing_optional_read_models
        if self.warnings:
            payload["warnings"] = self.warnings
        if self.error:
            payload["error"] = self.error
        return payload


def check_database_health(using: str = DEFAULT_DB_ALIAS) -> DatabaseHealthResult:
    db_connection = connections[using]

    try:
        db_connection.ensure_connection()
        vendor = db_connection.vendor
        server_version = _server_version(db_connection)
        table_names, read_model_names = _schema_object_names(db_connection)
    except Exception as exc:  # noqa: BLE001 - health checks must report any DB failure.
        return DatabaseHealthResult(
            connected=False,
            error=_safe_error(exc),
        )

    missing_required = sorted(set(REQUIRED_TABLES) - table_names)
    missing_optional = sorted(set(OPTIONAL_READ_MODELS) - read_model_names - table_names)
    warnings = [
        f"optional read model missing: {name}" for name in missing_optional
    ]

    result = DatabaseHealthResult(
        connected=True,
        vendor=vendor,
        server_version=server_version,
        required_tables_ok=not missing_required,
        missing_required_tables=missing_required,
        missing_optional_read_models=missing_optional,
        warnings=warnings,
    )

    if not result.vendor_ok:
        return DatabaseHealthResult(
            connected=True,
            vendor=vendor,
            server_version=server_version,
            required_tables_ok=False,
            missing_required_tables=missing_required,
            missing_optional_read_models=missing_optional,
            warnings=warnings,
            error="DATABASE_URL must point to a PostgreSQL database.",
        )

    return result


def _schema_object_names(db_connection) -> tuple[set[str], set[str]]:
    with db_connection.cursor() as cursor:
        table_names = set(db_connection.introspection.table_names(cursor))
        read_model_names = {
            item.name
            for item in db_connection.introspection.get_table_list(cursor)
            if item.type == "v"
        }
    return table_names, read_model_names


def _server_version(db_connection) -> str | None:
    if db_connection.vendor != "postgresql":
        return None

    raw_connection = db_connection.connection
    if raw_connection is None:
        return None

    info = getattr(raw_connection, "info", None)
    if info is None:
        return None

    parameter_status = getattr(info, "parameter_status", None)
    if callable(parameter_status):
        version = parameter_status("server_version")
        if version:
            return str(version)

    server_version = getattr(info, "server_version", None)
    if server_version:
        return str(server_version)

    return None


def _safe_error(exc: Exception) -> str:
    return f"{exc.__class__.__name__}: database connection or schema check failed"
