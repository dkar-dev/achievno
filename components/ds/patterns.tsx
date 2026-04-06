"use client"

import {
  Trophy, Flame, BookOpen, Dumbbell, Target, Users,
  ChevronRight, Check, Clock, Star, MoreHorizontal,
  TrendingUp, Calendar, Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Shared helpers ─────────────────────────────────── */
function Avatar({
  initials,
  color,
  size = "sm",
}: {
  initials: string
  color: string
  size?: "xs" | "sm" | "md"
}) {
  const sizes = { xs: "h-6 w-6 text-[10px]", sm: "h-8 w-8 text-caption", md: "h-10 w-10 text-label" }
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0", sizes[size])}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  )
}

function ProgressBar({ value, max = 100, color = "var(--accent)" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-1.5 w-full rounded-full bg-background-subtle overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function StatusDot({ status }: { status: "success" | "warning" | "danger" | "neutral" }) {
  const colors = {
    success: "bg-success",
    warning: "bg-accent",
    danger:  "bg-danger",
    neutral: "bg-foreground-tertiary",
  }
  return <span className={cn("h-2 w-2 rounded-full shrink-0", colors[status])} />
}

/* ══════════════════════════════════════════════════════
   ACHIEVEMENT CARD
══════════════════════════════════════════════════════ */
function AchievementCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  progress,
  target,
  unit,
  streak,
  status,
  daysLeft,
}: {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  description: string
  progress: number
  target: number
  unit: string
  streak?: number
  status: "success" | "warning" | "danger" | "neutral"
  daysLeft?: number
}) {
  const pct = Math.min(100, Math.round((progress / target) * 100))
  const statusColors = {
    success: "var(--success)",
    warning: "var(--accent)",
    danger:  "var(--danger)",
    neutral: "var(--foreground-tertiary)",
  }
  const statusLabels = {
    success: "On track",
    warning: "Due today",
    danger:  "Overdue",
    neutral: "Paused",
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-border-strong transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-title text-foreground truncate">{title}</p>
            {streak && (
              <span className="inline-flex items-center gap-1 text-caption text-amber-600 font-medium bg-accent-subtle rounded-full px-2 py-0.5 shrink-0">
                <Flame className="h-3 w-3" />
                {streak}
              </span>
            )}
          </div>
          <p className="text-body-sm text-secondary truncate">{description}</p>
        </div>
        <button className="text-foreground-tertiary hover:text-foreground shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <ProgressBar value={progress} max={target} color={statusColors[status]} />
        <div className="flex items-center justify-between">
          <p className="text-caption text-secondary">
            <span className="text-foreground font-medium">{progress}</span>
            <span> / {target} {unit}</span>
          </p>
          <p className="text-caption font-medium" style={{ color: statusColors[status] }}>{pct}%</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          <StatusDot status={status} />
          <span className="text-caption text-secondary">{statusLabels[status]}</span>
        </div>
        {daysLeft !== undefined && (
          <div className="flex items-center gap-1 text-caption text-secondary">
            <Clock className="h-3 w-3" />
            <span>{daysLeft}d left</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   GROUP PROGRESS CARD
══════════════════════════════════════════════════════ */
const memberAvatars = [
  { initials: "AK", color: "#6366f1" },
  { initials: "LM", color: "#0ea5e9" },
  { initials: "RJ", color: "#059669" },
  { initials: "SB", color: "#e11d48" },
]

function GroupCard({
  name,
  description,
  memberCount,
  progress,
  target,
  unit,
  streak,
  category,
}: {
  name: string
  description: string
  memberCount: number
  progress: number
  target: number
  unit: string
  streak: number
  category: string
}) {
  const pct = Math.min(100, Math.round((progress / target) * 100))
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4 hover:border-border-strong transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-title text-foreground truncate">{name}</p>
            <span className="text-caption text-amber-700 bg-accent-subtle rounded-full px-2 py-0.5 font-medium shrink-0">{category}</span>
          </div>
          <p className="text-body-sm text-secondary">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-foreground-tertiary shrink-0 mt-0.5" />
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-label text-secondary">Group progress</p>
          <p className="text-label font-semibold text-foreground">{pct}%</p>
        </div>
        <ProgressBar value={progress} max={target} />
        <p className="text-caption text-secondary">{progress} / {target} {unit} completed</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {memberAvatars.slice(0, 4).map((a) => (
              <Avatar key={a.initials} initials={a.initials} color={a.color} size="xs" />
            ))}
          </div>
          <p className="text-caption text-secondary">{memberCount} members</p>
        </div>
        <div className="flex items-center gap-1 text-caption text-amber-600 font-medium">
          <Flame className="h-3 w-3" />
          <span>{streak}-day streak</span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   LIST ROW (activity feed row)
══════════════════════════════════════════════════════ */
function ListRow({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  trailing,
  trailingSubtitle,
  showDivider = true,
}: {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  trailing?: string
  trailingSubtitle?: string
  showDivider?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-3 py-3 px-4", showDivider && "border-b border-border last:border-0")}>
      <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label text-foreground">{title}</p>
        <p className="text-caption text-secondary truncate">{subtitle}</p>
      </div>
      {(trailing || trailingSubtitle) && (
        <div className="text-right shrink-0">
          {trailing && <p className="text-label text-foreground">{trailing}</p>}
          {trailingSubtitle && <p className="text-caption text-secondary">{trailingSubtitle}</p>}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════ */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center rounded-xl border border-dashed border-border">
      <div className="h-12 w-12 rounded-xl bg-background-raised flex items-center justify-center">
        <Icon className="h-6 w-6 text-foreground-tertiary" />
      </div>
      <div className="space-y-1">
        <p className="text-title text-foreground">{title}</p>
        <p className="text-body-sm text-secondary max-w-xs">{description}</p>
      </div>
      {action}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  change,
  changeDir = "up",
  icon: Icon,
}: {
  label: string
  value: string
  change: string
  changeDir?: "up" | "down"
  icon: React.ElementType
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label text-secondary">{label}</p>
        <div className="h-8 w-8 rounded-lg bg-accent-subtle flex items-center justify-center">
          <Icon className="h-4 w-4 text-accent-hover" />
        </div>
      </div>
      <p className="text-heading-1 text-foreground">{value}</p>
      <p className={cn("text-caption font-medium flex items-center gap-1", changeDir === "up" ? "text-success" : "text-danger")}>
        <TrendingUp className={cn("h-3 w-3", changeDir === "down" && "rotate-180")} />
        {change} vs last week
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   EXPORTS
══════════════════════════════════════════════════════ */
export function AchievementCardDemos() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <AchievementCard
        icon={Dumbbell}
        iconColor="#059669"
        iconBg="#d1fae5"
        title="Daily Workout"
        description="30 min cardio or strength"
        progress={22}
        target={30}
        unit="min"
        streak={8}
        status="warning"
        daysLeft={1}
      />
      <AchievementCard
        icon={BookOpen}
        iconColor="#6366f1"
        iconBg="#ede9fe"
        title="Read Every Day"
        description="Build a reading habit"
        progress={15}
        target={20}
        unit="pages"
        streak={14}
        status="success"
        daysLeft={5}
      />
      <AchievementCard
        icon={Target}
        iconColor="#f59e0b"
        iconBg="#fef3c7"
        title="10k Steps"
        description="Hit your daily step goal"
        progress={4200}
        target={10000}
        unit="steps"
        status="danger"
        daysLeft={0}
      />
      <AchievementCard
        icon={Zap}
        iconColor="#0ea5e9"
        iconBg="#e0f2fe"
        title="Drink Water"
        description="8 glasses per day"
        progress={6}
        target={8}
        unit="glasses"
        streak={3}
        status="success"
        daysLeft={1}
      />
    </div>
  )
}

export function GroupCardDemos() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <GroupCard
        name="Morning Crew"
        description="Early risers accountability group"
        memberCount={6}
        progress={18}
        target={30}
        unit="sessions"
        streak={12}
        category="Health"
      />
      <GroupCard
        name="Book Club"
        description="One chapter a day, every day"
        memberCount={4}
        progress={84}
        target={100}
        unit="pages"
        streak={5}
        category="Learning"
      />
    </div>
  )
}

export function ActivityFeedDemos() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-title text-foreground">Recent Activity</p>
      </div>
      <ListRow icon={Trophy}    iconColor="#f59e0b" iconBg="#fef3c7" title="Achievement unlocked" subtitle="You completed 10 workouts this month" trailing="🏆" trailingSubtitle="2m ago" />
      <ListRow icon={Users}     iconColor="#6366f1" iconBg="#ede9fe" title="Morning Crew — new member" subtitle="Alex K. joined your group" trailing="+1" trailingSubtitle="1h ago" />
      <ListRow icon={Flame}     iconColor="#e11d48" iconBg="#ffe4e6" title="Streak milestone" subtitle="14-day reading streak — keep going!" trailing="🔥 14" trailingSubtitle="Yesterday" />
      <ListRow icon={Check}     iconColor="#059669" iconBg="#d1fae5" title="Goal completed" subtitle="Daily water goal — 8/8 glasses" trailing="Done" trailingSubtitle="Yesterday" showDivider={false} />
    </div>
  )
}

export function StatCardDemos() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total Goals" value="24" change="+3" changeDir="up" icon={Target} />
      <StatCard label="Completed" value="18" change="+5" changeDir="up" icon={Check} />
      <StatCard label="Current Streak" value="14d" change="+2" changeDir="up" icon={Flame} />
      <StatCard label="Group Score" value="87%" change="-2%" changeDir="down" icon={Star} />
    </div>
  )
}

export function EmptyStateDemos() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <EmptyState
        icon={Trophy}
        title="No achievements yet"
        description="Start tracking your first goal to see your progress here."
        action={
          <button className="h-9 px-4 rounded-lg bg-accent text-accent-foreground text-body-sm font-medium hover:bg-accent-hover transition-colors">
            Add first goal
          </button>
        }
      />
      <EmptyState
        icon={Users}
        title="No groups joined"
        description="Join a group to stay accountable and celebrate wins together."
        action={
          <button className="h-9 px-4 rounded-lg bg-background-raised text-foreground border border-border text-body-sm font-medium hover:bg-background-subtle transition-colors">
            Explore groups
          </button>
        }
      />
    </div>
  )
}
