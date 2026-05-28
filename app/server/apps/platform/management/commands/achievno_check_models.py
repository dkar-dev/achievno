from __future__ import annotations

from dataclasses import dataclass
from importlib import import_module

from django.core.management.base import BaseCommand, CommandError
from django.db import DEFAULT_DB_ALIAS, connections


@dataclass(frozen=True)
class ModelMapping:
    module: str
    model_name: str
    db_table: str


A3_MODEL_MAPPINGS = (
    ModelMapping("apps.accounts.infrastructure.models", "Account", "accounts"),
    ModelMapping("apps.accounts.infrastructure.models", "AccountAuthMethod", "account_auth_methods"),
    ModelMapping("apps.accounts.infrastructure.models", "AuthSession", "auth_sessions"),
    ModelMapping("apps.accounts.infrastructure.models", "AuthVerificationToken", "auth_verification_tokens"),
    ModelMapping("apps.profiles.infrastructure.models", "UserProfile", "user_profiles"),
    ModelMapping("apps.profiles.infrastructure.models", "ProfilePreferences", "profile_preferences"),
    ModelMapping("apps.profiles.infrastructure.models", "ProfileInterestCategory", "profile_interest_categories"),
    ModelMapping("apps.friends.infrastructure.models", "FriendConnection", "friend_connections"),
    ModelMapping("apps.friends.infrastructure.models", "FriendConnectionSide", "friend_connection_sides"),
    ModelMapping("apps.groups.infrastructure.models", "Group", "groups"),
    ModelMapping("apps.groups.infrastructure.models", "GroupMembership", "group_memberships"),
    ModelMapping("apps.groups.infrastructure.models", "GroupCategoryLink", "group_category_links"),
    ModelMapping("apps.achievements.infrastructure.models", "OwnerContext", "owner_contexts"),
    ModelMapping("apps.achievements.infrastructure.models", "Achievement", "achievements"),
    ModelMapping("apps.achievements.infrastructure.models", "AchievementLog", "achievement_logs"),
    ModelMapping("apps.achievements.infrastructure.models", "AchievementAssignee", "achievement_assignees"),
    ModelMapping("apps.achievements.infrastructure.models", "ApprovalPolicy", "approval_policies"),
    ModelMapping("apps.achievements.infrastructure.models", "ApprovalPolicyApprover", "approval_policy_approvers"),
    ModelMapping("apps.achievements.infrastructure.models", "ApprovalRequest", "approval_requests"),
    ModelMapping("apps.achievements.infrastructure.models", "ApprovalRequestApprover", "approval_request_approvers"),
    ModelMapping("apps.achievements.infrastructure.models", "ApprovalDecision", "approval_decisions"),
    ModelMapping("apps.achievements.infrastructure.models", "EvidenceAsset", "evidence_assets"),
    ModelMapping("apps.achievements.infrastructure.models", "EvidenceLink", "evidence_links"),
    ModelMapping("apps.achievements.infrastructure.models", "Comment", "comments"),
    ModelMapping("apps.challenges.infrastructure.models", "Challenge", "challenges"),
    ModelMapping("apps.challenges.infrastructure.models", "ChallengeParticipant", "challenge_participants"),
    ModelMapping("apps.challenges.infrastructure.models", "ChallengeCompletionEvent", "challenge_completion_events"),
    ModelMapping("apps.notifications.infrastructure.models", "Notification", "notifications"),
    ModelMapping("apps.notifications.infrastructure.models", "OutboxEvent", "outbox_events"),
    ModelMapping("apps.platform.infrastructure.models", "TaxonomyCategory", "taxonomy_categories"),
    ModelMapping("apps.platform.infrastructure.models", "RankDefinition", "rank_definitions"),
    ModelMapping("apps.platform.infrastructure.models", "Invite", "invites"),
    ModelMapping("apps.platform.infrastructure.models", "InviteUsage", "invite_usages"),
)


class Command(BaseCommand):
    help = "Check A3 unmanaged model imports and mapped table names."

    def handle(self, *args, **options):
        models = _load_mapped_models()
        mismatched_tables = [
            f"{model.__module__}.{model.__name__}: expected {mapping.db_table}, got {model._meta.db_table}"
            for mapping, model in zip(A3_MODEL_MAPPINGS, models, strict=True)
            if model._meta.db_table != mapping.db_table
        ]
        if mismatched_tables:
            for mismatch in mismatched_tables:
                self.stderr.write(mismatch)
            raise CommandError("model db_table mismatch")

        connection = connections[DEFAULT_DB_ALIAS]
        try:
            with connection.cursor() as cursor:
                table_names = set(connection.introspection.table_names(cursor))
        except Exception as exc:  # noqa: BLE001 - command must report DB availability.
            self.stderr.write(f"database model check failed: {exc.__class__.__name__}")
            raise CommandError("database model check failed") from exc

        expected_tables = {mapping.db_table for mapping in A3_MODEL_MAPPINGS}
        missing_tables = sorted(expected_tables - table_names)
        if missing_tables:
            self.stderr.write("missing mapped tables:")
            for table_name in missing_tables:
                self.stderr.write(f"- {table_name}")
            raise CommandError("mapped tables missing")

        self.stdout.write(f"model imports ok: {len(models)}")
        self.stdout.write(f"mapped tables ok: {len(expected_tables)}")


def _load_mapped_models() -> list[type]:
    loaded_models = []
    for mapping in A3_MODEL_MAPPINGS:
        module = import_module(mapping.module)
        loaded_models.append(getattr(module, mapping.model_name))
    return loaded_models
