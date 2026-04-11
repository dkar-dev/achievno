'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { NoGroups } from '@/components/achievno'
import { GroupSpaceItem, PersonalSpaceItem } from '@/components/achievno/space-item'
import { TabBar } from '@/components/achievno/tabs'
import { Button } from '@/components/ui/button'
import {
  AchievnoIcon,
  IconBell,
  IconChevronDown,
  IconChevronUp,
  IconCompass,
  IconPlus,
  IconSettings,
  IconTarget,
  IconUsers,
} from '@/lib/achievno/icons'
import { AVATAR_COLORS, ROUTES, type RootShellSurface } from '@/lib/achievno/constants'
import type { Space } from '@/lib/achievno/types'
import { cn } from '@/lib/utils'

const ROOT_SURFACE_TABS: { id: RootShellSurface; label: string }[] = [
  { id: 'main', label: 'Main' },
  { id: 'groups', label: 'Groups' },
]

const PILL_NAV_ITEMS = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: IconBell,
    route: ROUTES.notifications,
  },
  {
    id: 'discover',
    label: 'Discover Groups',
    icon: IconCompass,
    route: ROUTES.discover,
  },
  {
    id: 'create-group',
    label: 'Create Group',
    icon: IconPlus,
    route: ROUTES.groupCreate,
    emphasized: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: IconSettings,
    route: ROUTES.settings,
  },
] as const

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


const DEMO_FRIENDS = [
  { id: 'fr-1', name: 'Alex Morgan', handle: '@alexm' },
  { id: 'fr-2', name: 'Nina Chen', handle: '@ninac' },
]

