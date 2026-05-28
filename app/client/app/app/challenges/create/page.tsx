'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { LoadingButton } from '@/components/achievno/loading-states'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { challengesApi } from '@/lib/achievno/api/challenges'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { CHALLENGES_USE_MOCKS } from '@/lib/achievno/challenges/use-challenges'
import { ROUTES } from '@/lib/achievno/constants'

export default function CreateChallengePage() {
  const router = useRouter()
  const auth = useAuth()
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [goalTitle, setGoalTitle] = React.useState('')
  const [targetValue, setTargetValue] = React.useState('')
  const [unitLabel, setUnitLabel] = React.useState('')
  const [startsAt, setStartsAt] = React.useState('')
  const [endsAt, setEndsAt] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  const canSubmit = title.trim().length >= 2 && (!targetValue || Number(targetValue) > 0)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      if (CHALLENGES_USE_MOCKS) {
        setSuccess('Demo challenge created.')
        router.push(ROUTES.challenge('demo-challenge'))
        return
      }

      const response = await challengesApi.create({
        title: title.trim(),
        description: description.trim() || null,
        goal_title: goalTitle.trim() || null,
        target_value: targetValue ? targetValue : null,
        unit_label: unitLabel.trim() || null,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      })
      setSuccess('Challenge created.')
      router.push(ROUTES.challenge(response.challenge.challenge_id))
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'Challenge could not be created.'))
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
      <BackHeader title="New challenge" onBack={() => router.back()} />
      <form onSubmit={handleSubmit} className="space-y-4 px-screen py-5">
        {CHALLENGES_USE_MOCKS && (
          <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
            Demo create preview
          </div>
        )}

        <Field label="Title">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} />
        </Field>

        <Field label="Goal">
          <Input value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} maxLength={255} />
        </Field>

        <Field label="Description">
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Target">
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
            />
          </Field>
          <Field label="Unit">
            <Input value={unitLabel} onChange={(event) => setUnitLabel(event.target.value)} maxLength={64} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts">
            <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          </Field>
          <Field label="Ends">
            <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
          </Field>
        </div>

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
          Create
        </LoadingButton>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-label text-secondary">{label}</span>
      {children}
    </label>
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
