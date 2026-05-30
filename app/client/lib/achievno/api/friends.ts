import { apiFetch } from '@/lib/achievno/api/client'
import type { CreatePersonalAchievementRequest, PersonalAchievement } from '@/lib/achievno/api/achievements'

export type FriendProfile = {
  profile_id: string
  display_name: string
  username: string | null
  avatar_url: string | null
}

export type FriendRelation = {
  relation_id: string
  friend_connection_id: string
  status: string
  side_status: string | null
  profile: FriendProfile
  active_achievements_count: number
  completed_achievements_count: number
  created_at: string | null
  updated_at: string | null
}

export type FriendsListResponse = {
  items: FriendRelation[]
  total_count: number
}

export type FriendDetailResponse = {
  relation: FriendRelation
  achievements: PersonalAchievement[]
}

export type FriendInvite = {
  invite_id: string
  invite_kind: string
  delivery_mode: string
  status: string
  token: string
  url: string | null
  link_expires_at: string | null
  accepted_at: string | null
  created_at: string | null
  sender_profile: FriendProfile
  resolved_friend_connection_id: string | null
}

export type FriendInviteResponse = {
  invite: FriendInvite
}

export type FriendAcceptResponse = {
  relation: FriendRelation
}

export type FriendAchievementsResponse = {
  items: PersonalAchievement[]
  total_count: number
}

export const friendsApi = {
  list(params: { limit?: number } = {}) {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.set('limit', String(params.limit))
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiFetch<FriendsListResponse>(`/api/v1/friends/${suffix}`)
  },
  detail(friendConnectionId: string) {
    return apiFetch<FriendDetailResponse>(`/api/v1/friends/${friendConnectionId}`)
  },
  createInvite() {
    return apiFetch<FriendInviteResponse>('/api/v1/friends/invites', {
      method: 'POST',
      body: {},
    })
  },
  inviteDetail(token: string) {
    return apiFetch<FriendInviteResponse>(`/api/v1/friends/invites/${encodeURIComponent(token)}`)
  },
  acceptInvite(token: string) {
    return apiFetch<FriendAcceptResponse>(`/api/v1/friends/invites/${encodeURIComponent(token)}/accept`, {
      method: 'POST',
      body: {},
    })
  },
  listAchievements(friendConnectionId: string) {
    return apiFetch<FriendAchievementsResponse>(`/api/v1/friends/${friendConnectionId}/achievements`)
  },
  createAchievement(friendConnectionId: string, payload: CreatePersonalAchievementRequest) {
    return apiFetch<{ achievement: PersonalAchievement }>(`/api/v1/friends/${friendConnectionId}/achievements`, {
      method: 'POST',
      body: payload,
    })
  },
}
