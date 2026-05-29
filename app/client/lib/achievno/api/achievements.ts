import { apiFetch } from '@/lib/achievno/api/client'

export type AchievementBaseType = 'done' | 'progress'
export type AchievementApiStatus = 'in_progress' | 'completed' | 'overdue' | 'archived' | 'in_review'

export type AchievementReference = {
  category_id?: string
  rank_id?: string
  code?: string
  title?: string
  label?: string
  color_token?: string | null
} | null

export type PersonalAchievement = {
  achievement_id: string
  owner_context_id: string
  base_type: AchievementBaseType
  assignment_mode: 'self' | 'all_members' | 'selected_members'
  title: string
  short_definition: string | null
  description: string | null
  status: AchievementApiStatus
  progress_current: number | null
  progress_target: number | null
  unit_label: string | null
  deadline_at: string | null
  completed_at: string | null
  archived_at: string | null
  created_at: string | null
  updated_at: string | null
  primary_category: AchievementReference
  rank: AchievementReference
}

export type AchievementLog = {
  achievement_log_id: string
  action_type: string
  delta_value: number | null
  resulting_value: number | null
  note_text: string | null
  created_at: string | null
}

export type PersonalAchievementsListResponse = {
  items: PersonalAchievement[]
  total_count: number
}

export type PersonalAchievementResponse = {
  achievement: PersonalAchievement
}

export type PersonalAchievementDetailResponse = PersonalAchievementResponse & {
  recent_logs: AchievementLog[]
}

export type PersonalAchievementProgressResponse = PersonalAchievementResponse & {
  log: AchievementLog
}

export type CreatePersonalAchievementRequest = {
  base_type: AchievementBaseType
  title: string
  short_definition?: string | null
  description?: string | null
  progress_target?: string | number | null
  unit_label?: string | null
  deadline_at?: string | null
}

export type PatchPersonalAchievementRequest = Partial<CreatePersonalAchievementRequest>

export type LogProgressRequest = {
  delta_value: string | number
  note_text?: string | null
}

export const achievementsApi = {
  listPersonal(params: { status?: string; limit?: number } = {}) {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.set('status', params.status)
    if (params.limit) searchParams.set('limit', String(params.limit))
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiFetch<PersonalAchievementsListResponse>(`/api/v1/achievements/personal${suffix}`)
  },
  createPersonal(payload: CreatePersonalAchievementRequest) {
    return apiFetch<PersonalAchievementResponse>('/api/v1/achievements/personal', {
      method: 'POST',
      body: payload,
    })
  },
  detail(achievementId: string) {
    return apiFetch<PersonalAchievementDetailResponse>(`/api/v1/achievements/${achievementId}`)
  },
  patch(achievementId: string, payload: PatchPersonalAchievementRequest) {
    return apiFetch<PersonalAchievementResponse>(`/api/v1/achievements/${achievementId}`, {
      method: 'PATCH',
      body: payload,
    })
  },
  progress(achievementId: string, payload: LogProgressRequest) {
    return apiFetch<PersonalAchievementProgressResponse>(`/api/v1/achievements/${achievementId}/progress`, {
      method: 'POST',
      body: payload,
    })
  },
  complete(achievementId: string, payload: { note_text?: string | null } = {}) {
    return apiFetch<PersonalAchievementProgressResponse>(`/api/v1/achievements/${achievementId}/complete`, {
      method: 'POST',
      body: payload,
    })
  },
  archive(achievementId: string) {
    return apiFetch<PersonalAchievementResponse>(`/api/v1/achievements/${achievementId}/archive`, {
      method: 'POST',
      body: {},
    })
  },
}
