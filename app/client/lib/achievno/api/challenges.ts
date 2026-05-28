import { apiFetch } from '@/lib/achievno/api/client'

export type ChallengeApiStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled' | 'archived'
export type ChallengeParticipantStatus = 'joined' | 'left' | 'completed' | 'winner'

export type Challenge = {
  challenge_id: string
  title: string
  description: string | null
  status: ChallengeApiStatus
  target_value: number | null
  unit_label: string | null
  starts_at: string | null
  ends_at: string | null
  created_at: string | null
  updated_at: string | null
  participant_count: number
}

export type ChallengeParticipant = {
  profile_id: string
  status: ChallengeParticipantStatus
  progress_value: number | null
  completed_at: string | null
  joined_at: string | null
}

export type ChallengeEvent = {
  challenge_completion_event_id: string
  profile_id: string
  delta_value: number | null
  note_text: string | null
  created_at: string | null
}

export type ChallengesListResponse = {
  items: Challenge[]
  total_count: number
}

export type ChallengeResponse = {
  challenge: Challenge
}

export type ChallengeDetailResponse = ChallengeResponse & {
  participant: ChallengeParticipant | null
  recent_completion_events: ChallengeEvent[]
}

export type ChallengeParticipantResponse = ChallengeResponse & {
  participant: ChallengeParticipant
}

export type ChallengeProgressResponse = ChallengeParticipantResponse & {
  event: ChallengeEvent | null
}

export type CreateChallengeRequest = {
  title: string
  description?: string | null
  goal_title?: string | null
  target_value?: string | number | null
  unit_label?: string | null
  starts_at?: string | null
  ends_at?: string | null
}

export type ChallengeProgressRequest = {
  delta_value: string | number
  note_text?: string | null
}

export const challengesApi = {
  list(params: { status?: string; limit?: number } = {}) {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.set('status', params.status)
    if (params.limit) searchParams.set('limit', String(params.limit))
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiFetch<ChallengesListResponse>(`/api/v1/challenges${suffix}`)
  },
  create(payload: CreateChallengeRequest) {
    return apiFetch<ChallengeResponse>('/api/v1/challenges', {
      method: 'POST',
      body: payload,
    })
  },
  detail(challengeId: string) {
    return apiFetch<ChallengeDetailResponse>(`/api/v1/challenges/${challengeId}`)
  },
  join(challengeId: string) {
    return apiFetch<ChallengeParticipantResponse>(`/api/v1/challenges/${challengeId}/join`, {
      method: 'POST',
      body: {},
    })
  },
  progress(challengeId: string, payload: ChallengeProgressRequest) {
    return apiFetch<ChallengeProgressResponse>(`/api/v1/challenges/${challengeId}/progress`, {
      method: 'POST',
      body: payload,
    })
  },
  complete(challengeId: string, payload: { note_text?: string | null } = {}) {
    return apiFetch<ChallengeProgressResponse>(`/api/v1/challenges/${challengeId}/complete`, {
      method: 'POST',
      body: payload,
    })
  },
}
