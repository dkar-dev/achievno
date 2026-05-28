from django.db import models


class TaxonomyCategory(models.Model):
    category_id = models.UUIDField(primary_key=True)
    code = models.CharField(max_length=80)
    title = models.CharField(max_length=160)
    description = models.TextField(null=True)
    sort_order = models.IntegerField()
    is_active = models.BooleanField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "taxonomy_categories"


class RankDefinition(models.Model):
    code = models.CharField(max_length=80)
    label = models.CharField(max_length=120)
    sort_order = models.IntegerField()
    color_token = models.CharField(max_length=64, null=True)
    is_active = models.BooleanField()
    rank_id = models.UUIDField(primary_key=True)
    owner_context = models.ForeignKey(
        "achievements.OwnerContext",
        models.DO_NOTHING,
        db_column="owner_context_id",
        null=True,
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "rank_definitions"


class Invite(models.Model):
    invite_id = models.UUIDField(primary_key=True)
    invite_kind = models.CharField(max_length=32)
    delivery_mode = models.CharField(max_length=32)
    sender_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="sender_profile_id",
        related_name="+",
    )
    target_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="target_profile_id",
        null=True,
        related_name="+",
    )
    target_email = models.TextField(null=True)
    link_token = models.CharField(max_length=255, null=True)
    link_expires_at = models.DateTimeField(null=True)
    group = models.ForeignKey(
        "groups.Group",
        models.DO_NOTHING,
        db_column="group_id",
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
    invite_status = models.CharField(max_length=32)
    accepted_at = models.DateTimeField(null=True)
    declined_at = models.DateTimeField(null=True)
    revoked_at = models.DateTimeField(null=True)
    expired_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField()
    resolved_group_membership = models.ForeignKey(
        "groups.GroupMembership",
        models.DO_NOTHING,
        db_column="resolved_group_membership_id",
        null=True,
        related_name="+",
    )
    resolved_friend_connection = models.ForeignKey(
        "friends.FriendConnection",
        models.DO_NOTHING,
        db_column="resolved_friend_connection_id",
        null=True,
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "invites"


class InviteUsage(models.Model):
    invite_usage_id = models.UUIDField(primary_key=True)
    invite = models.ForeignKey(Invite, models.DO_NOTHING, db_column="invite_id", related_name="+")
    accepted_by_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="accepted_by_profile_id",
        related_name="+",
    )
    usage_status = models.CharField(max_length=32)
    used_at = models.DateTimeField()
    resolved_group_membership = models.ForeignKey(
        "groups.GroupMembership",
        models.DO_NOTHING,
        db_column="resolved_group_membership_id",
        null=True,
        related_name="+",
    )
    resolved_friend_connection = models.ForeignKey(
        "friends.FriendConnection",
        models.DO_NOTHING,
        db_column="resolved_friend_connection_id",
        null=True,
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "invite_usages"
