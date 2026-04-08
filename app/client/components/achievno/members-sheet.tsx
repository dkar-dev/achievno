'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * MEMBERS SHEET
 * ═══════════════════════════════════════════════════════════════
 * Bottom sheet that displays the group member list.
 * Opened from the group header overflow menu.
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { AchievnoBadge } from '@/components/achievno/badge'
import { AchievnoIcon, IconPlus, IconChevronRight } from '@/lib/achievno/icons'
import { cn } from '@/lib/utils'

interface Member {
  id: string
  name: string
  avatar: string | null
  role: string
  completedCount: number
}

interface MembersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  isAdmin?: boolean
  className?: string
}

export function MembersSheet({
  open,
  onOpenChange,
  members,
  isAdmin = false,
  className,
}: MembersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          'inset-x-0 bottom-0 h-[70vh] rounded-t-2xl border-t',
          className
        )}
      >
        <SheetHeader className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-title">{members.length} members</SheetTitle>
            {isAdmin && (
              <Button size="sm" variant="outline">
                <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                Invite
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-4 pb-4">
          <div className="bg-bg-elevated rounded-xl border border-border-subtle divide-y divide-border-subtle">
            {members.map((member) => (
              <div key={member.id} className="p-3 flex items-center gap-3">
                <AchievnoAvatar name={member.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-label font-medium truncate">
                      {member.name}
                    </span>
                    {member.role === 'admin' && (
                      <AchievnoBadge variant="muted" size="sm">
                        Admin
                      </AchievnoBadge>
                    )}
                  </div>
                  <span className="text-caption text-tertiary">
                    {member.completedCount} achievements
                  </span>
                </div>
                <button className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted">
                  <AchievnoIcon
                    icon={IconChevronRight}
                    size="sm"
                    className="text-tertiary"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
