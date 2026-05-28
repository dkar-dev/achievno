from django.db import models


class Account(models.Model):
    account_id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    deactivated_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = "accounts"


class AccountAuthMethod(models.Model):
    auth_method_id = models.UUIDField(primary_key=True)
    account = models.ForeignKey(
        Account,
        models.DO_NOTHING,
        db_column="account_id",
        related_name="+",
    )
    method_type = models.CharField(max_length=64)
    login_identifier = models.TextField()
    credential_hash = models.TextField(null=True)
    provider_username = models.CharField(max_length=255, null=True)
    method_metadata_json = models.JSONField()
    verified_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    deactivated_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = "account_auth_methods"


class AuthSession(models.Model):
    session_id = models.UUIDField(primary_key=True)
    account = models.ForeignKey(
        Account,
        models.DO_NOTHING,
        db_column="account_id",
        related_name="+",
    )
    auth_method = models.ForeignKey(
        AccountAuthMethod,
        models.DO_NOTHING,
        db_column="auth_method_id",
        related_name="+",
    )
    refresh_token_hash = models.CharField(max_length=255)
    user_agent = models.TextField(null=True)
    ip_address = models.GenericIPAddressField(null=True)
    created_at = models.DateTimeField()
    last_seen_at = models.DateTimeField(null=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True)

    class Meta:
        managed = False
        db_table = "auth_sessions"


class AuthVerificationToken(models.Model):
    verification_token_id = models.UUIDField(primary_key=True)
    auth_method = models.ForeignKey(
        AccountAuthMethod,
        models.DO_NOTHING,
        db_column="auth_method_id",
        related_name="+",
    )
    token_hash = models.TextField()
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "auth_verification_tokens"
