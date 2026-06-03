'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { ListError, LoadingButton } from '@/components/achievno/loading-states'
import { AchievnoIcon, IconChevronRight, IconShare, IconUsers } from '@/lib/achievno/icons'
import { groupsApi, type GroupInvite, type GroupSummary } from '@/lib/achievno/api/groups'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { ROUTES } from '@/lib/achievno/constants'

export default function GroupInviteCreatePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const auth = useAuth()
  const groupId = params.id
  const [group, setGroup] = React.useState<GroupSummary | null>(null)
  const [invite, setInvite] = React.useState<GroupInvite | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreating, setIsCreating] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [createError, setCreateError] = React.useState<string | null>(null)

  const loadGroup = React.useCallback(async () => {
    if (!auth.isAuthenticated) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await groupsApi.detail(groupId)
      setGroup(response.group)
    } catch (caughtError) {
      setGroup(null)
      setError(getApiErrorMessage(caughtError, 'Group could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [auth.isAuthenticated, groupId])

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  React.useEffect(() => {
    void loadGroup()
  }, [loadGroup])

  const createInvite = async () => {
    setIsCreating(true)
    setCreateError(null)
    setCopied(false)
    try {
      const response = await groupsApi.createInvite(groupId)
      setInvite(response.invite)
    } catch (caughtError) {
      setCreateError(getApiErrorMessage(caughtError, 'Group invite could not be created.'))
    } finally {
      setIsCreating(false)
    }
  }

  const copyInvite = async () => {
    const value = invite?.url || invite?.token
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
  }

  if (auth.status === 'loading') {
    return <CenteredMessage message="Checking authentication..." />
  }

  if (!auth.isAuthenticated) {
    return <CenteredMessage message="Sign-in required." />
  }

  if (isLoading) {
    return <CenteredMessage message="Loading group..." />
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <div className="safe-area-top border-b border-border-subtle px-screen py-3">
        <div className="relative flex min-h-11 items-center justify-center">
          <button
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated"
            onClick={() => router.push(ROUTES.group(groupId))}
            aria-label="Back"
          >
            <AchievnoIcon icon={IconChevronRight} className="rotate-180" />
          </button>
          <div className="inline-flex h-11 items-center rounded-full border border-border-subtle bg-bg-elevated px-5">
            <p className="text-lg font-semibold leading-none">Invite members</p>
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-4 px-screen py-5">
        {error || !group ? (
          <ListError message={error || 'Group could not be loaded.'} onRetry={() => void loadGroup()} />
        ) : (
          <>
            <section className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
              <div className="flex items-start gap-3">
                <AchievnoAvatar name={group.title} src={group.avatar_url ?? undefined} size="lg" variant="rounded" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-heading font-semibold">{group.title}</h1>
                  <p className="mt-1 text-label text-secondary">
                    {group.member_count} members · your role: {group.role}
                  </p>
                  <p className="mt-3 text-label text-secondary">
                    Create a real invite link. After accepting, the user becomes a group member and lands on this group.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-border-subtle bg-bg-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <AchievnoIcon icon={IconUsers} size="sm" />
                </div>
                <div>
                  <h2 className="text-title font-semibold">Group invite</h2>
                  <p className="text-label text-secondary">One shareable local link for this team space.</p>
                </div>
              </div>

              <LoadingButton className="w-full" loading={isCreating} onClick={createInvite}>
                <AchievnoIcon icon={IconShare} size="sm" className="mr-1" />
                {invite ? 'Create another invite' : 'Create invite link'}
              </LoadingButton>

              {createError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
                  {createError}
                </div>
              )}

              {invite && (
                <div className="space-y-3 rounded-xl border border-border-subtle bg-bg-muted p-3">
                  <p className="break-all text-label font-medium">{invite.url || invite.token}</p>
                  <p className="text-caption text-tertiary">Token: {invite.token}</p>
                  <Button variant="outline" className="w-full rounded-full" onClick={() => void copyInvite()}>
                    {copied ? 'Copied' : 'Copy invite'}
                  </Button>
                </div>
              )}
            </section>
          </>
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
