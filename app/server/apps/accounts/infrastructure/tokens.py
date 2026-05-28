from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import secrets
from typing import Any
from uuid import UUID

import jwt
from django.conf import settings
from django.utils.crypto import salted_hmac


ACCESS_TOKEN_ALGORITHM = "HS256"
REFRESH_TOKEN_BYTES = 32
VERIFICATION_TOKEN_BYTES = 32


@dataclass(frozen=True)
class AccessTokenPayload:
    account_id: UUID
    profile_id: UUID
    session_id: UUID
    issued_at: datetime
    expires_at: datetime


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def access_token_secret() -> str:
    return getattr(settings, "ACHIEVNO_ACCESS_TOKEN_SECRET", settings.SECRET_KEY)


def issue_access_token(*, account_id: UUID, profile_id: UUID, session_id: UUID) -> tuple[str, datetime]:
    now = utcnow()
    expires_at = now + timedelta(seconds=settings.ACHIEVNO_ACCESS_TOKEN_TTL_SECONDS)
    payload = {
        "account_id": str(account_id),
        "profile_id": str(profile_id),
        "session_id": str(session_id),
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return jwt.encode(payload, access_token_secret(), algorithm=ACCESS_TOKEN_ALGORITHM), expires_at


def decode_access_token(token: str) -> AccessTokenPayload:
    payload: dict[str, Any] = jwt.decode(
        token,
        access_token_secret(),
        algorithms=[ACCESS_TOKEN_ALGORITHM],
    )
    return AccessTokenPayload(
        account_id=UUID(str(payload["account_id"])),
        profile_id=UUID(str(payload["profile_id"])),
        session_id=UUID(str(payload["session_id"])),
        issued_at=datetime.fromtimestamp(int(payload["iat"]), tz=timezone.utc),
        expires_at=datetime.fromtimestamp(int(payload["exp"]), tz=timezone.utc),
    )


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(REFRESH_TOKEN_BYTES)


def generate_verification_token() -> str:
    return secrets.token_urlsafe(VERIFICATION_TOKEN_BYTES)


def hash_refresh_token(token: str) -> str:
    return _hash_token("achievno.auth.refresh", token)


def hash_verification_token(token: str) -> str:
    return _hash_token("achievno.auth.verify_email", token)


def _hash_token(salt: str, token: str) -> str:
    return salted_hmac(salt, token, secret=settings.SECRET_KEY, algorithm="sha256").hexdigest()
