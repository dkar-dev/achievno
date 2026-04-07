'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ACHIEVEMENT CARD
 * ═══════════════════════════════════════════════════════════════
 * Card component for displaying achievements.
 * 
 * Layout Structure:
 * [Title]                    - max 2 lines
 * [Progress bar]             - primary color carrier
 * [meta: 7/10 · due Jun 30 · 3 left]  - SINGLE LINE, no wrap
 * [status badge]             - only badge per card
 * [+ button]                 - log progress action
 * 
 * Color Constraints:
 * - Max 1 colored element per card (excluding progress)
 * - Progress bar is the primary color carrier
 * - No multiple colored badges in one card
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AchievnoBadge, getAchievementBadgeVariant } from './badge'
import { AchievnoProgress } from './progress'
import { IconCheck, IconChevronRight } from '@/lib/achievno/icons'
import type { Achievement } from '@/lib/achievno/types'
import { STATUS_LABELS } from '@/lib/achievno/constants'

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface AchievementCardProps {
  achievement: Achievement
  onPress?: () => void
  onLogProgress?: () => void
  showProgress?: boolean
  variant?: 'comfortable' | 'compact'
  className?: string
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Format time relative to now
 * @returns "2h ago", "Yesterday", "Jun 30"
 */
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays === 1) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format due date compactly
 * @returns "Jun 30"
 */
function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Build single-line metadata string
 * @returns "7/10 · due Jun 30 · 3 left"
 */
function buildMetaString(achievement: Achievement): string {
  const parts: string[] = []
  
  // Progress: compact format (7/10)
  parts.push(`${achievement.currentValue}/${achievement.targetValue}`)
  
  // Due date (if exists)
  if (achievement.dueDate) {
    parts.push(`due ${formatDueDate(achievement.dueDate)}`)
  }
  
  // Remaining (if not completed)
  if (achievement.status !== 'completed') {
    const remaining = achievement.targetValue - achievement.currentValue
    if (remaining > 0) {
      parts.push(`${remaining} left`)
    }
  }
  
  return parts.join(' · ')
}

// ─────────────────────────────────────────────────────────────────
// LOG PROGRESS BUTTON
// ─────────────────────────────────────────────────────────────────

function LogProgressButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className={cn(
        'size-8 rounded-lg flex items-center justify-center shrink-0',
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90 active:scale-95',
        'transition-all duration-150'
      )}
      aria-label="Log progress"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN CARD COMPONENT
// ─────────────────────────────────────────────────────────────────

