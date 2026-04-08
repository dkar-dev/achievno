from pydantic import BaseModel


class TelegramUserPayload(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    language_code: str | None = None


class TelegramInitDataUnsafePayload(BaseModel):
    query_id: str | None = None
    auth_date: int | None = None
    hash: str | None = None
    start_param: str | None = None
    user: TelegramUserPayload | None = None


class TelegramBootstrapRequest(BaseModel):
    initData: str | None
    initDataUnsafe: TelegramInitDataUnsafePayload | None = None


class TelegramVerificationPayload(BaseModel):
    ok: bool
    reason: str
    authDate: int | None = None


class TelegramBootstrapTelegramPayload(BaseModel):
    hasInitData: bool
    startParam: str | None = None
    user: TelegramUserPayload | None = None


class TelegramSessionPayload(BaseModel):
    status: str


class TelegramBootstrapResponse(BaseModel):
    ok: bool
    telegram: TelegramBootstrapTelegramPayload
    verification: TelegramVerificationPayload
    session: TelegramSessionPayload
