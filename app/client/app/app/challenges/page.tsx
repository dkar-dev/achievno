'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { AchievnoProgress } from '@/components/achievno/progress'
import { ListError } from '@/components/achievno/loading-states'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { type Challenge } from '@/lib/achievno/api/challenges'
import { CHALLENGES_USE_MOCKS, useChallenges } from '@/lib/achievno/challenges/use-challenges'
import { IconPlus, IconTrophy } from '@/lib/achievno/icons'
import { ROUTES } from '@/lib/achievno/constants'

export default function ChallengesPage() {
  const router = useRouter()
  const auth = useAuth()
  const challenges = useChallenges({ enabled: auth.isAuthenticated })

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return <CenteredMessage message="Sign-in required." />
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <BackHeader title="Challenges" onBack={() => router.back()} />
      <div className="space-y-4 px-screen py-5">
        {CHALLENGES_USE_MOCKS && (
          <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
            Demo challenges preview
          </div>
        )}

        <Button
          type="button"
          onClick={() => router.push(ROUTES.challengeCreate)}
          className="h-12 w-full rounded-xl bg-challenge text-challenge-foreground hover:bg-challenge/90"
        >
          <IconPlus size={18} className="mr-2" />
          New challenge
        </Button>

        {challenges.isLoading ? (
          <div className="rounded-xl border border-border-subtle bg-bg-muted px-4 py-3 text-center text-label text-secondary">
            Loading challenges...
          </div>
        ) : challenges.error ? (
          <ListError message={challenges.error} onRetry={() => void challenges.reload()} />
        ) : challenges.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-subtle px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-challenge/10 text-challenge">
              <IconTrophy size={24} />
            </div>
            <h2 className="text-title font-semibold">No challenges yet</h2>
            <p className="mt-1 text-label text-secondary">Create a personal challenge to start tracking progress.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.items.map((challenge) => (
              <ChallengeRow
                key={challenge.challenge_id}
                challenge={challenge}
                onOpen={() => router.push(ROUTES.challenge(challenge.challenge_id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ChallengeRow({ challenge, onOpen }: { challenge: Challenge; onOpen: () => void }) {
  const current = 0
  const target = challenge.target_value ?? 1

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border border-border-subtle bg-bg-elevated p-4 text-left transition-colors hover:bg-bg-muted"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-title font-semibold">{challenge.title}</h2>
          {challenge.description && (
            <p className="mt-1 line-clamp-2 text-label text-secondary">{challenge.description}</p>
          )}
        </div>
        <span className="rounded-full bg-challenge/10 px-2 py-1 text-caption font-medium text-challenge">
          {challenge.status}
        </span>
      </div>
      <AchievnoProgress value={current} max={target} color="challenge" size="md" />
      <p className="mt-2 text-caption text-tertiary">
        {challenge.participant_count} participant{challenge.participant_count === 1 ? '' : 's'}
        {challenge.target_value ? ` · target ${challenge.target_value} ${challenge.unit_label ?? ''}` : ''}
      </p>
    </button>
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
