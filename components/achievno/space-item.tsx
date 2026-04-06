'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO SPACE LIST ITEM
 * ═══════════════════════════════════════════════════════════════
 * Chat-like list item for spaces (personal + groups)
 * Core component used in spaces.list screen
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AchievnoAvatar } from './avatar'
import { CountBadge, NotificationDot } from './badge'
import { IconChevronRight } from '@/lib/achievno/icons'
import type { Space } from '@/lib/achievno/types'

interface SpaceItemProps {
  space: Space
  isPinned?: boolean
  onPress?: () => void
  className?: string
}

export function SpaceItem({
  space,
  isPinned = false,
  onPress,
  className,
}: SpaceItemProps) {
  const isPersonal = space.type === 'personal'

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3',
        'bg-bg-elevated rounded-xl border border-border-subtle',
        'transition-colors hover:bg-bg-muted active:bg-bg-muted',
        'text-left',
        isPinned && 'border-primary/20 bg-accent-subtle',
        className
      )}
    >
      {/* Avatar */}
      <AchievnoAvatar
        src={space.avatarUrl}
        initials={space.avatarInitials}
        color={space.avatarColor}
        size="lg"
        variant="rounded"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-title font-semibold truncate">
            {space.name}
          </span>
          {isPinned && (
            <span className="text-caption text-primary font-semibold">
              YOU
            </span>
          )}
        </div>
        <p className="text-label text-secondary truncate">
          {isPersonal ? (
            <>
              {space.activeCount} active
              {space.completedCount > 0 && ` · ${space.completedCount} completed`}
            </>
          ) : (
            <>
              {space.memberCount} members
              {space.progressPercent !== undefined && ` · ${space.progressPercent}%`}
            </>
          )}
        </p>
      </div>

      {/* Right side: badge or chevron */}
      <div className="flex items-center gap-2">
        {space.hasUnread && space.unreadCount ? (
          <CountBadge count={space.unreadCount} />
        ) : space.hasUnread ? (
          <NotificationDot />
        ) : (
          <IconChevronRight
            size={20}
            className="text-tertiary"
          />
        )}
      </div>
    </button>
  )
}

// Personal Space row (pinned)
export function PersonalSpaceItem({
  space,
  onPress,
  className,
}: Omit<SpaceItemProps, 'isPinned'>) {
  return (
    <SpaceItem
      space={space}
      isPinned
      onPress={onPress}
      className={className}
    />
  )
}

// Group Space row
export function GroupSpaceItem({
  space,
  onPress,
  className,
}: Omit<SpaceItemProps, 'isPinned'>) {
  return (
    <SpaceItem
      space={space}
      isPinned={false}
      onPress={onPress}
      className={className}
    />
  )
}
