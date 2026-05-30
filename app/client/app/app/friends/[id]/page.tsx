'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { AchievementCard } from '@/components/achievno/achievement-card'
import { ListError, LoadingButton } from '@/components/achievno/loading-states'
import {
  AchievnoIcon,
  IconChevronRight,
  IconPlus,
  IconTarget,
  IconTrophy,
  IconUsers,
} from '@/lib/achievno/icons'
import type { AchievementBaseType } from '@/lib/achievno/api/achievements'
import { friendsApi, type FriendDetailResponse } from '@/lib/achievno/api/friends'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { toUiAchievement } from '@/lib/achievno/achievements/format'
import { ROUTES } from '@/lib/achievno/constants'

function buildDeadlineIso(deadlineDate: string, deadlineTime: string) {
  if (!deadlineDate) return null
  const localDateTime = deadlineTime ? `${deadlineDate}T${deadlineTime}` : `${deadlineDate}T23:59`
  return new Date(localDateTime).toISOString()
}

export default function FriendPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const auth = useAuth()
  const friendConnectionId = params.id
  const [data, setData] = React.useState<FriendDetailResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadFriend = React.useCallback(async () => {
    if (!auth.isAuthenticated) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      setData(await friendsApi.detail(friendConnectionId))
    } catch (caughtError) {
      setData(null)
      setError(getApiErrorMessage(caughtError, 'Friend relation could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [auth.isAuthenticated, friendConnectionId])

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  React.useEffect(() => {
    void loadFriend()
  }, [loadFriend])

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return <CenteredMessage message="Sign-in required." />
  }

  if (isLoading) {
    return <CenteredMessage message="Loading friend..." />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg-base px-screen py-6">
        <ListError message={error || 'Friend relation could not be loaded.'} onRetry={() => void loadFriend()} />
      </div>
    )
  }

  const { relation, achievements } = data
  const activeAchievements = achievements.filter((achievement) => achievement.status !== 'completed' && achievement.status !== 'archived')

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <div className="safe-area-top border-b border-border-subtle px-screen py-3">
        <div className="relative flex min-h-11 items-center justify-center">
          <button
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated"
            onClick={() => router.push(ROUTES.friends)}
            aria-label="Back"
          >
            <AchievnoIcon icon={IconChevronRight} className="rotate-180" />
          </button>
          <div className="inline-flex h-11 items-center rounded-full border border-border-subtle bg-bg-elevated px-5">
            <div className="text-center">
              <p className="text-lg font-semibold leading-none">{relation.profile.display_name}</p>
              <p className="text-xs text-secondary">1-on-1 relation</p>
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <AchievnoAvatar name={relation.profile.display_name} src={relation.profile.avatar_url ?? undefined} size="lg" variant="rounded" />
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-5 px-screen py-5">
        <section className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
          <div className="flex items-start gap-3">
            <AchievnoAvatar name={relation.profile.display_name} src={relation.profile.avatar_url ?? undefined} size="lg" variant="rounded" />
            <div className="min-w-0 flex-1">
              <h1 className="text-heading font-semibold">{relation.profile.display_name}</h1>
              <p className="mt-1 text-label text-secondary">
                {relation.profile.username ? `@${relation.profile.username}` : relation.status}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2">
          <StatTile icon={IconUsers} value={1} label="Relation" />
          <StatTile icon={IconTarget} value={activeAchievements.length} label="Active" />
          <StatTile icon={IconTrophy} value={relation.completed_achievements_count} label="Done" />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">Shared</p>
              <h2 className="text-title font-semibold">1-on-1 achievements</h2>
            </div>
          </div>
          <FriendAchievementForm
            friendConnectionId={relation.friend_connection_id}
            onCreated={async (achievementId) => {
              await loadFriend()
              router.push(ROUTES.achievement(achievementId))
            }}
          />
          {achievements.length > 0 ? (
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.achievement_id}
                  achievement={{ ...toUiAchievement(achievement), spaceType: 'friend' }}
                  variant="compact"
                  onPress={() => router.push(ROUTES.achievement(achievement.achievement_id))}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel message="No shared achievements yet." />
          )}
        </section>
      </main>
    </div>
  )
}

function FriendAchievementForm({
  friendConnectionId,
  onCreated,
}: {
  friendConnectionId: string
  onCreated: (achievementId: string) => Promise<void>
}) {
  const [showCreate, setShowCreate] = React.useState(false)
  const [baseType, setBaseType] = React.useState<AchievementBaseType>('done')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [target, setTarget] = React.useState('')
  const [unit, setUnit] = React.useState('')
  const [deadlineDate, setDeadlineDate] = React.useState('')
  const [deadlineTime, setDeadlineTime] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canSubmit = title.trim().length >= 2 && (baseType === 'done' || Number(target) > 0)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await friendsApi.createAchievement(friendConnectionId, {
        base_type: baseType,
        title: title.trim(),
        short_definition: null,
        description: description.trim() || null,
        progress_target: baseType === 'progress' ? target : null,
        unit_label: unit.trim() || null,
        deadline_at: buildDeadlineIso(deadlineDate, deadlineTime),
      })
      setTitle('')
      setDescription('')
      setTarget('')
      setUnit('')
      setDeadlineDate('')
      setDeadlineTime('')
      setShowCreate(false)
      await onCreated(response.achievement.achievement_id)
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'Shared achievement could not be created.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showCreate) {
    return (
      <Button className="w-full" onClick={() => setShowCreate(true)}>
        <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
        New shared achievement
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border-subtle bg-bg-elevated p-4">
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant={baseType === 'done' ? 'default' : 'outline'} onClick={() => setBaseType('done')}>
          Done
        </Button>
        <Button type="button" variant={baseType === 'progress' ? 'default' : 'outline'} onClick={() => setBaseType('progress')}>
          Progress
        </Button>
      </div>
      <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} placeholder="Achievement title" />
      <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Description" />
      {baseType === 'progress' && (
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" min="0.01" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Target" />
          <Input value={unit} onChange={(event) => setUnit(event.target.value)} maxLength={64} placeholder="Unit" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} />
        <Input type="time" value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)} disabled={!deadlineDate} />
      </div>
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
          Cancel
        </Button>
        <LoadingButton loading={isSubmitting} disabled={!canSubmit}>
          Create
        </LoadingButton>
      </div>
    </form>
  )
}

function StatTile({ icon, value, label }: { icon: typeof IconUsers; value: number; label: string }) {
  return (
    <div className="flex min-h-[72px] flex-col items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated p-3 text-center">
      <AchievnoIcon icon={icon} size="sm" className="mb-1 text-primary" />
      <div className="text-title font-semibold text-primary-text">{value}</div>
      <div className="w-full truncate text-caption text-tertiary">{label}</div>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle bg-bg-muted px-4 py-3 text-sm text-tertiary">
      {message}
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
