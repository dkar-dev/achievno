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
    IconShare,
    IconShield,
    IconTarget,
    IconUserPlus,
    IconUsers,
} from '@/lib/achievno/icons'
import { AVATAR_COLORS, ROUTES, type RootShellSurface } from '@/lib/achievno/constants'
import type { Space } from '@/lib/achievno/types'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import type { MainAggregate, MainFriendPreview, MainGroupPreview } from '@/lib/achievno/api/main'
import { MAIN_AGGREGATE_USE_MOCKS, useMainAggregate } from '@/lib/achievno/main/use-main-aggregate'
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
        emphasized: false,
    },
    {
        id: 'approvals',
        label: 'Approvals',
        icon: IconShield,
        route: ROUTES.approvals,
        emphasized: false,
    },
    {
        id: 'discover',
        label: 'Discover Groups',
        icon: IconCompass,
        route: ROUTES.discover,
        emphasized: false,
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
        emphasized: false,
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
        type: 'friend',
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
        type: 'friend',
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

const DEMO_MAIN_AGGREGATE: MainAggregate = {
    authenticated: true,
    profile: {
        profile_id: 'demo-profile',
        account_id: 'demo-account',
        display_name: 'Alex Jordan',
        username: 'alex',
        avatar_url: null,
        rank: null,
    },
    personal_space: {
        owner_context_id: 'demo-personal',
        active_achievements_count: DEMO_PERSONAL_SPACE.activeCount,
        completed_achievements_count: DEMO_PERSONAL_SPACE.completedCount,
        recent_logs_count: 3,
        recent_achievements: [
            {
                achievement_id: 'demo-achievement',
                title: 'Launch Presentation',
                status: 'active',
                progress_current: 6,
                progress_target: 10,
                unit_label: 'steps',
                updated_at: new Date().toISOString(),
            },
        ],
    },
    friends: {
        total_count: DEMO_FRIENDS.length,
        active_count: DEMO_FRIENDS.length,
        pending_count: 0,
        preview: DEMO_FRIENDS.map((friend) => ({
            friend_connection_id: friend.id,
            status: 'active',
            side_status: 'active',
            profile: {
                profile_id: friend.id,
                display_name: friend.name,
                username: null,
                avatar_url: friend.avatarUrl ?? null,
            },
            active_achievements_count: friend.activeCount,
            completed_achievements_count: friend.completedCount,
            updated_at: friend.lastActivityAt,
        })),
    },
    groups: {
        total_count: DEMO_GROUPS.length,
        owned_count: 1,
        member_count: DEMO_GROUPS.length - 1,
        preview: DEMO_GROUPS.map((group) => ({
            group_id: group.id,
            title: group.name,
            avatar_url: group.avatarUrl ?? null,
            visibility_type: 'private',
            role: 'member',
            membership_status: 'active',
            member_count: group.memberCount ?? 0,
            active_achievements_count: group.activeCount,
            completed_achievements_count: group.completedCount,
            joined_at: group.lastActivityAt,
        })),
    },
    notifications: {
        unread_count: 3,
        preview: [],
    },
    server_time: new Date().toISOString(),
}

function initialsForName(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'AC'
}

function colorForId(id: string) {
    const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_COLORS.length
    return AVATAR_COLORS[index]
}

function personalSpaceFromAggregate(aggregate: MainAggregate): Space {
    return {
        id: aggregate.personal_space.owner_context_id || 'personal',
        type: 'personal',
        name: aggregate.profile.display_name || 'Personal',
        avatarUrl: aggregate.profile.avatar_url ?? undefined,
        avatarInitials: initialsForName(aggregate.profile.display_name || aggregate.profile.username || 'AC'),
        avatarColor: colorForId(aggregate.profile.profile_id),
        activeCount: aggregate.personal_space.active_achievements_count,
        completedCount: aggregate.personal_space.completed_achievements_count,
        hasUnread: aggregate.notifications.unread_count > 0,
        unreadCount: aggregate.notifications.unread_count || undefined,
        lastActivityAt: aggregate.server_time,
    }
}

function friendSpaceFromPreview(friend: MainFriendPreview): Space {
    return {
        id: friend.friend_connection_id,
        type: 'friend',
        name: friend.profile.display_name,
        avatarUrl: friend.profile.avatar_url ?? undefined,
        avatarInitials: initialsForName(friend.profile.display_name),
        avatarColor: colorForId(friend.profile.profile_id),
        activeCount: friend.active_achievements_count,
        completedCount: friend.completed_achievements_count,
        hasUnread: false,
        lastActivityAt: friend.updated_at || new Date(0).toISOString(),
    }
}

function groupSpaceFromPreview(group: MainGroupPreview): Space {
    return {
        id: group.group_id,
        type: 'group',
        name: group.title,
        avatarUrl: group.avatar_url ?? undefined,
        avatarInitials: initialsForName(group.title),
        avatarColor: colorForId(group.group_id),
        memberCount: group.member_count,
        activeCount: group.active_achievements_count,
        completedCount: group.completed_achievements_count,
        progressPercent: 0,
        hasUnread: false,
        lastActivityAt: group.joined_at || new Date(0).toISOString(),
    }
}

function RootPillNav() {
    const router = useRouter()
    const auth = useAuth()
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
    const [isSigningOut, setIsSigningOut] = React.useState(false)

    const settingsItems = [
        { id: 'notifications', label: 'Notifications', route: ROUTES.notifications },
        { id: 'approvals', label: 'Approvals', route: ROUTES.approvals },
        { id: 'settings', label: 'Settings', route: ROUTES.settings },
        { id: 'logout', label: 'Logout', route: null },
    ] as const

    const handleSettingsItem = async (item: (typeof settingsItems)[number]) => {
        if (item.id !== 'logout') {
            setIsSettingsOpen(false)
            if (item.route) {
                router.push(item.route)
            }
            return
        }

        setIsSigningOut(true)
        try {
            await auth.signOut()
        } finally {
            setIsSigningOut(false)
            setIsSettingsOpen(false)
            router.push(ROUTES.welcome)
        }
    }

    return (
        <>
            <div
                className="fixed inset-x-0 bottom-0 z-40 px-screen"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
            >
                <div className="rounded-[30px] border border-border-subtle bg-bg-elevated/95 p-2 shadow-[0_18px_40px_rgba(17,24,39,0.12)] backdrop-blur">
                    <div className="grid grid-cols-5 gap-1">
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
                                    disabled={item.id === 'logout' && isSigningOut}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-bg-muted"
                                    onClick={() => void handleSettingsItem(item)}
                                >
                                    <span className={cn('text-label', item.id === 'logout' && 'text-destructive')}>
                                        {item.id === 'logout' && isSigningOut ? 'Logging out...' : item.label}
                                    </span>
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
                         aggregate,
                     }: {
    friendSearch: string
    onFriendSearchChange: (value: string) => void
    aggregate: MainAggregate
}) {
    const router = useRouter()
    const personalSpace = personalSpaceFromAggregate(aggregate)
    const friendSpaces = aggregate.friends.preview.map(friendSpaceFromPreview)
    const groupSpaces = aggregate.groups.preview.map(groupSpaceFromPreview)
    const filteredFriends = friendSpaces.filter((friend) =>
        friend.name.toLowerCase().includes(friendSearch.toLowerCase()),
    )
    const hasNoAchievements = aggregate.personal_space.active_achievements_count === 0
        && aggregate.personal_space.completed_achievements_count === 0
        && aggregate.personal_space.recent_achievements.length === 0

    return (
        <div className="space-y-6">
            <section className="space-y-3">
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <AchievnoIcon icon={IconUserPlus} size="sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-title font-semibold">Invite a friend</h3>
                            <p className="mt-1 text-label text-secondary">
                                Create a 1-on-1 relation and track shared achievements together.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button className="rounded-full" onClick={() => router.push(ROUTES.friends)}>
                            <AchievnoIcon icon={IconShare} size="sm" className="mr-1" />
                            Invite
                        </Button>
                        <Button variant="outline" className="rounded-full" onClick={() => router.push(ROUTES.friends)}>
                            <AchievnoIcon icon={IconUsers} size="sm" className="mr-1" />
                            Friends
                        </Button>
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
                </div>

                <PersonalSpaceItem
                    space={personalSpace}
                    onPress={() => router.push(ROUTES.personalWorkspace)}
                />
                {hasNoAchievements && (
                    <div className="rounded-xl border border-dashed border-border-subtle px-4 py-3">
                        <p className="text-sm text-tertiary">No personal achievements yet.</p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 rounded-full"
                            onClick={() => router.push(ROUTES.achievementCreate)}
                        >
                            <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                            Create achievement
                        </Button>
                    </div>
                )}
            </section>

            <section className="space-y-3">
                <div>
                    <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">
                        Challenges
                    </p>
                    <h3 className="text-title font-semibold">Open challenge flows</h3>
                </div>
                <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
                    <p className="text-label text-secondary">
                        Challenge data is loaded from the API on the challenge screens.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => router.push(ROUTES.challenges)}
                        >
                            Open
                        </Button>
                        <Button
                            size="sm"
                            className="rounded-full bg-challenge text-challenge-foreground"
                            onClick={() => router.push(ROUTES.challengeCreate)}
                        >
                            <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                            Create
                        </Button>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">Groups</p>
                        <h3 className="text-title font-semibold">Team achievement spaces</h3>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => router.push(ROUTES.groupCreate)}>
                        <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                        Create
                    </Button>
                </div>
                <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
                    <p className="text-label text-secondary">
                        {aggregate.groups.total_count > 0
                            ? `${aggregate.groups.total_count} real group spaces loaded from the API.`
                            : 'No group spaces yet. Create a team or discover a public group.'}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button size="sm" className="rounded-full" onClick={() => router.push(ROUTES.rootShell('groups'))}>
                            <AchievnoIcon icon={IconUsers} size="sm" className="mr-1" />
                            Groups
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => router.push(ROUTES.discover)}>
                            <AchievnoIcon icon={IconCompass} size="sm" className="mr-1" />
                            Discover
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    {groupSpaces.slice(0, 3).map((group) => (
                        <div key={group.id} className="space-y-2">
                            <GroupSpaceItem
                                space={group}
                                onPress={() => router.push(ROUTES.group(group.id))}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full rounded-full"
                                onClick={() => router.push(ROUTES.groupInviteCreate(group.id))}
                            >
                                <AchievnoIcon icon={IconShare} size="sm" className="mr-1" />
                                Invite to {group.name}
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">Friends</p>
                        <h3 className="text-title font-semibold">1-on-1 relations</h3>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => router.push(ROUTES.friends)}>
                        <AchievnoIcon icon={IconUserPlus} size="sm" className="mr-1" />
                        Invite
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
                            {friendSearch ? 'No friends found' : 'No friend spaces yet.'}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

function GroupsSurface({ aggregate }: { aggregate: MainAggregate }) {
    const router = useRouter()
    const groupSpaces = aggregate.groups.preview.map(groupSpaceFromPreview)

    return (
        <div className="space-y-6">
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">
                            Your Groups
                        </p>
                        <h3 className="text-title font-semibold">{aggregate.groups.total_count} active spaces</h3>
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

                {groupSpaces.length > 0 ? (
                    <div className="space-y-2">
                        {groupSpaces.map((group) => (
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
    const auth = useAuth()
    const [friendSearch, setFriendSearch] = React.useState('')
    const [activeSurface, setActiveSurface] = React.useState<RootShellSurface>('main')
    const [authError, setAuthError] = React.useState<string | null>(null)
    const main = useMainAggregate({
        enabled: auth.isAuthenticated,
        mockData: DEMO_MAIN_AGGREGATE,
    })

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        setActiveSurface(params.get('surface') === 'groups' ? 'groups' : 'main')
    }, [])

    React.useEffect(() => {
        if (auth.status === 'unauthenticated') {
            router.replace(ROUTES.signIn)
        }
    }, [auth.status, router])

    React.useEffect(() => {
        if (auth.status !== 'error') {
            setAuthError(null)
            return
        }

        setAuthError(auth.error || 'Authentication check failed.')
    }, [auth.error, auth.status])

    const handleSurfaceChange = (nextSurface: RootShellSurface) => {
        if (nextSurface === activeSurface) return

        setActiveSurface(nextSurface)
        router.replace(ROUTES.rootShell(nextSurface), { scroll: false })
    }

    if (auth.status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-base px-screen">
                <div className="rounded-xl border border-border-subtle bg-bg-muted px-4 py-3 text-label text-secondary">
                    Checking authentication...
                </div>
            </div>
        )
    }

    if (!auth.isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-base px-screen">
                <div className="space-y-3 text-center">
                    <p className="text-title font-semibold">Sign-in required</p>
                    <p className="text-body text-secondary">{authError || 'Redirecting to sign in...'}</p>
                    <Button onClick={() => router.replace(ROUTES.signIn)}>Go to sign in</Button>
                </div>
            </div>
        )
    }

    if (main.isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-base px-screen">
                <div className="rounded-xl border border-border-subtle bg-bg-muted px-4 py-3 text-label text-secondary">
                    Loading main space...
                </div>
            </div>
        )
    }

    if (main.error || !main.data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg-base px-screen">
                <div className="space-y-3 text-center">
                    <p className="text-title font-semibold">Main space unavailable</p>
                    <p className="text-body text-secondary">
                        {main.error || 'Main screen data could not be loaded.'}
                    </p>
                    <Button onClick={() => void main.reload()}>Retry</Button>
                </div>
            </div>
        )
    }

    const aggregate = main.data

    return (
        <>
            <div className="min-h-screen bg-bg-base">
                <div className="sticky top-0 z-30 border-b border-border-subtle bg-bg-base/95 backdrop-blur">
                    <div className="safe-area-top px-screen pb-4 pt-3">
                        <div className="rounded-3xl border border-border-subtle bg-[linear-gradient(135deg,rgba(224,148,0,0.12),rgba(224,148,0,0.03))] p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                                    {MAIN_AGGREGATE_USE_MOCKS ? 'Demo Main / Groups' : 'Main / Groups'}
                                </p>
                                {activeSurface === 'main' ? (
                                    <AchievnoIcon icon={IconTarget} size="sm" className="text-primary" />
                                ) : (
                                    <AchievnoIcon icon={IconUsers} size="sm" className="text-secondary" />
                                )}
                            </div>
                            <p className="mt-2 text-sm text-foreground-secondary">
                                {activeSurface === 'main'
                                    ? `${aggregate.profile.display_name || 'Your profile'} has ${aggregate.personal_space.active_achievements_count} active achievements and ${aggregate.notifications.unread_count} unread notifications.`
                                    : `${aggregate.groups.total_count} group spaces, ${aggregate.groups.owned_count} owned and ${aggregate.groups.member_count} joined.`}
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
                            aggregate={aggregate}
                            friendSearch={friendSearch}
                            onFriendSearchChange={setFriendSearch}
                        />
                    ) : (
                        <GroupsSurface aggregate={aggregate} />
                    )}
                </div>
            </div>

            <RootPillNav />
        </>
    )
}
