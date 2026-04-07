'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO SPACES LIST
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/spaces
 * Main entry screen after auth - spaces-first navigation
 * 
 * Features:
 * - Skeleton loading states (3-5 items)
 * - Light theme primary (bg-bg-base)
 * - Reduced vertical spacing
 * - Inline collapsible archive section
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { SpacesHeader } from '@/components/achievno/header'
import { PersonalSpaceItem, GroupSpaceItem } from '@/components/achievno/space-item'
import { SpaceListSkeleton } from '@/components/achievno/skeleton'
import { AsyncBoundary } from '@/components/achievno/loading-states'
import { MenuSheet } from '@/components/achievno/menu-sheet'
import { LogoutModal, NoGroups } from '@/components/achievno'
import { Button } from '@/components/ui/button'
import { IconChevronDown, IconChevronUp, IconCompass } from '@/lib/achievno/icons'
import { ROUTES, AVATAR_COLORS, UI } from '@/lib/achievno/constants'
import type { Space, User } from '@/lib/achievno/types'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────────────────────────

const DEMO_USER: User = {
  id: 'user-1',
  email: 'alex@example.com',
  displayName: 'Alex Johnson',
  onboardingCompleted: true,
  notificationsEnabled: true,
  createdAt: new Date().toISOString(),
}

const DEMO_PERSONAL_SPACE: Space = {
  id: 'personal',
  type: 'personal',
  name: 'Personal',
  avatarInitials: 'AJ',
  avatarColor: '#E09400',
  activeCount: 4,
  completedCount: 12,
  hasUnread: true,
  lastActivityAt: new Date().toISOString(),
}

const DEMO_ARCHIVED_ACHIEVEMENTS = [
  { id: 'arch-1', title: 'Learn Spanish basics', completedAt: '2025-12-15' },
  { id: 'arch-2', title: 'Run 5K', completedAt: '2025-11-20' },
  { id: 'arch-3', title: 'Read 10 books', completedAt: '2025-10-05' },
]

const DEMO_GROUPS: Space[] = [
  {
    id: 'group-1',
    type: 'group',
    name: 'Dev Team',
    avatarInitials: 'DT',
    avatarColor: AVATAR_COLORS[1],
    memberCount: 8,
    activeCount: 5,
    completedCount: 23,
    progressPercent: 72,
    hasUnread: true,
    unreadCount: 3,
    lastActivityAt: new Date().toISOString(),
  },
  {
    id: 'group-2',
    type: 'group',
    name: 'Fitness Club',
    avatarInitials: 'FC',
    avatarColor: AVATAR_COLORS[2],
    memberCount: 15,
    activeCount: 8,
    completedCount: 45,
    progressPercent: 85,
    hasUnread: false,
    lastActivityAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'group-3',
    type: 'group',
    name: 'Book Club',
    avatarInitials: 'BC',
    avatarColor: AVATAR_COLORS[3],
    memberCount: 6,
    activeCount: 2,
    completedCount: 18,
    progressPercent: 45,
    hasUnread: false,
    lastActivityAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function SpacesListPage() {
  const router = useRouter()
  const [isLoading] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false)
  const [hasNotifications] = React.useState(true)

  const handleLogout = () => {
    setIsLogoutModalOpen(false)
    router.push(ROUTES.welcome)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <SpacesHeader
        hasNotifications={hasNotifications}
        onNotificationsPress={() => router.push(ROUTES.notifications)}
        onMenuPress={() => setIsMenuOpen(true)}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-screen py-3 motion-screen-push">
          <AsyncBoundary
            loading={isLoading}
            loadingFallback={<SpaceListSkeleton count={UI.skeletonListCount} />}
          >
            {/* Pinned Personal Space */}
            <PersonalSpaceItem
              space={DEMO_PERSONAL_SPACE}
              onPress={() => router.push(ROUTES.personalWorkspace)}
            />

            {/* Archive Collapsible */}
            {DEMO_ARCHIVED_ACHIEVEMENTS.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                  className={cn(
                    'flex items-center justify-center w-full py-2 gap-1',
                    'text-caption text-tertiary hover:text-secondary transition-colors'
                  )}
                >
                  {isArchiveOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  <span>Archive ({DEMO_ARCHIVED_ACHIEVEMENTS.length})</span>
                </button>

                {isArchiveOpen && (
                  <div className="bg-bg-elevated rounded-xl border border-border-subtle p-2 space-y-1 motion-tab-content">
                    {DEMO_ARCHIVED_ACHIEVEMENTS.map((achievement) => (
                      <button
                        key={achievement.id}
                        type="button"
                        onClick={() => router.push(ROUTES.achievement(achievement.id))}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-bg-muted transition-colors"
                      >
                        <span className="text-label text-secondary line-through truncate">{achievement.title}</span>
                        <span className="text-caption text-tertiary shrink-0 ml-2">
                          {new Date(achievement.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Groups Section */}
            <div className="mt-4">
              <p className="text-caption text-tertiary mb-2">GROUPS</p>
              
              {DEMO_GROUPS.length > 0 ? (
                <div className="space-y-2">
                  {DEMO_GROUPS.map((group) => (
                    <GroupSpaceItem
                      key={group.id}
                      space={group}
                      onPress={() => router.push(ROUTES.group(group.id))}
                    />
                  ))}
                </div>
              ) : (
                <NoGroups onAction={() => router.push(ROUTES.groupCreate)} />
              )}
            </div>
          </AsyncBoundary>
        </div>
      </div>

      {/* Discover Link */}
      <div className="px-screen pb-safe-area-bottom py-3 border-t border-border-subtle">
        <Button
          onClick={() => router.push(ROUTES.discover)}
          variant="outline"
          className="w-full h-11 rounded-xl border-border-subtle bg-bg-elevated hover:bg-bg-muted gap-2"
        >
          <IconCompass size={18} />
          Discover Groups
        </Button>
      </div>

      {/* Menu Sheet */}
      <MenuSheet
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        user={DEMO_USER}
        onProfilePress={() => router.push(ROUTES.profile)}
        onSettingsPress={() => router.push(ROUTES.settings)}
        onCreateGroupPress={() => router.push(ROUTES.groupCreate)}
        onLogoutPress={() => setIsLogoutModalOpen(true)}
      />

      {/* Logout Confirmation */}
      <LogoutModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        onConfirm={handleLogout}
      />
    </div>
  )
}
