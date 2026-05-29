from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING
from uuid import UUID

from django.conf import settings

from apps.accounts.domain.errors import AuthenticationRequired, InvalidCredentials
from apps.accounts.infrastructure.email import send_verification_email
from apps.accounts.infrastructure.tokens import (
    generate_refresh_token,
    generate_verification_token,
    issue_access_token,
)

if TYPE_CHECKING:
    from apps.accounts.infrastructure.repositories import AccountsRepository


@dataclass(frozen=True)
class AccountDTO:
    account_id: UUID


@dataclass(frozen=True)
class ProfileDTO:
    profile_id: UUID
    display_name: str
    username: str | None


@dataclass(frozen=True)
class SignUpResult:
    account: AccountDTO
    profile: ProfileDTO
    dev_verification_token: str | None
    verification_email_sent: bool = False


@dataclass(frozen=True)
class AuthTokens:
    access_token: str
    refresh_token: str | None


@dataclass(frozen=True)
class AuthenticatedResult:
    account: AccountDTO
    profile: ProfileDTO
    tokens: AuthTokens


@dataclass(frozen=True)
class CurrentUserResult:
    account: AccountDTO
    profile: ProfileDTO


@dataclass(frozen=True)
class RefreshResult:
    access_token: str


class AuthService:
    def __init__(self, repository: AccountsRepository | None = None):
        if repository is None:
            from apps.accounts.infrastructure.repositories import AccountsRepository

            repository = AccountsRepository()
        self.repository = repository

    def sign_up(
        self,
        *,
        email: str,
        password: str,
        display_name: str,
        username: str | None = None,
    ) -> SignUpResult:
        verification_token = generate_verification_token()
        created = self.repository.create_email_account(
            email=email,
            password=password,
            display_name=display_name,
            username=username,
            verification_token=verification_token,
        )
        verification_email_sent = send_verification_email(
            email=email,
            display_name=display_name,
            token=verification_token,
        )
        return SignUpResult(
            account=AccountDTO(account_id=created.account.account_id),
            profile=ProfileDTO(
                profile_id=created.profile.profile_id,
                display_name=created.profile.display_name,
                username=created.profile.username,
            ),
            dev_verification_token=(
                verification_token
                if settings.ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN
                else None
            ),
            verification_email_sent=verification_email_sent,
        )

    def verify_email(self, *, token: str) -> None:
        self.repository.verify_email_token(token)

    def sign_in(
        self,
        *,
        email: str,
        password: str,
        user_agent: str | None,
        ip_address: str | None,
    ) -> AuthenticatedResult:
        auth_method = self.repository.get_verified_email_auth_method(email, password)
        profile = self.repository.get_profile_for_account(auth_method.account_id)
        refresh_token = generate_refresh_token()
        session = self.repository.create_session(
            auth_method=auth_method,
            refresh_token=refresh_token,
            user_agent=user_agent,
            ip_address=ip_address,
            ttl_seconds=settings.ACHIEVNO_REFRESH_TOKEN_TTL_SECONDS,
        )
        access_token, _ = issue_access_token(
            account_id=auth_method.account_id,
            profile_id=profile.profile_id,
            session_id=session.session_id,
        )
        return AuthenticatedResult(
            account=AccountDTO(account_id=auth_method.account_id),
            profile=ProfileDTO(
                profile_id=profile.profile_id,
                display_name=profile.display_name,
                username=profile.username,
            ),
            tokens=AuthTokens(access_token=access_token, refresh_token=refresh_token),
        )

    def refresh(self, *, refresh_token: str | None) -> RefreshResult:
        if not refresh_token:
            raise AuthenticationRequired()
        principal = self.repository.get_active_session_by_refresh_token(refresh_token)
        if principal is None:
            raise InvalidCredentials()
        self.repository.touch_session(principal.session)
        access_token, _ = issue_access_token(
            account_id=principal.account.account_id,
            profile_id=principal.profile.profile_id,
            session_id=principal.session.session_id,
        )
        return RefreshResult(access_token=access_token)

    def sign_out(self, *, refresh_token: str | None) -> None:
        if not refresh_token:
            return
        principal = self.repository.get_active_session_by_refresh_token(refresh_token)
        if principal is None:
            return
        self.repository.revoke_session(principal.session)

    def current_user(self, *, account_id: UUID, profile_id: UUID, session_id: UUID) -> CurrentUserResult:
        principal = self.repository.get_active_session_by_ids(
            account_id=account_id,
            profile_id=profile_id,
            session_id=session_id,
        )
        if principal is None:
            raise AuthenticationRequired()
        return CurrentUserResult(
            account=AccountDTO(account_id=principal.account.account_id),
            profile=ProfileDTO(
                profile_id=principal.profile.profile_id,
                display_name=principal.profile.display_name,
                username=principal.profile.username,
            ),
        )
