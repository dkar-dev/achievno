'use client'

import * as React from 'react'
import { achievementsApi, type PersonalAchievement } from '@/lib/achievno/api/achievements'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'

export const PERSONAL_ACHIEVEMENTS_USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

export type PersonalAchievementsState = {
  items: PersonalAchievement[]
  totalCount: number
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function usePersonalAchievements({
  enabled,
  status,
  mockItems = [],
}: {
  enabled: boolean
  status?: string
  mockItems?: PersonalAchievement[]
}): PersonalAchievementsState {
  const [items, setItems] = React.useState<PersonalAchievement[]>(() =>
    PERSONAL_ACHIEVEMENTS_USE_MOCKS ? mockItems : [],
  )
  const [totalCount, setTotalCount] = React.useState(() =>
    PERSONAL_ACHIEVEMENTS_USE_MOCKS ? mockItems.length : 0,
  )
  const [isLoading, setIsLoading] = React.useState(!PERSONAL_ACHIEVEMENTS_USE_MOCKS)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    if (PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
      const filtered = status ? mockItems.filter((item) => item.status === status) : mockItems
      setItems(filtered)
      setTotalCount(filtered.length)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await achievementsApi.listPersonal({ status, limit: 100 })
      setItems(response.items)
      setTotalCount(response.total_count)
    } catch (caughtError) {
      setItems([])
      setTotalCount(0)
      setError(getApiErrorMessage(caughtError, 'Personal achievements could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, mockItems, status])

  React.useEffect(() => {
    void load()
  }, [load])

  return { items, totalCount, isLoading, error, reload: load }
}
