'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO PROGRESS BAR
 * ═══════════════════════════════════════════════════════════════
 * Achievno-styled progress bar with optional labels
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface AchievnoProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  color?: 'primary' | 'success' | 'challenge' | 'info'
  showLabel?: boolean
  labelPosition?: 'inline' | 'above'
  label?: React.ReactNode
  className?: string
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-1.5',
}

const colorClasses = {
  primary: '[&>[data-slot=progress-indicator]]:bg-primary',
  success: '[&>[data-slot=progress-indicator]]:bg-success',
  challenge: '[&>[data-slot=progress-indicator]]:bg-challenge',
  info: '[&>[data-slot=progress-indicator]]:bg-info',
}

const trackColorClasses = {
  primary: 'bg-primary/15',
  success: 'bg-success/15',
  challenge: 'bg-challenge/15',
  info: 'bg-info/15',
}

export function AchievnoProgress({
  value,
  max = 100,
  size = 'sm',
  color = 'primary',
  showLabel = false,
  labelPosition = 'inline',
  label,
  className,
}: AchievnoProgressProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100)

  if (!showLabel) {
    return (
      <Progress
        value={percent}
        className={cn(
          sizeClasses[size],
          trackColorClasses[color],
          colorClasses[color],
          'rounded-full',
          className
        )}
      />
    )
  }

  if (labelPosition === 'above') {
    return (
      <div className={cn('space-y-1.5', className)}>
        <div className="flex items-center justify-between">
          {label || <span className="text-caption text-tertiary">{percent}% complete</span>}
          <span className="text-caption text-tertiary">{value}/{max}</span>
        </div>
        <Progress
          value={percent}
          className={cn(
            sizeClasses[size],
            trackColorClasses[color],
            colorClasses[color],
            'rounded-full'
          )}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      <Progress
        value={percent}
        className={cn(
          sizeClasses[size],
          trackColorClasses[color],
          colorClasses[color],
          'rounded-full'
        )}
      />
      <div className="flex items-center justify-between">
        <span className="text-caption text-tertiary">{percent}% complete</span>
        <span className="text-caption text-tertiary">{max - value} left</span>
      </div>
    </div>
  )
}
