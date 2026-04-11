'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { NoGroups } from '@/components/achievno'
import { GroupSpaceItem, PersonalSpaceItem, SpaceItem } from '@/components/achievno/space-item'
import { TabBar } from '@/components/achievno/tabs'
import { Button } from '@/components/ui/button'
import {
  AchievnoIcon,
  IconBell,
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

const DEMO_FRIENDS: Space[] = [
  {
    id: 'fr-1',
    type: 'personal',
    name: 'Alex Morgan',
    avatarInitials: 'AM',
    avatarColor: AVATAR_COLORS[4],
    activeCount: 2,
    completedCount: 6,
    hasUnread: false,
    lastActivityAt: new Date().toISOString(),
  },
  {
    id: 'fr-2',
    type: 'personal',
    name: 'Nina Chen',
    avatarInitials: 'NC',
    avatarColor: AVATAR_COLORS[5],
    activeCount: 3,
    completedCount: 5,
    hasUnread: true,
    lastActivityAt: new Date().toISOString(),
  },
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
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  const settingsItems = [
    { id: 'profile', label: 'Profile', route: ROUTES.profile },
    { id: 'notifications', label: 'Notifications', route: '/app/settings/notifications' },
    { id: 'privacy', label: 'Privacy', route: '/app/settings/privacy' },
    { id: 'account', label: 'Account', route: '/app/settings/account' },
    { id: 'language', label: 'Language', route: '/app/settings' },
    { id: 'appearance', label: 'Appearance', route: '/app/settings' },
    { id: 'about', label: 'About', route: '/app/settings' },
    { id: 'logout', label: 'Logout', route: ROUTES.welcome },
  ] as const

  return (
    <>
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
                onClick={() => (item.id === 'settings' ? setIsSettingsOpen(true) : router.push(item.route))}
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
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/35">
          <button className="absolute inset-0" onClick={() => setIsSettingsOpen(false)} aria-label="Close settings" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border-subtle bg-bg-base">
            <div className="border-b border-border-subtle px-screen py-4">
              <p className="text-title font-semibold">Settings</p>
              <p className="text-caption text-secondary">Profile, preferences and account</p>
            </div>
            <div className="px-screen py-2">
              {settingsItems.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-bg-muted"
                  onClick={() => {
                    setIsSettingsOpen(false)
                    router.push(item.route)
                  }}
                >
                  <span className={cn('text-label', item.id === 'logout' && 'text-destructive')}>{item.label}</span>
                  <span className="text-tertiary">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MainSurface({
  friendSearch,
  onFriendSearchChange,
}: {
  friendSearch: string
  onFriendSearchChange: (value: string) => void
}) {
  const router = useRouter()
  const filteredFriends = DEMO_FRIENDS.filter((friend) =>
    friend.name.toLowerCase().includes(friendSearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">
              Personal
            </p>
            <h3 className="text-title font-semibold">Continue your own space</h3>
          </div>
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
          <Button size="sm" className="rounded-full">
            + Invite
          </Button>
        </div>
        <input
          placeholder="Search friend"
          value={friendSearch}
          onChange={(event) => onFriendSearchChange(event.target.value)}
          className="h-10 w-full rounded-full border border-border-subtle px-4 text-sm"
        />
        <div className="space-y-2">
          {filteredFriends.map((friend) => (
            <SpaceItem
              key={friend.id}
              space={friend}
              onPress={() => router.push(ROUTES.friend(friend.id))}
            />
          ))}
          {filteredFriends.length === 0 && (
            <div className="rounded-xl border border-dashed border-border-subtle px-4 py-3 text-sm text-tertiary">
              No friends found
            </div>
          )}
        </div>
      </section>
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
  const [friendSearch, setFriendSearch] = React.useState('')
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
            <div className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(224,148,0,0.12),rgba(224,148,0,0.03))] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                  Main / Groups
                </p>
                {activeSurface === 'main' ? (
                  <AchievnoIcon icon={IconTarget} size="sm" className="text-primary" />
                ) : (
                  <AchievnoIcon icon={IconUsers} size="sm" className="text-secondary" />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground-secondary">
                {activeSurface === 'main'
                  ? 'Main keeps personal progress and friend activity in focus.'
                  : 'Groups keeps shared spaces and team progress in one surface.'}
              </p>
              <div className="mt-3">
                <TabBar
                  tabs={ROOT_SURFACE_TABS}
                  value={activeSurface}
                  onChange={handleSurfaceChange}
                  size="compact"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-screen py-5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 132px)' }}
        >
          {activeSurface === 'main' ? (
            <MainSurface
              friendSearch={friendSearch}
              onFriendSearchChange={setFriendSearch}
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
