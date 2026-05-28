from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from apps.accounts.infrastructure.tokens import decode_access_token


@dataclass(frozen=True)
class AuthPrincipal:
    account_id: UUID
    profile_id: UUID
    session_id: UUID
    is_authenticated: bool = True


class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get("achievno_access")
        if not token:
            return None

        try:
            payload = decode_access_token(token)
        except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as exc:
            raise AuthenticationFailed("Invalid access token.") from exc

        from apps.accounts.infrastructure.repositories import AccountsRepository

        principal = AccountsRepository().get_active_session_by_ids(
            account_id=payload.account_id,
            profile_id=payload.profile_id,
            session_id=payload.session_id,
        )
        if principal is None:
            raise AuthenticationFailed("Invalid access token.")

        return (
            AuthPrincipal(
                account_id=principal.account.account_id,
                profile_id=principal.profile.profile_id,
                session_id=principal.session.session_id,
            ),
            None,
        )
