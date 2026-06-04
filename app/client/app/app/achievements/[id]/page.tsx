'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { AchievnoBadge, getAchievementBadgeVariant } from '@/components/achievno/badge'
import { AchievnoProgress } from '@/components/achievno/progress'
import { AchievementDetailSkeleton } from '@/components/achievno/skeleton'
import { ListError, LoadingButton } from '@/components/achievno/loading-states'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import {
  achievementsApi,
  type AchievementEvidence,
  type AchievementLog,
  type PersonalAchievement,
} from '@/lib/achievno/api/achievements'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import {
  PERSONAL_ACHIEVEMENTS_USE_MOCKS,
} from '@/lib/achievno/achievements/use-personal-achievements'
import { useAchievementDetail } from '@/lib/achievno/achievements/use-achievement-detail'
import { toUiAchievement } from '@/lib/achievno/achievements/format'
import { IconArchive, IconCheck, IconClock, IconExternalLink, IconPlus, IconShield } from '@/lib/achievno/icons'
import { ROUTES, STATUS_LABELS } from '@/lib/achievno/constants'

const DEMO_ACHIEVEMENT: PersonalAchievement = {
  achievement_id: 'demo-progress-achievement',
  owner_context_id: 'demo-personal',
  owner_context_type: 'personal',
  base_type: 'progress',
  assignment_mode: 'self',
  title: 'Read 10 Books',
  short_definition: 'Complete 10 books this quarter',
  description: 'Focus on technical and personal development topics.',
  status: 'in_progress',
  progress_current: 7,
  progress_target: 10,
  unit_label: 'books',
  deadline_at: '2026-06-30T00:00:00Z',
  completed_at: null,
  archived_at: null,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: new Date().toISOString(),
  primary_category: null,
  rank: null,
}

