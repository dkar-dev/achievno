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
