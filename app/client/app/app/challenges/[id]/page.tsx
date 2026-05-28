'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { AchievnoProgress } from '@/components/achievno/progress'
import { ListError, LoadingButton } from '@/components/achievno/loading-states'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { challengesApi } from '@/lib/achievno/api/challenges'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useChallengeDetail } from '@/lib/achievno/challenges/use-challenge-detail'
import { CHALLENGES_USE_MOCKS } from '@/lib/achievno/challenges/use-challenges'
import { IconCheck, IconPlus, IconTrophy } from '@/lib/achievno/icons'
import { ROUTES } from '@/lib/achievno/constants'

export default function ChallengeDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const auth = useAuth()
  const challengeId = params.id
  const detail = useChallengeDetail({ challengeId, enabled: auth.isAuthenticated })
  const [deltaValue, setDeltaValue] = React.useState('1')
  const [noteText, setNoteText] = React.useState('')
  const [isJoining, setIsJoining] = React.useState(false)
  const [isProgressing, setIsProgressing] = React.useState(false)
  const [isCompleting, setIsCompleting] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  const challenge = detail.challenge
  const participant = detail.participant
  const targetValue = challenge?.target_value ?? 1
  const progressValue = participant?.progress_value ?? 0
  const isCompleted = participant?.status === 'completed' || challenge?.status === 'completed'

  const handleJoin = async () => {
    if (!challenge) return
    setActionError(null)
    setSuccess(null)
    setIsJoining(true)
    try {
      if (!CHALLENGES_USE_MOCKS) {
        await challengesApi.join(challenge.challenge_id)
        await detail.reload()
      }
      setSuccess('Challenge joined.')
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Challenge could not be joined.'))
    } finally {
      setIsJoining(false)
    }
  }

  const handleProgress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!challenge || Number(deltaValue) === 0) return
    setActionError(null)
    setSuccess(null)
    setIsProgressing(true)
    try {
      if (!CHALLENGES_USE_MOCKS) {
        await challengesApi.progress(challenge.challenge_id, {
          delta_value: deltaValue,
          note_text: noteText.trim() || null,
        })
        await detail.reload()
      }
      setNoteText('')
      setSuccess('Progress saved.')
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Progress could not be saved.'))
    } finally {
      setIsProgressing(false)
    }
  }

  const handleComplete = async () => {
    if (!challenge) return
    setActionError(null)
    setSuccess(null)
    setIsCompleting(true)
    try {
      if (!CHALLENGES_USE_MOCKS) {
        await challengesApi.complete(challenge.challenge_id, { note_text: noteText.trim() || null })
        await detail.reload()
      }
      setSuccess('Challenge completed.')
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Challenge could not be completed.'))
    } finally {
      setIsCompleting(false)
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
      <BackHeader title="Challenge" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto px-screen py-5">
        {detail.isLoading ? (
          <CenteredBlock message="Loading challenge..." />
        ) : detail.error || !challenge ? (
          <ListError message={detail.error || 'Challenge could not be loaded.'} onRetry={() => void detail.reload()} />
        ) : (
          <div className="space-y-5">
            {CHALLENGES_USE_MOCKS && (
              <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
                Demo challenge detail
              </div>
            )}

            <section className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-heading font-semibold">{challenge.title}</h1>
                  {challenge.description && <p className="mt-1 text-body text-secondary">{challenge.description}</p>}
                </div>
                <span className="rounded-full bg-challenge/10 px-2 py-1 text-caption font-medium text-challenge">
                  {challenge.status}
                </span>
              </div>
              <p className="text-caption text-tertiary">
                {challenge.participant_count} participant{challenge.participant_count === 1 ? '' : 's'}
              </p>
            </section>

            <section className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-caption font-semibold uppercase text-tertiary">Current progress</p>
                  <p className="text-title font-semibold">
                    {progressValue}
                    <span className="font-normal text-secondary"> / {targetValue}</span>
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-challenge/10 text-challenge">
                  <IconTrophy size={22} />
                </div>
              </div>
              <AchievnoProgress value={progressValue} max={targetValue} color="challenge" size="md" />
              <p className="mt-2 text-caption text-tertiary">{challenge.unit_label ?? 'progress units'}</p>
            </section>

            {!participant ? (
              <LoadingButton
                loading={isJoining}
                onClick={() => void handleJoin()}
                className="h-12 w-full rounded-xl bg-challenge text-challenge-foreground hover:bg-challenge/90"
              >
                <IconPlus size={18} className="mr-2" />
                Join challenge
              </LoadingButton>
            ) : (
              <form onSubmit={handleProgress} className="space-y-3">
                <div className="grid grid-cols-[110px_1fr] gap-3">
                  <label className="block space-y-1">
                    <span className="text-label text-secondary">Delta</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={deltaValue}
                      disabled={isCompleted}
                      onChange={(event) => setDeltaValue(event.target.value)}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-label text-secondary">Note</span>
                    <Textarea
                      value={noteText}
                      disabled={isCompleted}
                      onChange={(event) => setNoteText(event.target.value)}
                      rows={2}
                    />
                  </label>
                </div>
                <div className="flex gap-3">
                  <LoadingButton
                    loading={isProgressing}
                    disabled={isCompleted || Number(deltaValue) === 0}
                    className="h-12 flex-1 rounded-xl bg-challenge text-challenge-foreground hover:bg-challenge/90"
                  >
                    <IconPlus size={18} className="mr-2" />
                    Save progress
                  </LoadingButton>
                  {!isCompleted && (
                    <LoadingButton
                      type="button"
                      loading={isCompleting}
                      onClick={() => void handleComplete()}
                      variant="outline"
                      className="h-12 rounded-xl"
                    >
                      <IconCheck size={18} className="mr-1" />
                      Complete
                    </LoadingButton>
                  )}
                </div>
              </form>
            )}

            {actionError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
                {actionError}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-success/20 bg-success/5 px-3 py-2 text-label text-success">
                {success}
              </div>
            )}

            <section className="space-y-2">
              <h2 className="text-caption font-semibold uppercase text-tertiary">Recent events</h2>
              {detail.recentCompletionEvents.length > 0 ? (
                <div className="space-y-2">
                  {detail.recentCompletionEvents.map((event) => (
                    <div
                      key={event.challenge_completion_event_id}
                      className="rounded-xl border border-border-subtle px-3 py-2"
                    >
                      <p className="text-label font-medium">{event.delta_value ?? 0}</p>
                      {event.note_text && <p className="text-caption text-secondary">{event.note_text}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border-subtle px-4 py-3 text-sm text-tertiary">
                  No challenge events yet.
                </div>
              )}
            </section>
          </div>
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
