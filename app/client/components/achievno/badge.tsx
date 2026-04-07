'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO STATUS BADGE
 * ═══════════════════════════════════════════════════════════════
 * Semantic status badges with Achievno colors
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { AchievementStatus, ChallengeStatus } from '@/lib/achievno/types'

interface AchievnoBadgeProps {
  variant:
    | 'primary'
    | 'success'
    | 'destructive'
    | 'info'
    | 'challenge'
    | 'muted'
    | 'draft'
    | 'overdue'
  children: React.ReactNode
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variantClasses = {
  primary: 'bg-primary/15 text-primary border-primary/25',
  success: 'bg-success/15 text-success border-success/25',
  destructive: 'bg-destructive/15 text-destructive border-destructive/25',
  info: 'bg-info/15 text-info border-info/25',
  challenge: 'bg-challenge/15 text-challenge border-challenge/25',
  muted: 'bg-background-elevated text-tertiary border-border-strong',
  draft: 'bg-primary/10 text-primary border-primary/20',
  overdue: 'bg-destructive/15 text-destructive border-destructive/25',
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-[11px]',
}

export function AchievnoBadge({
  variant,
  children,
  size = 'sm',
  dot = false,
  className,
}: AchievnoBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-md border tracking-wide',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'size-1.5 rounded-full',
            variant === 'primary' && 'bg-primary',
            variant === 'success' && 'bg-success',
            variant === 'destructive' && 'bg-destructive',
            variant === 'info' && 'bg-info',
            variant === 'challenge' && 'bg-challenge',
            variant === 'muted' && 'bg-foreground-tertiary',
            variant === 'draft' && 'bg-primary',
            variant === 'overdue' && 'bg-destructive'
          )}
        />
      )}
      {children}
    </span>
  )
}

// Helper to get badge variant from achievement status
export function getAchievementBadgeVariant(status: AchievementStatus | 'not_started' | 'overdue'): AchievnoBadgeProps['variant'] {
  switch (status) {
    case 'draft':
    case 'not_started':
      return 'muted'
    case 'active':
      return 'info'
    case 'completed':
      return 'success'
    case 'archived':
      return 'muted'
    case 'overdue':
      return 'overdue'
    default:
      return 'muted'
  }
}

// Helper to get badge variant from challenge status
export function getChallengeBadgeVariant(status: ChallengeStatus): AchievnoBadgeProps['variant'] {
  switch (status) {
    case 'upcoming':
      return 'info'
    case 'active':
      return 'challenge'
    case 'completed':
      return 'success'
    default:
      return 'muted'
  }
}

// Unread/notification dot
export function NotificationDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'size-2 rounded-full bg-destructive animate-pulse',
        className
      )}
    />
  )
}

// Count badge for unread items
export function CountBadge({
  count,
  max = 99,
  className,
}: {
  count: number
  max?: number
  className?: string
}) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1',
        'bg-info text-[10px] font-bold text-white rounded-full',
        className
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  )
}
