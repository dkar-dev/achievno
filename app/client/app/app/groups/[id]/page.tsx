'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * GROUP WORKSPACE SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/groups/[id]
 * Tabs: Overview | Achievements | Challenges | Members | Info
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
import { BackHeader } from '@/components/achievno/header'
import { AchievnoProgress } from '@/components/achievno/progress'
import { AchievnoAvatar, AchievnoAvatarStack } from '@/components/achievno/avatar'
import { AchievnoBadge } from '@/components/achievno/badge'
import { AchievementCard } from '@/components/achievno/achievement-card'
import { TabBar } from '@/components/achievno/tabs'
import { NoChallenges } from '@/components/achievno/empty-state'
import { GroupWorkspaceSkeleton, ActivityListSkeleton, MemberListSkeleton } from '@/components/achievno/skeleton'
import { AsyncBoundary } from '@/components/achievno/loading-states'
import { 
  AchievnoIcon,
  IconPlus,
  IconTrophy,
  IconUsers,
  IconInfo,
  IconCrown,
  IconActivity,
  IconCalendar,
  IconChevronRight,
  IconMoreHorizontal
} from '@/lib/achievno/icons'
import { ROUTES } from '@/lib/achievno/constants'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/achievno/types'

// ─────────────────────────────────────────────────────────────────
// TAB CONFIG
// ─────────────────────────────────────────────────────────────────

