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

export type GroupMember = {
  membership_id: string
  profile_id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  role: string
  status: string
  joined_at: string | null
  created_at: string | null
}

export type GroupsListResponse = {
  items: GroupSummary[]
  total_count: number
}

export type GroupResponse = {
  group: GroupSummary
}

export type GroupDetailResponse = GroupResponse & {
  members: GroupMember[]
  achievements: PersonalAchievement[]
}

export type GroupMembersResponse = {
  items: GroupMember[]
  total_count: number
}

export type GroupInvite = {
  invite_id: string
  invite_kind: string
  delivery_mode: string
  status: string
  token: string
  url: string | null
  link_expires_at: string | null
  accepted_at: string | null
  created_at: string | null
  sender_profile: {
    profile_id: string
    display_name: string
    username: string | null
    avatar_url: string | null
  }
  group: {
    group_id: string
    title: string
    description: string | null
    avatar_url: string | null
    visibility_type: string
  }
  resolved_group_membership_id: string | null
}

export type GroupInviteResponse = {
  invite: GroupInvite
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
  members(groupId: string) {
    return apiFetch<GroupMembersResponse>(`/api/v1/groups/${groupId}/members`)
  },
  createInvite(groupId: string) {
    return apiFetch<GroupInviteResponse>(`/api/v1/groups/${groupId}/invites`, {
      method: 'POST',
      body: {},
    })
  },
  inviteDetail(token: string) {
    return apiFetch<GroupInviteResponse>(`/api/v1/group-invites/${encodeURIComponent(token)}`)
  },
  acceptInvite(token: string) {
    return apiFetch<GroupResponse>(`/api/v1/group-invites/${encodeURIComponent(token)}/accept`, {
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
