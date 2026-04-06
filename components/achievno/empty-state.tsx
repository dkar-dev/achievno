'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO EMPTY STATE
 * ═══════════════════════════════════════════════════════════════
 * Empty state component for lists and screens
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IconPlus, IconTarget, IconUsers, IconZap, IconCompass } from '@/lib/achievno/icons'

type EmptyStateType = 'achievements' | 'groups' | 'challenges' | 'notifications' | 'discover' | 'generic'

interface EmptyStateProps {
  type?: EmptyStateType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

const typeIcons: Record<EmptyStateType, React.ReactNode> = {
  achievements: <IconTarget size={40} />,
  groups: <IconUsers size={40} />,
  challenges: <IconZap size={40} />,
  notifications: <IconTarget size={40} />,
  discover: <IconCompass size={40} />,
  generic: <IconTarget size={40} />,
}

export function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* Icon */}
      <div className="size-20 rounded-2xl bg-background-elevated flex items-center justify-center text-tertiary mb-4">
        {icon || typeIcons[type]}
      </div>

      {/* Text */}
      <h3 className="text-title font-semibold mb-1">{title}</h3>
      <p className="text-label text-secondary max-w-[260px]">{description}</p>

      {/* Action */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          <IconPlus size={18} />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

// Pre-configured empty states
export function NoAchievements({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      type="achievements"
      title="No achievements yet"
      description="Create your first achievement to start tracking your progress."
      actionLabel="Create Achievement"
      onAction={onAction}
    />
  )
}

export function NoGroups({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      type="groups"
      title="No groups yet"
      description="Join a group or create your own to track progress together."
      actionLabel="Create Group"
      onAction={onAction}
    />
  )
}

export function NoChallenges() {
  return (
    <EmptyState
      type="challenges"
      title="No active challenges"
      description="Challenges will appear here when group admins create them."
    />
  )
}

export function NoNotifications() {
  return (
    <EmptyState
      type="notifications"
      title="All caught up"
      description="You have no new notifications."
    />
  )
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      type="generic"
      title="No results found"
      description={`No matches for "${query}". Try a different search.`}
    />
  )
}
