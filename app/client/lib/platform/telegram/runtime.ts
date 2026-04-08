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

function hasTelegramInitData(webApp: TelegramWebApp | null): boolean {
    return Boolean(webApp?.initData && webApp.initData.trim().length > 0)
}

export function isTelegramMiniApp(): boolean {
    return hasTelegramInitData(getTelegramWebApp())
}

export function getTelegramPlatformContext(): TelegramPlatformContext {
    const webApp = getTelegramWebApp()

    if (!webApp) {
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
        isTelegramMiniApp: hasTelegramInitData(webApp),
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
    const webApp = getTelegramWebApp()

    if (!webApp) {
        return getTelegramPlatformContext()
    }

    webApp.ready()

    if (typeof webApp.expand === "function") {
        webApp.expand()
    }

    return getTelegramPlatformContext()
}