import type { PersonalAchievement } from '@/lib/achievno/api/achievements'
import type { Achievement } from '@/lib/achievno/types'

export function toUiAchievement(achievement: PersonalAchievement): Achievement {
  const target = achievement.base_type === 'done'
    ? 1
    : Math.max(achievement.progress_target ?? 1, 1)
  const current = achievement.base_type === 'done'
    ? achievement.status === 'completed' ? 1 : 0
    : achievement.progress_current ?? 0
  const status = achievement.status === 'completed'
    ? 'completed'
    : achievement.status === 'archived'
      ? 'archived'
      : 'active'

  return {
    id: achievement.achievement_id,
    title: achievement.title,
    description: achievement.description ?? achievement.short_definition ?? '',
    targetValue: target,
    currentValue: current,
    unit: achievement.unit_label ?? (achievement.base_type === 'done' ? 'done' : undefined),
    status,
    dueDate: achievement.deadline_at ?? undefined,
    createdAt: achievement.created_at ?? new Date().toISOString(),
    completedAt: achievement.completed_at ?? undefined,
    archivedAt: achievement.archived_at ?? undefined,
    spaceId: achievement.owner_context_id,
    spaceType: 'personal',
    creatorId: 'current-profile',
    progressPercent: Math.min(100, Math.round((current / target) * 100)),
    isOverdue: achievement.status === 'overdue',
  }
}
