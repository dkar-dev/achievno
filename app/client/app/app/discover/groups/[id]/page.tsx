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
  IconGlobe,
  IconCalendar,
  IconCheck
} from "@/lib/achievno/icons"
import { groupsApi } from "@/lib/achievno/api/groups"
import { getApiErrorMessage } from "@/lib/achievno/api/errors"
import { ROUTES } from "@/lib/achievno/constants"

const DEMO_GROUPS = {
  "fitness-warriors": {
    id: "fitness-warriors",
    name: "Fitness Warriors",
    description: "A community dedicated to daily workouts and fitness goals.",
    memberCount: 1240,
    category: "Health & Fitness",
  },
  "book-club": {
    id: "book-club",
    name: "Book Club 2026",
    description: "Read consistently and share progress with other learners.",
    memberCount: 856,
    category: "Learning",
  },
  "early-risers": {
    id: "early-risers",
    name: "Early Risers",
    description: "Build morning routines and keep each other accountable.",
    memberCount: 2100,
    category: "Productivity",
  },
  "code-masters": {
    id: "code-masters",
    name: "Code Masters",
    description: "Daily coding practice and skill-building achievements.",
    memberCount: 3400,
    category: "Tech",
  },
}

const TOP_MEMBERS = [
  { id: "1", name: "Alex Chen", avatar: null },
  { id: "2", name: "Bella Rodriguez", avatar: null },
  { id: "3", name: "Max Kim", avatar: null },
  { id: "4", name: "Sophie Lee", avatar: null },
  { id: "5", name: "Jordan Park", avatar: null },
]

export default function PublicGroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [showJoinConfirm, setShowJoinConfirm] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const groupId = String(params.id)
  const group = DEMO_GROUPS[groupId as keyof typeof DEMO_GROUPS] ?? DEMO_GROUPS["fitness-warriors"]

  const handleJoin = async () => {
    setIsJoining(true)
    setError(null)
    try {
      const response = await groupsApi.joinDemo({
        template_id: group.id,
        title: group.name,
        description: group.description,
        visibility_type: "public",
      })
      setShowJoinConfirm(false)
      setHasJoined(true)
      router.push(ROUTES.group(response.group.group_id))
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Group could not be joined."))
    } finally {
      setIsJoining(false)
    }
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
            <AchievnoAvatar name={group.name} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-heading">{group.name}</h1>
                <AchievnoBadge variant="default" size="sm">{group.category}</AchievnoBadge>
              </div>
              <div className="flex items-center gap-3 text-label text-secondary">
                <div className="flex items-center gap-1">
                  <AchievnoIcon icon={IconGlobe} size="xs" />
                  <span>Public</span>
                </div>
                <span className="text-tertiary">|</span>
                <div className="flex items-center gap-1">
                  <AchievnoIcon icon={IconUsers} size="xs" />
                  <span>{group.memberCount.toLocaleString()} members</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-body text-secondary">{group.description}</p>

          {/* Top Members */}
          <div className="flex items-center gap-3 mt-4">
            <AchievnoAvatarStack users={TOP_MEMBERS} size="sm" max={5} />
            <span className="text-label text-secondary">
              Including Alex, Bella, and {group.memberCount - 5} others
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-5 border-b border-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-xl border border-border p-3 text-center">
              <div className="text-heading text-primary">0</div>
              <div className="text-caption text-secondary mt-1">Achievements</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-3 text-center">
              <div className="text-heading text-challenge">0</div>
              <div className="text-caption text-secondary mt-1">Challenges</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-3 text-center">
              <div className="text-heading text-info">{group.memberCount}</div>
              <div className="text-caption text-secondary mt-1">Members</div>
            </div>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="px-5 py-5 border-b border-border">
          <h3 className="text-title mb-3">Active Challenges</h3>
          <div className="rounded-xl border border-dashed border-border px-4 py-3 text-label text-secondary">
            Join to create real group achievements. Group challenges are not connected in this pass.
          </div>
        </div>

        {/* Popular Achievements */}
        <div className="px-5 py-5">
          <h3 className="text-title mb-3">Popular Achievements</h3>
          <div className="rounded-xl border border-dashed border-border px-4 py-3 text-label text-secondary">
            No persisted achievements exist until this template is joined.
          </div>
        </div>

        {/* Group Info */}
        <div className="px-5 pb-8">
          <div className="flex items-center gap-2 text-label text-tertiary">
            <AchievnoIcon icon={IconCalendar} size="xs" />
            <span>Demo template</span>
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
        {error && (
          <div className="mt-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-label text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Join Confirmation */}
      <ConfirmModal
        open={showJoinConfirm}
        onOpenChange={setShowJoinConfirm}
        title={`Join ${group.name}?`}
        description="You'll be able to participate in group achievements and challenges, and see activity from other members."
        confirmLabel={isJoining ? "Joining..." : "Join Group"}
        onConfirm={handleJoin}
      />
    </div>
  )
}
