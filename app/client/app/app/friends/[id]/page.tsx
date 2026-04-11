'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { AchievnoBadge } from '@/components/achievno/badge'
import { AchievementCard } from '@/components/achievno/achievement-card'
import { TabBar } from '@/components/achievno/tabs'
import { NoChallenges } from '@/components/achievno/empty-state'
import { ActivityListSkeleton } from '@/components/achievno/skeleton'
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

const TABS = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'achievements' as const, label: 'Achievements' },
    { id: 'challenges' as const, label: 'Challenges' },
]

type TabId = (typeof TABS)[number]['id']

const FRIEND = { id: 'fr-1', name: 'Alex Morgan', active: 2, completed: 6 }

const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'f1',
        title: 'Launch Presentation',
        description: 'Complete the Q2 launch presentation',
        targetValue: 10,
        currentValue: 6,
        unit: 'slides',
        status: 'active',
        dueDate: '2026-05-30',
        createdAt: '2026-03-01',
        spaceId: 'fr-1',
        spaceType: 'friend',
        creatorId: 'user-1',
        progressPercent: 60,
        isOverdue: false,
    },
    {
        id: 'f2',
        title: 'Bug Fix Sprint',
        description: 'Fix all critical bugs before release',
        targetValue: 10,
        currentValue: 4,
        unit: 'bugs',
        status: 'active',
        createdAt: '2026-03-15',
        spaceId: 'fr-1',
        spaceType: 'friend',
        creatorId: 'user-2',
        progressPercent: 40,
        isOverdue: false,
    },
]

const MOCK_CHALLENGES = [
    { id: 'c1', title: 'Code Review Sprint', description: 'First to review 10 PRs wins', status: 'active' as const, participantCount: 2, leader: { name: 'Alex', score: 7 } },
    { id: 'c2', title: 'Documentation Marathon', description: 'Most docs written in a week', status: 'upcoming' as const, participantCount: 2, startDate: 'Apr 20' },
]

const MOCK_ACTIVITY = [
    { id: 'a1', user: 'Alex', action: 'completed "Daily Workout"', time: '2h ago' },
    { id: 'a2', user: 'You', action: 'logged progress on "Launch"', time: '3h ago' },
    { id: 'a3', user: 'Alex', action: 'joined the friend space', time: 'Yesterday' },
]

function OverviewTab() {
    const router = useRouter()
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle text-center"><div className="text-title font-semibold text-primary">{MOCK_ACHIEVEMENTS.length}</div><div className="text-caption text-tertiary">Active</div></div>
                <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle text-center"><div className="text-title font-semibold text-challenge">{MOCK_CHALLENGES.filter((c) => c.status === 'active').length}</div><div className="text-caption text-tertiary">Challenges</div></div>
                <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle text-center"><div className="text-title font-semibold text-success">89%</div><div className="text-caption text-tertiary">This week</div></div>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between"><h3 className="text-label font-medium">Recent Activity</h3><button className="text-label text-primary">See all</button></div>
                <div className="bg-bg-elevated rounded-xl border border-border-subtle divide-y divide-border-subtle">
                    {MOCK_ACTIVITY.map((item) => (
                        <div key={item.id} className="p-3 flex items-start gap-3">
                            <div className="size-8 rounded-full bg-bg-muted flex items-center justify-center"><AchievnoIcon icon={IconActivity} size="sm" className="text-tertiary" /></div>
                            <div className="flex-1 min-w-0 line-clamp-2"><span className="text-label"><span className="font-medium">{item.user}</span> <span className="text-secondary">{item.action}</span></span></div>
                            <span className="text-caption text-tertiary shrink-0">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between"><h3 className="text-label font-medium">Current Goals</h3><button className="text-label text-primary">See all</button></div>
                <div className="space-y-2">{MOCK_ACHIEVEMENTS.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} variant="compact" onPress={() => router.push(ROUTES.achievement(achievement.id))} />)}</div>
            </div>
        </div>
    )
}

