"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTelegramMiniApp } from "@/hooks/use-telegram-mini-app"
import { ROUTES } from "@/lib/achievno/constants"

const ROOT_PATHS = new Set<string>([
    ROUTES.splash,
    ROUTES.welcome,
    ROUTES.signIn,
    ROUTES.signUp,
    ROUTES.forgotPassword,
    ROUTES.resetPasswordInfo,
    ROUTES.resetPassword,
    ROUTES.onboardingProfile,
    ROUTES.onboardingGoals,
    ROUTES.onboardingNotifications,
    ROUTES.spaces,
    ROUTES.personalWorkspace,
    ROUTES.discover,
    ROUTES.notifications,
    ROUTES.profile,
    ROUTES.settings,
])

export function useTelegramBackButton() {
    const router = useRouter()
    const pathname = usePathname()
    const tg = useTelegramMiniApp()

    useEffect(() => {
        if (!tg.isTelegramMiniApp || !tg.webApp?.BackButton || !pathname) return

        const backButton = tg.webApp.BackButton
        const shouldShow = !ROOT_PATHS.has(pathname)

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