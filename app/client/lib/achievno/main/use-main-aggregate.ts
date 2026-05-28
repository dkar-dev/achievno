'use client'

import * as React from 'react'
import { mainApi, type MainAggregate } from '@/lib/achievno/api/main'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'

export const MAIN_AGGREGATE_USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

export type MainAggregateState = {
  data: MainAggregate | null
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useMainAggregate({
  enabled,
  mockData,
}: {
  enabled: boolean
  mockData?: MainAggregate
}): MainAggregateState {
  const [data, setData] = React.useState<MainAggregate | null>(() =>
    MAIN_AGGREGATE_USE_MOCKS ? mockData ?? null : null,
  )
  const [isLoading, setIsLoading] = React.useState(!MAIN_AGGREGATE_USE_MOCKS)
  const [error, setError] = React.useState<string | null>(null)

  const loadMain = React.useCallback(async () => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    if (MAIN_AGGREGATE_USE_MOCKS) {
      setData(mockData ?? null)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await mainApi.getMain()
      setData(response)
    } catch (caughtError) {
      setData(null)
      setError(getApiErrorMessage(caughtError, 'Main screen data could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, mockData])

  React.useEffect(() => {
    void loadMain()
  }, [loadMain])

  return {
    data,
    isLoading,
    error,
    reload: loadMain,
  }
}
