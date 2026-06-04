'use client'

import * as React from 'react'
import {
  achievementsApi,
  type AchievementApprovalRequestSummary,
  type AchievementEvidence,
  type AchievementLog,
  type PersonalAchievement,
} from '@/lib/achievno/api/achievements'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'

const EMPTY_MOCK_LOGS: AchievementLog[] = []

export type AchievementDetailState = {
  achievement: PersonalAchievement | null
  recentLogs: AchievementLog[]
  evidence: AchievementEvidence[]
  approvalRequest: AchievementApprovalRequestSummary | null
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
  const [evidence, setEvidence] = React.useState<AchievementEvidence[]>([])
  const [approvalRequest, setApprovalRequest] =
    React.useState<AchievementApprovalRequestSummary | null>(null)
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
      setEvidence([])
      setApprovalRequest(null)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const [response, evidenceResponse] = await Promise.all([
        achievementsApi.detail(achievementId),
        achievementsApi.listEvidence(achievementId),
      ])
      setAchievement(response.achievement)
      setRecentLogs(response.recent_logs)
      setApprovalRequest(response.approval_request)
      setEvidence(evidenceResponse.items)
    } catch (caughtError) {
      setAchievement(null)
      setRecentLogs([])
      setEvidence([])
      setApprovalRequest(null)
      setError(getApiErrorMessage(caughtError, 'Achievement could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [achievementId, enabled, mockAchievement, mockLogs, useMocks])

  React.useEffect(() => {
    void load()
  }, [load])

  return { achievement, recentLogs, evidence, approvalRequest, isLoading, error, reload: load }
}
