'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO HEADER COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * Shared header bar for all screens
 * Handles: back button, title, actions
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  IconBack,
  IconBell,
  IconMenu,
  IconMoreVertical,
} from '@/lib/achievno/icons'
import { NotificationDot } from './badge'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  variant?: 'default' | 'transparent' | 'spaces'
  rightActions?: React.ReactNode
  hasNotifications?: boolean
  onNotificationsPress?: () => void
  onMenuPress?: () => void
  className?: string
  children?: React.ReactNode
}

export function Header({
  title,
  showBack = false,
  onBack,
  variant = 'default',
  rightActions,
  hasNotifications,
  onNotificationsPress,
  onMenuPress,
  className,
  children,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'flex items-center h-header px-screen gap-2',
        'safe-area-top',
        variant === 'default' && 'bg-background/95 backdrop-blur-lg border-b border-border',
        variant === 'transparent' && 'bg-transparent',
        variant === 'spaces' && 'bg-background',
        className
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-2 min-w-0">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="size-9 rounded-lg bg-background-elevated shrink-0"
          >
            <IconBack size={18} />
            <span className="sr-only">Go back</span>
          </Button>
        )}

        {/* Title or custom content */}
        {children || (
          title && (
            <h1 className="text-title font-semibold truncate">
              {title}
            </h1>
          )
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-1.5 shrink-0">
        {rightActions}

        {/* Notifications */}
        {onNotificationsPress && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationsPress}
            className="size-9 rounded-full bg-background-elevated relative"
          >
            <IconBell size={18} />
            {hasNotifications && (
              <NotificationDot className="absolute -top-0.5 -right-0.5 size-2.5 border-2 border-background" />
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        {/* Menu */}
        {onMenuPress && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuPress}
            className="size-9 rounded-full bg-background-elevated"
          >
            <IconMoreVertical size={18} />
            <span className="sr-only">Menu</span>
          </Button>
        )}
      </div>
    </header>
  )
}

// Spaces list specific header with wordmark
export function SpacesHeader({
  hasNotifications,
  onNotificationsPress,
  onMenuPress,
  className,
}: Pick<HeaderProps, 'hasNotifications' | 'onNotificationsPress' | 'onMenuPress' | 'className'>) {
  return (
    <Header
      variant="spaces"
      hasNotifications={hasNotifications}
      onNotificationsPress={onNotificationsPress}
      onMenuPress={onMenuPress}
      className={className}
    >
      {/* Wordmark */}
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-primary">Achievno</span>
      </span>
    </Header>
  )
}

// Simple back header
export function BackHeader({
  title,
  onBack,
  rightActions,
  className,
}: Pick<HeaderProps, 'title' | 'onBack' | 'rightActions' | 'className'>) {
  return (
    <Header
      title={title}
      showBack
      onBack={onBack}
      rightActions={rightActions}
      className={className}
    />
  )
}
