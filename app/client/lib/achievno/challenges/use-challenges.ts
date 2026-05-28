'use client'

import * as React from 'react'
import { challengesApi, type Challenge } from '@/lib/achievno/api/challenges'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'

export const CHALLENGES_USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

export type ChallengesState = {
  items: Challenge[]
  totalCount: number
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

export const DEMO_CHALLENGES: Challenge[] = [
  {
    challenge_id: 'demo-challenge',
    title: 'Weekly Focus Sprint',
    description: 'Complete five focused work sessions.',
    status: 'active',
    target_value: 5,
    unit_label: 'sessions',
    starts_at: null,
    ends_at: null,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    participant_count: 1,
  },
]

export function useChallenges({
  enabled,
  status,
  mockItems = DEMO_CHALLENGES,
}: {
  enabled: boolean
  status?: string
  mockItems?: Challenge[]
}): ChallengesState {
  const [items, setItems] = React.useState<Challenge[]>(() => (CHALLENGES_USE_MOCKS ? mockItems : []))
  const [totalCount, setTotalCount] = React.useState(() => (CHALLENGES_USE_MOCKS ? mockItems.length : 0))
  const [isLoading, setIsLoading] = React.useState(!CHALLENGES_USE_MOCKS)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    if (CHALLENGES_USE_MOCKS) {
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
      const response = await challengesApi.list({ status, limit: 100 })
      setItems(response.items)
      setTotalCount(response.total_count)
    } catch (caughtError) {
      setItems([])
      setTotalCount(0)
      setError(getApiErrorMessage(caughtError, 'Challenges could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled, mockItems, status])

  React.useEffect(() => {
    void load()
  }, [load])

  return { items, totalCount, isLoading, error, reload: load }
}
