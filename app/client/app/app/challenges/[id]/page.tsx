"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * CHALLENGE DETAIL SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/challenges/[id]
 * Shows challenge info, leaderboard, and join/leave actions
 * States: not-joined, joined (as participant)
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoProgress } from "@/components/achievno/progress"
import { AchievnoAvatar } from "@/components/achievno/avatar"
import { AchievnoBadge } from "@/components/achievno/badge"
import { ConfirmModal } from "@/components/achievno/confirm-modal"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  AchievnoIcon,
  IconTrophy,
  IconUsers,
  IconCalendar,
  IconCrown,
  IconChevronRight,
  IconMoreHorizontal,
  IconCheck
} from "@/lib/achievno/icons"
import { cn } from "@/lib/utils"

// Mock data
const MOCK_CHALLENGE = {
  id: "c1",
  title: "Code Review Sprint",
  description: "First to review 10 PRs wins. Quality matters - each review must have at least one constructive comment.",
  status: "active" as const,
  groupId: "dev-team",
  groupName: "Dev Team",
  goal: 10,
  endDate: "Apr 15, 2026",
  createdBy: { id: "1", name: "Alex Chen", avatar: null },
  rules: [
    "Each PR review must include at least one constructive comment",
    "Self-reviews don't count",
    "Reviews must be completed within 24 hours of starting",
  ],
}

const MOCK_LEADERBOARD = [
  { id: "1", name: "Alex Chen", avatar: null, score: 7, rank: 1 },
  { id: "2", name: "Bella Rodriguez", avatar: null, score: 5, rank: 2 },
  { id: "3", name: "Max Kim", avatar: null, score: 4, rank: 3 },
  { id: "4", name: "Sophie Lee", avatar: null, score: 3, rank: 4 },
  { id: "5", name: "Jordan Park", avatar: null, score: 2, rank: 5 },
]

const CURRENT_USER_ID = "2" // Simulating current user is Bella

