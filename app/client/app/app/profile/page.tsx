"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * PROFILE OVERVIEW SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/profile
 * Displays user's own profile with stats and actions
 * ═══════════════════════════════════════════════════════════════
 */

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoAvatar } from "@/components/achievno/avatar"
import { AchievnoBadge } from "@/components/achievno/badge"
import { 
  AchievnoIcon,
  IconEdit,
  IconSettings,
  IconTarget,
  IconTrophy,
  IconUsers,
  IconCalendar,
  IconChevronRight
} from "@/lib/achievno/icons"
import { ROUTES } from "@/lib/achievno/constants"

// Mock user data
const MOCK_USER = {
  id: "user-1",
  displayName: "Alex Johnson",
  email: "alex@example.com",
  bio: "Building products and tracking progress. Always learning, always growing.",
  avatarUrl: null,
  joinedDate: "January 2026",
  stats: {
    totalAchievements: 24,
    completedAchievements: 12,
    activeChallenges: 3,
    groupsJoined: 4,
    currentStreak: 7,
  },
  recentActivity: [
    { id: "1", action: 'Completed "Morning Meditation"', time: "2 hours ago" },
    { id: "2", action: 'Logged progress on "Read 10 Books"', time: "Yesterday" },
    { id: "3", action: 'Joined "Code Review Sprint" challenge', time: "3 days ago" },
  ],
  goalCategories: ["Learning", "Fitness", "Career"],
}

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Profile"
        onBack={() => router.back()}
        rightActions={
          <button 
            onClick={() => router.push(ROUTES.settings)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-secondary"
          >
            <AchievnoIcon icon={IconSettings} />
          </button>
        }
      />

      <div className="flex-1 overflow-auto">
        {/* Profile Header */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-start gap-4">
            <AchievnoAvatar name={MOCK_USER.displayName} size="xl" />
            <div className="flex-1 min-w-0">
              <h1 className="text-heading mb-1">{MOCK_USER.displayName}</h1>
              <p className="text-label text-secondary mb-3">{MOCK_USER.email}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(ROUTES.profileEdit)}
                className="h-8 px-3"
              >
                <AchievnoIcon icon={IconEdit} size="sm" className="mr-1.5" />
                Edit Profile
              </Button>
            </div>
          </div>

          {MOCK_USER.bio && (
            <p className="text-body text-secondary mt-4">{MOCK_USER.bio}</p>
          )}

          {/* Goal Categories */}
          {MOCK_USER.goalCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {MOCK_USER.goalCategories.map((category) => (
                <AchievnoBadge key={category} variant="default" size="sm">
                  {category}
                </AchievnoBadge>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="px-5 py-5 border-b border-border">
          <h3 className="text-caption text-secondary mb-3">Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconTarget} size="sm" className="text-primary" />
                <span className="text-label text-secondary">Achievements</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.totalAchievements}</div>
              <div className="text-caption text-tertiary mt-1">
                {MOCK_USER.stats.completedAchievements} completed
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconTrophy} size="sm" className="text-challenge" />
                <span className="text-label text-secondary">Challenges</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.activeChallenges}</div>
              <div className="text-caption text-tertiary mt-1">active</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconUsers} size="sm" className="text-info" />
                <span className="text-label text-secondary">Groups</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.groupsJoined}</div>
              <div className="text-caption text-tertiary mt-1">joined</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconCalendar} size="sm" className="text-success" />
                <span className="text-label text-secondary">Streak</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.currentStreak}</div>
              <div className="text-caption text-tertiary mt-1">days</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-5 py-5">
          <h3 className="text-caption text-secondary mb-3">Recent Activity</h3>
          <div className="bg-surface rounded-xl border border-border divide-y divide-border">
            {MOCK_USER.recentActivity.map((activity) => (
              <div key={activity.id} className="px-4 py-3">
                <p className="text-body">{activity.action}</p>
                <span className="text-caption text-tertiary">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Member Since */}
        <div className="px-5 pb-8">
          <p className="text-label text-tertiary text-center">
            Member since {MOCK_USER.joinedDate}
          </p>
        </div>
      </div>
    </div>
  )
}
