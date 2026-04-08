from __future__ import annotations

import hmac
import time
from dataclasses import dataclass
from hashlib import sha256
from urllib.parse import parse_qsl


@dataclass(slots=True)
class TelegramInitDataVerificationResult:
    ok: bool
    reason: str
    auth_date: int | None


def verify_telegram_webapp_init_data(
    init_data: str | None,
    bot_token: str | None,
    *,
    max_age_seconds: int = 3600,
) -> TelegramInitDataVerificationResult:
    if not bot_token:
        return TelegramInitDataVerificationResult(
            ok=False,
            reason="missing_bot_token",
            auth_date=None,
        )

    if not init_data:
        return TelegramInitDataVerificationResult(
            ok=False,
            reason="missing_init_data",
            auth_date=None,
        )

    params = dict(parse_qsl(init_data, keep_blank_values=True))
    hash_value = params.pop("hash", None)

    if not hash_value:
        return TelegramInitDataVerificationResult(
            ok=False,
            reason="missing_hash",
            auth_date=None,
        )

    auth_date_raw = params.get("auth_date")
    auth_date: int | None = None

    if auth_date_raw is not None:
        try:
            auth_date = int(auth_date_raw)
        except ValueError:
            return TelegramInitDataVerificationResult(
                ok=False,
                reason="invalid_auth_date",
                auth_date=None,
            )

    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(params.items(), key=lambda item: item[0])
    )

    secret_key = hmac.new(
        b"WebAppData",
        bot_token.encode("utf-8"),
        sha256,
    ).digest()

    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode("utf-8"),
        sha256,
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, hash_value):
        return TelegramInitDataVerificationResult(
            ok=False,
            reason="invalid_hash",
            auth_date=auth_date,
        )

    now = int(time.time())
    if auth_date is not None and now - auth_date > max_age_seconds:
        return TelegramInitDataVerificationResult(
            ok=False,
            reason="expired",
            auth_date=auth_date,
        )

    return TelegramInitDataVerificationResult(
        ok=True,
        reason="verified",
        auth_date=auth_date,
    )
