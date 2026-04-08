import type {
  TelegramPlatformContext,
  TelegramWebApp,
  TelegramWindow,
} from "./types"

function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null
  const telegramWindow = window as TelegramWindow
  return telegramWindow.Telegram?.WebApp ?? null
}

function isRealTelegramMiniApp(webApp: TelegramWebApp | null): boolean {
  return Boolean(webApp?.initData && webApp.initData.trim().length > 0)
}

export function isTelegramMiniApp(): boolean {
  return isRealTelegramMiniApp(getTelegramWebApp())
}

export function getTelegramPlatformContext(): TelegramPlatformContext {
  const webApp = getTelegramWebApp()

  if (!isRealTelegramMiniApp(webApp)) {
    return {
      isTelegramMiniApp: false,
      webApp: null,
      initData: null,
      initDataUnsafe: null,
      colorScheme: null,
      themeParams: null,
      viewport: null,
      platform: null,
      version: null,
    }
  }

  return {
    isTelegramMiniApp: true,
    webApp,
    initData: webApp.initData ?? null,
    initDataUnsafe: webApp.initDataUnsafe ?? null,
    colorScheme: webApp.colorScheme ?? null,
    themeParams: webApp.themeParams ?? null,
    viewport: {
      height: webApp.viewportHeight ?? 0,
      stableHeight: webApp.viewportStableHeight,
      isExpanded: webApp.isExpanded,
    },
    platform: webApp.platform ?? null,
    version: webApp.version ?? null,
  }
}

export function initTelegramMiniApp(): TelegramPlatformContext {
  const context = getTelegramPlatformContext()

  if (!context.webApp) return context

  context.webApp.ready()

  if (typeof context.webApp.expand === "function") {
    context.webApp.expand()
  }

  return context
}
