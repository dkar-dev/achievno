'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO MENU SHEET
 * ═══════════════════════════════════════════════════════════════
 * Bottom sheet menu for secondary actions
 * Items: Profile, Settings, Create Group, Logout
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { AchievnoAvatar } from './avatar'
import {
  IconUser,
  IconSettings,
  IconUsers,
  IconLogOut,
  IconChevronRight,
} from '@/lib/achievno/icons'
import type { User } from '@/lib/achievno/types'

interface MenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onProfilePress: () => void
  onSettingsPress: () => void
  onCreateGroupPress: () => void
  onLogoutPress: () => void
}

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onPress: () => void
  variant?: 'default' | 'destructive'
}

function MenuItem({ icon, label, onPress, variant = 'default' }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors',
        'hover:bg-background-elevated active:bg-background-elevated',
        variant === 'destructive' && 'text-destructive'
      )}
    >
      <span className={cn(
        'size-9 rounded-lg flex items-center justify-center',
        variant === 'destructive' ? 'bg-destructive/15' : 'bg-background-elevated'
      )}>
        {icon}
      </span>
      <span className="flex-1 text-left text-title font-medium">{label}</span>
      <IconChevronRight size={18} className="text-tertiary" />
    </button>
  )
}

export function MenuSheet({
  open,
  onOpenChange,
  user,
  onProfilePress,
  onSettingsPress,
  onCreateGroupPress,
  onLogoutPress,
}: MenuSheetProps) {
  const handleItemPress = (callback: () => void) => {
    onOpenChange(false)
    // Small delay to let sheet close before navigation
    setTimeout(callback, 150)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl bg-background-surface border-border-strong pb-safe-area-bottom"
      >
        <SheetHeader className="text-left pb-4 border-b border-border">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          
          {/* User profile preview */}
          {user && (
            <button
              type="button"
              onClick={() => handleItemPress(onProfilePress)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <AchievnoAvatar
                initials={user.displayName.slice(0, 2)}
                src={user.avatarUrl}
                color="#F5A623"
                size="lg"
                variant="circle"
              />
              <div className="text-left">
                <p className="text-title font-semibold">{user.displayName}</p>
                <p className="text-label text-secondary">{user.email}</p>
              </div>
            </button>
          )}
        </SheetHeader>

        {/* Menu items */}
        <div className="py-2 space-y-1">
          <MenuItem
            icon={<IconUser size={18} />}
            label="Profile"
            onPress={() => handleItemPress(onProfilePress)}
          />
          <MenuItem
            icon={<IconSettings size={18} />}
            label="Settings"
            onPress={() => handleItemPress(onSettingsPress)}
          />
          <MenuItem
            icon={<IconUsers size={18} />}
            label="Create Group"
            onPress={() => handleItemPress(onCreateGroupPress)}
          />
          
          <div className="h-px bg-border my-2" />
          
          <MenuItem
            icon={<IconLogOut size={18} />}
            label="Log Out"
            onPress={() => handleItemPress(onLogoutPress)}
            variant="destructive"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
