'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { TabBar } from '@/components/achievno/tabs'
import { AchievementCard, AchievementCardSkeleton } from '@/components/achievno/achievement-card'
import { LogProgressSheet } from '@/components/achievno/log-progress-sheet'
import { NoAchievements } from '@/components/achievno/empty-state'
import { ListError } from '@/components/achievno/loading-states'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { achievementsApi, type PersonalAchievement } from '@/lib/achievno/api/achievements'
import {
  PERSONAL_ACHIEVEMENTS_USE_MOCKS,
  usePersonalAchievements,
} from '@/lib/achievno/achievements/use-personal-achievements'
import { toUiAchievement } from '@/lib/achievno/achievements/format'
import { IconPlus } from '@/lib/achievno/icons'
import { ROUTES, UI } from '@/lib/achievno/constants'
import type { Achievement } from '@/lib/achievno/types'

type Filter = 'active' | 'completed' | 'archived'

const DEMO_PERSONAL_ACHIEVEMENTS: PersonalAchievement[] = [
  {
    achievement_id: 'demo-progress-achievement',
    owner_context_id: 'demo-personal',
    base_type: 'progress',
    assignment_mode: 'self',
    title: 'Read 10 Books',
    short_definition: 'Complete 10 books this quarter',
    description: 'Technical and personal development reading list.',
    status: 'in_progress',
    progress_current: 7,
    progress_target: 10,
    unit_label: 'books',
    deadline_at: '2026-06-30T00:00:00Z',
    completed_at: null,
    archived_at: null,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: new Date().toISOString(),
    primary_category: null,
    rank: null,
  },
  {
    achievement_id: 'demo-done-achievement',
    owner_context_id: 'demo-personal',
    base_type: 'done',
    assignment_mode: 'self',
    title: 'Morning Meditation',
    short_definition: 'Complete the 30 day meditation plan',
    description: null,
    status: 'completed',
    progress_current: 1,
    progress_target: null,
    unit_label: null,
    deadline_at: null,
    completed_at: '2026-02-01T00:00:00Z',
    archived_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
    primary_category: null,
    rank: null,
  },
  {
    achievement_id: 'demo-archived-achievement',
    owner_context_id: 'demo-personal',
    base_type: 'progress',
    assignment_mode: 'self',
    title: 'Run 5K',
    short_definition: 'Finish a 5K race',
    description: null,
    status: 'archived',
    progress_current: 1,
    progress_target: 1,
    unit_label: 'race',
    deadline_at: null,
    completed_at: '2025-11-20T00:00:00Z',
    archived_at: '2025-11-25T00:00:00Z',
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-11-25T00:00:00Z',
    primary_category: null,
    rank: null,
  },
]

const FILTER_OPTIONS = [
  { id: 'active' as const, label: 'Active' },
  { id: 'completed' as const, label: 'Completed' },
  { id: 'archived' as const, label: 'Archived' },
]

function filterAchievements(items: PersonalAchievement[], filter: Filter) {
  if (filter === 'active') {
    return items.filter((item) => ['in_progress', 'overdue', 'in_review'].includes(item.status))
  }
  return items.filter((item) => item.status === filter)
}

export default function PersonalWorkspacePage() {
  const router = useRouter()
  const auth = useAuth()
  const [filter, setFilter] = React.useState<Filter>('active')
  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null)
  const [isLogSheetOpen, setIsLogSheetOpen] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const achievements = usePersonalAchievements({
    enabled: auth.isAuthenticated,
    mockItems: DEMO_PERSONAL_ACHIEVEMENTS,
  })

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  const filteredApiAchievements = React.useMemo(
    () => filterAchievements(achievements.items, filter),
    [achievements.items, filter],
  )
  const filteredAchievements = React.useMemo(
    () => filteredApiAchievements.map(toUiAchievement),
    [filteredApiAchievements],
  )

  const handleLogProgress = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setActionError(null)
    setIsLogSheetOpen(true)
  }

  const handleSaveProgress = async (value: number, note?: string) => {
    if (!selectedAchievement) return
    setActionError(null)
    if (PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
      setIsLogSheetOpen(false)
      return
    }
    try {
      await achievementsApi.progress(selectedAchievement.id, {
        delta_value: value,
        note_text: note || null,
      })
      setIsLogSheetOpen(false)
      await achievements.reload()
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Progress could not be logged.')
      throw caughtError
    }
  }

  const handleMarkComplete = async () => {
    if (!selectedAchievement) return
    setActionError(null)
    if (PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
      setIsLogSheetOpen(false)
      return
    }
    try {
      await achievementsApi.complete(selectedAchievement.id)
      setIsLogSheetOpen(false)
      await achievements.reload()
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Achievement could not be completed.')
      throw caughtError
    }
  }

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return <CenteredMessage message="Sign-in required." />
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <BackHeader title="Personal" onBack={() => router.push(ROUTES.rootShell())} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-screen py-4 motion-screen-push">
          {PERSONAL_ACHIEVEMENTS_USE_MOCKS && (
            <div className="mb-4 rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
              Demo achievements preview
            </div>
          )}

          <div className="mb-4">
            <TabBar value={filter} onChange={setFilter} tabs={FILTER_OPTIONS} size="compact" />
          </div>

          {actionError && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
              {actionError}
            </div>
          )}

          {achievements.error ? (
            <ListError message={achievements.error} onRetry={() => void achievements.reload()} />
          ) : achievements.isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: UI.skeletonListCount }).map((_, index) => (
                <AchievementCardSkeleton key={index} variant="compact" />
              ))}
            </div>
          ) : filteredAchievements.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredAchievements.map((achievement, index) => {
                const apiAchievement = filteredApiAchievements[index]
                return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  variant="compact"
                  onPress={() => router.push(ROUTES.achievement(achievement.id))}
                  onLogProgress={
                    achievement.status === 'active' && apiAchievement?.base_type === 'progress'
                      ? () => handleLogProgress(achievement)
                      : undefined
                  }
                />
                )
              })}
            </div>
          ) : (
            <NoAchievements onAction={() => router.push(ROUTES.achievementCreate)} />
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 safe-area-bottom">
        <Button
          onClick={() => router.push(ROUTES.achievementCreate)}
          className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <IconPlus size={24} />
          <span className="sr-only">Create achievement</span>
        </Button>
      </div>

      {selectedAchievement && (
        <LogProgressSheet
          open={isLogSheetOpen}
          onOpenChange={setIsLogSheetOpen}
          achievement={selectedAchievement}
          onLogProgress={handleSaveProgress}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </div>
  )
}

function CenteredMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-screen">
      <div className="rounded-xl border border-border-subtle bg-bg-muted px-4 py-3 text-label text-secondary">
        {message}
      </div>
    </div>
  )
}
