import { apiFetch } from '@/lib/achievno/api/client'

export type MainProfile = {
  profile_id: string
  account_id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  rank: {
    rank_id?: string
    code?: string
    label?: string
    color_token?: string | null
  } | null
}

export type MainAchievementPreview = {
  achievement_id: string
  title: string
  status: string
  progress_current: number | null
  progress_target: number | null
  unit_label: string | null
  updated_at: string | null
}

export type MainPersonalSpace = {
  owner_context_id: string | null
  active_achievements_count: number
  completed_achievements_count: number
  recent_logs_count: number
  recent_achievements: MainAchievementPreview[]
}

export type MainFriendPreview = {
  friend_connection_id: string
  status: string
  side_status: string | null
  profile: {
    profile_id: string
    display_name: string
    username: string | null
    avatar_url: string | null
  }
  updated_at: string | null
}

export type MainFriends = {
  total_count: number
  active_count: number
  pending_count: number
  preview: MainFriendPreview[]
}

export type MainGroupPreview = {
  group_id: string
  title: string
  avatar_url: string | null
  visibility_type: string
  role: string
  membership_status: string
  member_count: number
  active_achievements_count: number
  completed_achievements_count: number
  joined_at: string | null
}

export type MainGroups = {
  total_count: number
  owned_count: number
  member_count: number
  preview: MainGroupPreview[]
}

export type MainNotificationPreview = {
  notification_id: string
  type: string
  title: string
  body: string
  action_url: string | null
  is_read: boolean
  created_at: string | null
}

export type MainNotifications = {
  unread_count: number
  preview: MainNotificationPreview[]
}

export type MainAggregate = {
  authenticated: true
  profile: MainProfile
  personal_space: MainPersonalSpace
  friends: MainFriends
  groups: MainGroups
  notifications: MainNotifications
  server_time: string
}

export const mainApi = {
  getMain() {
    return apiFetch<MainAggregate>('/api/v1/main')
  },
}
