"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { TelegramBootstrapResponse } from "@/lib/platform/telegram"

type TelegramBootstrapState = {
  isLoading: boolean
  isLoaded: boolean
  data: TelegramBootstrapResponse | null
  error: string | null
  setLoading: (value: boolean) => void
  setData: (value: TelegramBootstrapResponse | null) => void
  setError: (value: string | null) => void
}

const TelegramBootstrapStateContext =
  createContext<TelegramBootstrapState | null>(null)

type TelegramBootstrapStateProviderProps = {
  children: React.ReactNode
}

export function TelegramBootstrapStateProvider({
  children,
}: TelegramBootstrapStateProviderProps) {
  const [isLoading, setLoading] = useState(false)
  const [data, setData] = useState<TelegramBootstrapResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const value = useMemo<TelegramBootstrapState>(
    () => ({
      isLoading,
      isLoaded: !isLoading && (data !== null || error !== null),
      data,
      error,
      setLoading,
      setData,
      setError,
    }),
    [isLoading, data, error],
  )

  return (
    <TelegramBootstrapStateContext.Provider value={value}>
      {children}
    </TelegramBootstrapStateContext.Provider>
  )
}

export function useTelegramBootstrapState() {
  const context = useContext(TelegramBootstrapStateContext)

  if (!context) {
    throw new Error(
      "useTelegramBootstrapState must be used within TelegramBootstrapStateProvider",
    )
  }

  return context
}
