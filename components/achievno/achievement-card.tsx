'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ACHIEVEMENT CARD
 * ═══════════════════════════════════════════════════════════════
 * Card component for displaying achievements
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AchievnoBadge, getAchievementBadgeVariant } from './badge'
import { AchievnoProgress } from './progress'
import { IconCheck, IconChevronRight, IconClock } from '@/lib/achievno/icons'
import type { Achievement } from '@/lib/achievno/types'
import { STATUS_LABELS } from '@/lib/achievno/constants'

interface AchievementCardProps {
  achievement: Achievement
  onPress?: () => void
  showProgress?: boolean
  variant?: 'default' | 'compact'
  className?: string
}

export function AchievementCard({
  achievement,
  onPress,
  showProgress = true,
  variant = 'default',
  className,
}: AchievementCardProps) {
  const isCompleted = achievement.status === 'completed'
  const isOverdue = achievement.isOverdue && !isCompleted
  const badgeVariant = isOverdue ? 'overdue' : getAchievementBadgeVariant(achievement.status)

  // Format due date
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onPress}
        className={cn(
          'flex items-center gap-3 w-full px-4 py-3',
          'bg-background-surface rounded-xl border border-border',
          'transition-colors hover:bg-background-elevated active:bg-background-elevated',
          'text-left',
          className
        )}
      >
        {/* Check circle */}
        <div
          className={cn(
            'size-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0',
            isCompleted
              ? 'bg-primary border-primary'
              : 'border-border-strong bg-transparent'
          )}
        >
          {isCompleted && (
            <IconCheck size={12} className="text-primary-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className={cn(
            'text-title font-semibold truncate block',
            isCompleted && 'line-through text-secondary'
          )}>
            {achievement.title}
          </span>
          <span className="text-label text-tertiary">
            {achievement.currentValue} of {achievement.targetValue}
            {achievement.unit && ` ${achievement.unit}`}
          </span>
        </div>

        <IconChevronRight size={20} className="text-tertiary shrink-0" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'w-full p-4 text-left',
        'bg-background-surface rounded-2xl border border-border',
        'transition-colors hover:bg-background-elevated active:bg-background-elevated',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Check circle */}
        <div
          className={cn(
            'size-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 mt-0.5',
            isCompleted
              ? 'bg-primary border-primary'
              : 'border-border-strong bg-transparent'
          )}
        >
          {isCompleted && (
            <IconCheck size={12} className="text-primary-foreground" />
          )}
        </div>

        {/* Title & meta */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'text-title font-semibold',
            isCompleted && 'line-through text-secondary'
          )}>
            {achievement.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-label text-tertiary">
              {achievement.currentValue} of {achievement.targetValue}
              {achievement.unit && ` ${achievement.unit}`}
            </span>
            {achievement.dueDate && (
              <>
                <span className="text-tertiary">·</span>
                <span className={cn(
                  'text-label flex items-center gap-1',
                  isOverdue ? 'text-destructive' : 'text-tertiary'
                )}>
                  <IconClock size={12} />
                  Due {formatDueDate(achievement.dueDate)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Badge */}
        <AchievnoBadge variant={badgeVariant}>
          {isOverdue ? 'Overdue' : STATUS_LABELS.achievement[achievement.status]}
        </AchievnoBadge>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <AchievnoProgress
          value={achievement.currentValue}
          max={achievement.targetValue}
          color={isCompleted ? 'success' : 'primary'}
          showLabel
        />
      )}
    </button>
  )
}

// List item variant
export function AchievementListItem(props: AchievementCardProps) {
  return <AchievementCard {...props} variant="compact" showProgress={false} />
}
