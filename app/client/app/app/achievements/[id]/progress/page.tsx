'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { LoadingButton, ListError } from '@/components/achievno/loading-states'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { achievementsApi, type PersonalAchievement } from '@/lib/achievno/api/achievements'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useAchievementDetail } from '@/lib/achievno/achievements/use-achievement-detail'
import { PERSONAL_ACHIEVEMENTS_USE_MOCKS } from '@/lib/achievno/achievements/use-personal-achievements'
import { ROUTES } from '@/lib/achievno/constants'

const DEMO_ACHIEVEMENT: PersonalAchievement = {
  achievement_id: 'demo-progress-achievement',
  owner_context_id: 'demo-personal',
  base_type: 'progress',
  assignment_mode: 'self',
  title: 'Read 10 Books',
  short_definition: 'Complete 10 books this quarter',
  description: null,
  status: 'in_progress',
  progress_current: 7,
  progress_target: 10,
  unit_label: 'books',
  deadline_at: null,
  completed_at: null,
  archived_at: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: new Date().toISOString(),
  primary_category: null,
  rank: null,
}

export default function AchievementProgressPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const auth = useAuth()
  const achievementId = params.id
  const detail = useAchievementDetail({
    achievementId,
    enabled: auth.isAuthenticated,
    mockAchievement: DEMO_ACHIEVEMENT,
  })
  const [deltaValue, setDeltaValue] = React.useState('1')
  const [noteText, setNoteText] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  const achievement = detail.achievement
  const isDoneType = achievement?.base_type === 'done'
  const canSubmit = isDoneType || Number(deltaValue) !== 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!achievement || !canSubmit) return

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      if (PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
        setSuccess('Demo progress saved.')
        router.push(ROUTES.achievement(achievement.achievement_id))
        return
      }

      if (isDoneType) {
        await achievementsApi.complete(achievement.achievement_id, { note_text: noteText.trim() || null })
      } else {
        await achievementsApi.progress(achievement.achievement_id, {
          delta_value: deltaValue,
          note_text: noteText.trim() || null,
        })
      }
      setSuccess('Progress saved.')
      router.push(ROUTES.achievement(achievement.achievement_id))
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'Progress could not be saved.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return <CenteredMessage message="Sign-in required." />
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <BackHeader title="Log progress" onBack={() => router.back()} />
      <div className="px-screen py-5">
        {detail.error ? (
          <ListError message={detail.error} onRetry={() => void detail.reload()} />
        ) : detail.isLoading || !achievement ? (
          <CenteredBlock message="Loading achievement..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {PERSONAL_ACHIEVEMENTS_USE_MOCKS && (
              <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
                Demo progress preview
              </div>
            )}

            <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
              <h1 className="text-title font-semibold">{achievement.title}</h1>
              <p className="mt-1 text-label text-secondary">
                {achievement.base_type === 'done'
                  ? 'This action completes the achievement.'
                  : `${achievement.progress_current ?? 0} / ${achievement.progress_target ?? 0} ${achievement.unit_label ?? ''}`}
              </p>
            </div>

            {!isDoneType && (
              <label className="block space-y-1">
                <span className="text-label text-secondary">Delta</span>
                <Input
                  type="number"
                  step="0.01"
                  value={deltaValue}
                  onChange={(event) => setDeltaValue(event.target.value)}
                />
              </label>
            )}

            <label className="block space-y-1">
              <span className="text-label text-secondary">Note</span>
              <Textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={4} />
            </label>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-success/20 bg-success/5 px-3 py-2 text-label text-success">
                {success}
              </div>
            )}

            <LoadingButton className="w-full" loading={isSubmitting} disabled={!canSubmit}>
              {isDoneType ? 'Complete' : 'Save progress'}
            </LoadingButton>
          </form>
        )}
      </div>
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

function CenteredBlock({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-muted px-4 py-3 text-center text-label text-secondary">
      {message}
    </div>
  )
}
