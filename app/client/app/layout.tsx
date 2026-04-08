import type {Metadata, Viewport} from 'next'
import {DM_Sans, DM_Mono} from 'next/font/google'
import {Analytics} from '@vercel/analytics/next'
import Script from "next/script"
import {TelegramMiniAppProvider} from "@/components/providers/telegram-mini-app-provider"
import './globals.css'
import {TelegramThemeSync} from "@/components/providers/telegram-theme-sync";
import {TelegramBackButtonBridge} from "@/components/providers/telegram-back-button-bridge";
import {TelegramBootstrapProvider} from "@/components/providers/telegram-bootstrap-provider";
import {TelegramStartParamRedirect} from "@/components/providers/telegram-start-param-redirect";
import {TelegramBootstrapStateProvider} from "@/components/providers/telegram-bootstrap-state-provider";

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ROOT LAYOUT
 * ═══════════════════════════════════════════════════════════════
 * Shared layout for Telegram Mini App and Website
 * Mobile-first, dark mode default
 * ═══════════════════════════════════════════════════════════════
 */

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

const dmMono = DM_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-mono',
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: 'Achievno',
        template: '%s | Achievno',
    },
    description: 'Track personal achievements and group progress. Celebrate wins together.',
    generator: 'Achievno',
    applicationName: 'Achievno',
    keywords: ['achievements', 'goals', 'progress', 'groups', 'challenges', 'habits'],
    authors: [{name: 'Achievno'}],
    creator: 'Achievno',
    manifest: '/manifest.json',
    icons: {
        icon: [
            {url: '/icon-32x32.png', sizes: '32x32', type: 'image/png'},
            {url: '/icon-192x192.png', sizes: '192x192', type: 'image/png'},
        ],
        apple: [
            {url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png'},
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Achievno',
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: 'website',
        siteName: 'Achievno',
        title: 'Achievno',
        description: 'Track personal achievements and group progress. Celebrate wins together.',
    },
    twitter: {
        card: 'summary',
        title: 'Achievno',
        description: 'Track personal achievements and group progress.',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: [
        {media: '(prefers-color-scheme: dark)', color: '#0E0F11'},
        {media: '(prefers-color-scheme: light)', color: '#FFFFFF'},
    ],
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
        <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <Script
            src="https://telegram.org/js/telegram-web-app.js"
            strategy="beforeInteractive"
        />
        <TelegramMiniAppProvider>
            <TelegramBootstrapStateProvider>
                <TelegramThemeSync />
                <TelegramBackButtonBridge />
                <TelegramBootstrapProvider />
                <TelegramStartParamRedirect />
                {children}
                {process.env.NODE_ENV === "production" && <Analytics />}
            </TelegramBootstrapStateProvider>
        </TelegramMiniAppProvider>
        </body>
        </html>
    )
}