const DEMO_GROUPS: Space[] = [
  {
    id: 'dev-team',
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
    id: 'fitness-club',
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
    id: 'book-club',
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

function RootPillNav() {
  const router = useRouter()

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-screen"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      <div className="rounded-[30px] border border-border-subtle bg-bg-elevated/95 p-2 shadow-[0_18px_40px_rgba(17,24,39,0.12)] backdrop-blur">
        <div className="grid grid-cols-4 gap-1">
          {PILL_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.route)}
              className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-[22px] px-2 py-2 text-center transition-colors hover:bg-bg-muted"
            >
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-full',
                  item.emphasized
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-bg-muted text-secondary'
                )}
              >
                <AchievnoIcon icon={item.icon} size="sm" />
              </span>
              <span className="text-[11px] font-medium leading-[1.15] text-foreground-secondary">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MainSurface({
  isArchiveOpen,
  onArchiveToggle,
  onOpenGroups,
}: {
  isArchiveOpen: boolean
  onArchiveToggle: () => void
  onOpenGroups: () => void
}) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border-subtle bg-[linear-gradient(135deg,rgba(224,148,0,0.12),rgba(224,148,0,0.03))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Main
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-foreground">
              Personal progress stays in focus while the shell handles navigation.
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              `Main` is now the default root surface. Secondary entry points moved into the lower
              pill-nav, so the old top notifications and menu combo is no longer needed here.
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <AchievnoIcon icon={IconTarget} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">
              Personal
            </p>
            <h3 className="text-title font-semibold">Continue your own space</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => router.push(ROUTES.personalWorkspace)}
          >
            Open
          </Button>
        </div>

        <PersonalSpaceItem
          space={DEMO_PERSONAL_SPACE}
          onPress={() => router.push(ROUTES.personalWorkspace)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">Friends</p>
            <h3 className="text-title font-semibold">1-on-1 relations</h3>
          </div>
          <input placeholder="Search friend" className="h-9 w-32 rounded-full border border-border-subtle px-3 text-sm" />
        </div>
        <div className="space-y-2">
          {DEMO_FRIENDS.map((friend) => (
            <button key={friend.id} type="button" onClick={() => router.push(ROUTES.friend(friend.id))} className="w-full rounded-2xl border border-border-subtle p-3 text-left">
              <p className="font-medium">{friend.name}</p>
              <p className="text-xs text-tertiary">{friend.handle}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">
              Groups Preview
            </p>
            <h3 className="text-title font-semibold">Jump into shared spaces when you need them</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-primary hover:text-primary"
            onClick={onOpenGroups}
          >
            See all groups
          </Button>
        </div>

        <div className="space-y-2">
          {DEMO_GROUPS.slice(0, 2).map((group) => (
            <GroupSpaceItem
              key={group.id}
              space={group}
              onPress={() => router.push(ROUTES.group(group.id))}
            />
          ))}
        </div>
      </section>

      {DEMO_ARCHIVED_ACHIEVEMENTS.length > 0 && (
        <section className="space-y-2">
          <button
            type="button"
            onClick={onArchiveToggle}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-subtle px-4 py-3 text-label text-tertiary transition-colors hover:border-border-emphasis hover:text-secondary"
          >
            {isArchiveOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            <span>Archive ({DEMO_ARCHIVED_ACHIEVEMENTS.length})</span>
          </button>

          {isArchiveOpen && (
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated p-2">
              {DEMO_ARCHIVED_ACHIEVEMENTS.map((achievement) => (
                <button
                  key={achievement.id}
                  type="button"
                  onClick={() => router.push(ROUTES.achievement(achievement.id))}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-bg-muted"
                >
                  <span className="truncate text-label text-secondary line-through">
                    {achievement.title}
                  </span>
                  <span className="ml-3 shrink-0 text-caption text-tertiary">
                    {new Date(achievement.completedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function GroupsSurface() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border-subtle bg-bg-elevated p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Groups
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-foreground">
              Shared spaces now live in their own root surface.
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              This keeps `Groups` separate from `Main` without forcing a deep rewrite of group
              detail screens in the current task.
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground">
            <AchievnoIcon icon={IconUsers} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">Friends</p>
            <h3 className="text-title font-semibold">1-on-1 relations</h3>
          </div>
          <input placeholder="Search friend" className="h-9 w-32 rounded-full border border-border-subtle px-3 text-sm" />
        </div>
        <div className="space-y-2">
          {DEMO_FRIENDS.map((friend) => (
            <button key={friend.id} type="button" onClick={() => router.push(ROUTES.friend(friend.id))} className="w-full rounded-2xl border border-border-subtle p-3 text-left">
              <p className="font-medium">{friend.name}</p>
              <p className="text-xs text-tertiary">{friend.handle}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">
              Your Groups
            </p>
            <h3 className="text-title font-semibold">{DEMO_GROUPS.length} active spaces</h3>
          </div>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => router.push(ROUTES.groupCreate)}
          >
            <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
            Create
          </Button>
        </div>

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
      </section>
    </div>
  )
}

export default function RootShellPage() {
  const router = useRouter()
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false)
  const [activeSurface, setActiveSurface] = React.useState<RootShellSurface>('main')

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setActiveSurface(params.get('surface') === 'groups' ? 'groups' : 'main')
  }, [])

  const handleSurfaceChange = (nextSurface: RootShellSurface) => {
    if (nextSurface === activeSurface) return

    setActiveSurface(nextSurface)
    router.replace(ROUTES.rootShell(nextSurface), { scroll: false })
  }

  return (
    <>
      <div className="min-h-screen bg-bg-base">
        <div className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/95 backdrop-blur">
          <div className="safe-area-top px-screen pb-4 pt-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                  Achievno
                </p>
                <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-foreground">
                  Root Shell
                </h1>
                <p className="mt-1 text-sm text-foreground-secondary">
                  Switch between `Main` and `Groups` here. Open secondary surfaces from the lower
                  pill-nav.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <TabBar
                tabs={ROOT_SURFACE_TABS}
                value={activeSurface}
                onChange={handleSurfaceChange}
              />
            </div>
          </div>
        </div>

        <div
          className="px-screen py-5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 132px)' }}
        >
          {activeSurface === 'main' ? (
            <MainSurface
              isArchiveOpen={isArchiveOpen}
              onArchiveToggle={() => setIsArchiveOpen((prev) => !prev)}
              onOpenGroups={() => handleSurfaceChange('groups')}
            />
          ) : (
            <GroupsSurface />
          )}
        </div>
      </div>

      <RootPillNav />
    </>
  )
}
