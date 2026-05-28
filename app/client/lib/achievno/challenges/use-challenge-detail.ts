'use client'

import * as React from 'react'
import {
  challengesApi,
  type Challenge,
  type ChallengeEvent,
  type ChallengeParticipant,
} from '@/lib/achievno/api/challenges'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { CHALLENGES_USE_MOCKS, DEMO_CHALLENGES } from '@/lib/achievno/challenges/use-challenges'

export type ChallengeDetailState = {
  challenge: Challenge | null
  participant: ChallengeParticipant | null
  recentCompletionEvents: ChallengeEvent[]
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useChallengeDetail({
  challengeId,
  enabled,
  mockChallenge,
}: {
  challengeId: string
  enabled: boolean
  mockChallenge?: Challenge
}): ChallengeDetailState {
  const demoChallenge = mockChallenge ?? DEMO_CHALLENGES[0]
  const [challenge, setChallenge] = React.useState<Challenge | null>(() =>
    CHALLENGES_USE_MOCKS ? { ...demoChallenge, challenge_id: challengeId || demoChallenge.challenge_id } : null,
  )
  const [participant, setParticipant] = React.useState<ChallengeParticipant | null>(() =>
    CHALLENGES_USE_MOCKS
      ? {
          profile_id: 'demo-profile',
          status: 'joined',
          progress_value: 2,
          completed_at: null,
          joined_at: new Date().toISOString(),
        }
      : null,
  )
  const [recentCompletionEvents, setRecentCompletionEvents] = React.useState<ChallengeEvent[]>([])
  const [isLoading, setIsLoading] = React.useState(!CHALLENGES_USE_MOCKS)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!enabled || !challengeId) {
      setIsLoading(false)
      return
    }

    if (CHALLENGES_USE_MOCKS) {
      setChallenge({ ...demoChallenge, challenge_id: challengeId })
      setParticipant((current) => current)
      setRecentCompletionEvents([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await challengesApi.detail(challengeId)
      setChallenge(response.challenge)
      setParticipant(response.participant)
      setRecentCompletionEvents(response.recent_completion_events)
    } catch (caughtError) {
      setChallenge(null)
      setParticipant(null)
      setRecentCompletionEvents([])
      setError(getApiErrorMessage(caughtError, 'Challenge could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [challengeId, demoChallenge, enabled])

  React.useEffect(() => {
    void load()
  }, [load])

  return { challenge, participant, recentCompletionEvents, isLoading, error, reload: load }
}
