"use client"

import { useTelegramBackButton } from "@/hooks/use-telegram-back-button"

export function TelegramBackButtonBridge() {
    useTelegramBackButton()
    return null
}