export default function ChallengeDetailPage() {
  const router = useRouter()
  const [isJoined, setIsJoined] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const currentUserEntry = MOCK_LEADERBOARD.find(e => e.id === CURRENT_USER_ID)
  const isLeader = MOCK_LEADERBOARD[0]?.id === CURRENT_USER_ID

  const handleJoin = () => {
    setIsJoined(true)
  }

  const handleLeave = () => {
    setIsJoined(false)
    setShowLeaveConfirm(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Challenge"
        onBack={() => router.back()}
        rightActions={
          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-secondary">
            <AchievnoIcon icon={IconMoreHorizontal} />
          </button>
        }
      />

      <div className="flex-1 overflow-auto">
        {/* Hero Section */}
        <div className="bg-challenge-subtle p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-challenge flex items-center justify-center shrink-0">
              <AchievnoIcon icon={IconTrophy} size="lg" className="text-challenge-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <AchievnoBadge variant="info" size="sm" className="mb-2">
                {MOCK_CHALLENGE.status === "active" ? "Active" : "Upcoming"}
              </AchievnoBadge>
              <h1 className="text-heading mb-1">{MOCK_CHALLENGE.title}</h1>
              <button 
                onClick={() => router.push(`/app/groups/${MOCK_CHALLENGE.groupId}`)}
                className="text-label text-secondary hover:text-foreground"
              >
                {MOCK_CHALLENGE.groupName}
              </button>
            </div>
          </div>
        </div>

        {/* Challenge Info */}
        <div className="p-5 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-caption text-secondary mb-2">About</h3>
            <p className="text-body">{MOCK_CHALLENGE.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconUsers} size="sm" className="text-muted-foreground" />
                <span className="text-label text-secondary">Participants</span>
              </div>
              <div className="text-heading">{MOCK_LEADERBOARD.length}</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AchievnoIcon icon={IconCalendar} size="sm" className="text-muted-foreground" />
                <span className="text-label text-secondary">Ends</span>
              </div>
              <div className="text-heading">{MOCK_CHALLENGE.endDate}</div>
            </div>
          </div>

          {/* Your Progress (if joined) */}
          {isJoined && currentUserEntry && (
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-title">Your Progress</h3>
                <div className="flex items-center gap-1">
                  {isLeader && (
                    <AchievnoIcon icon={IconCrown} size="sm" className="text-primary" />
                  )}
                  <span className="text-label text-primary">#{currentUserEntry.rank}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-body text-secondary">
                  {currentUserEntry.score} of {MOCK_CHALLENGE.goal}
                </span>
                <span className="text-label text-primary">
                  {Math.round((currentUserEntry.score / MOCK_CHALLENGE.goal) * 100)}%
                </span>
              </div>
              <AchievnoProgress 
                value={(currentUserEntry.score / MOCK_CHALLENGE.goal) * 100} 
                variant="challenge"
              />
            </div>
          )}

          {/* Leaderboard Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-title">Leaderboard</h3>
              <Sheet open={showLeaderboard} onOpenChange={setShowLeaderboard}>
                <SheetTrigger asChild>
                  <button className="text-label text-primary">View All</button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh] bg-background border-t border-border rounded-t-3xl">
                  <SheetHeader className="pb-4 border-b border-border">
                    <SheetTitle className="text-heading">Full Leaderboard</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 overflow-auto">
                    {MOCK_LEADERBOARD.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl",
                          entry.id === CURRENT_USER_ID && "bg-accent-subtle"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-label",
                          index === 0 && "bg-primary text-primary-foreground",
                          index === 1 && "bg-secondary text-foreground",
                          index === 2 && "bg-secondary text-foreground",
                          index > 2 && "bg-secondary text-muted-foreground"
                        )}>
                          {index === 0 ? (
                            <AchievnoIcon icon={IconCrown} size="sm" />
                          ) : (
                            entry.rank
                          )}
                        </div>
                        <AchievnoAvatar name={entry.name} size="sm" />
                        <div className="flex-1">
                          <span className={cn(
                            "text-body",
                            entry.id === CURRENT_USER_ID && "font-medium"
                          )}>
                            {entry.name}
                            {entry.id === CURRENT_USER_ID && " (You)"}
                          </span>
                        </div>
                        <div className="text-title text-primary">{entry.score}</div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {MOCK_LEADERBOARD.slice(0, 3).map((entry, index) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border-b border-border last:border-0",
                    entry.id === CURRENT_USER_ID && "bg-accent-subtle"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-label",
                    index === 0 && "bg-primary text-primary-foreground",
                    index > 0 && "bg-secondary text-muted-foreground"
                  )}>
                    {index === 0 ? (
                      <AchievnoIcon icon={IconCrown} size="sm" />
                    ) : (
                      entry.rank
                    )}
                  </div>
                  <AchievnoAvatar name={entry.name} size="sm" />
                  <span className="text-body flex-1">{entry.name}</span>
                  <span className="text-title text-primary">{entry.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          {MOCK_CHALLENGE.rules && MOCK_CHALLENGE.rules.length > 0 && (
            <div>
              <h3 className="text-caption text-secondary mb-3">Rules</h3>
              <div className="bg-surface rounded-xl border border-border p-4">
                <ul className="space-y-2">
                  {MOCK_CHALLENGE.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-caption text-muted-foreground">{index + 1}</span>
                      </div>
                      <span className="text-body text-secondary">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-5 border-t border-border safe-area-bottom">
        {isJoined ? (
          <Button
            variant="outline"
            onClick={() => setShowLeaveConfirm(true)}
            className="w-full"
          >
            Leave Challenge
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            className="w-full bg-challenge text-challenge-foreground hover:bg-challenge/90"
          >
            <AchievnoIcon icon={IconTrophy} size="sm" className="mr-2" />
            Join Challenge
          </Button>
        )}
      </div>

      {/* Leave Confirmation */}
      <ConfirmModal
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave Challenge"
        description="Are you sure you want to leave this challenge? Your progress will be lost and you'll need to rejoin to participate again."
        confirmLabel="Leave Challenge"
        onConfirm={handleLeave}
        variant="destructive"
      />
    </div>
  )
}
