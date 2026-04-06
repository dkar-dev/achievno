"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Palette, Type, Layers, Square, Grid2X2, Layout, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { ColorTokens, TypographyScale, SpacingScale, RadiusScale } from "./foundations"
import { ButtonDemos, InputDemos, BadgeDemos, ChipDemosInteractive, TabDemos } from "./components-section"
import {
  AchievementCardDemos,
  GroupCardDemos,
  ActivityFeedDemos,
  StatCardDemos,
  EmptyStateDemos,
} from "./patterns"
import { ThemePreview } from "./theme-preview"

/* ─── Nav sections ───────────────────────────────────── */
const sections = [
  {
    group: "Foundations",
    items: [
      { id: "colors",     label: "Color Tokens",  icon: Palette },
      { id: "typography", label: "Typography",     icon: Type    },
      { id: "spacing",    label: "Spacing",        icon: Layers  },
      { id: "radius",     label: "Radius",         icon: Square  },
    ],
  },
  {
    group: "Components",
    items: [
      { id: "buttons",  label: "Buttons",            icon: Square   },
      { id: "inputs",   label: "Inputs",             icon: Square   },
      { id: "badges",   label: "Badges & Status",    icon: Grid2X2  },
      { id: "chips",    label: "Chips & Tags",       icon: Grid2X2  },
      { id: "tabs",     label: "Tabs & Segmented",   icon: Layout   },
    ],
  },
  {
    group: "Patterns",
    items: [
      { id: "stats",        label: "Stat Cards",     icon: Grid2X2   },
      { id: "achievements", label: "Achievement Cards", icon: Square },
      { id: "groups",       label: "Group Cards",    icon: Square    },
      { id: "activity",     label: "Activity Feed",  icon: Layers    },
      { id: "empty",        label: "Empty States",   icon: Square    },
    ],
  },
  {
    group: "Themes",
    items: [
      { id: "theme", label: "Light & Dark", icon: Smartphone },
    ],
  },
]

/* ─── Section content map ────────────────────────────── */
const sectionContent: Record<string, { title: string; description?: string; content: React.ReactNode }> = {
  colors: {
    title: "Color Tokens",
    description: "A reduced 5-color palette: 1 warm amber accent, 1 success (emerald), 1 danger (rose), and neutral grays for everything else. No decorative gradient colors.",
    content: <ColorTokens />,
  },
  typography: {
    title: "Typography Scale",
    description: "Plus Jakarta Sans for all text. 9 steps from Display (32px / 700) down to Overline (11px / 600 uppercase). Optimized for high-density scanning.",
    content: <TypographyScale />,
  },
  spacing: {
    title: "Spacing Scale",
    description: "4-point base grid (4px, 8px, 12px …). Use Tailwind spacing utilities directly — no custom values needed.",
    content: <SpacingScale />,
  },
  radius: {
    title: "Radius Scale",
    description: "10px base radius (--radius). Scale ranges from xs ~6px to full 9999px. Consistent rounding creates a calm, trustworthy feel.",
    content: <RadiusScale />,
  },
  buttons: {
    title: "Buttons",
    description: "5 variants × 3 sizes. Primary uses the amber accent. Avoid mixing more than 2 button variants in a single view.",
    content: <ButtonDemos />,
  },
  inputs: {
    title: "Inputs",
    description: "Minimal fill style. Border appears on focus. Error state replaces border with danger red and shows inline message.",
    content: <InputDemos />,
  },
  badges: {
    title: "Badges & Status",
    description: "Small inline labels communicating status. Uses subtle background fills — never full saturated backgrounds. Dot variant for live status.",
    content: <BadgeDemos />,
  },
  chips: {
    title: "Chips & Tags",
    description: "Filter chips for category selection. Selected state uses the amber accent. Removable variant for tags.",
    content: <ChipDemosInteractive />,
  },
  tabs: {
    title: "Tabs & Segmented Controls",
    description: "Underline tabs for primary navigation. Segmented controls for binary or ternary views (week/month/year, list/grid).",
    content: <TabDemos />,
  },
  stats: {
    title: "Stat Cards",
    description: "Compact 2×2 or 4-column stat grid for dashboards. Icon uses accent-subtle background for warmth without noise.",
    content: <StatCardDemos />,
  },
  achievements: {
    title: "Achievement Cards",
    description: "The primary content card. Shows goal icon, title, progress bar, streak, status badge, and days remaining.",
    content: <AchievementCardDemos />,
  },
  groups: {
    title: "Group Progress Cards",
    description: "Group card shows stacked member avatars, collective progress bar, streak, and category chip.",
    content: <GroupCardDemos />,
  },
  activity: {
    title: "Activity Feed",
    description: "Compact list row with icon, title, subtitle, and trailing value. Used for notifications and recent actions.",
    content: <ActivityFeedDemos />,
  },
  empty: {
    title: "Empty States",
    description: "Clean dashed-border container with icon, heading, description, and optional CTA. Never show blank screens.",
    content: <EmptyStateDemos />,
  },
  theme: {
    title: "Light & Dark Theme",
    description: "Side-by-side mobile preview of both themes. All tokens map identically — only values change between themes.",
    content: <ThemePreview />,
  },
}

/* ─── Main component ─────────────────────────────────── */
export function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState("colors")
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const current = sectionContent[activeSection]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top header ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 h-14 bg-background-surface border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-accent-foreground">A</span>
          </div>
          <div>
            <p className="text-label font-semibold text-foreground leading-none">Achievno</p>
            <p className="text-caption text-secondary">Design System v2</p>
          </div>
        </div>

        <button
          onClick={() => setDark((d) => !d)}
          className="h-8 w-8 rounded-lg border border-border bg-background-raised flex items-center justify-center text-secondary hover:text-foreground hover:border-border-strong transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-background-surface overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem)]">
          <nav className="py-4 px-3 space-y-5">
            {sections.map((group) => (
              <div key={group.group} className="space-y-0.5">
                <p className="text-overline text-tertiary px-2 mb-2">{group.group}</p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-label transition-colors text-left",
                      activeSection === item.id
                        ? "bg-accent-subtle text-accent-hover font-semibold"
                        : "text-secondary hover:text-foreground hover:bg-background-raised"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Mobile section picker ───────────────────────── */}
        <div className="md:hidden w-full border-b border-border bg-background-surface overflow-x-auto">
          {/* intentionally empty — handled by full page scroll */}
        </div>

        {/* ── Main content ───────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile nav strip */}
          <div className="md:hidden flex overflow-x-auto gap-1 p-3 border-b border-border bg-background-surface">
            {sections.flatMap((g) => g.items).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "shrink-0 h-7 px-3 rounded-full text-caption font-medium transition-colors",
                  activeSection === item.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-background-raised text-secondary hover:text-foreground border border-border"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Section content */}
          {current && (
            <div className="max-w-3xl mx-auto px-5 py-10 space-y-8">
              {/* Section header */}
              <div className="space-y-1.5">
                <p className="text-overline text-secondary">
                  {sections.find((g) => g.items.some((i) => i.id === activeSection))?.group}
                </p>
                <h1 className="text-heading-1 text-foreground text-balance">{current.title}</h1>
                {current.description && (
                  <p className="text-body text-secondary max-w-xl text-pretty">{current.description}</p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Content */}
              <div>{current.content}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
