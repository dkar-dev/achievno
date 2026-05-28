from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from uuid import UUID, uuid4

from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.accounts.domain.errors import (
    DuplicateAccount,
    DuplicateUsername,
    InvalidCredentials,
    InvalidVerificationToken,
)
from apps.accounts.infrastructure.models import Account, AccountAuthMethod, AuthSession, AuthVerificationToken
from apps.accounts.infrastructure.tokens import hash_refresh_token, hash_verification_token
from apps.profiles.infrastructure.models import ProfilePreferences, UserProfile


EMAIL_METHOD_TYPE = "email"


@dataclass(frozen=True)
class AccountProfile:
    account: Account
    profile: UserProfile


@dataclass(frozen=True)
class CreatedAccount:
    account: Account
    profile: UserProfile
    auth_method: AccountAuthMethod
    verification_token: str


@dataclass(frozen=True)
class SessionPrincipal:
    account: Account
    profile: UserProfile
    session: AuthSession


class AccountsRepository:
    def create_email_account(
        self,
        *,
        email: str,
        password: str,
        display_name: str,
        username: str | None,
        verification_token: str,
    ) -> CreatedAccount:
        if self.email_auth_method_exists(email):
            raise DuplicateAccount()
        if username and self.username_exists(username):
            raise DuplicateUsername()

        now = timezone.now()
        try:
            with transaction.atomic():
                account = Account.objects.create(
                    account_id=uuid4(),
                    created_at=now,
                    updated_at=now,
                )
                auth_method = AccountAuthMethod.objects.create(
                    auth_method_id=uuid4(),
                    account=account,
                    method_type=EMAIL_METHOD_TYPE,
                    login_identifier=email,
                    credential_hash=make_password(password),
                    provider_username=None,
                    method_metadata_json={},
                    verified_at=None,
                    created_at=now,
                    updated_at=now,
                )
                profile = UserProfile.objects.create(
                    profile_id=uuid4(),
                    account=account,
                    display_name=display_name,
                    username=username,
                    avatar_url=None,
                    bio=None,
                    created_at=now,
                    updated_at=now,
                )
                ProfilePreferences.objects.create(
                    profile=profile,
                    language_code="en",
                    appearance_mode="system",
                    timezone="UTC",
                    created_at=now,
                    updated_at=now,
                )
                AuthVerificationToken.objects.create(
                    verification_token_id=uuid4(),
                    auth_method=auth_method,
                    token_hash=hash_verification_token(verification_token),
                    expires_at=now + timedelta(hours=24),
                    used_at=None,
                    created_at=now,
                )
        except IntegrityError as exc:
            if username and self.username_exists(username):
                raise DuplicateUsername() from exc
            raise DuplicateAccount() from exc

        return CreatedAccount(
            account=account,
            profile=profile,
            auth_method=auth_method,
            verification_token=verification_token,
        )

    def verify_email_token(self, token: str) -> None:
        now = timezone.now()
        token_hash = hash_verification_token(token)
        with transaction.atomic():
            verification_token = (
                AuthVerificationToken.objects.select_for_update()
                .select_related("auth_method")
                .filter(token_hash=token_hash, used_at__isnull=True, expires_at__gt=now)
                .first()
            )
            if verification_token is None:
                raise InvalidVerificationToken()

            verification_token.used_at = now
            verification_token.save(update_fields=["used_at"])

            auth_method = verification_token.auth_method
            auth_method.verified_at = now
            auth_method.updated_at = now
            auth_method.save(update_fields=["verified_at", "updated_at"])

    def get_verified_email_auth_method(self, email: str, password: str) -> AccountAuthMethod:
        auth_method = (
            AccountAuthMethod.objects.select_related("account")
            .filter(
                method_type=EMAIL_METHOD_TYPE,
                login_identifier=email,
                verified_at__isnull=False,
                deactivated_at__isnull=True,
                account__deactivated_at__isnull=True,
                account__deleted_at__isnull=True,
            )
            .first()
        )
        if auth_method is None or not auth_method.credential_hash:
            raise InvalidCredentials()
        if not check_password(password, auth_method.credential_hash):
            raise InvalidCredentials()
        return auth_method

    def get_profile_for_account(self, account_id: UUID) -> UserProfile:
        return UserProfile.objects.get(
            account_id=account_id,
            deactivated_at__isnull=True,
            deleted_at__isnull=True,
        )

    def create_session(
        self,
        *,
        auth_method: AccountAuthMethod,
        refresh_token: str,
        user_agent: str | None,
        ip_address: str | None,
        ttl_seconds: int,
    ) -> AuthSession:
        now = timezone.now()
        return AuthSession.objects.create(
            session_id=uuid4(),
            account=auth_method.account,
            auth_method=auth_method,
            refresh_token_hash=hash_refresh_token(refresh_token),
            user_agent=user_agent,
            ip_address=ip_address,
            created_at=now,
            last_seen_at=now,
            expires_at=now + timedelta(seconds=ttl_seconds),
            revoked_at=None,
        )

    def get_active_session_by_refresh_token(self, refresh_token: str) -> SessionPrincipal | None:
        now = timezone.now()
        session = (
            AuthSession.objects.select_related("account", "auth_method")
            .filter(
                refresh_token_hash=hash_refresh_token(refresh_token),
                revoked_at__isnull=True,
                expires_at__gt=now,
                account__deactivated_at__isnull=True,
                account__deleted_at__isnull=True,
                auth_method__deactivated_at__isnull=True,
            )
            .first()
        )
        if session is None:
            return None
        profile = self.get_profile_for_account(session.account_id)
        return SessionPrincipal(account=session.account, profile=profile, session=session)

    def get_active_session_by_ids(
        self,
        *,
        account_id: UUID,
        profile_id: UUID,
        session_id: UUID,
    ) -> SessionPrincipal | None:
        now = timezone.now()
        session = (
            AuthSession.objects.select_related("account", "auth_method")
            .filter(
                session_id=session_id,
                account_id=account_id,
                revoked_at__isnull=True,
                expires_at__gt=now,
                account__deactivated_at__isnull=True,
                account__deleted_at__isnull=True,
                auth_method__deactivated_at__isnull=True,
            )
            .first()
        )
        if session is None:
            return None

        profile = (
            UserProfile.objects.filter(
                profile_id=profile_id,
                account_id=account_id,
                deactivated_at__isnull=True,
                deleted_at__isnull=True,
            )
            .first()
        )
        if profile is None:
            return None
        return SessionPrincipal(account=session.account, profile=profile, session=session)

    def touch_session(self, session: AuthSession) -> None:
        session.last_seen_at = timezone.now()
        session.save(update_fields=["last_seen_at"])

    def revoke_session(self, session: AuthSession) -> None:
        if session.revoked_at is not None:
            return
        session.revoked_at = timezone.now()
        session.save(update_fields=["revoked_at"])

    def email_auth_method_exists(self, email: str) -> bool:
        return AccountAuthMethod.objects.filter(method_type=EMAIL_METHOD_TYPE, login_identifier=email).exists()

    def username_exists(self, username: str) -> bool:
        return UserProfile.objects.filter(username=username).exists()
