"use client"

import { useTelegramMiniApp } from "@/hooks/use-telegram-mini-app"

export function TelegramMiniAppDebug() {
    const tg = useTelegramMiniApp()

    if (!tg.isReady) return null

    return (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
            <div>telegram: {tg.isTelegramMiniApp ? "yes" : "no"}</div>
            <div>platform: {tg.platform ?? "unknown"}</div>
            <div>version: {tg.version ?? "unknown"}</div>
            <div>user: {tg.initDataUnsafe?.user?.username ?? tg.initDataUnsafe?.user?.first_name ?? "guest"}</div>
        </div>
    )
}