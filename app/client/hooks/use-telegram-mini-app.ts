"use client"

import { useEffect, useMemo, useState } from "react"
import {
    getTelegramPlatformContext,
    isTelegramMiniApp,
} from "@/lib/platform/telegram"
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
        const nextContext = getTelegramPlatformContext()
        setContext(nextContext)
        setIsReady(true)
    }, [])

    return useMemo(
        () => ({
            ...context,
            isTelegramMiniApp: isTelegramMiniApp(),
            isReady,
        }),
        [context, isReady],
    )
}