"use client"

import {
  Trophy, Flame, Dumbbell, BookOpen, Target, Users,
  Bell, Search, Home, BarChart2, Plus, Settings, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Tiny progress bar used inside the phone ─────────── */
function MiniProgress({ value, max = 100, color = "#f59e0b" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--background-subtle, #e8e8e6)" }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }} />
    </div>
  )
}

/* ─── Single mobile phone frame ──────────────────────── */
function PhoneFrame({ dark, label }: { dark: boolean; label: string }) {
  const bg         = dark ? "#111110" : "#f9f9f8"
  const surface    = dark ? "#1a1a19" : "#ffffff"
  const raised     = dark ? "#222220" : "#f1f0ef"
  const subtle     = dark ? "#2a2a28" : "#e8e8e6"
  const border     = dark ? "#2a2a28" : "#e4e4e0"
  const fg         = dark ? "#f5f5f4" : "#18181b"
  const fgSec      = dark ? "#a8a89e" : "#71717a"
  const fgTert     = dark ? "#6c6c65" : "#a1a09a"
  const accent     = "#f59e0b"
  const accentFg   = dark ? "#111110" : "#ffffff"
  const success    = dark ? "#10b981" : "#059669"
  const successSub = dark ? "#052e1a" : "#d1fae5"
  const danger     = dark ? "#f43f5e" : "#e11d48"
  const dangerSub  = dark ? "#2d0614" : "#ffe4e6"

  const goals = [
    { icon: Dumbbell, iconColor: success, iconBg: successSub, label: "Daily Workout", value: 22, max: 30, unit: "min", streak: 8, status: "warning" as const },
    { icon: BookOpen, iconColor: "#6366f1", iconBg: dark ? "#1e1b4b" : "#ede9fe", label: "Read Every Day", value: 15, max: 20, unit: "pages", streak: 14, status: "success" as const },
    { icon: Target, iconColor: accent, iconBg: dark ? "#2d1f00" : "#fef3c7", label: "10k Steps", value: 4200, max: 10000, unit: "steps", status: "danger" as const },
  ]
  const statusColors = { success: success, warning: accent, danger: danger, neutral: fgTert }
  const statusLabels = { success: "On track", warning: "Due today", danger: "Overdue", neutral: "Paused" }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Phone shell */}
      <div
        className="relative w-[220px] rounded-[32px] overflow-hidden shadow-2xl"
        style={{ backgroundColor: dark ? "#0a0a09" : "#d1d1cc", padding: 3 }}
      >
        {/* Screen */}
        <div className="rounded-[30px] overflow-hidden" style={{ backgroundColor: bg }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1" style={{ backgroundColor: surface }}>
            <span className="text-[10px] font-semibold" style={{ color: fg }}>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: success }} />
              <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: fgTert }} />
              <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: fgTert }} />
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: surface, borderBottom: `1px solid ${border}` }}>
            <div>
              <p className="text-[11px] font-medium" style={{ color: fgSec }}>Good morning</p>
              <p className="text-[14px] font-bold tracking-tight" style={{ color: fg }}>Alex K.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: raised }}>
                <Search className="h-3.5 w-3.5" style={{ color: fgSec }} />
              </div>
              <div className="relative h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: raised }}>
                <Bell className="h-3.5 w-3.5" style={{ color: fgSec }} />
                <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: danger }} />
              </div>
            </div>
          </div>

          {/* Streak banner */}
          <div className="mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5" style={{ backgroundColor: dark ? "#2d1f00" : "#fef3c7", border: `1px solid ${accent}33` }}>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent }}>
              <Flame className="h-4 w-4" style={{ color: accentFg }} />
            </div>
            <div>
              <p className="text-[12px] font-semibold" style={{ color: dark ? "#fbbf24" : "#92400e" }}>14-day streak!</p>
              <p className="text-[10px]" style={{ color: dark ? "#d97706" : "#b45309" }}>Keep going, don&apos;t break it</p>
            </div>
          </div>

          {/* Section label */}
          <div className="flex items-center justify-between px-4 mt-4 mb-2">
            <p className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: fgTert }}>Today&apos;s Goals</p>
            <p className="text-[10px] font-medium" style={{ color: accent }}>See all</p>
          </div>

          {/* Goal cards */}
          <div className="px-3 space-y-2">
            {goals.map((g, i) => (
              <div key={i} className="rounded-xl p-3 space-y-2" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: g.iconBg }}>
                    <g.icon className="h-3.5 w-3.5" style={{ color: g.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate" style={{ color: fg }}>{g.label}</p>
                    <p className="text-[9px]" style={{ color: fgSec }}>
                      {g.value}/{g.max} {g.unit}
                      {g.streak && <span> · 🔥 {g.streak}</span>}
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: g.status === "success" ? successSub : g.status === "danger" ? dangerSub : dark ? "#2d1f00" : "#fef3c7", color: statusColors[g.status] }}
                  >
                    {statusLabels[g.status]}
                  </span>
                </div>
                <MiniProgress value={g.value} max={g.max} color={statusColors[g.status]} />
              </div>
            ))}
          </div>

          {/* Bottom tab bar */}
          <div className="flex items-center justify-around px-4 py-2.5 mt-4" style={{ backgroundColor: surface, borderTop: `1px solid ${border}` }}>
            {[
              { icon: Home,     label: "Home",   active: true  },
              { icon: Trophy,   label: "Goals",  active: false },
              { icon: Plus,     label: "",       active: false, fab: true },
              { icon: Users,    label: "Groups", active: false },
              { icon: BarChart2,label: "Stats",  active: false },
            ].map((item, i) => (
              item.fab
                ? (
                  <div key={i} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
                    <Plus className="h-4 w-4" style={{ color: accentFg }} />
                  </div>
                )
                : (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <item.icon className="h-4 w-4" style={{ color: item.active ? accent : fgTert }} />
                    <p className="text-[8px]" style={{ color: item.active ? accent : fgTert }}>{item.label}</p>
                  </div>
                )
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2 pt-1">
            <div className="h-1 w-16 rounded-full" style={{ backgroundColor: subtle }} />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="text-center space-y-0.5">
        <p className="text-label text-foreground font-semibold">{label}</p>
        <p className="text-caption text-secondary">{dark ? "Dark theme" : "Light theme"}</p>
      </div>
    </div>
  )
}

/* ─── Exported section ───────────────────────────────── */
export function ThemePreview() {
  return (
    <div className="space-y-8">
      <p className="text-body text-secondary max-w-lg text-pretty">
        Both themes share the same token structure. Light is the default; dark activates via the{" "}
        <code className="text-label font-mono bg-background-raised px-1.5 py-0.5 rounded-md">.dark</code> class on{" "}
        <code className="text-label font-mono bg-background-raised px-1.5 py-0.5 rounded-md">html</code>.
      </p>

      {/* Side-by-side phones */}
      <div className="flex flex-col sm:flex-row gap-12 items-start justify-center py-4">
        <PhoneFrame dark={false} label="Light — Default" />
        <PhoneFrame dark={true}  label="Dark — Optional" />
      </div>

      {/* Token diff table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="px-5 py-3 border-b border-border bg-background">
          <p className="text-label font-semibold text-foreground">Token delta — light vs. dark</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { token: "--background",         light: "#f9f9f8", dark: "#111110" },
            { token: "--background-surface", light: "#ffffff", dark: "#1a1a19" },
            { token: "--foreground",         light: "#18181b", dark: "#f5f5f4" },
            { token: "--foreground-secondary",light: "#71717a", dark: "#a8a89e" },
            { token: "--border",             light: "#e4e4e0", dark: "#2a2a28" },
            { token: "--accent",             light: "#f59e0b", dark: "#f59e0b" },
            { token: "--success",            light: "#059669", dark: "#10b981" },
            { token: "--danger",             light: "#e11d48", dark: "#f43f5e" },
          ].map((row) => (
            <div key={row.token} className="flex items-center gap-4 px-5 py-2.5">
              <code className="text-caption font-mono text-foreground w-56 shrink-0">{row.token}</code>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-4 w-4 rounded border border-border shrink-0" style={{ backgroundColor: row.light }} />
                <code className="text-caption font-mono text-secondary">{row.light}</code>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-4 w-4 rounded border border-border shrink-0" style={{ backgroundColor: row.dark }} />
                <code className="text-caption font-mono text-secondary">{row.dark}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
