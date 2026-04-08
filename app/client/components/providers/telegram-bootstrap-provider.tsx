"use client"

import { useEffect } from "react"
import { bootstrapTelegramSession } from "@/lib/platform/telegram"
import { useTelegramBootstrapState } from "@/components/providers/telegram-bootstrap-state-provider"

type TelegramBootstrapProviderProps = {
  children?: React.ReactNode
}

export function TelegramBootstrapProvider({
  children,
}: TelegramBootstrapProviderProps) {
  const { setLoading, setLoaded, setData, setError } = useTelegramBootstrapState()

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setLoading(true)
        setLoaded(false)
        setError(null)

        const result = await bootstrapTelegramSession()

        if (cancelled) return

        setData(result)
      } catch (error) {
        if (cancelled) return

        setError(error instanceof Error ? error.message : "Unknown bootstrap error")
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoaded(true)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [setLoading, setLoaded, setData, setError])

  return <>{children}</>
}
