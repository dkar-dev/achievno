'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * GROUP WORKSPACE SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/groups/[id]
 * Tabs: Overview | Achievements | Challenges
 *
 * Members moved to header overflow menu -> bottom sheet
 *
 * Layout (CRITICAL - no shift):
 * - Fixed header (sticky)
 * - Sticky tabs (below header)
 * - Scrollable content (STABLE HEIGHT)
 * - Tab switch: crossfade animation without layout shift
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { AchievnoBadge } from '@/components/achievno/badge'
import { AchievementCard } from '@/components/achievno/achievement-card'
import { TabBar } from '@/components/achievno/tabs'
import { NoChallenges } from '@/components/achievno/empty-state'
import {
    ActivityListSkeleton,
    MemberListSkeleton,
} from '@/components/achievno/skeleton'
import { AsyncBoundary } from '@/components/achievno/loading-states'
import {
    AchievnoIcon,
    IconPlus,
    IconTrophy,
    IconUsers,
    IconCrown,
    IconActivity,
    IconCalendar,
    IconChevronRight,
} from '@/lib/achievno/icons'
import { ROUTES } from '@/lib/achievno/constants'
import type { Achievement } from '@/lib/achievno/types'

// ─────────────────────────────────────────────────────────────────
// TAB CONFIG
// ─────────────────────────────────────────────────────────────────

const GROUP_TABS = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'achievements' as const, label: 'Achievements' },
    { id: 'challenges' as const, label: 'Challenges' },
]

type TabId = typeof GROUP_TABS[number]['id']

// ─────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────

const MOCK_GROUP = {
    id: 'dev-team',
    name: 'Dev Team',
    avatar: null,
    memberCount: 8,
    completionRate: 72,
    description: 'Building amazing products together',
    createdAt: '2025-01-15',
    isAdmin: true,
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: '1',
        title: 'Launch Presentation',
        description: 'Complete the Q2 launch presentation',
        targetValue: 10,
        currentValue: 6,
        unit: 'slides',
        status: 'active',
        dueDate: '2026-05-30',
        createdAt: '2026-03-01',
        spaceId: 'dev-team',
        spaceType: 'group',
        creatorId: 'user-1',
        progressPercent: 60,
        isOverdue: false,
    },
    {
        id: '2',
        title: 'Bug Fix Sprint',
        description: 'Fix all critical bugs before release',
        targetValue: 10,
        currentValue: 4,
        unit: 'bugs',
        status: 'active',
        createdAt: '2026-03-15',
        spaceId: 'dev-team',
        spaceType: 'group',
        creatorId: 'user-2',
        progressPercent: 40,
        isOverdue: false,
    },
]

const MOCK_CHALLENGES = [
    {
        id: 'c1',
        title: 'Code Review Sprint',
        description: 'First to review 10 PRs wins',
        status: 'active' as const,
        participantCount: 5,
        endDate: 'Apr 15',
        leader: { id: '1', name: 'Alex Chen', avatar: null, score: 7 },
    },
    {
        id: 'c2',
        title: 'Documentation Marathon',
        description: 'Most docs written in a week',
        status: 'upcoming' as const,
        participantCount: 3,
        startDate: 'Apr 20',
    },
]

const MOCK_ACTIVITY = [
    { id: 'a1', user: 'Alex', action: 'completed "Daily Workout"', time: '2h ago' },
    { id: 'a2', user: 'Bella', action: 'logged progress on "Launch"', time: '3h ago' },
    { id: 'a3', user: 'Max', action: 'joined the group', time: 'Yesterday' },
]

// ─────────────────────────────────────────────────────────────────
// AUXILIARY COMPONENTS
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// TAB CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────

