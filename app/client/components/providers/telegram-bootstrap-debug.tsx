"use client"

import { useTelegramBootstrap } from "@/hooks/use-telegram-bootstrap"

export function TelegramBootstrapDebug() {
    const bootstrap = useTelegramBootstrap()

    return (
        <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(
                    {
                        isLoading: bootstrap.isLoading,
                        isLoaded: bootstrap.isLoaded,
                        error: bootstrap.error,
                        data: bootstrap.data,
                    },
                    null,
                    2,
                )}
            </pre>
    )
}