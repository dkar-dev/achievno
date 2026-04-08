from fastapi import APIRouter

from app.schemas.telegram import (
    TelegramBootstrapRequest,
    TelegramBootstrapResponse,
    TelegramBootstrapTelegramPayload,
    TelegramSessionPayload,
    TelegramVerificationPayload,
)

router = APIRouter(prefix="/telegram", tags=["telegram"])


@router.post("/bootstrap", response_model=TelegramBootstrapResponse)
async def telegram_bootstrap(
    payload: TelegramBootstrapRequest,
) -> TelegramBootstrapResponse:
    has_init_data = bool(payload.initData)
    start_param = payload.initDataUnsafe.start_param if payload.initDataUnsafe else None
    user = payload.initDataUnsafe.user if payload.initDataUnsafe else None

    verification = TelegramVerificationPayload(
        ok=False,
        reason="missing_bot_token",
        authDate=payload.initDataUnsafe.auth_date if payload.initDataUnsafe else None,
    )

    if not has_init_data:
        verification = TelegramVerificationPayload(
            ok=False,
            reason="missing_init_data",
            authDate=None,
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
            status="bootstrap_stub",
        ),
    )