function AchievementsTab() {
    const router = useRouter()
    return (
        <div>
            <div className="mb-3 flex items-center justify-between"><span className="text-label text-secondary">{MOCK_ACHIEVEMENTS.length} achievements</span><Button size="sm"><AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />New</Button></div>
            <div className="space-y-2">{MOCK_ACHIEVEMENTS.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} variant="compact" onPress={() => router.push(ROUTES.achievement(achievement.id))} />)}</div>
        </div>
    )
}

function ChallengesTab() {
    const router = useRouter()
    if (MOCK_CHALLENGES.length === 0) return <NoChallenges />
    return (
        <div>
            <div className="mb-3 flex items-center justify-between"><span className="text-label text-secondary">{MOCK_CHALLENGES.length} challenges</span><Button size="sm" className="bg-challenge text-challenge-foreground"><AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />Create</Button></div>
            <div className="space-y-2">
                {MOCK_CHALLENGES.map((challenge) => (
                    <button key={challenge.id} onClick={() => router.push(`/app/challenges/${challenge.id}`)} className="w-full bg-bg-elevated rounded-xl border border-border-subtle p-3 text-left">
                        <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2"><div className="size-10 rounded-lg bg-challenge-subtle flex items-center justify-center"><AchievnoIcon icon={IconTrophy} className="text-challenge" /></div><div><h4 className="text-label font-medium">{challenge.title}</h4><p className="text-caption text-tertiary line-clamp-1">{challenge.description}</p></div></div>
                            <AchievnoBadge variant={challenge.status === 'active' ? 'info' : 'muted'} size="sm">{challenge.status === 'active' ? 'Active' : 'Soon'}</AchievnoBadge>
                        </div>
                        <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                            <div className="flex items-center gap-1 text-caption text-tertiary"><AchievnoIcon icon={IconUsers} size="sm" /><span>{challenge.participantCount}</span></div>
                            {challenge.status === 'active' ? <div className="flex items-center gap-1 text-caption"><AchievnoIcon icon={IconCrown} size="sm" className="text-primary" /><span>{challenge.leader?.name}</span><span className="text-primary">{challenge.leader?.score} pts</span></div> : <div className="flex items-center gap-1 text-caption text-tertiary"><AchievnoIcon icon={IconCalendar} size="sm" /><span>Starts {challenge.startDate}</span></div>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function FriendPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabId>('overview')
    const [isLoading] = useState(false)

    return (
        <div className="min-h-screen bg-bg-base flex flex-col">
            <div className="safe-area-top px-screen py-3 border-b border-border-subtle">
                <div className="relative flex min-h-11 items-center justify-center">
                    <button className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated" onClick={() => router.push(ROUTES.rootShell())}>
                        <AchievnoIcon icon={IconChevronRight} className="rotate-180" />
                    </button>
                    <div className="inline-flex h-11 items-center rounded-full border border-border-subtle bg-bg-elevated px-5">
                        <div className="text-center">
                            <p className="text-lg font-semibold leading-none">{FRIEND.name}</p>
                            <p className="truncate text-xs text-secondary">{FRIEND.active} active · {FRIEND.completed} completed</p>
                        </div>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2"><AchievnoAvatar name={FRIEND.name} size="lg" variant="rounded" /></div>
                </div>
            </div>

            <div className="sticky top-0 z-10 bg-bg-base border-b border-border-subtle"><div className="px-screen py-2"><TabBar tabs={TABS} value={activeTab} onChange={setActiveTab} size="compact" /></div></div>

            <div className="flex-1 overflow-auto"><div className="px-screen py-4 min-h-[300px]"><AsyncBoundary loading={isLoading} loadingFallback={<ActivityListSkeleton />}>{activeTab === 'overview' ? <OverviewTab /> : activeTab === 'achievements' ? <AchievementsTab /> : <ChallengesTab />}</AsyncBoundary></div></div>
        </div>
    )
}