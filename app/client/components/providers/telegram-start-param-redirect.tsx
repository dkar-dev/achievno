"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ROUTES } from "@/lib/achievno/constants"
import { useTelegramMiniApp } from "@/hooks/use-telegram-mini-app"
import { resolveTelegramStartParam } from "@/lib/platform/telegram"

const TELEGRAM_ENTRY_PATHS = new Set<string>([
  ROUTES.splash,
  ROUTES.welcome,
  ROUTES.signIn,
  ROUTES.signUp,
])

export function TelegramStartParamRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const tg = useTelegramMiniApp()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    if (!tg.isReady || !pathname) return

    handledRef.current = true

    if (!tg.isTelegramMiniApp) return
    if (!TELEGRAM_ENTRY_PATHS.has(pathname)) return

    const resolution = resolveTelegramStartParam(
      tg.initDataUnsafe?.start_param ?? null,
    )

    if (resolution.type !== "route") return
    if (resolution.href === pathname) return

    router.replace(resolution.href)
  }, [
    tg.isReady,
    tg.isTelegramMiniApp,
    tg.initDataUnsafe?.start_param,
    pathname,
    router,
  ])

  return null
}
