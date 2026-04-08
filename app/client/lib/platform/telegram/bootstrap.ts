import { getTelegramPlatformContext } from "@/lib/platform/telegram"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""

export type TelegramBootstrapResponse = {
  ok: boolean
  telegram: {
    hasInitData: boolean
    startParam: string | null
    user: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    } | null
  }
  verification: {
    ok: boolean
    reason:
      | "verified"
      | "missing_hash"
      | "invalid_hash"
      | "expired"
      | "invalid_auth_date"
      | "missing_bot_token"
      | "missing_init_data"
    authDate: number | null
  }
  session: {
    status: string
  }
}

export async function bootstrapTelegramSession() {
  const context = getTelegramPlatformContext()

  if (!context.isTelegramMiniApp) return null
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set")
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/telegram/bootstrap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      initData: context.initData,
      initDataUnsafe: context.initDataUnsafe,
    }),
  })

  if (!response.ok) {
    throw new Error("Telegram bootstrap request failed")
  }

  return (await response.json()) as TelegramBootstrapResponse
}
