'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ACHIEVEMENT DETAIL
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/achievements/:id
 * View achievement details, progress, and actions
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { AchievnoBadge, getAchievementBadgeVariant } from '@/components/achievno/badge'
import { AchievnoProgress } from '@/components/achievno/progress'
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
  IconClock,
  IconCheck,
} from '@/lib/achievno/icons'
import { ROUTES, STATUS_LABELS } from '@/lib/achievno/constants'
import type { Achievement } from '@/lib/achievno/types'

// Demo achievement data
const DEMO_ACHIEVEMENT: Achievement = {
  id: 'ach-1',
  title: 'Read 10 Books',
  description: 'Complete 10 books this quarter. Focus on technical and personal development topics.',
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

export default function AchievementDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [achievement] = React.useState<Achievement>(DEMO_ACHIEVEMENT)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false)

  const isCompleted = achievement.status === 'completed'
  const isArchived = achievement.status === 'archived'
  const badgeVariant = achievement.isOverdue ? 'overdue' : getAchievementBadgeVariant(achievement.status)

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleLogProgress = () => {
    router.push(ROUTES.achievementProgress(params.id as string))
  }

  const handleEdit = () => {
    router.push(ROUTES.achievementEdit(params.id as string))
  }

  const handleComplete = () => {
    setIsCompleteOpen(false)
    router.push(ROUTES.personalWorkspace)
  }

  const handleArchive = () => {
    setIsArchiveOpen(false)
    router.push(ROUTES.personalWorkspace)
  }

  const handleDelete = () => {
    setIsDeleteOpen(false)
    router.push(ROUTES.personalWorkspace)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <BackHeader
        title=""
        onBack={() => router.back()}
        rightActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-9 rounded-lg bg-background-elevated"
              >
                <IconMoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isArchived && (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
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
        <div className="px-screen py-6">
          {/* Header section */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-display">{achievement.title}</h1>
              <AchievnoBadge variant={badgeVariant} size="md">
                {achievement.isOverdue ? 'Overdue' : STATUS_LABELS.achievement[achievement.status]}
              </AchievnoBadge>
            </div>
            
            {achievement.description && (
              <p className="text-body text-secondary">{achievement.description}</p>
            )}
          </div>

          {/* Progress card */}
          <div className="bg-background-surface rounded-2xl border border-border p-4 mb-6">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-heading font-semibold">
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
            />
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-label text-tertiary">
                {achievement.progressPercent}% complete
              </span>
              <span className="text-label text-tertiary">
                {achievement.targetValue - achievement.currentValue} left
              </span>
            </div>
          </div>

          {/* Due date */}
          {achievement.dueDate && (
            <div className="flex items-center gap-3 px-4 py-3 bg-background-surface rounded-xl border border-border mb-6">
              <IconClock size={20} className={achievement.isOverdue ? 'text-destructive' : 'text-tertiary'} />
              <div>
                <p className="text-label text-tertiary">Due date</p>
                <p className={`text-title ${achievement.isOverdue ? 'text-destructive' : ''}`}>
                  {formatDate(achievement.dueDate)}
                </p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2 text-label text-tertiary">
            <p>Created {formatDate(achievement.createdAt)}</p>
            {achievement.completedAt && <p>Completed {formatDate(achievement.completedAt)}</p>}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      {!isArchived && (
        <div className="px-screen pb-safe-area-bottom py-4 border-t border-border">
          <div className="flex gap-3">
            {!isCompleted && (
              <>
                <Button
                  onClick={handleLogProgress}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
                >
                  <IconPlus size={18} />
                  Log Progress
                </Button>
                <Button
                  onClick={() => setIsCompleteOpen(true)}
                  variant="outline"
                  className="h-12 px-4 rounded-xl border-success/30 bg-success/10 text-success hover:bg-success/20"
                >
                  <IconCheck size={18} />
                  Complete
                </Button>
              </>
            )}
            {isCompleted && (
              <Button
                onClick={() => setIsArchiveOpen(true)}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-border-strong bg-background-elevated"
              >
                <IconArchive size={18} />
                Archive
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        title="Mark as Complete?"
        description="Congratulations! You can still log additional progress after marking complete."
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
