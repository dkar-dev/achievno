'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO AVATAR COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * Shared avatar with Achievno styling
 * Used for: spaces, groups, users
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AchievnoAvatarProps extends React.ComponentProps<typeof Avatar> {
  src?: string | null
  initials?: string
  name?: string
  color?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circle' | 'rounded'
}

function getInitials(name?: string, initials?: string): string {
  if (initials) return initials.slice(0, 2).toUpperCase()
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const sizeClasses = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-11 text-base',
  xl: 'size-14 text-lg',
}

const radiusClasses = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
}

export function AchievnoAvatar({
  src,
  initials,
  name,
  color = '#F5A623',
  size = 'md',
  variant = 'rounded',
  className,
  ...props
}: AchievnoAvatarProps) {
  // Derive initials from name or use provided initials
  const displayInitials = getInitials(name, initials)
  
  // Calculate background with opacity for subtle appearance
  const bgStyle = {
    backgroundColor: `${color}15`,
  }

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        radiusClasses[variant],
        'shrink-0',
        className
      )}
      {...props}
    >
      {src && (
        <AvatarImage
          src={src}
          alt={name || displayInitials}
          className={radiusClasses[variant]}
        />
      )}
      <AvatarFallback
        className={cn(
          radiusClasses[variant],
          'font-semibold'
        )}
        style={{ ...bgStyle, color }}
      >
        {displayInitials}
      </AvatarFallback>
    </Avatar>
  )
}

// ─────────────────────────────────────────────────────────────────
// AVATAR STACK (overlapping avatars)
// ─────────────────────────────────────────────────────────────────

interface AchievnoAvatarStackProps {
  users: Array<{ id: string; name: string; avatar?: string | null }>
  size?: 'xs' | 'sm' | 'md'
  max?: number
  className?: string
}

export function AchievnoAvatarStack({
  users,
  size = 'sm',
  max = 3,
  className,
}: AchievnoAvatarStackProps) {
  const displayed = users.slice(0, max)
  const remaining = users.length - max

  const overlapClasses = {
    xs: '-ml-1.5 first:ml-0',
    sm: '-ml-2 first:ml-0',
    md: '-ml-2.5 first:ml-0',
  }

  return (
    <div className={cn('flex items-center', className)}>
      {displayed.map((user) => (
        <AchievnoAvatar
          key={user.id}
          name={user.name}
          src={user.avatar}
          size={size}
          variant="circle"
          className={cn(overlapClasses[size], 'ring-2 ring-background')}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-secondary text-secondary-foreground ring-2 ring-background font-medium',
            overlapClasses[size],
            size === 'xs' && 'size-6 text-[10px]',
            size === 'sm' && 'size-8 text-xs',
            size === 'md' && 'size-10 text-sm'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
