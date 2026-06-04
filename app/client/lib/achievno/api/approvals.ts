import { apiFetch } from '@/lib/achievno/api/client'
import type { AchievementLog, PersonalAchievement } from '@/lib/achievno/api/achievements'

export type ApprovalRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type ApprovalRequest = {
  approval_request_id: string
  achievement_id: string
  origin_progress_log_id: string
  request_status: ApprovalRequestStatus
  min_approval_count: number
  current_approval_count: number
  current_reject_count: number
  created_at: string | null
  resolved_at: string | null
  achievement: PersonalAchievement
  origin_log: AchievementLog
  approvers: {
    profile_id: string
    assigned_at: string | null
  }[]
  decisions: {
    approval_decision_id: string
    approver_profile_id: string
    decision_type: 'approve' | 'reject'
    note_text: string | null
    decided_at: string | null
  }[]
}

export type ApprovalListResponse = {
  items: ApprovalRequest[]
}

export type ApprovalDetailResponse = {
  approval_request: ApprovalRequest
}

export const approvalsApi = {
  list(params: { status?: ApprovalRequestStatus } = {}) {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.set('status', params.status)
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiFetch<ApprovalListResponse>(`/api/v1/approvals${suffix}`)
  },
  detail(approvalRequestId: string) {
    return apiFetch<ApprovalDetailResponse>(`/api/v1/approvals/${approvalRequestId}`)
  },
  approve(approvalRequestId: string, payload: { note_text?: string | null } = {}) {
    return apiFetch<ApprovalDetailResponse>(`/api/v1/approvals/${approvalRequestId}/approve`, {
      method: 'POST',
      body: payload,
    })
  },
  reject(approvalRequestId: string, payload: { note_text?: string | null } = {}) {
    return apiFetch<ApprovalDetailResponse>(`/api/v1/approvals/${approvalRequestId}/reject`, {
      method: 'POST',
      body: payload,
    })
  },
}
