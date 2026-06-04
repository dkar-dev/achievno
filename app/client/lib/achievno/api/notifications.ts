import { apiFetch } from '@/lib/achievno/api/client'

export type AppNotification = {
  notification_id: string
  type: string
  title: string
  body: string
  action_url: string | null
  payload_json: Record<string, unknown>
  is_read: boolean
  created_at: string | null
  read_at: string | null
  notification_status: string | null
  acted_at: string | null
  achievement_id: string | null
  approval_request_id: string | null
  group_id: string | null
  friend_connection_id: string | null
}

export type NotificationsListResponse = {
  items: AppNotification[]
  unread_count: number
}

export type NotificationReadResponse = {
  notification: AppNotification
}

export const notificationsApi = {
  list(params: { limit?: number } = {}) {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.set('limit', String(params.limit))
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiFetch<NotificationsListResponse>(`/api/v1/notifications/${suffix}`)
  },
  markRead(notificationId: string) {
    return apiFetch<NotificationReadResponse>(`/api/v1/notifications/${notificationId}/read`, {
      method: 'POST',
      body: {},
    })
  },
}
