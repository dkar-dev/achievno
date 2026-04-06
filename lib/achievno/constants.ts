/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO SHARED CONSTANTS
 * ═══════════════════════════════════════════════════════════════
 * Shared configuration for all platforms
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// BRAND
// ─────────────────────────────────────────────────────────────────

export const APP_NAME = 'Achievno'
export const APP_TAGLINE = 'Track achievements. Celebrate wins.'
export const APP_DESCRIPTION = 'Track personal achievements and group progress. Celebrate wins together.'

// ─────────────────────────────────────────────────────────────────
// COLORS (for runtime use, e.g. avatars, bot messages)
// ─────────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand
  primary: '#F5A623',
  primaryForeground: '#1A1200',
  
  // Backgrounds
  bgBase: '#0E0F11',
  bgSurface: '#16181C',
  bgElevated: '#1E2128',
  bgInput: '#272B33',
  
  // Text
  textPrimary: '#F2F3F5',
  textSecondary: '#9BA3AF',
  textTertiary: '#5C6370',
  
  // Semantic
  success: '#4ADE80',
  destructive: '#FF6B6B',
  info: '#60A5FA',
  challenge: '#A78BFA',
  teal: '#2DD4BF',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.07)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
} as const

// Avatar colors for groups
export const AVATAR_COLORS = [
  '#F5A623', // amber
  '#60A5FA', // blue
  '#4ADE80', // green
  '#A78BFA', // purple
  '#FF6B6B', // red
  '#2DD4BF', // teal
  '#F472B6', // pink
  '#FBBF24', // yellow
] as const

// ─────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────

export const ROUTES = {
  // System
  splash: '/',
  offline: '/offline',
  maintenance: '/maintenance',
  updateRequired: '/update-required',
  notFound: '/404',
  accessDenied: '/403',
  
  // Auth
  welcome: '/welcome',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  forgotPassword: '/auth/forgot-password',
  resetPasswordInfo: '/auth/reset-password-info',
  resetPassword: '/auth/reset-password',
  
  // Onboarding
  onboardingProfile: '/onboarding/profile',
  onboardingGoals: '/onboarding/goals',
  onboardingNotifications: '/onboarding/notifications',
  
  // Main App
  spaces: '/app/spaces',
  personalWorkspace: '/app/me',
  discover: '/app/discover',
  notifications: '/app/notifications',
  profile: '/app/profile',
  profileEdit: '/app/profile/edit',
  settings: '/app/settings',
  
  // Dynamic routes
  achievement: (id: string) => `/app/achievements/${id}`,
  achievementCreate: '/app/me/achievements/create',
  achievementEdit: (id: string) => `/app/achievements/${id}/edit`,
  achievementProgress: (id: string) => `/app/achievements/${id}/progress`,
  
  group: (id: string) => `/app/groups/${id}`,
  groupCreate: '/app/groups/create',
  groupAchievements: (id: string) => `/app/groups/${id}/achievements`,
  groupChallenges: (id: string) => `/app/groups/${id}/challenges`,
  groupMembers: (id: string) => `/app/groups/${id}/members`,
  groupInfo: (id: string) => `/app/groups/${id}/info`,
  groupSettings: (id: string) => `/app/groups/${id}/settings`,
  
  challenge: (groupId: string, challengeId: string) => `/app/groups/${groupId}/challenges/${challengeId}`,
  challengeLeaderboard: (groupId: string, challengeId: string) => `/app/groups/${groupId}/challenges/${challengeId}/leaderboard`,
  
  discoverGroup: (id: string) => `/app/discover/groups/${id}`,
  discoverTemplate: (id: string) => `/app/discover/templates/${id}`,
  
  publicProfile: (id: string) => `/app/users/${id}`,
} as const

// ─────────────────────────────────────────────────────────────────
// GOAL CATEGORIES (for onboarding)
// ─────────────────────────────────────────────────────────────────

