/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO SHARED TYPES
 * ═══════════════════════════════════════════════════════════════
 * Core type definitions shared across all platforms:
 * - Telegram Mini App
 * - Website
 * - Telegram Bot (message rendering)
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// USER & AUTH
// ─────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  onboardingCompleted: boolean
  goalPreferences?: string[]
  notificationsEnabled: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

// ─────────────────────────────────────────────────────────────────
// SPACES
// ─────────────────────────────────────────────────────────────────

export type SpaceType = 'personal' | 'group'

export interface Space {
  id: string
  type: SpaceType
  name: string
  avatarUrl?: string
  avatarInitials: string
  avatarColor: string
  memberCount?: number
  activeCount: number
  completedCount: number
  progressPercent?: number
  hasUnread: boolean
  unreadCount?: number
  lastActivityAt: string
}

// ─────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────

export type AchievementStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface Achievement {
  id: string
  title: string
  description?: string
  targetValue: number
  currentValue: number
  unit?: string
  status: AchievementStatus
  dueDate?: string
  createdAt: string
  completedAt?: string
  archivedAt?: string
  spaceId: string
  spaceType: SpaceType
  creatorId: string
  assignees?: string[]
  progressPercent: number
  isOverdue: boolean
}

export interface AchievementProgress {
  id: string
  achievementId: string
  value: number
  note?: string
  createdAt: string
  creatorId: string
}

// ─────────────────────────────────────────────────────────────────
// GROUPS
// ─────────────────────────────────────────────────────────────────

export type GroupRole = 'owner' | 'admin' | 'member'
export type GroupVisibility = 'public' | 'private'

export interface Group {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  avatarInitials: string
  avatarColor: string
  visibility: GroupVisibility
  memberCount: number
  achievementCount: number
  challengeCount: number
  overallProgress: number
  createdAt: string
  ownerId: string
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: GroupRole
  joinedAt: string
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'>
}

// ─────────────────────────────────────────────────────────────────
// CHALLENGES
// ─────────────────────────────────────────────────────────────────

export type ChallengeStatus = 'upcoming' | 'active' | 'completed'
export type ChallengeType = 'race' | 'collaborative' | 'streak'

export interface Challenge {
  id: string
  groupId: string
  title: string
  description?: string
  type: ChallengeType
  status: ChallengeStatus
  targetValue: number
  unit?: string
  startDate: string
  endDate: string
  participantCount: number
  winnerId?: string
  creatorId: string
  createdAt: string
}

export interface ChallengeParticipant {
  id: string
  challengeId: string
  userId: string
  currentValue: number
  rank?: number
  joinedAt: string
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'>
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl?: string
  value: number
  isCurrentUser: boolean
}

// ─────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'personal_achievement_update'
  | 'group_achievement_update'
  | 'challenge_update'
  | 'group_invite'
  | 'role_change'
  | 'profile_event'
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  createdAt: string
  targetId?: string
  targetType?: string
  metadata?: Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────────
// DISCOVER
// ─────────────────────────────────────────────────────────────────

export interface PublicGroup extends Pick<Group, 'id' | 'name' | 'description' | 'avatarUrl' | 'avatarInitials' | 'avatarColor' | 'memberCount'> {
  category?: string
  tags?: string[]
}

export interface ChallengeTemplate {
  id: string
  title: string
  description: string
  type: ChallengeType
  suggestedTarget: number
  unit?: string
  durationDays: number
  category: string
  usageCount: number
}

// ─────────────────────────────────────────────────────────────────
// UI STATE
// ─────────────────────────────────────────────────────────────────

export type ScreenState = 'loading' | 'ready' | 'empty' | 'error'

export interface ScreenMeta {
  state: ScreenState
  errorMessage?: string
  isEmpty?: boolean
}

// ─────────────────────────────────────────────────────────────────
// NAVIGATION (matching contract)
// ─────────────────────────────────────────────────────────────────

export type MainDestination = 'spaces' | 'discover'
export type HeaderAction = 'notifications' | 'menu'
export type MenuAction = 'profile' | 'settings' | 'create_group' | 'logout'

export type GroupWorkspaceSection = 'overview' | 'achievements' | 'challenges' | 'members' | 'info'
export type PersonalWorkspaceSection = 'active' | 'archived'

// ─────────────────────────────────────────────────────────────────
// PLATFORM DETECTION
// ─────────────────────────────────────────────────────────────────

export type Platform = 'mini-app' | 'web' | 'bot'

export interface PlatformContext {
  platform: Platform
  isTelegramWebApp: boolean
  isDesktop: boolean
  isMobile: boolean
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}
