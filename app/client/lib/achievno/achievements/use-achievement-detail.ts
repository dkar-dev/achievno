'use client'

import * as React from 'react'
import {
  achievementsApi,
  type AchievementLog,
  type PersonalAchievement,
} from '@/lib/achievno/api/achievements'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'

const EMPTY_MOCK_LOGS: AchievementLog[] = []

export type AchievementDetailState = {
  achievement: PersonalAchievement | null
  recentLogs: AchievementLog[]
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useAchievementDetail({
  achievementId,
  enabled,
  mockAchievement,
  mockLogs = EMPTY_MOCK_LOGS,
}: {
  achievementId: string
  enabled: boolean
  mockAchievement?: PersonalAchievement
  mockLogs?: AchievementLog[]
}): AchievementDetailState {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
  const [achievement, setAchievement] = React.useState<PersonalAchievement | null>(() =>
    useMocks ? mockAchievement ?? null : null,
  )
  const [recentLogs, setRecentLogs] = React.useState<AchievementLog[]>(() =>
    useMocks ? mockLogs : [],
  )
  const [isLoading, setIsLoading] = React.useState(!useMocks)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!enabled || !achievementId) {
      setIsLoading(false)
      return
    }

    if (useMocks) {
      setAchievement(mockAchievement ?? null)
      setRecentLogs(mockLogs)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await achievementsApi.detail(achievementId)
      setAchievement(response.achievement)
      setRecentLogs(response.recent_logs)
    } catch (caughtError) {
      setAchievement(null)
      setRecentLogs([])
      setError(getApiErrorMessage(caughtError, 'Achievement could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [achievementId, enabled, mockAchievement, mockLogs, useMocks])

  React.useEffect(() => {
    void load()
  }, [load])

  return { achievement, recentLogs, isLoading, error, reload: load }
}
