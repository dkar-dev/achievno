"use client"

import { useEffect } from "react"
import { initTelegramMiniApp } from "@/lib/platform/telegram"

type TelegramMiniAppProviderProps = {
    children: React.ReactNode
}

export function TelegramMiniAppProvider({
                                            children,
                                        }: TelegramMiniAppProviderProps) {
    useEffect(() => {
        initTelegramMiniApp()
    }, [])

    return <>{children}</>
}