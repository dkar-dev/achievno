export type TelegramWebAppColorScheme = "light" | "dark"

export type TelegramWebAppUser = {
    id: number
    is_bot?: boolean
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    allows_write_to_pm?: boolean
    photo_url?: string
}

export type TelegramWebAppInitDataUnsafe = {
    query_id?: string
    user?: TelegramWebAppUser
    receiver?: TelegramWebAppUser
    start_param?: string
    auth_date?: number
    hash?: string
}

export type TelegramWebAppViewport = {
    height: number
    stableHeight?: number
    isExpanded?: boolean
}

export type TelegramWebAppThemeParams = {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    header_bg_color?: string
    accent_text_color?: string
    section_bg_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
}

export type TelegramWebApp = {
    ready: () => void
    expand?: () => void
    close?: () => void
    enableClosingConfirmation?: () => void
    disableClosingConfirmation?: () => void
    setHeaderColor?: (color: string) => void
    setBackgroundColor?: (color: string) => void
    colorScheme?: TelegramWebAppColorScheme
    initData?: string
    initDataUnsafe?: TelegramWebAppInitDataUnsafe
    version?: string
    platform?: string
    themeParams?: TelegramWebAppThemeParams
    viewportHeight?: number
    viewportStableHeight?: number
    isExpanded?: boolean
    BackButton?: {
        show: () => void
        hide: () => void
        onClick: (cb: () => void) => void
        offClick: (cb: () => void) => void
    }
}

export type TelegramWindow = Window & {
    Telegram?: {
        WebApp?: TelegramWebApp
    }
}

export type TelegramPlatformContext = {
    isTelegramMiniApp: boolean
    webApp: TelegramWebApp | null
    initData: string | null
    initDataUnsafe: TelegramWebAppInitDataUnsafe | null
    colorScheme: TelegramWebAppColorScheme | null
    themeParams: TelegramWebAppThemeParams | null
    viewport: TelegramWebAppViewport | null
    platform: string | null
    version: string | null
}