from django.db import models


class UserProfile(models.Model):
    profile_id = models.UUIDField(primary_key=True)
    display_name = models.CharField(max_length=120)
    username = models.TextField(null=True)
    avatar_url = models.TextField(null=True)
    bio = models.TextField(null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    deactivated_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)
    account = models.ForeignKey(
        "accounts.Account",
        models.DO_NOTHING,
        db_column="account_id",
        related_name="+",
    )

    class Meta:
        managed = False
        db_table = "user_profiles"


class ProfilePreferences(models.Model):
    profile = models.ForeignKey(
        UserProfile,
        models.DO_NOTHING,
        db_column="profile_id",
        primary_key=True,
        related_name="+",
    )
    language_code = models.CharField(max_length=16)
    appearance_mode = models.CharField(max_length=32)
    timezone = models.CharField(max_length=64)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "profile_preferences"


class ProfileInterestCategory(models.Model):
    # Django has no composite primary key support; profile is the ORM identity.
    profile = models.ForeignKey(
        UserProfile,
        models.DO_NOTHING,
        db_column="profile_id",
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
        db_table = "profile_interest_categories"
