from django.db import models


class Notification(models.Model):
    type = models.CharField(max_length=64)
    title = models.CharField(max_length=180)
    body = models.TextField()
    action_url = models.TextField(null=True)
    payload_json = models.JSONField()
    is_read = models.BooleanField()
    created_at = models.DateTimeField()
    read_at = models.DateTimeField(null=True)
    notification_id = models.UUIDField(primary_key=True)
    recipient_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="recipient_profile_id",
        related_name="+",
    )
    notification_status = models.CharField(max_length=32, null=True)
    acted_at = models.DateTimeField(null=True)
    invite = models.ForeignKey(
        "platform.Invite",
        models.DO_NOTHING,
        db_column="invite_id",
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
    achievement = models.ForeignKey(
        "achievements.Achievement",
        models.DO_NOTHING,
        db_column="achievement_id",
        null=True,
        related_name="+",
    )
    challenge = models.ForeignKey(
        "challenges.Challenge",
        models.DO_NOTHING,
        db_column="challenge_id",
        null=True,
        related_name="+",
    )
    approval_request = models.ForeignKey(
        "achievements.ApprovalRequest",
        models.DO_NOTHING,
        db_column="approval_request_id",
        null=True,
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "notifications"


class OutboxEvent(models.Model):
    event_type = models.CharField(max_length=80)
    aggregate_type = models.CharField(max_length=80)
    aggregate_id = models.UUIDField(null=True)
    payload_json = models.JSONField()
    status = models.CharField(max_length=32)
    available_at = models.DateTimeField()
    attempt_count = models.IntegerField()
    last_error = models.TextField(null=True)
    created_at = models.DateTimeField()
    processed_at = models.DateTimeField(null=True)
    outbox_event_id = models.UUIDField(primary_key=True)

    class Meta:
        managed = False
        db_table = "outbox_events"