export function AchievementCard({
  achievement,
  onPress,
  onLogProgress,
  showProgress = true,
  variant = 'comfortable',
  className,
}: AchievementCardProps) {
  const isCompleted = achievement.status === 'completed'
  const isOverdue = achievement.isOverdue && !isCompleted
  
  // Only use muted badge to respect color constraint (progress is color carrier)
  const badgeVariant = isOverdue ? 'overdue' : getAchievementBadgeVariant(achievement.status)

  // Use muted badge for active/info status to keep progress bar as sole color carrier
  const displayBadgeVariant = (badgeVariant === 'primary' || badgeVariant === 'info') ? 'muted' : badgeVariant

  // Build meta string
  const metaString = buildMetaString(achievement)

  // Padding based on variant
  const paddingClass = variant === 'compact' ? 'p-3' : 'p-4'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPress?.()
        }
      }}
      className={cn(
        'w-full text-left',
        'bg-bg-elevated rounded-xl border border-border-subtle',
        'transition-colors hover:bg-bg-muted active:bg-bg-muted',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        paddingClass,
        className
      )}
    >
      {/* Title Row */}
      <div className="flex items-start gap-3 mb-2">
        {/* Completed checkmark */}
        {isCompleted && (
          <div className="size-5 rounded-md bg-success flex items-center justify-center shrink-0 mt-0.5">
            <IconCheck size={12} className="text-success-foreground" />
          </div>
        )}
        
        {/* Title - max 2 lines */}
        <h3 className={cn(
          'text-title font-semibold flex-1 line-clamp-2',
          isCompleted && 'text-secondary line-through'
        )}>
          {achievement.title}
        </h3>

        {/* Log Progress Button (only if not completed) */}
        {!isCompleted && onLogProgress && (
          <LogProgressButton onClick={onLogProgress} />
        )}
      </div>

      {/* Progress Bar - Primary color carrier */}
      {showProgress && (
        <AchievnoProgress
          value={achievement.currentValue}
          max={achievement.targetValue}
          color={isCompleted ? 'success' : 'primary'}
          size="sm"
          className="mb-2 motion-progress"
        />
      )}

      {/* Metadata Row - SINGLE LINE, no wrap */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {/* Meta string - truncate to single line */}
        <span className={cn(
          'meta-single-line flex-1 font-medium',
          isOverdue ? 'text-destructive' : 'text-secondary'
        )}>
          {metaString}
        </span>

        {/* Status Badge - only colored element per card */}
        <AchievnoBadge variant={displayBadgeVariant} size="sm">
          {isOverdue ? STATUS_LABELS.achievement.overdue : STATUS_LABELS.achievement[achievement.status]}
        </AchievnoBadge>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMPACT LIST ITEM VARIANT
// ─────────────────────────────────────────────────────────────────

export function AchievementListItem({
  achievement,
  onPress,
  className,
}: Omit<AchievementCardProps, 'showProgress' | 'variant' | 'onLogProgress'>) {
  const isCompleted = achievement.status === 'completed'
  const isOverdue = achievement.isOverdue && !isCompleted

  // Build compact meta string
  const metaString = `${achievement.currentValue}/${achievement.targetValue}${achievement.unit ? ` ${achievement.unit}` : ''}`

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5',
        'bg-bg-elevated rounded-lg border border-border-subtle',
        'transition-colors hover:bg-bg-muted active:bg-bg-muted',
        'text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
    >
      {/* Check circle */}
      <div
        className={cn(
          'size-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0',
          isCompleted
            ? 'bg-success border-success'
            : 'border-border-emphasis bg-transparent'
        )}
      >
        {isCompleted && (
          <IconCheck size={12} className="text-success-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          'text-label font-medium truncate block',
          isCompleted && 'line-through text-secondary'
        )}>
          {achievement.title}
        </span>
        <span className={cn(
          'text-caption text-tertiary',
          isOverdue && 'text-destructive'
        )}>
          {metaString}
        </span>
      </div>

      <IconChevronRight size={18} className="text-tertiary shrink-0" />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// SKELETON PLACEHOLDER
// ─────────────────────────────────────────────────────────────────

export function AchievementCardSkeleton({ 
  variant = 'comfortable' 
}: { 
  variant?: 'comfortable' | 'compact' 
}) {
  const paddingClass = variant === 'compact' ? 'p-3' : 'p-4'

  return (
    <div className={cn(
      'w-full bg-bg-elevated rounded-xl border border-border-subtle',
      paddingClass
    )}>
      {/* Title placeholder */}
      <div className="flex items-start gap-3 mb-2">
        <div className="h-5 flex-1 rounded motion-skeleton" />
        <div className="size-8 rounded-lg motion-skeleton shrink-0" />
      </div>

      {/* Progress bar placeholder */}
      <div className="h-1 w-full rounded-full motion-skeleton mb-2" />

      {/* Meta row placeholder */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-32 rounded motion-skeleton" />
        <div className="h-5 w-16 rounded-md motion-skeleton" />
      </div>
    </div>
  )
}

export function AchievementListItemSkeleton() {
  return (
    <div className={cn(
      'flex items-center gap-3 w-full px-3 py-2.5',
      'bg-bg-elevated rounded-lg border border-border-subtle'
    )}>
      <div className="size-5 rounded-md motion-skeleton shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-3/4 rounded motion-skeleton mb-1" />
        <div className="h-3 w-16 rounded motion-skeleton" />
      </div>
      <div className="size-4 rounded motion-skeleton shrink-0" />
    </div>
  )
}