function OverviewTab() {
    const router = useRouter()

    return (
        <div className="space-y-6 motion-tab-content">
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle flex flex-col items-center justify-center text-center min-h-[64px]">
                    <div className="text-title font-semibold text-primary">
                        {MOCK_ACHIEVEMENTS.length}
                    </div>
                    <div className="text-caption text-tertiary truncate w-full">
                        Active
                    </div>
                </div>
                <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle flex flex-col items-center justify-center text-center min-h-[64px]">
                    <div className="text-title font-semibold text-challenge">
                        {MOCK_CHALLENGES.filter((c) => c.status === 'active').length}
                    </div>
                    <div className="text-caption text-tertiary truncate w-full">
                        Challenges
                    </div>
                </div>
                <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle flex flex-col items-center justify-center text-center min-h-[64px]">
                    <div className="text-title font-semibold text-success">89%</div>
                    <div className="text-caption text-tertiary truncate w-full">
                        This week
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-label font-medium">Recent Activity</h3>
                    <button className="text-label text-primary">See all</button>
                </div>
                <div className="bg-bg-elevated rounded-xl border border-border-subtle divide-y divide-border-subtle">
                    {MOCK_ACTIVITY.map((item) => (
                        <div key={item.id} className="p-3 flex items-start gap-3">
                            <div className="size-8 rounded-full bg-bg-muted flex items-center justify-center shrink-0">
                                <AchievnoIcon
                                    icon={IconActivity}
                                    size="sm"
                                    className="text-tertiary"
                                />
                            </div>
                            <div className="flex-1 min-w-0 line-clamp-2">
                <span className="text-label">
                  <span className="font-medium">{item.user}</span>{' '}
                    <span className="text-secondary">{item.action}</span>
                </span>
                            </div>
                            <span className="text-caption text-tertiary shrink-0">
                {item.time}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-label font-medium">Current Goals</h3>
                    <button className="text-label text-primary">See all</button>
                </div>
                <div className="space-y-2">
                    {MOCK_ACHIEVEMENTS.slice(0, 2).map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            variant="compact"
                            onPress={() => router.push(ROUTES.achievement(achievement.id))}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function AchievementsTab() {
    const router = useRouter()

    return (
        <div className="motion-tab-content">
            <div className="flex items-center justify-between mb-3">
        <span className="text-label text-secondary">
          {MOCK_ACHIEVEMENTS.length} achievements
        </span>
                <Button size="sm" className="bg-primary text-primary-foreground">
                    <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                    New
                </Button>
            </div>
            <div className="space-y-2">
                {MOCK_ACHIEVEMENTS.map((achievement) => (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        variant="compact"
                        onPress={() => router.push(ROUTES.achievement(achievement.id))}
                    />
                ))}
            </div>
        </div>
    )
}

function ChallengesTab() {
    const router = useRouter()

    if (MOCK_CHALLENGES.length === 0) {
        return <NoChallenges />
    }

    return (
        <div className="motion-tab-content">
            <div className="flex items-center justify-between mb-3">
        <span className="text-label text-secondary">
          {MOCK_CHALLENGES.length} challenges
        </span>
                <Button size="sm" className="bg-challenge text-challenge-foreground">
                    <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                    Create
                </Button>
            </div>
            <div className="space-y-2">
                {MOCK_CHALLENGES.map((challenge) => (
                    <button
                        key={challenge.id}
                        onClick={() => router.push(`/app/challenges/${challenge.id}`)}
                        className="w-full bg-bg-elevated rounded-xl border border-border-subtle p-3 text-left hover:bg-bg-muted transition-colors"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="size-10 rounded-lg bg-challenge-subtle flex items-center justify-center">
                                    <AchievnoIcon icon={IconTrophy} className="text-challenge" />
                                </div>
                                <div>
                                    <h4 className="text-label font-medium">{challenge.title}</h4>
                                    <p className="text-caption text-tertiary line-clamp-1">
                                        {challenge.description}
                                    </p>
                                </div>
                            </div>
                            <AchievnoBadge
                                variant={challenge.status === 'active' ? 'info' : 'muted'}
                                size="sm"
                            >
                                {challenge.status === 'active' ? 'Active' : 'Soon'}
                            </AchievnoBadge>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                            <div className="flex items-center gap-1 text-caption text-tertiary">
                                <AchievnoIcon icon={IconUsers} size="sm" />
                                <span>{challenge.participantCount}</span>
                            </div>
                            {challenge.status === 'active' && challenge.leader && (
                                <div className="flex items-center gap-1 text-caption">
                                    <AchievnoIcon
                                        icon={IconCrown}
                                        size="sm"
                                        className="text-primary"
                                    />
                                    <span>{challenge.leader.name}</span>
                                    <span className="text-primary">
                    {challenge.leader.score} pts
                  </span>
                                </div>
                            )}
                            {challenge.status === 'upcoming' && (
                                <div className="flex items-center gap-1 text-caption text-tertiary">
                                    <AchievnoIcon icon={IconCalendar} size="sm" />
                                    <span>Starts {challenge.startDate}</span>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function GroupWorkspacePage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabId>('overview')
    const [isLoading] = useState(false)

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />
            case 'achievements':
                return <AchievementsTab />
            case 'challenges':
                return <ChallengesTab />
            default:
                return null
        }
    }

    return (
        <>
            <div className="min-h-screen bg-bg-base flex flex-col">
                <div className="safe-area-top px-screen py-3 border-b border-border-subtle">
                    <div className="relative flex min-h-11 items-center justify-center">
                        <button
                            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated"
                            onClick={() => router.push(ROUTES.rootShell('groups'))}
                            aria-label="Back"
                        >
                            <AchievnoIcon icon={IconChevronRight} className="rotate-180" />
                        </button>

                        <div className="inline-flex h-11 items-center rounded-full border border-border-subtle bg-bg-elevated px-5">
                            <div className="text-center">
                                <p className="text-lg font-semibold leading-none">{MOCK_GROUP.name}</p>
                                <p className="text-xs text-secondary">{MOCK_GROUP.memberCount} members</p>
                            </div>
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <AchievnoAvatar name={MOCK_GROUP.name} size="lg" variant="rounded" />
                        </div>
                    </div>
                </div>

                <div className="sticky top-0 z-10 bg-bg-base border-b border-border-subtle">
                    <div className="px-screen py-2">
                        <TabBar
                            tabs={GROUP_TABS}
                            value={activeTab}
                            onChange={setActiveTab}
                            variant="default"
                            size="compact"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="px-screen py-4 min-h-[300px]">
                        <AsyncBoundary
                            loading={isLoading}
                            loadingFallback={<ActivityListSkeleton />}
                        >
                            {renderTabContent()}
                        </AsyncBoundary>
                    </div>
                </div>
            </div>
        </>
    )
}
