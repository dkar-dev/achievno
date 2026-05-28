from django.db import models


class OwnerContext(models.Model):
    owner_context_id = models.UUIDField(primary_key=True)
    context_type = models.CharField(max_length=32)
    personal_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="personal_profile_id",
        null=True,
        related_name="+",
    )
    friend_connection = models.ForeignKey(
        "friends.FriendConnection",
        models.DO_NOTHING,
        db_column="friend_connection_id",
        null=True,
        related_name="+",
    )
    group = models.ForeignKey(
        "groups.Group",
        models.DO_NOTHING,
        db_column="group_id",
        null=True,
        related_name="+",
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "owner_contexts"


class Achievement(models.Model):
    created_by_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="created_by_profile_id",
        related_name="+",
    )
    base_type = models.CharField(max_length=32)
    assignment_mode = models.CharField(max_length=32)
    title = models.CharField(max_length=180)
    short_definition = models.CharField(max_length=255)
    description = models.TextField(null=True)
    primary_category = models.ForeignKey(
        "platform.TaxonomyCategory",
        models.DO_NOTHING,
        db_column="primary_category_id",
        null=True,
        related_name="+",
    )
    rank = models.ForeignKey(
        "platform.RankDefinition",
        models.DO_NOTHING,
        db_column="rank_id",
        null=True,
        related_name="+",
    )
    status = models.CharField(max_length=32)
    deadline_at = models.DateTimeField(null=True)
    progress_current = models.DecimalField(max_digits=14, decimal_places=2)
    progress_target = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    unit_label = models.CharField(max_length=64, null=True)
    allow_negative_progress = models.BooleanField()
    approval_policy = models.ForeignKey(
        "achievements.ApprovalPolicy",
        models.DO_NOTHING,
        db_column="approval_policy_id",
        null=True,
        related_name="+",
    )
    completed_at = models.DateTimeField(null=True)
    archived_at = models.DateTimeField(null=True)
    achievement_id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    owner_context = models.ForeignKey(
        OwnerContext,
        models.DO_NOTHING,
        db_column="owner_context_id",
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "achievements"


class AchievementLog(models.Model):
    achievement = models.ForeignKey(
        Achievement,
        models.DO_NOTHING,
        db_column="achievement_id",
        related_name="+",
    )
    actor_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="actor_profile_id",
        related_name="+",
    )
    action_type = models.CharField(max_length=64)
    delta_value = models.DecimalField(max_digits=14, decimal_places=2)
    resulting_value = models.DecimalField(max_digits=14, decimal_places=2)
    note_text = models.TextField(null=True)
    created_at = models.DateTimeField()
    achievement_log_id = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = "achievement_logs"


class AchievementAssignee(models.Model):
    # Django has no composite primary key support; achievement is the ORM identity.
    achievement = models.ForeignKey(
        Achievement,
        models.DO_NOTHING,
        db_column="achievement_id",
        primary_key=True,
        related_name="+",
    )
    profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="profile_id",
        related_name="+",
    )
    can_log_progress = models.BooleanField()
    can_complete = models.BooleanField()
    assigned_by_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="assigned_by_profile_id",
        null=True,
        related_name="+",
    )
    assigned_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "achievement_assignees"


class ApprovalPolicy(models.Model):
    mode = models.CharField(max_length=32)
    min_approvals = models.IntegerField()
    require_evidence = models.BooleanField()
    allowed_approver_scope = models.CharField(max_length=32)
    created_by_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="created_by_profile_id",
        related_name="+",
    )
    approval_policy_id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    owner_context = models.ForeignKey(
        OwnerContext,
        models.DO_NOTHING,
        db_column="owner_context_id",
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "approval_policies"


class ApprovalPolicyApprover(models.Model):
    # Django has no composite primary key support; policy is the ORM identity.
    policy = models.ForeignKey(
        ApprovalPolicy,
        models.DO_NOTHING,
        db_column="policy_id",
        primary_key=True,
        related_name="+",
    )
    approver_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="approver_profile_id",
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "approval_policy_approvers"


class ApprovalRequest(models.Model):
    approval_request_id = models.UUIDField(primary_key=True)
    achievement = models.ForeignKey(
        Achievement,
        models.DO_NOTHING,
        db_column="achievement_id",
        related_name="+",
    )
    origin_progress_log = models.ForeignKey(
        AchievementLog,
        models.DO_NOTHING,
        db_column="origin_progress_log_id",
        related_name="+",
    )
    request_status = models.CharField(max_length=32)
    min_approval_count = models.IntegerField()
    current_approval_count = models.IntegerField()
    current_reject_count = models.IntegerField()
    created_at = models.DateTimeField()
    resolved_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = "approval_requests"


class ApprovalRequestApprover(models.Model):
    # Django has no composite primary key support; approval_request is the ORM identity.
    approval_request = models.ForeignKey(
        ApprovalRequest,
        models.DO_NOTHING,
        db_column="approval_request_id",
        primary_key=True,
        related_name="+",
    )
    approver_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="approver_profile_id",
        related_name="+",
    )
    assigned_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "approval_request_approvers"


class ApprovalDecision(models.Model):
    approval_decision_id = models.UUIDField(primary_key=True)
    approval_request = models.ForeignKey(
        ApprovalRequest,
        models.DO_NOTHING,
        db_column="approval_request_id",
        related_name="+",
    )
    approver_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="approver_profile_id",
        related_name="+",
    )
    decision_type = models.CharField(max_length=32)
    note_text = models.TextField(null=True)
    decided_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "approval_decisions"


class EvidenceAsset(models.Model):
    owner_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="owner_profile_id",
        related_name="+",
    )
    storage_provider = models.CharField(max_length=64)
    storage_key = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=128)
    size_bytes = models.BigIntegerField()
    checksum_sha256 = models.CharField(max_length=64)
    created_at = models.DateTimeField()
    evidence_asset_id = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = "evidence_assets"


class EvidenceLink(models.Model):
    target_kind = models.CharField(max_length=32)
    target_id = models.UUIDField()
    asset = models.ForeignKey(
        EvidenceAsset,
        models.DO_NOTHING,
        db_column="asset_id",
        related_name="+",
    )
    caption = models.TextField(null=True)
    created_at = models.DateTimeField()
    evidence_link_id = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = "evidence_links"


class Comment(models.Model):
    target_kind = models.CharField(max_length=32)
    target_id = models.UUIDField()
    author_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="author_profile_id",
        related_name="+",
    )
    body = models.TextField()
    deleted_at = models.DateTimeField(null=True)
    comment_id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "comments"
