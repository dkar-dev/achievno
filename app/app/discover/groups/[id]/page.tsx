"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * PUBLIC GROUP DETAIL SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/discover/groups/[id]
 * View public group info and request to join
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoAvatar, AchievnoAvatarStack } from "@/components/achievno/avatar"
import { AchievnoBadge } from "@/components/achievno/badge"
import { ConfirmModal } from "@/components/achievno/confirm-modal"
import { 
  AchievnoIcon,
  IconUsers,
  IconTarget,
  IconTrophy,
  IconGlobe,
  IconCalendar,
  IconCheck
} from "@/lib/achievno/icons"
import { cn } from "@/lib/utils"

// Mock data
const MOCK_GROUP = {
  id: "fitness-warriors",
  name: "Fitness Warriors",
  description: "A community dedicated to daily workouts and fitness goals. Whether you're just starting out or a seasoned athlete, join us to track progress, participate in challenges, and celebrate wins together!",
  avatar: null,
  memberCount: 1240,
  category: "Health & Fitness",
  achievementCount: 45,
  challengeCount: 8,
  createdAt: "2025-06-15",
  isPublic: true,
  topMembers: [
    { id: "1", name: "Alex Chen", avatar: null },
    { id: "2", name: "Bella Rodriguez", avatar: null },
    { id: "3", name: "Max Kim", avatar: null },
    { id: "4", name: "Sophie Lee", avatar: null },
    { id: "5", name: "Jordan Park", avatar: null },
  ],
  activeChallenges: [
    { id: "c1", title: "April Fitness Challenge", participantCount: 420, endsIn: "24 days" },
    { id: "c2", title: "Morning Run Streak", participantCount: 180, endsIn: "Ongoing" },
  ],
  recentAchievements: [
    { id: "a1", title: "100 Pushups Challenge", completedBy: 45 },
    { id: "a2", title: "Marathon Training", completedBy: 12 },
  ],
}

export default function PublicGroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [showJoinConfirm, setShowJoinConfirm] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  const handleJoin = async () => {
    setIsJoining(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsJoining(false)
    setShowJoinConfirm(false)
    setHasJoined(true)
    // Would redirect to group workspace after successful join
    setTimeout(() => router.push(`/app/groups/${params.id}`), 1000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Group"
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-auto">
        {/* Header Section */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-start gap-4 mb-4">
            <AchievnoAvatar name={MOCK_GROUP.name} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-heading">{MOCK_GROUP.name}</h1>
                <AchievnoBadge variant="default" size="sm">{MOCK_GROUP.category}</AchievnoBadge>
              </div>
              <div className="flex items-center gap-3 text-label text-secondary">
                <div className="flex items-center gap-1">
                  <AchievnoIcon icon={IconGlobe} size="xs" />
                  <span>Public</span>
                </div>
                <span className="text-tertiary">|</span>
                <div className="flex items-center gap-1">
                  <AchievnoIcon icon={IconUsers} size="xs" />
                  <span>{MOCK_GROUP.memberCount.toLocaleString()} members</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-body text-secondary">{MOCK_GROUP.description}</p>

          {/* Top Members */}
          <div className="flex items-center gap-3 mt-4">
            <AchievnoAvatarStack users={MOCK_GROUP.topMembers} size="sm" max={5} />
            <span className="text-label text-secondary">
              Including Alex, Bella, and {MOCK_GROUP.memberCount - 5} others
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-5 border-b border-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-xl border border-border p-3 text-center">
              <div className="text-heading text-primary">{MOCK_GROUP.achievementCount}</div>
              <div className="text-caption text-secondary mt-1">Achievements</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-3 text-center">
              <div className="text-heading text-challenge">{MOCK_GROUP.challengeCount}</div>
              <div className="text-caption text-secondary mt-1">Challenges</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-3 text-center">
              <div className="text-heading text-info">{MOCK_GROUP.memberCount}</div>
              <div className="text-caption text-secondary mt-1">Members</div>
            </div>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="px-5 py-5 border-b border-border">
          <h3 className="text-title mb-3">Active Challenges</h3>
          <div className="space-y-2">
            {MOCK_GROUP.activeChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-challenge-subtle flex items-center justify-center shrink-0">
                  <AchievnoIcon icon={IconTrophy} size="sm" className="text-challenge" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium truncate">{challenge.title}</p>
                  <div className="flex items-center gap-2 text-label text-secondary">
                    <span>{challenge.participantCount} joined</span>
                    <span className="text-tertiary">|</span>
                    <span>{challenge.endsIn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Achievements */}
        <div className="px-5 py-5">
          <h3 className="text-title mb-3">Popular Achievements</h3>
          <div className="space-y-2">
            {MOCK_GROUP.recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0">
                  <AchievnoIcon icon={IconTarget} size="sm" className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium truncate">{achievement.title}</p>
                  <p className="text-label text-secondary">
                    {achievement.completedBy} members completed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Info */}
        <div className="px-5 pb-8">
          <div className="flex items-center gap-2 text-label text-tertiary">
            <AchievnoIcon icon={IconCalendar} size="xs" />
            <span>Created {new Date(MOCK_GROUP.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="px-5 py-4 border-t border-border safe-area-bottom">
        {hasJoined ? (
          <Button
            disabled
            className="w-full bg-success text-success-foreground"
          >
            <AchievnoIcon icon={IconCheck} size="sm" className="mr-2" />
            Joined Successfully
          </Button>
        ) : (
          <Button
            onClick={() => setShowJoinConfirm(true)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <AchievnoIcon icon={IconUsers} size="sm" className="mr-2" />
            Join Group
          </Button>
        )}
      </div>

      {/* Join Confirmation */}
      <ConfirmModal
        open={showJoinConfirm}
        onOpenChange={setShowJoinConfirm}
        title={`Join ${MOCK_GROUP.name}?`}
        description="You'll be able to participate in group achievements and challenges, and see activity from other members."
        confirmLabel={isJoining ? "Joining..." : "Join Group"}
        onConfirm={handleJoin}
      />
    </div>
  )
}
