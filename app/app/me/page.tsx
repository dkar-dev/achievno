'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO PERSONAL WORKSPACE
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/me
 * Personal achievement workspace with active/archived filter
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { SegmentedControl } from '@/components/achievno/tabs'
import { AchievementCard } from '@/components/achievno/achievement-card'
import { NoAchievements } from '@/components/achievno/empty-state'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@/lib/achievno/icons'
import { ROUTES, PERSONAL_FILTERS } from '@/lib/achievno/constants'
import type { Achievement, PersonalWorkspaceSection } from '@/lib/achievno/types'

// Demo data
const DEMO_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Read 10 Books',
    description: 'Complete 10 books this quarter',
    targetValue: 10,
    currentValue: 7,
    unit: 'books',
    status: 'active',
    dueDate: '2026-06-30',
    createdAt: '2026-01-15',
    spaceId: 'personal',
    spaceType: 'personal',
    creatorId: 'user-1',
    progressPercent: 70,
    isOverdue: false,
  },
  {
    id: 'ach-2',
    title: 'Complete Project Alpha',
    description: 'Finish all milestones for the alpha release',
    targetValue: 5,
    currentValue: 3,
    unit: 'milestones',
    status: 'active',
    dueDate: '2026-04-15',
    createdAt: '2026-02-01',
    spaceId: 'personal',
    spaceType: 'personal',
    creatorId: 'user-1',
    progressPercent: 60,
    isOverdue: true,
  },
  {
    id: 'ach-3',
    title: 'Learn TypeScript',
    description: 'Complete TypeScript fundamentals course',
    targetValue: 12,
    currentValue: 8,
    unit: 'modules',
    status: 'active',
    createdAt: '2026-03-01',
    spaceId: 'personal',
    spaceType: 'personal',
    creatorId: 'user-1',
    progressPercent: 67,
    isOverdue: false,
  },
  {
    id: 'ach-4',
    title: 'Morning Meditation',
    description: '30 days of morning meditation',
    targetValue: 30,
    currentValue: 30,
    unit: 'days',
    status: 'completed',
    createdAt: '2026-01-01',
    completedAt: '2026-02-01',
    spaceId: 'personal',
    spaceType: 'personal',
    creatorId: 'user-1',
    progressPercent: 100,
    isOverdue: false,
  },
]

const DEMO_ARCHIVED: Achievement[] = [
  {
    id: 'arch-1',
    title: 'Learn Spanish Basics',
    targetValue: 20,
    currentValue: 20,
    unit: 'lessons',
    status: 'archived',
    createdAt: '2025-10-01',
    completedAt: '2025-12-15',
    archivedAt: '2025-12-20',
    spaceId: 'personal',
    spaceType: 'personal',
    creatorId: 'user-1',
    progressPercent: 100,
    isOverdue: false,
  },
]

export default function PersonalWorkspacePage() {
  const router = useRouter()
  const [filter, setFilter] = React.useState<PersonalWorkspaceSection>('active')

  const filteredAchievements = filter === 'active'
    ? DEMO_ACHIEVEMENTS.filter((a) => a.status === 'active' || a.status === 'completed')
    : DEMO_ARCHIVED

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <BackHeader
        title="My Space"
        onBack={() => router.push(ROUTES.spaces)}
        rightActions={
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push(ROUTES.achievementCreate)}
            className="size-9 rounded-lg bg-background-elevated"
          >
            <IconPlus size={18} />
            <span className="sr-only">Create achievement</span>
          </Button>
        }
      />

      {/* Filter tabs */}
      <div className="px-screen py-3 border-b border-border">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={PERSONAL_FILTERS}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-screen py-4">
          {filteredAchievements.length > 0 ? (
            <div className="space-y-3">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onPress={() => router.push(ROUTES.achievement(achievement.id))}
                />
              ))}
            </div>
          ) : (
            <NoAchievements
              onAction={() => router.push(ROUTES.achievementCreate)}
            />
          )}
        </div>
      </div>

      {/* Floating action button for mobile */}
      <div className="fixed bottom-6 right-6 safe-area-bottom">
        <Button
          onClick={() => router.push(ROUTES.achievementCreate)}
          className="size-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <IconPlus size={24} />
          <span className="sr-only">Create achievement</span>
        </Button>
      </div>
    </div>
  )
}
