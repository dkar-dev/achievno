"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * PUBLIC PROFILE SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/users/[id]
 * View another user's public profile
 * ═══════════════════════════════════════════════════════════════
 */

import { useRouter, useParams } from "next/navigation"
import { AchievnoHeader } from "@/components/achievno/header"
import { AchievnoAvatar } from "@/components/achievno/avatar"
import { AchievnoBadge } from "@/components/achievno/badge"
import { AchievnoProgress } from "@/components/achievno/progress"
import { 
  AchievnoIcon,
  IconTarget,
  IconTrophy,
  IconUsers,
  IconCalendar,
  IconFlame
} from "@/lib/achievno/icons"

// Mock user data
const MOCK_USER = {
  id: "user-2",
  displayName: "Bella Rodriguez",
  bio: "Fitness enthusiast and lifelong learner. Always looking for new challenges!",
  avatarUrl: null,
  joinedDate: "March 2025",
  stats: {
    totalAchievements: 45,
    completedAchievements: 32,
    challengesWon: 5,
    groupsJoined: 6,
    currentStreak: 14,
  },
  goalCategories: ["Fitness", "Learning", "Health"],
  sharedGroups: [
    { id: "g1", name: "Dev Team" },
    { id: "g2", name: "Fitness Club" },
  ],
  recentAchievements: [
    { id: "1", title: "Morning Meditation", progress: 100, status: "completed" as const },
    { id: "2", title: "Read 20 Books", progress: 65, status: "active" as const },
    { id: "3", title: "10K Steps Daily", progress: 80, status: "active" as const },
  ],
}

export default function PublicProfilePage() {
  const router = useRouter()
  const params = useParams()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AchievnoHeader
        title="Profile"
        showBack
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-auto">
        {/* Profile Header */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-start gap-4">
            <AchievnoAvatar name={MOCK_USER.displayName} size="xl" />
            <div className="flex-1 min-w-0">
              <h1 className="text-heading mb-1">{MOCK_USER.displayName}</h1>
              
              {/* Streak Badge */}
              {MOCK_USER.stats.currentStreak > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-accent-subtle rounded-full px-3 py-1 mb-2">
                  <AchievnoIcon icon={IconFlame} size="xs" className="text-primary" />
                  <span className="text-label text-primary font-medium">
                    {MOCK_USER.stats.currentStreak} day streak
                  </span>
                </div>
              )}
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
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconTarget} size="sm" className="text-primary" />
                <span className="text-label text-secondary">Achievements</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.totalAchievements}</div>
              <div className="text-caption text-tertiary mt-1">
                {MOCK_USER.stats.completedAchievements} completed
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconTrophy} size="sm" className="text-challenge" />
                <span className="text-label text-secondary">Challenges Won</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.challengesWon}</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconUsers} size="sm" className="text-info" />
                <span className="text-label text-secondary">Groups</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.groupsJoined}</div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconFlame} size="sm" className="text-destructive" />
                <span className="text-label text-secondary">Best Streak</span>
              </div>
              <div className="text-heading">{MOCK_USER.stats.currentStreak}</div>
              <div className="text-caption text-tertiary mt-1">days</div>
            </div>
          </div>
        </div>

        {/* Shared Groups */}
        {MOCK_USER.sharedGroups.length > 0 && (
          <div className="px-5 py-5 border-b border-border">
            <h3 className="text-caption text-secondary mb-3">Shared Groups</h3>
            <div className="flex flex-wrap gap-2">
              {MOCK_USER.sharedGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => router.push(`/app/groups/${group.id}`)}
                  className="flex items-center gap-2 bg-surface rounded-xl border border-border px-4 py-2 hover:border-border-strong transition-colors"
                >
                  <AchievnoAvatar name={group.name} size="xs" />
                  <span className="text-label">{group.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Achievements */}
        <div className="px-5 py-5">
          <h3 className="text-caption text-secondary mb-3">Recent Achievements</h3>
          <div className="space-y-3">
            {MOCK_USER.recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-surface rounded-xl border border-border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-medium">{achievement.title}</span>
                  <AchievnoBadge 
                    variant={achievement.status === "completed" ? "success" : "default"}
                    size="sm"
                  >
                    {achievement.status === "completed" ? "Completed" : "In Progress"}
                  </AchievnoBadge>
                </div>
                <AchievnoProgress 
                  value={achievement.progress} 
                  size="sm"
                  variant={achievement.status === "completed" ? "success" : "default"}
                />
                <p className="text-label text-tertiary mt-2">{achievement.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>

        {/* Member Since */}
        <div className="px-5 pb-8">
          <div className="flex items-center justify-center gap-2 text-label text-tertiary">
            <AchievnoIcon icon={IconCalendar} size="xs" />
            <span>Member since {MOCK_USER.joinedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
