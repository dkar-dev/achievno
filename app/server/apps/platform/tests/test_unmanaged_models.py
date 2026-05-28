from importlib import import_module

from django.test import SimpleTestCase


EXPECTED_MODEL_TABLES = (
    ("apps.accounts.infrastructure.models", "Account", "accounts", "account_id"),
    ("apps.accounts.infrastructure.models", "AccountAuthMethod", "account_auth_methods", "auth_method_id"),
    ("apps.accounts.infrastructure.models", "AuthSession", "auth_sessions", "session_id"),
    ("apps.accounts.infrastructure.models", "AuthVerificationToken", "auth_verification_tokens", "verification_token_id"),
    ("apps.profiles.infrastructure.models", "UserProfile", "user_profiles", "profile_id"),
    ("apps.profiles.infrastructure.models", "ProfilePreferences", "profile_preferences", "profile_id"),
    ("apps.profiles.infrastructure.models", "ProfileInterestCategory", "profile_interest_categories", "profile_id"),
    ("apps.friends.infrastructure.models", "FriendConnection", "friend_connections", "friend_connection_id"),
    ("apps.friends.infrastructure.models", "FriendConnectionSide", "friend_connection_sides", "friend_connection_id"),
    ("apps.groups.infrastructure.models", "Group", "groups", "group_id"),
    ("apps.groups.infrastructure.models", "GroupMembership", "group_memberships", "group_membership_id"),
    ("apps.groups.infrastructure.models", "GroupCategoryLink", "group_category_links", "group_id"),
    ("apps.achievements.infrastructure.models", "OwnerContext", "owner_contexts", "owner_context_id"),
    ("apps.achievements.infrastructure.models", "Achievement", "achievements", "achievement_id"),
    ("apps.achievements.infrastructure.models", "AchievementLog", "achievement_logs", "achievement_log_id"),
    ("apps.achievements.infrastructure.models", "AchievementAssignee", "achievement_assignees", "achievement_id"),
    ("apps.achievements.infrastructure.models", "ApprovalPolicy", "approval_policies", "approval_policy_id"),
    ("apps.achievements.infrastructure.models", "ApprovalPolicyApprover", "approval_policy_approvers", "policy_id"),
    ("apps.achievements.infrastructure.models", "ApprovalRequest", "approval_requests", "approval_request_id"),
    ("apps.achievements.infrastructure.models", "ApprovalRequestApprover", "approval_request_approvers", "approval_request_id"),
    ("apps.achievements.infrastructure.models", "ApprovalDecision", "approval_decisions", "approval_decision_id"),
    ("apps.achievements.infrastructure.models", "EvidenceAsset", "evidence_assets", "evidence_asset_id"),
    ("apps.achievements.infrastructure.models", "EvidenceLink", "evidence_links", "evidence_link_id"),
    ("apps.achievements.infrastructure.models", "Comment", "comments", "comment_id"),
    ("apps.challenges.infrastructure.models", "Challenge", "challenges", "challenge_id"),
    ("apps.challenges.infrastructure.models", "ChallengeParticipant", "challenge_participants", "challenge_id"),
    ("apps.challenges.infrastructure.models", "ChallengeCompletionEvent", "challenge_completion_events", "challenge_completion_event_id"),
    ("apps.notifications.infrastructure.models", "Notification", "notifications", "notification_id"),
    ("apps.notifications.infrastructure.models", "OutboxEvent", "outbox_events", "outbox_event_id"),
    ("apps.platform.infrastructure.models", "TaxonomyCategory", "taxonomy_categories", "category_id"),
    ("apps.platform.infrastructure.models", "RankDefinition", "rank_definitions", "rank_id"),
    ("apps.platform.infrastructure.models", "Invite", "invites", "invite_id"),
    ("apps.platform.infrastructure.models", "InviteUsage", "invite_usages", "invite_usage_id"),
)


class UnmanagedModelMappingTests(SimpleTestCase):
    def test_model_modules_import_successfully(self):
        modules = {module_path for module_path, _, _, _ in EXPECTED_MODEL_TABLES}

        for module_path in modules:
            with self.subTest(module_path=module_path):
                import_module(module_path)

    def test_models_are_unmanaged(self):
        for module_path, model_name, _, _ in EXPECTED_MODEL_TABLES:
            with self.subTest(model=model_name):
                model = getattr(import_module(module_path), model_name)

                self.assertFalse(model._meta.managed)

    def test_models_use_contract_db_table_names(self):
        for module_path, model_name, expected_db_table, _ in EXPECTED_MODEL_TABLES:
            with self.subTest(model=model_name):
                model = getattr(import_module(module_path), model_name)

                self.assertEqual(model._meta.db_table, expected_db_table)

    def test_models_use_contract_primary_key_columns(self):
        for module_path, model_name, _, expected_pk_column in EXPECTED_MODEL_TABLES:
            with self.subTest(model=model_name):
                model = getattr(import_module(module_path), model_name)

                self.assertEqual(model._meta.pk.column, expected_pk_column)
