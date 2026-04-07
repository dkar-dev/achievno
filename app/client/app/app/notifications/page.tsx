"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * NOTIFICATIONS SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/notifications
 * Shows all user notifications grouped by recency
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoAvatar } from "@/components/achievno/avatar"
import { EmptyState } from "@/components/achievno/empty-state"
import { 
  AchievnoIcon,
  IconBell,
  IconTrophy,
  IconUsers,
  IconTarget,
  IconCheck,
  IconActivity
} from "@/lib/achievno/icons"
import { cn } from "@/lib/utils"

type NotificationType = "achievement" | "challenge" | "group" | "invite" | "comment"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  isRead: boolean
  actionUrl?: string
  actor?: {
    name: string
    avatar: string | null
  }
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "Achievement Progress",
    message: "Alex completed 3 more steps on \"Launch Presentation\"",
    time: "5 min ago",
    isRead: false,
    actionUrl: "/app/achievements/1",
    actor: { name: "Alex Chen", avatar: null },
  },
  {
    id: "2",
    type: "challenge",
    title: "Challenge Update",
    message: "You moved up to #2 in \"Code Review Sprint\"",
    time: "1 hour ago",
    isRead: false,
    actionUrl: "/app/challenges/c1",
  },
  {
    id: "3",
    type: "group",
    title: "Group Activity",
    message: "3 new achievements were completed in Dev Team",
    time: "2 hours ago",
    isRead: true,
    actionUrl: "/app/groups/dev-team",
  },
  {
    id: "4",
    type: "invite",
    title: "Group Invite",
    message: "Emma invited you to join \"Design Crew\"",
    time: "3 hours ago",
    isRead: true,
    actor: { name: "Emma Wilson", avatar: null },
  },
  {
    id: "5",
    type: "comment",
    title: "New Comment",
    message: "Bella commented on your achievement \"Daily Workout\"",
    time: "Yesterday",
    isRead: true,
    actionUrl: "/app/achievements/2",
    actor: { name: "Bella Rodriguez", avatar: null },
  },
]

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "achievement":
      return IconTarget
    case "challenge":
      return IconTrophy
    case "group":
      return IconUsers
    case "invite":
      return IconUsers
    case "comment":
      return IconActivity
    default:
      return IconBell
  }
}

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "achievement":
      return "bg-success-subtle text-success"
    case "challenge":
      return "bg-challenge-subtle text-challenge"
    case "group":
      return "bg-info-subtle text-info"
    case "invite":
      return "bg-accent-subtle text-primary"
    case "comment":
      return "bg-secondary text-foreground"
    default:
      return "bg-secondary text-foreground"
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
    )
    // Navigate if there's an action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const todayNotifications = notifications.filter(n => 
    n.time.includes("min") || n.time.includes("hour")
  )
  const olderNotifications = notifications.filter(n => 
    !n.time.includes("min") && !n.time.includes("hour")
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Notifications"
        onBack={() => router.push("/app/spaces")}
        rightActions={
          unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="text-label text-primary px-2"
            >
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-auto">
        {notifications.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={IconBell}
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Today */}
            {todayNotifications.length > 0 && (
              <div>
                <div className="px-5 py-2 bg-surface">
                  <span className="text-caption text-secondary">Today</span>
                </div>
                {todayNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-surface/50 transition-colors",
                      !notification.isRead && "bg-accent-subtle/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      getNotificationColor(notification.type)
                    )}>
                      <AchievnoIcon icon={getNotificationIcon(notification.type)} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-label",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-body text-secondary line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-caption text-tertiary mt-1 block">
                        {notification.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Older */}
            {olderNotifications.length > 0 && (
              <div>
                <div className="px-5 py-2 bg-surface">
                  <span className="text-caption text-secondary">Earlier</span>
                </div>
                {olderNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-surface/50 transition-colors",
                      !notification.isRead && "bg-accent-subtle/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      getNotificationColor(notification.type)
                    )}>
                      <AchievnoIcon icon={getNotificationIcon(notification.type)} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-label",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-body text-secondary line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-caption text-tertiary mt-1 block">
                        {notification.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
