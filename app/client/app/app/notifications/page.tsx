'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/achievno/empty-state'
import { BackHeader } from '@/components/achievno/header'
import { ListError, Spinner } from '@/components/achievno/loading-states'
import {
  notificationsApi,
  type AppNotification,
} from '@/lib/achievno/api/notifications'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { ROUTES } from '@/lib/achievno/constants'
import { AchievnoIcon, IconBell, IconShield, IconTarget, IconUsers } from '@/lib/achievno/icons'
import { cn } from '@/lib/utils'

type NotificationTone = 'approval' | 'achievement' | 'group' | 'default'

export default function NotificationsPage() {
  const router = useRouter()
  const auth = useAuth()
  const [notifications, setNotifications] = React.useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!auth.isAuthenticated) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await notificationsApi.list({ limit: 100 })
      setNotifications(response.items)
    } catch (caughtError) {
      setNotifications([])
      setError(getApiErrorMessage(caughtError, 'Notifications could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [auth.isAuthenticated])

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
      return
    }
    if (auth.isAuthenticated) {
      void load()
    }
  }, [auth.isAuthenticated, auth.status, load, router])

  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  const markAllAsRead = async () => {
    const unread = notifications.filter((notification) => !notification.is_read)
    await Promise.all(unread.map((notification) => notificationsApi.markRead(notification.notification_id)))
    await load()
  }

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await notificationsApi.markRead(notification.notification_id)
      setNotifications((current) =>
        current.map((item) =>
          item.notification_id === notification.notification_id ? { ...item, is_read: true } : item,
        ),
      )
    }
    const target = notification.action_url || notificationRoute(notification)
    if (target) {
      router.push(target)
    }
  }

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return <CenteredMessage message="Sign-in required." />
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <BackHeader
        title="Notifications"
        onBack={() => router.push(ROUTES.rootShell())}
        rightActions={
          unreadCount > 0 ? (
            <button onClick={() => void markAllAsRead()} className="px-2 text-label text-primary">
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="px-screen py-4">
            <ListError message={error} onRetry={() => void load()} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<IconBell size={40} />}
              title="No notifications"
              description="You're all caught up. New approval activity will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {notifications.map((notification) => (
              <button
                key={notification.notification_id}
                onClick={() => void handleNotificationClick(notification)}
                className={cn(
                  'flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-bg-muted',
                  !notification.is_read && 'bg-accent-subtle/30',
                )}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneClass(notificationTone(notification)))}>
                  <AchievnoIcon icon={notificationIcon(notificationTone(notification))} size="sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={cn('text-label', !notification.is_read && 'font-semibold')}>
                      {notification.title}
                    </span>
                    {!notification.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="line-clamp-2 text-body text-secondary">{notification.body}</p>
                  <span className="mt-1 block text-caption text-tertiary">
                    {formatDateTime(notification.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function notificationRoute(notification: AppNotification) {
  if (notification.approval_request_id) return ROUTES.approvals
  if (notification.achievement_id) return ROUTES.achievement(notification.achievement_id)
  if (notification.group_id) return ROUTES.group(notification.group_id)
  return null
}

function notificationTone(notification: AppNotification): NotificationTone {
  if (notification.approval_request_id || notification.type.includes('approval')) return 'approval'
  if (notification.achievement_id || notification.type.includes('achievement')) return 'achievement'
  if (notification.group_id || notification.friend_connection_id) return 'group'
  return 'default'
}

function notificationIcon(tone: NotificationTone) {
  if (tone === 'approval') return IconShield
  if (tone === 'achievement') return IconTarget
  if (tone === 'group') return IconUsers
  return IconBell
}

function toneClass(tone: NotificationTone) {
  if (tone === 'approval') return 'bg-primary/10 text-primary'
  if (tone === 'achievement') return 'bg-success/10 text-success'
  if (tone === 'group') return 'bg-info/10 text-info'
  return 'bg-bg-muted text-secondary'
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'Recently'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CenteredMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-screen">
      <div className="rounded-xl border border-border-subtle bg-bg-muted px-4 py-3 text-label text-secondary">
        {message}
      </div>
    </div>
  )
}
