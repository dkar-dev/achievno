"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { TelegramBootstrapResponse } from "@/lib/platform/telegram"

type TelegramBootstrapState = {
  isLoading: boolean
  isLoaded: boolean
  data: TelegramBootstrapResponse | null
  error: string | null
  setLoading: (value: boolean) => void
  setLoaded: (value: boolean) => void
  setData: (value: TelegramBootstrapResponse | null) => void
  setError: (value: string | null) => void
}

const noop = () => {}

const defaultTelegramBootstrapState: TelegramBootstrapState = {
  isLoading: false,
  isLoaded: true,
  data: null,
  error: null,
  setLoading: noop,
  setLoaded: noop,
  setData: noop,
  setError: noop,
}

const TelegramBootstrapStateContext = createContext<TelegramBootstrapState>(
  defaultTelegramBootstrapState,
)

type TelegramBootstrapStateProviderProps = {
  children: React.ReactNode
}

export function TelegramBootstrapStateProvider({
  children,
}: TelegramBootstrapStateProviderProps) {
  const [isLoading, setLoading] = useState(false)
  const [isLoaded, setLoaded] = useState(false)
  const [data, setData] = useState<TelegramBootstrapResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const value = useMemo<TelegramBootstrapState>(
    () => ({
      isLoading,
      isLoaded,
      data,
      error,
      setLoading,
      setLoaded,
      setData,
      setError,
    }),
    [isLoading, isLoaded, data, error],
  )

  return (
    <TelegramBootstrapStateContext.Provider value={value}>
      {children}
    </TelegramBootstrapStateContext.Provider>
  )
}

export function useTelegramBootstrapState() {
  return useContext(TelegramBootstrapStateContext)
}
