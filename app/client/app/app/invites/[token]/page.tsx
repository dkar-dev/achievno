'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { ListError, LoadingButton } from '@/components/achievno/loading-states'
import { AchievnoIcon, IconChevronRight, IconUserPlus } from '@/lib/achievno/icons'
import { friendsApi, type FriendInvite } from '@/lib/achievno/api/friends'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { ROUTES } from '@/lib/achievno/constants'

export default function InviteAcceptPage() {
  const router = useRouter()
  const params = useParams<{ token: string }>()
  const auth = useAuth()
  const token = params.token
  const [invite, setInvite] = React.useState<FriendInvite | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAccepting, setIsAccepting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [acceptError, setAcceptError] = React.useState<string | null>(null)

  const loadInvite = React.useCallback(async () => {
    if (!auth.isAuthenticated) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await friendsApi.inviteDetail(token)
      setInvite(response.invite)
    } catch (caughtError) {
      setInvite(null)
      setError(getApiErrorMessage(caughtError, 'Invite could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [auth.isAuthenticated, token])

  React.useEffect(() => {
    void loadInvite()
  }, [loadInvite])

  const acceptInvite = async () => {
    setIsAccepting(true)
    setAcceptError(null)
    try {
      const response = await friendsApi.acceptInvite(token)
      router.push(ROUTES.friend(response.relation.friend_connection_id))
    } catch (caughtError) {
      setAcceptError(getApiErrorMessage(caughtError, 'Invite could not be accepted.'))
    } finally {
      setIsAccepting(false)
    }
  }

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base px-screen">
        <section className="w-full rounded-xl border border-border-subtle bg-bg-elevated p-4 text-center">
          <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AchievnoIcon icon={IconUserPlus} size="sm" />
          </div>
          <h1 className="text-title font-semibold">Sign in to accept invite</h1>
          <p className="mt-2 text-label text-secondary">After signing in, reopen this invite link.</p>
          <Button className="mt-4 w-full" onClick={() => router.push(ROUTES.signIn)}>
            Sign in
          </Button>
        </section>
      </div>
    )
  }

  if (isLoading) {
    return <CenteredMessage message="Loading invite..." />
  }

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
            <p className="text-lg font-semibold leading-none">Friend invite</p>
          </div>
        </div>
      </div>

      <main className="flex-1 px-screen py-5">
        {error || !invite ? (
          <ListError message={error || 'Invite could not be loaded.'} onRetry={() => void loadInvite()} />
        ) : (
          <section className="space-y-4 rounded-xl border border-border-subtle bg-bg-elevated p-4">
            <div className="flex items-start gap-3">
              <AchievnoAvatar name={invite.sender_profile.display_name} src={invite.sender_profile.avatar_url ?? undefined} size="lg" variant="rounded" />
              <div className="min-w-0 flex-1">
                <h1 className="text-heading font-semibold">{invite.sender_profile.display_name}</h1>
                <p className="mt-1 text-label text-secondary">
                  {invite.sender_profile.username ? `@${invite.sender_profile.username}` : 'wants to connect'}
                </p>
              </div>
            </div>
            <LoadingButton className="w-full" loading={isAccepting} onClick={acceptInvite} disabled={invite.status !== 'pending'}>
              Accept invite
            </LoadingButton>
            {acceptError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
                {acceptError}
              </div>
            )}
            {invite.status !== 'pending' && (
              <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-label text-secondary">
                Invite status: {invite.status}
              </div>
            )}
          </section>
        )}
      </main>
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
