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
      title="No achievements"
      description="Add your first one to start tracking."
      actionLabel="New achievement"
      onAction={onAction}
    />
  )
}

export function NoGroups({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      type="groups"
      title="No groups"
      description="Create or join a group to track goals together."
      actionLabel="Create group"
      onAction={onAction}
    />
  )
}

export function NoChallenges() {
  return (
    <EmptyState
      type="challenges"
      title="No challenges"
      description="Group admins can create challenges here."
    />
  )
}

export function NoNotifications() {
  return (
    <EmptyState
      type="notifications"
      title="All caught up"
      description="No new notifications."
    />
  )
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      type="generic"
      title="No results"
      description={`Nothing matched "${query}".`}
    />
  )
}
