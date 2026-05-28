from django.db import models


class Group(models.Model):
    group_id = models.UUIDField(primary_key=True)
    title = models.CharField(max_length=160)
    description = models.TextField(null=True)
    avatar_url = models.TextField(null=True)
    visibility_type = models.CharField(max_length=32)
    base_permission = models.CharField(max_length=32)
    created_by_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="created_by_profile_id",
        related_name="+",
    )
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    deactivated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = "groups"


class GroupMembership(models.Model):
    group_membership_id = models.UUIDField(primary_key=True)
    group = models.ForeignKey(Group, models.DO_NOTHING, db_column="group_id", related_name="+")
    profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="profile_id",
        related_name="+",
    )
    role = models.CharField(max_length=32)
    membership_status = models.CharField(max_length=32)
    notifications_enabled = models.BooleanField()
    joined_at = models.DateTimeField()
    left_at = models.DateTimeField(null=True)
    invited_by_profile = models.ForeignKey(
        "profiles.UserProfile",
        models.DO_NOTHING,
        db_column="invited_by_profile_id",
        null=True,
        related_name="+",
    )
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "group_memberships"


class GroupCategoryLink(models.Model):
    # Django has no composite primary key support; group is the ORM identity.
    group = models.ForeignKey(
        Group,
        models.DO_NOTHING,
        db_column="group_id",
        primary_key=True,
        related_name="+",
    )
    category = models.ForeignKey(
        "platform.TaxonomyCategory",
        models.DO_NOTHING,
        db_column="category_id",
        related_name="+",
    )
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "group_category_links"
