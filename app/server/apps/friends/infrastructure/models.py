from django.db import models


class FriendConnection(models.Model):
    profile_a = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="profile_a_id",
        related_name="+",
    )
    profile_b = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="profile_b_id",
        related_name="+",
    )
    status = models.CharField(max_length=32)
    tombstoned_at = models.DateTimeField(null=True)
    friend_connection_id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "friend_connections"


class FriendConnectionSide(models.Model):
    # Django has no composite primary key support; friend_connection is the ORM identity.
    friend_connection = models.ForeignKey(
        FriendConnection,
        models.DO_NOTHING,
        db_column="friend_connection_id",
        primary_key=True,
        related_name="+",
    )
    profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="profile_id",
        related_name="+",
    )
    side_status = models.CharField(max_length=32)
    notifications_enabled = models.BooleanField()
    removed_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField()
    restored_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = "friend_connection_sides"
