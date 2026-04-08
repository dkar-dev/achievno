from fastapi import APIRouter

from app.config import settings
from app.schemas.telegram import (
    TelegramBootstrapRequest,
    TelegramBootstrapResponse,
    TelegramBootstrapTelegramPayload,
    TelegramSessionPayload,
    TelegramVerificationPayload,
)
from app.services.telegram_init_data import verify_telegram_webapp_init_data

router = APIRouter(prefix="/telegram", tags=["telegram"])


@router.post("/bootstrap", response_model=TelegramBootstrapResponse)
async def telegram_bootstrap(
    payload: TelegramBootstrapRequest,
) -> TelegramBootstrapResponse:
    has_init_data = bool(payload.initData)
    start_param = payload.initDataUnsafe.start_param if payload.initDataUnsafe else None
    user = payload.initDataUnsafe.user if payload.initDataUnsafe else None

    verification_result = verify_telegram_webapp_init_data(
        payload.initData,
        settings.telegram_bot_token,
        max_age_seconds=3600,
    )

    verification = TelegramVerificationPayload(
        ok=verification_result.ok,
        reason=verification_result.reason,
        authDate=verification_result.auth_date,
    )

    return TelegramBootstrapResponse(
        ok=True,
        telegram=TelegramBootstrapTelegramPayload(
            hasInitData=has_init_data,
            startParam=start_param,
            user=user,
        ),
        verification=verification,
        session=TelegramSessionPayload(
            status="verified_stub" if verification_result.ok else "unverified_stub",
        ),
    )
