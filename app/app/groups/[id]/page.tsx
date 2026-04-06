"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * GROUP WORKSPACE SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/groups/[id]
 * Tabs: Overview | Achievements | Challenges | Members | Info
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoProgress } from "@/components/achievno/progress"
import { AchievnoAvatar, AchievnoAvatarStack } from "@/components/achievno/avatar"
import { AchievnoBadge } from "@/components/achievno/badge"
import { AchievementCard } from "@/components/achievno/achievement-card"
import { TabBar } from "@/components/achievno/tabs"
import { EmptyState } from "@/components/achievno/empty-state"
import { 
  AchievnoIcon,
  IconPlus,
  IconTrophy,
  IconTarget,
  IconUsers,
  IconInfo,
  IconCrown,
  IconActivity,
  IconCalendar,
  IconChevronRight,
  IconMoreHorizontal
} from "@/lib/achievno/icons"
import { cn } from "@/lib/utils"

const GROUP_TABS = [
  { value: "overview", label: "Overview" },
  { value: "achievements", label: "Achievements" },
  { value: "challenges", label: "Challenges" },
  { value: "members", label: "Members" },
  { value: "info", label: "Info" },
]

// Mock data
const MOCK_GROUP = {
  id: "dev-team",
  name: "Dev Team",
  avatar: null,
  memberCount: 8,
  completionRate: 72,
  description: "Building amazing products together",
  createdAt: "2025-01-15",
  isAdmin: true,
}

const MOCK_ACHIEVEMENTS = [
  {
    id: "1",
    title: "Launch Presentation",
    type: "shared" as const,
    status: "active" as const,
    progress: 60,
    assignees: [
      { id: "1", name: "Alex Chen", avatar: null },
      { id: "2", name: "Bella Rodriguez", avatar: null },
    ],
    dueDate: "May 30",
  },
  {
    id: "2",
    title: "Bug Fix Race",
    type: "shared" as const,
    status: "active" as const,
    progress: 40,
    assignees: [
      { id: "1", name: "Alex Chen", avatar: null },
      { id: "3", name: "Max Kim", avatar: null },
    ],
  },
]

const MOCK_CHALLENGES = [
  {
    id: "c1",
    title: "Code Review Sprint",
    description: "First to review 10 PRs wins",
    status: "active" as const,
    participantCount: 5,
    endDate: "Apr 15",
    leader: { id: "1", name: "Alex Chen", avatar: null, score: 7 },
  },
  {
    id: "c2",
    title: "Documentation Marathon",
    description: "Most docs written in a week",
    status: "upcoming" as const,
    participantCount: 3,
    startDate: "Apr 20",
  },
]

const MOCK_MEMBERS = [
  { id: "1", name: "Alex Chen", avatar: null, role: "admin", completedCount: 24 },
  { id: "2", name: "Bella Rodriguez", avatar: null, role: "member", completedCount: 18 },
  { id: "3", name: "Max Kim", avatar: null, role: "member", completedCount: 15 },
  { id: "4", name: "Sophie Lee", avatar: null, role: "member", completedCount: 12 },
]

const MOCK_ACTIVITY = [
  { id: "a1", user: "Alex", action: 'completed "Daily Workout"', time: "2h ago" },
  { id: "a2", user: "Bella", action: 'commented "Great job!"', time: "3h ago" },
  { id: "a3", user: "Max", action: "joined the group", time: "1d ago" },
]

