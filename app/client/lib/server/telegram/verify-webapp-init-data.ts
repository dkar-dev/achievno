import { createHmac, timingSafeEqual } from "node:crypto"

export type TelegramInitDataVerificationResult =
  | {
      ok: true
      reason: "verified"
      authDate: number | null
    }
  | {
      ok: false
      reason:
        | "missing_hash"
        | "invalid_hash"
        | "expired"
        | "invalid_auth_date"
        | "missing_bot_token"
        | "missing_init_data"
      authDate: number | null
    }

type VerifyTelegramWebAppInitDataOptions = {
  maxAgeSeconds?: number
  now?: number
}

function buildDataCheckString(params: URLSearchParams): string {
  return [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")
}

export function verifyTelegramWebAppInitData(
  initData: string | null | undefined,
  botToken: string | null | undefined,
  options: VerifyTelegramWebAppInitDataOptions = {},
): TelegramInitDataVerificationResult {
  if (!botToken) {
    return {
      ok: false,
      reason: "missing_bot_token",
      authDate: null,
    }
  }

  if (!initData) {
    return {
      ok: false,
      reason: "missing_init_data",
      authDate: null,
    }
  }

  const params = new URLSearchParams(initData)
  const hash = params.get("hash")

  if (!hash) {
    return {
      ok: false,
      reason: "missing_hash",
      authDate: null,
    }
  }

  const authDateRaw = params.get("auth_date")
  const authDate = authDateRaw ? Number(authDateRaw) : null

  if (authDateRaw && Number.isNaN(authDate)) {
    return {
      ok: false,
      reason: "invalid_auth_date",
      authDate: null,
    }
  }

  const dataCheckString = buildDataCheckString(params)
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest()
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex")

  const hashBuffer = Buffer.from(hash, "hex")
  const calculatedHashBuffer = Buffer.from(calculatedHash, "hex")

  if (
    hashBuffer.length !== calculatedHashBuffer.length ||
    !timingSafeEqual(hashBuffer, calculatedHashBuffer)
  ) {
    return {
      ok: false,
      reason: "invalid_hash",
      authDate: authDate ?? null,
    }
  }

  const maxAgeSeconds = options.maxAgeSeconds ?? 3600
  const now = options.now ?? Math.floor(Date.now() / 1000)

  if (authDate !== null && now - authDate > maxAgeSeconds) {
    return {
      ok: false,
      reason: "expired",
      authDate,
    }
  }

  return {
    ok: true,
    reason: "verified",
    authDate,
  }
}
