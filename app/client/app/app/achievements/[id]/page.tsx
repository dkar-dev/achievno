'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { AchievnoBadge, getAchievementBadgeVariant } from '@/components/achievno/badge'
import { AchievnoProgress } from '@/components/achievno/progress'
import { AchievementDetailSkeleton } from '@/components/achievno/skeleton'
import { ListError, LoadingButton } from '@/components/achievno/loading-states'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { achievementsApi, type PersonalAchievement } from '@/lib/achievno/api/achievements'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import {
  PERSONAL_ACHIEVEMENTS_USE_MOCKS,
} from '@/lib/achievno/achievements/use-personal-achievements'
import { useAchievementDetail } from '@/lib/achievno/achievements/use-achievement-detail'
import { toUiAchievement } from '@/lib/achievno/achievements/format'
import { IconArchive, IconCheck, IconPlus } from '@/lib/achievno/icons'
import { ROUTES, STATUS_LABELS } from '@/lib/achievno/constants'

const DEMO_ACHIEVEMENT: PersonalAchievement = {
  achievement_id: 'demo-progress-achievement',
  owner_context_id: 'demo-personal',
  base_type: 'progress',
  assignment_mode: 'self',
  title: 'Read 10 Books',
  short_definition: 'Complete 10 books this quarter',
  description: 'Focus on technical and personal development topics.',
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
}

function apiStatusLabel(status: PersonalAchievement['status']) {
  if (status === 'in_progress' || status === 'in_review') return STATUS_LABELS.achievement.active
  return STATUS_LABELS.achievement[status]
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AchievementDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const auth = useAuth()
  const achievementId = params.id
  const [isCompleting, setIsCompleting] = React.useState(false)
  const [isArchiving, setIsArchiving] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const detail = useAchievementDetail({
    achievementId,
    enabled: auth.isAuthenticated,
    mockAchievement: DEMO_ACHIEVEMENT,
  })

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  const achievement = detail.achievement
  const uiAchievement = achievement ? toUiAchievement(achievement) : null
  const isCompleted = achievement?.status === 'completed'
  const isArchived = achievement?.status === 'archived'

  const handleComplete = async () => {
    if (!achievement) return
    setActionError(null)
    setIsCompleting(true)
    try {
      if (!PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
        await achievementsApi.complete(achievement.achievement_id)
        await detail.reload()
      }
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Achievement could not be completed.'))
    } finally {
      setIsCompleting(false)
    }
  }

  const handleArchive = async () => {
    if (!achievement) return
    setActionError(null)
    setIsArchiving(true)
    try {
      if (!PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
        await achievementsApi.archive(achievement.achievement_id)
      }
      router.push(ROUTES.personalWorkspace)
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Achievement could not be archived.'))
    } finally {
      setIsArchiving(false)
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
      <BackHeader title="" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto">
        {detail.isLoading ? (
          <AchievementDetailSkeleton />
        ) : detail.error || !achievement || !uiAchievement ? (
          <ListError message={detail.error || 'Achievement could not be loaded.'} onRetry={() => void detail.reload()} />
        ) : (
          <div className="space-y-5 px-screen py-4 motion-screen-push">
            {PERSONAL_ACHIEVEMENTS_USE_MOCKS && (
              <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
                Demo achievement detail
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-heading font-semibold">{achievement.title}</h1>
                <p className="mt-1 text-body text-secondary">{achievement.short_definition}</p>
              </div>
              <AchievnoBadge
                variant={getAchievementBadgeVariant(uiAchievement.status)}
                size="md"
              >
                {apiStatusLabel(achievement.status)}
              </AchievnoBadge>
            </div>

            <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-title font-semibold">
                  {uiAchievement.currentValue}
                  <span className="font-normal text-secondary"> / {uiAchievement.targetValue}</span>
                </span>
                <span className="text-label text-tertiary">{uiAchievement.unit}</span>
              </div>
              <AchievnoProgress
                value={uiAchievement.currentValue}
                max={uiAchievement.targetValue}
                color={isCompleted ? 'success' : 'primary'}
                size="md"
              />
              <p className="mt-2 text-label text-tertiary">
                {achievement.base_type === 'done' ? 'Done achievement' : 'Progress achievement'}
                {achievement.deadline_at ? ` · due ${formatDate(achievement.deadline_at)}` : ''}
              </p>
            </div>

            {achievement.description && (
              <p className="text-body text-secondary">{achievement.description}</p>
            )}

            {actionError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
                {actionError}
              </div>
            )}

            <section className="space-y-2">
              <h2 className="text-caption font-semibold uppercase text-tertiary">Recent logs</h2>
              {detail.recentLogs.length > 0 ? (
                <div className="space-y-2">
                  {detail.recentLogs.map((log) => (
                    <div key={log.achievement_log_id} className="rounded-xl border border-border-subtle px-3 py-2">
                      <p className="text-label font-medium">{log.action_type}</p>
                      <p className="text-caption text-secondary">
                        {log.delta_value ?? 0} · result {log.resulting_value ?? 0}
                        {log.note_text ? ` · ${log.note_text}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border-subtle px-4 py-3 text-sm text-tertiary">
                  No progress logs yet.
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {achievement && !isArchived && (
        <div className="sticky bottom-0 border-t border-border-subtle bg-bg-base px-screen py-4 safe-area-bottom">
          <div className="flex gap-3">
            {!isCompleted && (
              <>
                <Button
                  onClick={() => router.push(ROUTES.achievementProgress(achievement.achievement_id))}
                  className="h-12 flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <IconPlus size={18} className="mr-2" />
                  Progress
                </Button>
                <LoadingButton
                  loading={isCompleting}
                  onClick={() => void handleComplete()}
                  variant="ghost"
                  className="h-12 rounded-xl px-4 text-secondary"
                >
                  <IconCheck size={18} className="mr-1" />
                  Complete
                </LoadingButton>
              </>
            )}
            {isCompleted && (
              <LoadingButton
                loading={isArchiving}
                onClick={() => void handleArchive()}
                variant="outline"
                className="h-12 flex-1 rounded-xl"
              >
                <IconArchive size={18} className="mr-2" />
                Archive
              </LoadingButton>
            )}
          </div>
        </div>
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
