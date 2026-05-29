'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { LoadingButton } from '@/components/achievno/loading-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { achievementsApi, type AchievementBaseType } from '@/lib/achievno/api/achievements'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { PERSONAL_ACHIEVEMENTS_USE_MOCKS } from '@/lib/achievno/achievements/use-personal-achievements'
import { ROUTES } from '@/lib/achievno/constants'

export default function CreateAchievementPage() {
  const router = useRouter()
  const auth = useAuth()
  const [baseType, setBaseType] = React.useState<AchievementBaseType>('done')
  const [title, setTitle] = React.useState('')
  const [shortDefinition, setShortDefinition] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [progressTarget, setProgressTarget] = React.useState('')
  const [unitLabel, setUnitLabel] = React.useState('')
  const [deadlineDate, setDeadlineDate] = React.useState('')
  const [deadlineTime, setDeadlineTime] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  const canSubmit = title.trim().length >= 2
    && (baseType === 'done' || Number(progressTarget) > 0)

  const buildDeadlineIso = () => {
    if (!deadlineDate) return null
    const localDateTime = deadlineTime ? `${deadlineDate}T${deadlineTime}` : `${deadlineDate}T23:59`
    return new Date(localDateTime).toISOString()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      if (PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
        setSuccess('Demo achievement created.')
        router.push(ROUTES.personalWorkspace)
        return
      }

      const response = await achievementsApi.createPersonal({
        base_type: baseType,
        title: title.trim(),
        short_definition: shortDefinition.trim() || null,
        description: description.trim() || null,
        progress_target: baseType === 'progress' ? progressTarget : null,
        unit_label: unitLabel.trim() || null,
        deadline_at: buildDeadlineIso(),
      })
      setSuccess('Achievement created.')
      router.push(ROUTES.achievement(response.achievement.achievement_id))
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'Achievement could not be created.'))
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
      <BackHeader title="New achievement" onBack={() => router.back()} />
      <form onSubmit={handleSubmit} className="space-y-4 px-screen py-5">
        {PERSONAL_ACHIEVEMENTS_USE_MOCKS && (
          <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
            Demo create preview
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={baseType === 'done' ? 'default' : 'outline'}
            onClick={() => setBaseType('done')}
          >
            Done
          </Button>
          <Button
            type="button"
            variant={baseType === 'progress' ? 'default' : 'outline'}
            onClick={() => setBaseType('progress')}
          >
            Progress
          </Button>
        </div>

        <Field label="Title" required>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} />
        </Field>

        <Field label="Short name" hint="Optional">
          <Input
            value={shortDefinition}
            onChange={(event) => setShortDefinition(event.target.value)}
            maxLength={255}
            placeholder="Leave empty to use title"
          />
        </Field>

        <Field label="Description">
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
        </Field>

        {baseType === 'progress' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target" required>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={progressTarget}
                onChange={(event) => setProgressTarget(event.target.value)}
              />
            </Field>
            <Field label="Unit">
              <Input value={unitLabel} onChange={(event) => setUnitLabel(event.target.value)} maxLength={64} />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Deadline date" hint="Optional">
            <Input
              type="date"
              value={deadlineDate}
              onChange={(event) => setDeadlineDate(event.target.value)}
            />
          </Field>
          <Field label="Deadline time" hint="Optional">
            <Input
              type="time"
              value={deadlineTime}
              onChange={(event) => setDeadlineTime(event.target.value)}
              disabled={!deadlineDate}
            />
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

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between gap-2 text-label text-secondary">
        <span>{label}{required ? ' *' : ''}</span>
        {hint && <span className="text-caption text-tertiary">{hint}</span>}
      </span>
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
