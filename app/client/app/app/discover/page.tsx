"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * DISCOVER SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/discover
 * Browse public groups and featured challenges
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoAvatar } from "@/components/achievno/avatar"
import { AchievnoBadge } from "@/components/achievno/badge"
import { TabBar } from "@/components/achievno/tabs"
import { 
  AchievnoIcon,
  IconSearch,
  IconUsers,
  IconTrophy,
  IconChevronRight,
  IconGlobe
} from "@/lib/achievno/icons"
import { ROUTES } from "@/lib/achievno/constants"
import { cn } from "@/lib/utils"

const DISCOVER_TABS = [
  { value: "groups", label: "Groups" },
  { value: "challenges", label: "Challenges" },
]

// Mock public groups
const MOCK_PUBLIC_GROUPS = [
  {
    id: "fitness-warriors",
    name: "Fitness Warriors",
    description: "Daily workout challenges and fitness goals",
    memberCount: 1240,
    category: "Health",
    avatar: null,
  },
  {
    id: "book-club",
    name: "Book Club 2026",
    description: "Read 52 books this year together",
    memberCount: 856,
    category: "Learning",
    avatar: null,
  },
  {
    id: "early-risers",
    name: "Early Risers",
    description: "Wake up at 5am challenge community",
    memberCount: 2100,
    category: "Productivity",
    avatar: null,
  },
  {
    id: "code-masters",
    name: "Code Masters",
    description: "Daily coding challenges and learning",
    memberCount: 3400,
    category: "Tech",
    avatar: null,
  },
]

// Mock featured challenges
const MOCK_FEATURED_CHALLENGES = [
  {
    id: "april-fitness",
    title: "April Fitness Challenge",
    description: "30 days of daily workouts",
    participantCount: 5420,
    groupName: "Fitness Warriors",
    status: "active" as const,
    endsIn: "24 days",
  },
  {
    id: "reading-sprint",
    title: "Spring Reading Sprint",
    description: "Read 5 books by May",
    participantCount: 1890,
    groupName: "Book Club 2026",
    status: "active" as const,
    endsIn: "48 days",
  },
]

export default function DiscoverPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("groups")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredGroups = MOCK_PUBLIC_GROUPS.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Discover"
        onBack={() => router.push(ROUTES.rootShell())}
      />

      {/* Search */}
      <div className="px-5 py-3 border-b border-border">
        <div className="relative">
          <AchievnoIcon
            icon={IconSearch}
            size="sm"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups and challenges..."
            className="pl-10 bg-input-surface border-input-border"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-3 border-b border-border">
        <TabBar
          tabs={DISCOVER_TABS.map(t => ({ id: t.value, label: t.label }))}
          value={activeTab}
          onChange={setActiveTab}
          variant="pill"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => router.push(`/app/discover/groups/${group.id}`)}
                className="w-full bg-surface rounded-xl border border-border p-4 text-left hover:border-border-strong transition-colors"
              >
                <div className="flex items-start gap-3">
                  <AchievnoAvatar name={group.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-title truncate">{group.name}</h3>
                      <AchievnoBadge variant="default" size="sm">
                        {group.category}
                      </AchievnoBadge>
                    </div>
                    <p className="text-label text-secondary line-clamp-2 mb-2">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-2 text-label text-secondary">
                      <AchievnoIcon icon={IconUsers} size="sm" />
                      <span>{group.memberCount.toLocaleString()} members</span>
                    </div>
                  </div>
                  <AchievnoIcon
                    icon={IconChevronRight}
                    size="sm"
                    className="text-muted-foreground shrink-0"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="space-y-3">
            {MOCK_FEATURED_CHALLENGES.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => router.push(`/app/discover/challenges/${challenge.id}`)}
                className="w-full bg-surface rounded-xl border border-border p-4 text-left hover:border-border-strong transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-challenge-subtle flex items-center justify-center shrink-0">
                    <AchievnoIcon icon={IconTrophy} className="text-challenge" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-title truncate">{challenge.title}</h3>
                      <AchievnoBadge variant="info" size="sm">Active</AchievnoBadge>
                    </div>
                    <p className="text-label text-secondary mb-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-label text-secondary">
                        <AchievnoIcon icon={IconUsers} size="sm" />
                        <span>{challenge.participantCount.toLocaleString()} joined</span>
                      </div>
                      <span className="text-label text-primary">
                        {challenge.endsIn} left
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
