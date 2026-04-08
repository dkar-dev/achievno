"use client"

import { useEffect } from "react"
import { useTelegramMiniApp } from "@/hooks/use-telegram-mini-app"

function setCssVar(name: string, value?: string) {
    if (!value) return
    document.documentElement.style.setProperty(name, value)
}

export function TelegramThemeSync() {
    const tg = useTelegramMiniApp()

    useEffect(() => {
        if (!tg.isTelegramMiniApp || !tg.themeParams) return

        const theme = tg.themeParams

        setCssVar("--tg-bg-color", theme.bg_color)
        setCssVar("--tg-text-color", theme.text_color)
        setCssVar("--tg-hint-color", theme.hint_color)
        setCssVar("--tg-link-color", theme.link_color)
        setCssVar("--tg-button-color", theme.button_color)
        setCssVar("--tg-button-text-color", theme.button_text_color)
        setCssVar("--tg-secondary-bg-color", theme.secondary_bg_color)
        setCssVar("--tg-header-bg-color", theme.header_bg_color)
        setCssVar("--tg-accent-text-color", theme.accent_text_color)
        setCssVar("--tg-section-bg-color", theme.section_bg_color)
        setCssVar(
            "--tg-section-header-text-color",
            theme.section_header_text_color,
        )
        setCssVar("--tg-subtitle-text-color", theme.subtitle_text_color)
        setCssVar("--tg-destructive-text-color", theme.destructive_text_color)

        if (tg.colorScheme) {
            document.documentElement.dataset.telegramColorScheme = tg.colorScheme
        }

        if (theme.bg_color) {
            document.body.style.backgroundColor = theme.bg_color
        }

        if (theme.text_color) {
            document.body.style.color = theme.text_color
        }
    }, [tg.isTelegramMiniApp, tg.themeParams, tg.colorScheme])

    return null
}