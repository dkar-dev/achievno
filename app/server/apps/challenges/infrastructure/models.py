from django.db import models


class Challenge(models.Model):
    created_by_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="created_by_profile_id",
        related_name="+",
    )
    challenge_type = models.CharField(max_length=32)
    title = models.CharField(max_length=180)
    short_definition = models.CharField(max_length=255)
    description = models.TextField(null=True)
    rules_text = models.TextField(null=True)
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
    start_at = models.DateTimeField(null=True)
    end_at = models.DateTimeField(null=True)
    progress_target = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    unit_label = models.CharField(max_length=64, null=True)
    lifecycle_state = models.CharField(max_length=32)
    winner_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="winner_profile_id",
        null=True,
        related_name="+",
    )
    archived_at = models.DateTimeField(null=True)
    challenge_id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    owner_context = models.ForeignKey(
        "achievements.OwnerContext",
        models.DO_NOTHING,
        db_column="owner_context_id",
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "challenges"


class ChallengeParticipant(models.Model):
    # Django has no composite primary key support; challenge is the ORM identity.
    challenge = models.ForeignKey(
        Challenge,
        models.DO_NOTHING,
        db_column="challenge_id",
        primary_key=True,
        related_name="+",
    )
    profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="profile_id",
        related_name="+",
    )
    state = models.CharField(max_length=32)
    current_progress = models.DecimalField(max_digits=14, decimal_places=2)
    current_rank = models.IntegerField(null=True)
    joined_at = models.DateTimeField()
    left_at = models.DateTimeField(null=True)
    completed_at = models.DateTimeField(null=True)
    winner_position = models.IntegerField(null=True)

    class Meta:
        managed = False
        db_table = "challenge_participants"


class ChallengeCompletionEvent(models.Model):
    challenge = models.ForeignKey(
        Challenge,
        models.DO_NOTHING,
        db_column="challenge_id",
        related_name="+",
    )
    profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="profile_id",
        related_name="+",
    )
    event_type = models.CharField(max_length=64)
    payload_json = models.JSONField()
    created_at = models.DateTimeField()
    challenge_completion_event_id = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = "challenge_completion_events"
