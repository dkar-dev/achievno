"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTelegramMiniApp } from "@/hooks/use-telegram-mini-app"

const ROOT_PATHS = new Set([
    "/",
    "/welcome",
    "/auth",
    "/onboarding",
    "/app",
])

export function useTelegramBackButton() {
    const router = useRouter()
    const pathname = usePathname()
    const tg = useTelegramMiniApp()

    useEffect(() => {
        if (!tg.isTelegramMiniApp || !tg.webApp?.BackButton) return

        const backButton = tg.webApp.BackButton
        const shouldShow = pathname ? !ROOT_PATHS.has(pathname) : false

        const handleBack = () => {
            router.back()
        }

        if (shouldShow) {
            backButton.show()
            backButton.onClick(handleBack)
        } else {
            backButton.hide()
        }

        return () => {
            backButton.offClick(handleBack)
            backButton.hide()
        }
    }, [tg.isTelegramMiniApp, tg.webApp, pathname, router])
}