function apiStatusLabel(status: PersonalAchievement['status']) {
  if (status === 'in_progress' || status === 'in_review') return STATUS_LABELS.achievement.active
  return STATUS_LABELS.achievement[status]
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr?: string | null): string | null {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function logTitle(log: AchievementLog): string {
  if (log.action_type === 'progress_logged') return 'Progress logged'
  if (log.action_type === 'completed') return 'Completed'
  return log.action_type.replaceAll('_', ' ')
}

export default function AchievementDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const auth = useAuth()
  const achievementId = params.id
  const [isCompleting, setIsCompleting] = React.useState(false)
  const [isArchiving, setIsArchiving] = React.useState(false)
  const [evidenceKind, setEvidenceKind] = React.useState<'link' | 'note'>('link')
  const [evidenceUrl, setEvidenceUrl] = React.useState('')
  const [evidenceNote, setEvidenceNote] = React.useState('')
  const [isAddingEvidence, setIsAddingEvidence] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const detail = useAchievementDetail({
    achievementId,
    enabled: auth.isAuthenticated,
    mockAchievement: DEMO_ACHIEVEMENT,
  })

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.replace(ROUTES.signIn)
    }
  }, [auth.status, router])

  const achievement = detail.achievement
  const uiAchievement = achievement ? toUiAchievement(achievement) : null
  const isCompleted = achievement?.status === 'completed'
  const isArchived = achievement?.status === 'archived'
  const isDoneType = achievement?.base_type === 'done'
  const isSharedContext = achievement?.owner_context_type === 'friend_connection' || achievement?.owner_context_type === 'group'
  const summary = achievement ? achievement.description || achievement.short_definition : null

  const handleComplete = async () => {
    if (!achievement) return
    setActionError(null)
    setIsCompleting(true)
    try {
      if (!PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
        await achievementsApi.complete(achievement.achievement_id)
        await detail.reload()
      }
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Achievement could not be completed.'))
    } finally {
      setIsCompleting(false)
    }
  }

  const handleArchive = async () => {
    if (!achievement) return
    setActionError(null)
    setIsArchiving(true)
    try {
      if (!PERSONAL_ACHIEVEMENTS_USE_MOCKS) {
        await achievementsApi.archive(achievement.achievement_id)
      }
      router.push(ROUTES.personalWorkspace)
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Achievement could not be archived.'))
    } finally {
      setIsArchiving(false)
    }
  }

  const handleAddEvidence = async () => {
    if (!achievement) return
    setActionError(null)
    setIsAddingEvidence(true)
    try {
      await achievementsApi.attachEvidence(achievement.achievement_id, {
        kind: evidenceKind,
        url: evidenceKind === 'link' ? evidenceUrl.trim() : null,
        note_text: evidenceNote.trim() || null,
      })
      setEvidenceUrl('')
      setEvidenceNote('')
      await detail.reload()
    } catch (caughtError) {
      setActionError(getApiErrorMessage(caughtError, 'Evidence could not be added.'))
    } finally {
      setIsAddingEvidence(false)
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
      <BackHeader title="Achievement" onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto pb-28">
        {detail.isLoading ? (
          <AchievementDetailSkeleton />
        ) : detail.error || !achievement || !uiAchievement ? (
          <div className="px-screen py-4">
            <ListError message={detail.error || 'Achievement could not be loaded.'} onRetry={() => void detail.reload()} />
          </div>
        ) : (
          <div className="space-y-5 px-screen py-4 motion-screen-push">
            {PERSONAL_ACHIEVEMENTS_USE_MOCKS && (
              <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2 text-caption text-secondary">
                Demo achievement detail
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-border-subtle bg-bg-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-heading font-semibold text-primary-text">{achievement.title}</h1>
                  {summary && <p className="mt-1 text-body text-secondary">{summary}</p>}
                </div>
                <AchievnoBadge
                  variant={getAchievementBadgeVariant(uiAchievement.status)}
                  size="md"
                >
                  {apiStatusLabel(achievement.status)}
                </AchievnoBadge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-label text-secondary">
                <InfoPill label="Type" value={isDoneType ? 'Done' : 'Progress'} />
                <InfoPill label="Due" value={formatDate(achievement.deadline_at) ?? 'No deadline'} />
              </div>
            </div>

            {isDoneType ? (
              <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-title font-semibold">Completion</h2>
                    <p className="mt-1 text-label text-secondary">
                      {isCompleted ? 'This achievement is completed.' : 'Mark it done when the result is achieved.'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-muted">
                    {isCompleted ? <IconCheck size={22} /> : <span className="text-title font-semibold">0/1</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-title font-semibold">
                    {uiAchievement.currentValue}
                    <span className="font-normal text-secondary"> / {uiAchievement.targetValue}</span>
                  </span>
                  <span className="text-label text-tertiary">{uiAchievement.unit}</span>
                </div>
                <AchievnoProgress
                  value={uiAchievement.currentValue}
                  max={uiAchievement.targetValue}
                  color={isCompleted ? 'success' : 'primary'}
                  size="md"
                />
                <p className="mt-2 text-label text-tertiary">
                  {uiAchievement.progressPercent}% complete
                  {achievement.deadline_at ? ` · due ${formatDate(achievement.deadline_at)}` : ''}
                </p>
              </div>
            )}

            {actionError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
                {actionError}
              </div>
            )}

            {detail.approvalRequest && (
              <section className="rounded-xl border border-border-subtle bg-bg-elevated p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-muted text-primary">
                    <IconShield size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-title font-semibold">Approval</h2>
                      <AchievnoBadge
                        variant={detail.approvalRequest.request_status === 'approved' ? 'success' : detail.approvalRequest.request_status === 'rejected' ? 'destructive' : 'primary'}
                        size="sm"
                      >
                        {approvalStatusLabel(detail.approvalRequest.request_status)}
                      </AchievnoBadge>
                    </div>
                    <p className="mt-1 text-label text-secondary">
                      {detail.approvalRequest.current_approval_count}/{detail.approvalRequest.min_approval_count} approvals
                      {detail.approvalRequest.current_reject_count > 0 ? ` · ${detail.approvalRequest.current_reject_count} rejected` : ''}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-3 rounded-xl border border-border-subtle bg-bg-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-title font-semibold">Evidence</h2>
                  <p className="mt-1 text-label text-secondary">
                    Evidence is optional but useful for verification.
                    {isSharedContext ? ' Shared achievements may enter approval after completion.' : ''}
                  </p>
                </div>
                <IconClock size={20} className="mt-0.5 text-tertiary" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEvidenceKind('link')}
                  className={`rounded-lg border px-3 py-2 text-label font-medium ${evidenceKind === 'link' ? 'border-primary bg-accent-subtle text-primary' : 'border-border-subtle text-secondary'}`}
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setEvidenceKind('note')}
                  className={`rounded-lg border px-3 py-2 text-label font-medium ${evidenceKind === 'note' ? 'border-primary bg-accent-subtle text-primary' : 'border-border-subtle text-secondary'}`}
                >
                  Note
                </button>
              </div>

              {evidenceKind === 'link' && (
                <Input
                  value={evidenceUrl}
                  onChange={(event) => setEvidenceUrl(event.target.value)}
                  placeholder="https://example.com/proof"
                  inputMode="url"
                  className="h-11 rounded-xl"
                />
              )}
              <Textarea
                value={evidenceNote}
                onChange={(event) => setEvidenceNote(event.target.value)}
                placeholder={evidenceKind === 'link' ? 'Add context for this evidence' : 'Write a short evidence note'}
                className="min-h-20 rounded-xl"
              />
              <LoadingButton
                loading={isAddingEvidence}
                onClick={() => void handleAddEvidence()}
                disabled={evidenceKind === 'link' ? !evidenceUrl.trim() : !evidenceNote.trim()}
                variant="outline"
                className="h-11 w-full rounded-xl"
              >
                <IconPlus size={18} className="mr-2" />
                Add evidence
              </LoadingButton>

              {detail.evidence.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {detail.evidence.map((evidence) => (
                    <EvidenceItem key={evidence.evidence_link_id} evidence={evidence} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border-subtle bg-bg-muted px-4 py-3 text-sm text-tertiary">
                  No evidence attached yet.
                </div>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-caption font-semibold uppercase text-tertiary">Recent logs</h2>
              {detail.recentLogs.length > 0 ? (
                <div className="space-y-2">
                  {detail.recentLogs.map((log) => (
                    <div key={log.achievement_log_id} className="rounded-xl border border-border-subtle bg-bg-elevated px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-label font-medium capitalize">{logTitle(log)}</p>
                          <p className="text-caption text-secondary">
                            {log.delta_value !== null ? `+${log.delta_value}` : 'No delta'}
                            {log.resulting_value !== null ? ` · result ${log.resulting_value}` : ''}
                            {log.note_text ? ` · ${log.note_text}` : ''}
                          </p>
                        </div>
                        {log.created_at && <span className="text-caption text-tertiary">{formatDateTime(log.created_at)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border-subtle bg-bg-muted px-4 py-3 text-sm text-tertiary">
                  {isDoneType
                    ? 'No completion log yet. Complete the achievement to create the first log.'
                    : 'No progress logs yet. Add progress to create the first log.'}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {achievement && !isArchived && (
        <div className="sticky bottom-0 border-t border-border-subtle bg-bg-base px-screen py-4 safe-area-bottom">
          {!isCompleted && isDoneType && (
            <LoadingButton
              loading={isCompleting}
              onClick={() => void handleComplete()}
              className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <IconCheck size={18} className="mr-2" />
              Done
            </LoadingButton>
          )}
          {!isCompleted && !isDoneType && (
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(ROUTES.achievementProgress(achievement.achievement_id))}
                className="h-12 flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <IconPlus size={18} className="mr-2" />
                Log progress
              </Button>
              <LoadingButton
                loading={isCompleting}
                onClick={() => void handleComplete()}
                variant="ghost"
                className="h-12 rounded-xl px-4 text-secondary"
              >
                <IconCheck size={18} className="mr-1" />
                Complete
              </LoadingButton>
            </div>
          )}
          {isCompleted && (
            <LoadingButton
              loading={isArchiving}
              onClick={() => void handleArchive()}
              variant="outline"
              className="h-12 w-full rounded-xl"
            >
              <IconArchive size={18} className="mr-2" />
              Archive
            </LoadingButton>
          )}
        </div>
      )}
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2">
      <p className="text-caption text-tertiary">{label}</p>
      <p className="truncate text-label font-medium text-primary-text">{value}</p>
    </div>
  )
}

function approvalStatusLabel(status: string) {
  if (status === 'pending') return 'Pending'
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Cancelled'
}

function EvidenceItem({ evidence }: { evidence: AchievementEvidence }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-muted px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label font-medium capitalize">{evidence.kind}</p>
          {evidence.url ? (
            <a
              href={evidence.url}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-label text-primary"
            >
              <span className="truncate">{evidence.url}</span>
              <IconExternalLink size={14} />
            </a>
          ) : null}
          {evidence.note_text ? (
            <p className="mt-0.5 text-caption text-secondary">{evidence.note_text}</p>
          ) : null}
        </div>
        {evidence.created_at && <span className="shrink-0 text-caption text-tertiary">{formatDateTime(evidence.created_at)}</span>}
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
