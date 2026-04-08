'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ACHIEVEMENT DETAIL
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/achievements/:id
 * 
 * Features:
 * - Log progress via bottom sheet
 * - Fixed back button position
 * - Primary CTA bottom anchored
 * - Description: max 1 line preview, full on expand
 * - Success feedback: scale animation + checkmark fade
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { AchievnoBadge, getAchievementBadgeVariant } from '@/components/achievno/badge'
import { AchievnoProgress } from '@/components/achievno/progress'
import { LogProgressSheet } from '@/components/achievno/log-progress-sheet'
import { AchievementDetailSkeleton } from '@/components/achievno/skeleton'
import { AsyncBoundary } from '@/components/achievno/loading-states'
import {
  DeleteAchievementModal,
  ArchiveAchievementModal,
  ConfirmModal,
} from '@/components/achievno/confirm-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconMoreVertical,
  IconEdit,
  IconArchive,
  IconTrash,
  IconPlus,
  IconCheck,
} from '@/lib/achievno/icons'
import { ROUTES, STATUS_LABELS } from '@/lib/achievno/constants'
import { toast } from '@/hooks/use-toast'
import type { Achievement } from '@/lib/achievno/types'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────────────────────────

const DEMO_ACHIEVEMENT: Achievement = {
  id: 'ach-1',
  title: 'Read 10 Books',
  description: 'Complete 10 books this quarter. Focus on technical and personal development topics. This is a longer description that should be truncated on the detail page.',
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
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function AchievementDetailPage() {
  const router = useRouter()
  const params = useParams()
  
  // State
  const [achievement, setAchievement] = React.useState<Achievement>(DEMO_ACHIEVEMENT)
  const [isLoading] = React.useState(false)
  const [isLogSheetOpen, setIsLogSheetOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false)

  const isCompleted = achievement.status === 'completed'
  const isArchived = achievement.status === 'archived'
  const badgeVariant = achievement.isOverdue ? 'overdue' : getAchievementBadgeVariant(achievement.status)

  // Use muted badge for primary status to keep progress bar as sole color carrier,
  // but keep inProgress blue to maintain semantic clarity
  const displayBadgeVariant = (badgeVariant === 'primary') ? 'muted' : badgeVariant

  // Build compact meta string
  const metaString = `${achievement.currentValue}/${achievement.targetValue}${achievement.dueDate ? ` · due ${formatDate(achievement.dueDate)}` : ''}`

  // Handlers
  const handleLogProgress = async (value: number, note?: string) => {
    // Optimistic update
    const newValue = Math.min(achievement.currentValue + value, achievement.targetValue)
    setAchievement((prev) => ({
      ...prev,
      currentValue: newValue,
      progressPercent: Math.round((newValue / prev.targetValue) * 100),
    }))

    // Show success animation
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 500)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 300))
  }

  const handleMarkComplete = async () => {
    setAchievement((prev) => ({
      ...prev,
      status: 'completed',
      currentValue: prev.targetValue,
      progressPercent: 100,
      completedAt: new Date().toISOString(),
    }))

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 500)

    await new Promise((r) => setTimeout(r, 300))
  }

  const handleComplete = () => {
    setIsCompleteOpen(false)
    handleMarkComplete()
    toast({ title: 'Achievement completed!' })
  }

  const handleArchive = () => {
    setIsArchiveOpen(false)
    toast({ title: 'Achievement archived' })
    router.push(ROUTES.personalWorkspace)
  }

  const handleDelete = () => {
    setIsDeleteOpen(false)
    toast({ title: 'Achievement deleted' })
    router.push(ROUTES.personalWorkspace)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header - Fixed position back button */}
      <BackHeader
        title=""
        onBack={() => router.back()}
        rightActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-9 rounded-lg bg-bg-elevated"
              >
                <IconMoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isArchived && (
                <>
                  <DropdownMenuItem onClick={() => router.push(ROUTES.achievementEdit(params.id as string))}>
                    <IconEdit size={16} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsArchiveOpen(true)}>
                    <IconArchive size={16} className="mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AsyncBoundary
          loading={isLoading}
          loadingFallback={<AchievementDetailSkeleton />}
        >
          <div className={cn(
            'px-screen py-4 motion-screen-push',
            showSuccess && 'motion-success'
          )}>
            {/* Title & Badge */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                {/* Completed checkmark */}
                {isCompleted && (
                  <div className={cn(
                    'inline-flex items-center justify-center size-6 rounded-md bg-success mb-2',
                    showSuccess && 'motion-checkmark'
                  )}>
                    <IconCheck size={14} className="text-success-foreground" />
                  </div>
                )}
                
                <h1 className={cn(
                  'text-heading font-semibold',
                  isCompleted && 'text-secondary line-through'
                )}>
                  {achievement.title}
                </h1>
              </div>
              
              <AchievnoBadge variant={displayBadgeVariant} size="md">
                {achievement.isOverdue ? STATUS_LABELS.achievement.overdue : STATUS_LABELS.achievement[achievement.status]}
              </AchievnoBadge>
            </div>

            {/* Progress Card */}
            <div className="bg-bg-elevated rounded-xl border border-border-subtle p-4 mb-4">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-title font-semibold">
                  {achievement.currentValue}
                  <span className="text-secondary font-normal"> / {achievement.targetValue}</span>
                </span>
                <span className="text-label text-tertiary">{achievement.unit}</span>
              </div>
              
              <AchievnoProgress
                value={achievement.currentValue}
                max={achievement.targetValue}
                color={isCompleted ? 'success' : 'primary'}
                size="md"
                className="motion-progress"
              />
              
              <p className="text-label text-tertiary mt-2">
                {metaString}
              </p>
            </div>

            {/* Description - max 1 line preview, expandable */}
            {achievement.description && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-left w-full"
                >
                  <p className={cn(
                    'text-body text-secondary',
                    !isDescriptionExpanded && 'line-clamp-1'
                  )}>
                    {achievement.description}
                  </p>
                  {achievement.description.length > 60 && (
                    <span className="text-label text-primary mt-1 inline-block">
                      {isDescriptionExpanded ? 'Show less' : 'Show more'}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Dates */}
            <div className="space-y-1 text-label text-tertiary">
              <p>Created {formatTimeAgo(achievement.createdAt)}</p>
              {achievement.completedAt && (
                <p>Completed {formatTimeAgo(achievement.completedAt)}</p>
              )}
            </div>
          </div>
        </AsyncBoundary>
      </div>

      {/* Bottom Actions - Anchored */}
      {!isArchived && (
        <div className="sticky bottom-0 bg-bg-base border-t border-border-subtle px-screen py-4 safe-area-bottom">
          <div className="flex gap-3">
            {!isCompleted && (
              <>
                <Button
                  onClick={() => setIsLogSheetOpen(true)}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
                >
                  <IconPlus size={18} className="mr-2" />
                  Log Progress
                </Button>
                <Button
                  onClick={() => setIsCompleteOpen(true)}
                  variant="ghost"
                  className="h-12 px-4 rounded-xl text-secondary"
                >
                  <IconCheck size={18} className="mr-1" />
                  Complete
                </Button>
              </>
            )}
            {isCompleted && (
              <Button
                onClick={() => setIsArchiveOpen(true)}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                <IconArchive size={18} className="mr-2" />
                Archive
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Log Progress Sheet */}
      <LogProgressSheet
        open={isLogSheetOpen}
        onOpenChange={setIsLogSheetOpen}
        achievement={achievement}
        onLogProgress={handleLogProgress}
        onMarkComplete={handleMarkComplete}
      />

      {/* Modals */}
      <ConfirmModal
        open={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        title="Mark as complete?"
        description="You can still edit this achievement after marking complete."
        confirmLabel="Complete"
        onConfirm={handleComplete}
      />

      <ArchiveAchievementModal
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        onConfirm={handleArchive}
      />

      <DeleteAchievementModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  )
}
