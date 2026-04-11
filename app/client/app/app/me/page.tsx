'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO PERSONAL WORKSPACE
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/me
 * Personal achievement workspace with:
 * - Needs Attention section (sorted: overdue → due today → due soon)
 * - Active/archived filter with compact density
 * - Log progress sheet integration
 * - Inline collapsible archive section
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { TabBar } from '@/components/achievno/tabs'
import { AchievementCard, AchievementCardSkeleton } from '@/components/achievno/achievement-card'
import { LogProgressSheet } from '@/components/achievno/log-progress-sheet'
import { NoAchievements, NeedsAttentionEmpty } from '@/components/achievno/empty-state'
import { AsyncBoundary } from '@/components/achievno/loading-states'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@/lib/achievno/icons'
import { ROUTES, UI } from '@/lib/achievno/constants'
import type { Achievement, PersonalWorkspaceSection } from '@/lib/achievno/types'

// ─────────────────────────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────────────────────────

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
    dueDate: '2026-04-01', // Overdue
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
    dueDate: '2026-04-08', // Due soon
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
  {
    id: 'arch-2',
    title: 'Run 5K',
    targetValue: 1,
    currentValue: 1,
    unit: 'race',
    status: 'archived',
    createdAt: '2025-09-01',
    completedAt: '2025-11-20',
    archivedAt: '2025-11-25',
    spaceId: 'personal',
    spaceType: 'personal',
    creatorId: 'user-1',
    progressPercent: 100,
    isOverdue: false,
  },
]

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Get items for Needs Attention section
 * Sorted: overdue → due today → due soon (next 3 days)
 * Max: 3-5 items
 */
function getNeedsAttention(achievements: Achievement[]): Achievement[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

  const urgent = achievements
    .filter((a) => {
      if (a.status !== 'active') return false
      if (!a.dueDate) return false
      return true
    })
    .map((a) => {
      const dueDate = new Date(a.dueDate!)
      const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
      
      let priority: number
      if (a.isOverdue || dueDateNormalized < today) {
        priority = 0 // Overdue
      } else if (dueDateNormalized.getTime() === today.getTime()) {
        priority = 1 // Due today
      } else if (dueDateNormalized <= threeDaysLater) {
        priority = 2 // Due soon
      } else {
        priority = 3 // Not urgent
      }
      
      return { ...a, priority }
    })
    .filter((a) => a.priority < 3) // Only urgent items
    .sort((a, b) => a.priority - b.priority)
    .slice(0, UI.needsAttentionMax)

  return urgent
}

// ─────────────────────────────────────────────────────────────────
// FILTER OPTIONS
// ─────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { id: 'active' as const, label: 'Active' },
  { id: 'completed' as const, label: 'Completed' },
  { id: 'archived' as const, label: 'Archived' },
]

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function PersonalWorkspacePage() {
  const router = useRouter()
  
  // State
  const [filter, setFilter] = React.useState<'active' | 'completed' | 'archived'>('active')
  const [isLoading] = React.useState(false)
  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null)
  const [isLogSheetOpen, setIsLogSheetOpen] = React.useState(false)

  // Computed data
  const activeAchievements = DEMO_ACHIEVEMENTS.filter((a) => a.status === 'active')
  const completedAchievements = DEMO_ACHIEVEMENTS.filter((a) => a.status === 'completed')
  const needsAttention = getNeedsAttention(DEMO_ACHIEVEMENTS)

  const filteredAchievements =
    filter === 'active' ? activeAchievements : filter === 'completed' ? completedAchievements : DEMO_ARCHIVED

  // Handlers
  const handleLogProgress = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setIsLogSheetOpen(true)
  }

  const handleSaveProgress = async (value: number, note?: string) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500))
    console.log('[v0] Progress logged:', { achievement: selectedAchievement?.id, value, note })
  }

  const handleMarkComplete = async () => {
    await new Promise((r) => setTimeout(r, 500))
    console.log('[v0] Marked complete:', selectedAchievement?.id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header - Fixed */}
      <BackHeader
        title="Personal"
        onBack={() => router.push(ROUTES.rootShell())}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-screen py-4 motion-screen-push">
          
          {/* Needs Attention Section */}
          {needsAttention.length > 0 && (
            <section className="mb-6">
              <h2 className="text-caption text-secondary mb-2">NEEDS ATTENTION</h2>
              <div className="flex flex-col gap-2">
                {needsAttention.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    variant="compact"
                    onPress={() => router.push(ROUTES.achievement(achievement.id))}
                    onLogProgress={() => handleLogProgress(achievement)}
                  />
                ))}
              </div>
            </section>
          )}

          {needsAttention.length === 0 && filter === 'active' && activeAchievements.length > 0 && (
            <section className="mb-6">
              <NeedsAttentionEmpty />
            </section>
          )}

          {/* Filter Pills */}
          <div className="mb-4">
            <TabBar
              value={filter}
              onChange={setFilter}
              tabs={FILTER_OPTIONS}
              size="compact"
            />
          </div>

          {/* Achievement List */}
          <AsyncBoundary
            loading={isLoading}
            loadingFallback={
              <div className="flex flex-col gap-2">
                {Array.from({ length: UI.skeletonListCount }).map((_, i) => (
                  <AchievementCardSkeleton key={i} variant="compact" />
                ))}
              </div>
            }
          >
            {filteredAchievements.length > 0 ? (
              <div className="flex flex-col gap-2">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    variant="compact"
                    onPress={() => router.push(ROUTES.achievement(achievement.id))}
                    onLogProgress={achievement.status === 'active' ? () => handleLogProgress(achievement) : undefined}
                  />
                ))}
              </div>
            ) : (
              <NoAchievements onAction={() => router.push(ROUTES.achievementCreate)} />
            )}
          </AsyncBoundary>

        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 safe-area-bottom">
        <Button
          onClick={() => router.push(ROUTES.achievementCreate)}
          className="size-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <IconPlus size={24} />
          <span className="sr-only">Create achievement</span>
        </Button>
      </div>

      {/* Log Progress Sheet */}
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