export default function GroupWorkspacePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title={MOCK_GROUP.name}
        onBack={() => router.push("/app/spaces")}
        rightActions={
          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-secondary">
            <AchievnoIcon icon={IconMoreHorizontal} />
          </button>
        }
      />

      {/* Group Header Card */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <AchievnoAvatar name={MOCK_GROUP.name} size="lg" />
          <div className="flex-1">
            <h1 className="text-title">{MOCK_GROUP.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-label text-secondary">
                {MOCK_GROUP.memberCount} Members
              </span>
              <span className="text-label text-secondary">|</span>
              <span className="text-label text-primary">
                {MOCK_GROUP.completionRate}% Completion
              </span>
            </div>
          </div>
        </div>
        <AchievnoProgress value={MOCK_GROUP.completionRate} size="sm" />
      </div>

      {/* Tabs */}
      <div className="px-5 py-3 border-b border-border">
        <TabBar
          tabs={GROUP_TABS.map(t => ({ id: t.value, label: t.label }))}
          value={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="p-5 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface rounded-xl p-3 text-center border border-border">
                <div className="text-heading text-primary">{MOCK_ACHIEVEMENTS.length}</div>
                <div className="text-caption text-secondary mt-1">Active Goals</div>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center border border-border">
                <div className="text-heading text-challenge">{MOCK_CHALLENGES.filter(c => c.status === "active").length}</div>
                <div className="text-caption text-secondary mt-1">Challenges</div>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center border border-border">
                <div className="text-heading text-success">89%</div>
                <div className="text-caption text-secondary mt-1">This Week</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-title">Recent Activity</h3>
                <button className="text-label text-primary">View All</button>
              </div>
              <div className="bg-surface rounded-xl border border-border divide-y divide-border">
                {MOCK_ACTIVITY.map((item) => (
                  <div key={item.id} className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <AchievnoIcon icon={IconActivity} size="sm" className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body truncate">
                        <span className="font-medium">{item.user}</span>{" "}
                        <span className="text-secondary">{item.action}</span>
                      </p>
                    </div>
                    <span className="text-caption text-tertiary">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Goals Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-title">Current Goals</h3>
                <button 
                  onClick={() => setActiveTab("achievements")}
                  className="text-label text-primary"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_ACHIEVEMENTS.slice(0, 2).map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onClick={() => router.push(`/app/achievements/${achievement.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title">{MOCK_ACHIEVEMENTS.length} Achievements</h3>
              <Button
                size="sm"
                onClick={() => router.push("/app/achievements/create")}
                className="bg-primary text-primary-foreground"
              >
                <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                New
              </Button>
            </div>
            <div className="space-y-3">
              {MOCK_ACHIEVEMENTS.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => router.push(`/app/achievements/${achievement.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title">Group Challenges</h3>
              <Button
                size="sm"
                className="bg-challenge text-challenge-foreground"
              >
                <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                Create
              </Button>
            </div>
            <div className="space-y-3">
              {MOCK_CHALLENGES.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => router.push(`/app/challenges/${challenge.id}`)}
                  className="w-full bg-surface rounded-xl border border-border p-4 text-left hover:border-border-strong transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-challenge-subtle flex items-center justify-center">
                        <AchievnoIcon icon={IconTrophy} className="text-challenge" />
                      </div>
                      <div>
                        <h4 className="text-title">{challenge.title}</h4>
                        <p className="text-label text-secondary">{challenge.description}</p>
                      </div>
                    </div>
                    <AchievnoBadge variant={challenge.status === "active" ? "info" : "default"}>
                      {challenge.status === "active" ? "Active" : "Upcoming"}
                    </AchievnoBadge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-label text-secondary">
                      <AchievnoIcon icon={IconUsers} size="sm" />
                      <span>{challenge.participantCount} participants</span>
                    </div>
                    {challenge.status === "active" && challenge.leader && (
                      <div className="flex items-center gap-2">
                        <AchievnoIcon icon={IconCrown} size="sm" className="text-primary" />
                        <span className="text-label">{challenge.leader.name}</span>
                        <span className="text-label text-primary">{challenge.leader.score} pts</span>
                      </div>
                    )}
                    {challenge.status === "upcoming" && (
                      <div className="flex items-center gap-2 text-label text-secondary">
                        <AchievnoIcon icon={IconCalendar} size="sm" />
                        <span>Starts {challenge.startDate}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title">{MOCK_MEMBERS.length} Members</h3>
              {MOCK_GROUP.isAdmin && (
                <Button size="sm" variant="outline">
                  <AchievnoIcon icon={IconPlus} size="sm" className="mr-1" />
                  Invite
                </Button>
              )}
            </div>
            <div className="bg-surface rounded-xl border border-border divide-y divide-border">
              {MOCK_MEMBERS.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center gap-3"
                >
                  <AchievnoAvatar name={member.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body font-medium">{member.name}</span>
                      {member.role === "admin" && (
                        <AchievnoBadge variant="default" size="sm">Admin</AchievnoBadge>
                      )}
                    </div>
                    <span className="text-label text-secondary">
                      {member.completedCount} achievements
                    </span>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
                    <AchievnoIcon icon={IconChevronRight} size="sm" className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="p-5 space-y-6">
            <div>
              <h3 className="text-caption text-secondary mb-2">Description</h3>
              <p className="text-body">{MOCK_GROUP.description}</p>
            </div>
            
            <div>
              <h3 className="text-caption text-secondary mb-2">Created</h3>
              <p className="text-body">{new Date(MOCK_GROUP.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <h3 className="text-caption text-secondary mb-2">Members</h3>
              <div className="flex items-center gap-3">
                <AchievnoAvatarStack users={MOCK_MEMBERS} size="sm" max={5} />
                <span className="text-body text-secondary">{MOCK_GROUP.memberCount} members</span>
              </div>
            </div>

            {MOCK_GROUP.isAdmin && (
              <div className="pt-4 border-t border-border space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <AchievnoIcon icon={IconInfo} size="sm" className="mr-2" />
                  Edit Group Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  Leave Group
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
