import { apiFetch } from '@/lib/achievno/api/client'
import type { CreatePersonalAchievementRequest, PersonalAchievement } from '@/lib/achievno/api/achievements'

export type GroupSummary = {
  group_id: string
  title: string
  description: string | null
  avatar_url: string | null
  visibility_type: 'public' | 'private' | string
  base_permission: string
  role: 'owner' | 'admin' | 'member' | string
  membership_status: string
  member_count: number
  active_achievements_count: number
  completed_achievements_count: number
  created_at: string | null
  updated_at: string | null
  joined_at: string | null
}

export type GroupsListResponse = {
  items: GroupSummary[]
  total_count: number
}

export type GroupResponse = {
  group: GroupSummary
}

export type GroupDetailResponse = GroupResponse & {
  achievements: PersonalAchievement[]
}

export type GroupAchievementsResponse = {
  items: PersonalAchievement[]
  total_count: number
}

export type CreateGroupRequest = {
  title: string
  description?: string | null
  visibility_type?: 'public' | 'private'
}

export type JoinDemoGroupRequest = CreateGroupRequest & {
  template_id: string
}

export const groupsApi = {
  list(params: { limit?: number } = {}) {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.set('limit', String(params.limit))
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiFetch<GroupsListResponse>(`/api/v1/groups/${suffix}`)
  },
  create(payload: CreateGroupRequest) {
    return apiFetch<GroupResponse>('/api/v1/groups/', {
      method: 'POST',
      body: payload,
    })
  },
  detail(groupId: string) {
    return apiFetch<GroupDetailResponse>(`/api/v1/groups/${groupId}`)
  },
  join(groupId: string) {
    return apiFetch<GroupResponse>(`/api/v1/groups/${groupId}/join`, {
      method: 'POST',
      body: {},
    })
  },
  joinDemo(payload: JoinDemoGroupRequest) {
    return apiFetch<GroupResponse>('/api/v1/groups/join-demo', {
      method: 'POST',
      body: payload,
    })
  },
  listAchievements(groupId: string) {
    return apiFetch<GroupAchievementsResponse>(`/api/v1/groups/${groupId}/achievements`)
  },
  createAchievement(groupId: string, payload: CreatePersonalAchievementRequest) {
    return apiFetch<{ achievement: PersonalAchievement }>(`/api/v1/groups/${groupId}/achievements`, {
      method: 'POST',
      body: payload,
    })
  },
}
