'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { ListError, LoadingButton } from '@/components/achievno/loading-states'
import {
  AchievnoIcon,
  IconChevronRight,
  IconCheck,
  IconShare,
  IconUserPlus,
  IconUsers,
} from '@/lib/achievno/icons'
import { friendsApi, type FriendInvite, type FriendRelation } from '@/lib/achievno/api/friends'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { ROUTES } from '@/lib/achievno/constants'

export default function FriendsPage() {
  const router = useRouter()
  const auth = useAuth()
  const [items, setItems] = React.useState<FriendRelation[]>([])
  const [search, setSearch] = React.useState('')
  const [invite, setInvite] = React.useState<FriendInvite | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreatingInvite, setIsCreatingInvite] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [inviteError, setInviteError] = React.useState<string | null>(null)

  const loadFriends = React.useCallback(async () => {
    if (!auth.isAuthenticated) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await friendsApi.list({ limit: 100 })
      setItems(response.items)
    } catch (caughtError) {
      setItems([])
      setError(getApiErrorMessage(caughtError, 'Friends could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [auth.isAuthenticated])

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  React.useEffect(() => {
    void loadFriends()
  }, [loadFriends])

  const createInvite = async () => {
    setIsCreatingInvite(true)
    setCopied(false)
    setInviteError(null)
    try {
      const response = await friendsApi.createInvite()
      setInvite(response.invite)
    } catch (caughtError) {
      setInvite(null)
      setInviteError(getApiErrorMessage(caughtError, 'Invite could not be created.'))
    } finally {
      setIsCreatingInvite(false)
    }
  }

  const copyInvite = async () => {
    const value = invite?.url || invite?.token
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return <CenteredMessage message="Sign-in required." />
  }

  const filteredItems = items.filter((item) => {
    const searchText = search.trim().toLowerCase()
    if (!searchText) return true
    return [
      item.profile.display_name,
      item.profile.username ?? '',
    ].some((value) => value.toLowerCase().includes(searchText))
  })

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <div className="safe-area-top border-b border-border-subtle px-screen py-3">
        <div className="relative flex min-h-11 items-center justify-center">
          <button
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated"
            onClick={() => router.push(ROUTES.rootShell())}
            aria-label="Back"
          >
            <AchievnoIcon icon={IconChevronRight} className="rotate-180" />
          </button>
          <div className="inline-flex h-11 items-center rounded-full border border-border-subtle bg-bg-elevated px-5">
            <div className="text-center">
              <p className="text-lg font-semibold leading-none">Friends</p>
              <p className="text-xs text-secondary">{items.length} accepted relations</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-5 px-screen py-5">
        <section className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <AchievnoIcon icon={IconUserPlus} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-title font-semibold">Invite a friend</h1>
              <p className="mt-1 text-label text-secondary">
                Generate a link for a real persisted 1-on-1 relation.
              </p>
            </div>
          </div>

          <LoadingButton className="mt-4 w-full" loading={isCreatingInvite} onClick={createInvite}>
            <AchievnoIcon icon={IconShare} size="sm" className="mr-1" />
            Create invite
          </LoadingButton>

          {invite && (
            <div className="mt-3 space-y-2 rounded-xl border border-border-subtle bg-bg-elevated p-3">
              <p className="text-caption font-semibold uppercase tracking-[0.18em] text-tertiary">
                Invite link
              </p>
              <div className="break-all rounded-lg bg-bg-muted px-3 py-2 text-sm text-secondary">
                {invite.url || invite.token}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={copyInvite}>
                  <AchievnoIcon icon={copied ? IconCheck : IconShare} size="sm" className="mr-1" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(ROUTES.invite(invite.token))}>
                  Open
                </Button>
              </div>
            </div>
          )}

          {inviteError && (
            <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
              {inviteError}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.24em] text-tertiary">Accepted</p>
              <h2 className="text-title font-semibold">1-on-1 relations</h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-bg-muted text-secondary">
              <AchievnoIcon icon={IconUsers} size="sm" />
            </div>
          </div>

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search friends"
            className="h-10 rounded-full"
          />

          {isLoading && <CenteredPanel message="Loading friends..." />}
          {error && <ListError message={error} onRetry={() => void loadFriends()} />}
          {!isLoading && !error && filteredItems.length === 0 && (
            <CenteredPanel message={search ? 'No friends found.' : 'No accepted friends yet. Create an invite to start.'} />
          )}
          {!isLoading && !error && filteredItems.length > 0 && (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <button
                  key={item.friend_connection_id}
                  type="button"
                  onClick={() => router.push(ROUTES.friend(item.friend_connection_id))}
                  className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-bg-elevated p-3 text-left"
                >
                  <AchievnoAvatar name={item.profile.display_name} src={item.profile.avatar_url ?? undefined} size="md" variant="rounded" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label font-medium">{item.profile.display_name}</p>
                    <p className="truncate text-caption text-tertiary">
                      {item.profile.username ? `@${item.profile.username}` : item.status}
                    </p>
                  </div>
                  <div className="text-right text-caption text-tertiary">
                    <p>{item.active_achievements_count} active</p>
                    <p>{item.completed_achievements_count} done</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function CenteredPanel({ message }: { message: string }) {
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