const GROUP_TABS = [
  { id: 'overview' as const, label: 'Overview' },
  { id: 'achievements' as const, label: 'Achievements' },
  { id: 'challenges' as const, label: 'Challenges' },
  { id: 'members' as const, label: 'Members' },
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

const MOCK_MEMBERS = [
  { id: '1', name: 'Alex Chen', avatar: null, role: 'admin', completedCount: 24 },
  { id: '2', name: 'Bella Rodriguez', avatar: null, role: 'member', completedCount: 18 },
  { id: '3', name: 'Max Kim', avatar: null, role: 'member', completedCount: 15 },
  { id: '4', name: 'Sophie Lee', avatar: null, role: 'member', completedCount: 12 },
]

const MOCK_ACTIVITY = [
  { id: 'a1', user: 'Alex', action: 'completed "Daily Workout"', time: '2h ago' },
  { id: 'a2', user: 'Bella', action: 'logged progress on "Launch"', time: '3h ago' },
  { id: 'a3', user: 'Max', action: 'joined the group', time: 'Yesterday' },
]

// ─────────────────────────────────────────────────────────────────
// TAB CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────

function OverviewTab() {
  const router = useRouter()
  
  return (
    <div className="space-y-6 motion-tab-content">
      {/* Quick Stats - compact */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle flex flex-col items-center justify-center text-center min-h-[64px]">
          <div className="text-title font-semibold text-primary">{MOCK_ACHIEVEMENTS.length}</div>
          <div className="text-caption text-tertiary truncate w-full">Active</div>
        </div>
        <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle flex flex-col items-center justify-center text-center min-h-[64px]">
          <div className="text-title font-semibold text-challenge">{MOCK_CHALLENGES.filter(c => c.status === 'active').length}</div>
          <div className="text-caption text-tertiary truncate w-full">Challenges</div>
        </div>
        <div className="bg-bg-elevated rounded-lg p-3 border border-border-subtle flex flex-col items-center justify-center text-center min-h-[64px]">
          <div className="text-title font-semibold text-success">89%</div>
          <div className="text-caption text-tertiary truncate w-full">This week</div>
        </div>
      </div>

      {/* Recent Activity - max 2 lines per item */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-label font-medium">Recent Activity</h3>
          <button className="text-label text-primary">See all</button>
        </div>
        <div className="bg-bg-elevated rounded-xl border border-border-subtle divide-y divide-border-subtle">
          {MOCK_ACTIVITY.map((item) => (
            <div key={item.id} className="p-3 flex items-start gap-3">
              <div className="size-8 rounded-full bg-bg-muted flex items-center justify-center shrink-0">
                <AchievnoIcon icon={IconActivity} size="sm" className="text-tertiary" />
              </div>
              <div className="flex-1 min-w-0 line-clamp-2">
                <span className="text-label">
                  <span className="font-medium">{item.user}</span>{' '}
                  <span className="text-secondary">{item.action}</span>
                </span>
              </div>
              <span className="text-caption text-tertiary shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Goals Preview */}
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
        <span className="text-label text-secondary">{MOCK_ACHIEVEMENTS.length} achievements</span>
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
        <span className="text-label text-secondary">{MOCK_CHALLENGES.length} challenges</span>
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
                  <p className="text-caption text-tertiary line-clamp-1">{challenge.description}</p>
                </div>
              </div>
              <AchievnoBadge variant={challenge.status === 'active' ? 'info' : 'muted'} size="sm">
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
                  <AchievnoIcon icon={IconCrown} size="sm" className="text-primary" />
                  <span>{challenge.leader.name}</span>
                  <span className="text-primary">{challenge.leader.score} pts</span>
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

function MembersTab() {
  return (
    <div className="motion-tab-content">
      <div className="flex items-center justify-between mb-3">
        <span className="text-label text-secondary">{MOCK_MEMBERS.length} members</span>
        {MOCK_GROUP.isAdmin && (
          <Button size="sm" variant="outline">
            <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
            Invite
          </Button>
        )}
      </div>
      <div className="bg-bg-elevated rounded-xl border border-border-subtle divide-y divide-border-subtle">
        {MOCK_MEMBERS.map((member) => (
          <div key={member.id} className="p-3 flex items-center gap-3">
            <AchievnoAvatar name={member.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-label font-medium truncate">{member.name}</span>
                {member.role === 'admin' && (
                  <AchievnoBadge variant="muted" size="sm">Admin</AchievnoBadge>
                )}
              </div>
              <span className="text-caption text-tertiary">{member.completedCount} achievements</span>
            </div>
            <button className="size-8 flex items-center justify-center rounded-lg hover:bg-bg-muted">
              <AchievnoIcon icon={IconChevronRight} size="sm" className="text-tertiary" />
            </button>
          </div>
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

  // Render tab content with stable container
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'achievements':
        return <AchievementsTab />
      case 'challenges':
        return <ChallengesTab />
      case 'members':
        return <MembersTab />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Fixed Header */}
      <BackHeader
        title={MOCK_GROUP.name}
        onBack={() => router.push(ROUTES.spaces)}
        rightActions={
          <button className="size-10 flex items-center justify-center rounded-xl hover:bg-bg-muted">
            <AchievnoIcon icon={IconMoreHorizontal} />
          </button>
        }
      />

      {/* Group Header Card - Compact */}
      <div className="px-screen py-3 border-b border-border-subtle">
        <div className="flex items-center gap-3 mb-3">
          <AchievnoAvatar name={MOCK_GROUP.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-title font-semibold truncate">{MOCK_GROUP.name}</h1>
            <p className="text-caption text-secondary">
              {MOCK_GROUP.memberCount} members · {MOCK_GROUP.completionRate}%
            </p>
          </div>
        </div>
        <AchievnoProgress value={MOCK_GROUP.completionRate} size="sm" />
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-bg-base border-b border-border-subtle">
        <div className="px-screen py-2">
          <TabBar
            tabs={GROUP_TABS}
            value={activeTab}
            onChange={setActiveTab}
            variant="default"
          />
        </div>
      </div>

      {/* Scrollable Content - STABLE HEIGHT container */}
      <div className="flex-1 overflow-auto">
        <div className="px-screen py-4 min-h-[300px]">
          <AsyncBoundary
            loading={isLoading}
            loadingFallback={
              activeTab === 'members' ? <MemberListSkeleton /> : <ActivityListSkeleton />
            }
          >
            {renderTabContent()}
          </AsyncBoundary>
        </div>
      </div>
    </div>
  )
}
