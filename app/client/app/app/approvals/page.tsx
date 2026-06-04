'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AchievnoBadge } from '@/components/achievno/badge'
import { EmptyState } from '@/components/achievno/empty-state'
import { BackHeader } from '@/components/achievno/header'
import { ListError, LoadingButton, Spinner } from '@/components/achievno/loading-states'
import { Textarea } from '@/components/ui/textarea'
import { approvalsApi, type ApprovalRequest } from '@/lib/achievno/api/approvals'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { ROUTES } from '@/lib/achievno/constants'
import { IconCheck, IconShield, IconTarget, IconX } from '@/lib/achievno/icons'

export default function ApprovalsPage() {
  const router = useRouter()
  const auth = useAuth()
  const [items, setItems] = React.useState<ApprovalRequest[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [decisionNote, setDecisionNote] = React.useState('')
  const [activeDecisionId, setActiveDecisionId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!auth.isAuthenticated) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await approvalsApi.list()
      setItems(response.items)
    } catch (caughtError) {
      setItems([])
      setError(getApiErrorMessage(caughtError, 'Approvals could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }, [auth.isAuthenticated])

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
      return
    }
    if (auth.isAuthenticated) {
      void load()
    }
  }, [auth.isAuthenticated, auth.status, load, router])

  const decide = async (approvalRequestId: string, decision: 'approve' | 'reject') => {
    setActiveDecisionId(`${decision}:${approvalRequestId}`)
    setError(null)
    try {
      const response =
        decision === 'approve'
          ? await approvalsApi.approve(approvalRequestId, { note_text: decisionNote.trim() || null })
          : await approvalsApi.reject(approvalRequestId, { note_text: decisionNote.trim() || null })
      setItems((current) =>
        current.map((item) =>
          item.approval_request_id === approvalRequestId ? response.approval_request : item,
        ),
      )
      setDecisionNote('')
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'Approval decision could not be saved.'))
    } finally {
      setActiveDecisionId(null)
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
      <BackHeader title="Approvals" onBack={() => router.push(ROUTES.rootShell())} />

      <div className="flex-1 overflow-y-auto px-screen py-4">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <ListError message={error} onRetry={() => void load()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<IconShield size={40} />}
            title="No approvals"
            description="Pending approval requests will appear here."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const canDecide =
                item.request_status === 'pending' &&
                item.approvers.some((approver) => approver.profile_id === auth.profile?.profile_id) &&
                !item.decisions.some((decision) => decision.approver_profile_id === auth.profile?.profile_id)
              return (
                <article key={item.approval_request_id} className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-muted text-primary">
                      <IconTarget size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-title font-semibold">{item.achievement.title}</h2>
                          <p className="mt-1 text-label text-secondary">
                            {item.current_approval_count}/{item.min_approval_count} approvals
                            {item.current_reject_count ? ` · ${item.current_reject_count} rejected` : ''}
                          </p>
                        </div>
                        <AchievnoBadge variant={approvalBadgeVariant(item.request_status)} size="sm">
                          {approvalStatusLabel(item.request_status)}
                        </AchievnoBadge>
                      </div>

                      {item.origin_log.note_text && (
                        <p className="mt-3 rounded-lg bg-bg-muted px-3 py-2 text-label text-secondary">
                          {item.origin_log.note_text}
                        </p>
                      )}

                      {canDecide && (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={decisionNote}
                            onChange={(event) => setDecisionNote(event.target.value)}
                            placeholder="Optional decision note"
                            className="min-h-16 rounded-xl"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <LoadingButton
                              loading={activeDecisionId === `approve:${item.approval_request_id}`}
                              onClick={() => void decide(item.approval_request_id, 'approve')}
                              className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <IconCheck size={18} className="mr-2" />
                              Approve
                            </LoadingButton>
                            <LoadingButton
                              loading={activeDecisionId === `reject:${item.approval_request_id}`}
                              onClick={() => void decide(item.approval_request_id, 'reject')}
                              variant="outline"
                              className="h-11 rounded-xl text-destructive"
                            >
                              <IconX size={18} className="mr-2" />
                              Reject
                            </LoadingButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function approvalStatusLabel(status: ApprovalRequest['request_status']) {
  if (status === 'pending') return 'Pending'
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Cancelled'
}

function approvalBadgeVariant(status: ApprovalRequest['request_status']) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'destructive'
  if (status === 'pending') return 'primary'
  return 'muted'
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
