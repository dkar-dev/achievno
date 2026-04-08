import { NextRequest, NextResponse } from "next/server"
import { getTelegramServerConfig } from "@/lib/server/telegram/config"
import { verifyTelegramWebAppInitData } from "@/lib/server/telegram/verify-webapp-init-data"

export const runtime = "nodejs"

type TelegramBootstrapRequest = {
  initData: string | null
  initDataUnsafe?: {
    query_id?: string
    auth_date?: number
    hash?: string
    start_param?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
  } | null
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as TelegramBootstrapRequest
  const config = getTelegramServerConfig()

  const verification = verifyTelegramWebAppInitData(
    body.initData,
    config.botToken,
    { maxAgeSeconds: 3600 },
  )

  const user = body.initDataUnsafe?.user ?? null
  const startParam = body.initDataUnsafe?.start_param ?? null

  return NextResponse.json({
    ok: true,
    telegram: {
      hasInitData: Boolean(body.initData),
      startParam,
      user,
    },
    verification,
    session: {
      status: verification.ok ? "verified_stub" : "unverified_stub",
    },
  })
}
