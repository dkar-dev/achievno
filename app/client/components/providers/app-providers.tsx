"use client"

import { TelegramMiniAppProvider } from "@/components/providers/telegram-mini-app-provider"
import { TelegramBootstrapStateProvider } from "@/components/providers/telegram-bootstrap-state-provider"
import { TelegramThemeSync } from "@/components/providers/telegram-theme-sync"
import { TelegramBackButtonBridge } from "@/components/providers/telegram-back-button-bridge"
import { TelegramBootstrapProvider } from "@/components/providers/telegram-bootstrap-provider"
import { TelegramStartParamRedirect } from "@/components/providers/telegram-start-param-redirect"

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TelegramMiniAppProvider>
      <TelegramBootstrapStateProvider>
        <TelegramThemeSync />
        <TelegramBackButtonBridge />
        <TelegramBootstrapProvider />
        <TelegramStartParamRedirect />
        {children}
      </TelegramBootstrapStateProvider>
    </TelegramMiniAppProvider>
  )
}
