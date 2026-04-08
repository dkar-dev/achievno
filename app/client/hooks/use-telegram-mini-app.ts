"use client"

import { useEffect, useMemo, useState } from "react"
import { getTelegramPlatformContext } from "@/lib/platform/telegram"
import type { TelegramPlatformContext } from "@/lib/platform/telegram"

type UseTelegramMiniAppResult = TelegramPlatformContext & {
    isReady: boolean
}

export function useTelegramMiniApp(): UseTelegramMiniAppResult {
    const [context, setContext] = useState<TelegramPlatformContext>(() =>
        getTelegramPlatformContext(),
    )
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        let attempts = 0
        const maxAttempts = 20

        const sync = () => {
            const nextContext = getTelegramPlatformContext()
            setContext(nextContext)

            attempts += 1

            if (nextContext.initData || attempts >= maxAttempts) {
                setIsReady(true)
                return true
            }

            return false
        }

        if (sync()) return

        const interval = window.setInterval(() => {
            if (sync()) {
                window.clearInterval(interval)
            }
        }, 150)

        return () => {
            window.clearInterval(interval)
        }
    }, [])

    return useMemo(
        () => ({
            ...context,
            isReady,
        }),
        [context, isReady],
    )
}