export const GOAL_CATEGORIES = [
  { id: 'fitness', label: 'Fitness', color: COLORS.success },
  { id: 'learning', label: 'Learning', color: COLORS.info },
  { id: 'career', label: 'Career', color: COLORS.primary },
  { id: 'creativity', label: 'Creativity', color: COLORS.challenge },
  { id: 'health', label: 'Health', color: COLORS.teal },
  { id: 'finance', label: 'Finance', color: '#FBBF24' },
  { id: 'relationships', label: 'Relationships', color: '#F472B6' },
  { id: 'mindfulness', label: 'Mindfulness', color: '#A78BFA' },
  { id: 'reading', label: 'Reading', color: COLORS.info },
  { id: 'projects', label: 'Projects', color: COLORS.primary },
  { id: 'habits', label: 'Habits', color: COLORS.success },
  { id: 'travel', label: 'Travel', color: COLORS.teal },
] as const

// ─────────────────────────────────────────────────────────────────
// UI CONSTANTS
// ─────────────────────────────────────────────────────────────────

export const UI = {
  // Spacing
  screenPadding: 20,
  headerHeight: 48,
  bottomNavHeight: 48,
  safeAreaTop: 44, // default, overridden by device
  
  // Animation durations (ms)
  transitionFast: 150,
  transitionNormal: 200,
  transitionSlow: 300,
  
  // Limits
  maxAvatarInitials: 2,
  maxTitleLength: 100,
  maxDescriptionLength: 500,
  maxBioLength: 200,
  
  // Pagination
  pageSize: 20,
  
  // Toast durations
  toastSuccess: 3000,
  toastError: 5000,
} as const

// ─────────────────────────────────────────────────────────────────
// STATUS LABELS (for badges, bot messages)
// ─────────────────────────────────────────────────────────────────

export const STATUS_LABELS = {
  achievement: {
    draft: 'Draft',
    active: 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
  },
  challenge: {
    upcoming: 'Starting Soon',
    active: 'Active',
    completed: 'Finished',
  },
  notification: {
    personal_achievement_update: 'Achievement',
    group_achievement_update: 'Group Achievement',
    challenge_update: 'Challenge',
    group_invite: 'Invitation',
    role_change: 'Group Role',
    profile_event: 'Profile',
    system: 'System',
  },
} as const

// ─────────────────────────────────────────────────────────────────
// BOT MESSAGES (shared tone/vocabulary)
// ─────────────────────────────────────────────────────────────────

export const BOT_MESSAGES = {
  welcome: `Welcome to ${APP_NAME}! Track your achievements and celebrate wins with your groups.`,
  achievementCreated: (title: string) => `New achievement created: "${title}". Let's make progress!`,
  achievementCompleted: (title: string) => `Congratulations! You completed "${title}".`,
  challengeJoined: (title: string) => `You joined the challenge: "${title}". Good luck!`,
  challengeWon: (title: string) => `You won the challenge: "${title}"! Great work!`,
  groupJoined: (name: string) => `You're now a member of "${name}". Welcome!`,
  progressLogged: (value: number, unit: string) => `Progress logged: ${value} ${unit}. Keep it up!`,
  reminder: (title: string) => `Reminder: Don't forget about "${title}".`,
} as const

// ─────────────────────────────────────────────────────────────────
// MENU ITEMS
// ─────────────────────────────────────────────────────────────────

export const MENU_ITEMS = [
  { id: 'profile', label: 'Profile', route: ROUTES.profile },
  { id: 'settings', label: 'Settings', route: ROUTES.settings },
  { id: 'create_group', label: 'Create Group', route: ROUTES.groupCreate },
  { id: 'logout', label: 'Log Out', route: null, destructive: true },
] as const

// ─────────────────────────────────────────────────────────────────
// GROUP WORKSPACE TABS
// ─────────────────────────────────────────────────────────────────

export const GROUP_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'members', label: 'Members' },
  { id: 'info', label: 'Info' },
] as const

// ─────────────────────────────────────────────────────────────────
// PERSONAL WORKSPACE FILTERS
// ─────────────────────────────────────────────────────────────────

export const PERSONAL_FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
] as const
