"use client"

import { cn } from "@/lib/utils"

/* ─── Section wrapper ─────────────────────────────────── */
export function DSSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6">
      <div className="space-y-1">
        <p className="text-overline text-secondary">Design Tokens</p>
        <h2 className="text-heading-1 text-foreground text-balance">{title}</h2>
        {description && (
          <p className="text-body text-secondary max-w-lg text-pretty">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

/* ─── Token card wrapper ──────────────────────────────── */
export function TokenGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-label text-secondary">{label}</p>
      {children}
    </div>
  )
}

/* ─── Color Swatches ─────────────────────────────────── */
const colorTokens = [
  {
    group: "Backgrounds",
    swatches: [
      { name: "background",        value: "var(--background)",         hex: "#f9f9f8", label: "Canvas" },
      { name: "background-surface",value: "var(--background-surface)", hex: "#ffffff", label: "Surface" },
      { name: "background-raised", value: "var(--background-raised)",  hex: "#f1f0ef", label: "Raised" },
      { name: "background-subtle", value: "var(--background-subtle)",  hex: "#e8e8e6", label: "Subtle" },
    ],
  },
  {
    group: "Text",
    swatches: [
      { name: "foreground",          value: "var(--foreground)",           hex: "#18181b", label: "Primary" },
      { name: "foreground-secondary",value: "var(--foreground-secondary)", hex: "#71717a", label: "Secondary" },
      { name: "foreground-tertiary", value: "var(--foreground-tertiary)",  hex: "#a1a09a", label: "Tertiary" },
    ],
  },
  {
    group: "Brand Accent",
    swatches: [
      { name: "accent",        value: "var(--accent)",        hex: "#f59e0b", label: "Amber" },
      { name: "accent-hover",  value: "var(--accent-hover)",  hex: "#d97706", label: "Hover" },
      { name: "accent-subtle", value: "var(--accent-subtle)", hex: "#fef3c7", label: "Subtle" },
    ],
  },
  {
    group: "Semantic",
    swatches: [
      { name: "success",        value: "var(--success)",        hex: "#059669", label: "Success" },
      { name: "success-subtle", value: "var(--success-subtle)", hex: "#d1fae5", label: "Success Subtle" },
      { name: "danger",         value: "var(--danger)",         hex: "#e11d48", label: "Danger" },
      { name: "danger-subtle",  value: "var(--danger-subtle)",  hex: "#ffe4e6", label: "Danger Subtle" },
    ],
  },
  {
    group: "Borders & Structure",
    swatches: [
      { name: "border",       value: "var(--border)",       hex: "#e4e4e0", label: "Default" },
      { name: "border-strong",value: "var(--border-strong)",hex: "#d1d1cc", label: "Strong" },
      { name: "input",        value: "var(--input)",        hex: "#f1f0ef", label: "Input Fill" },
    ],
  },
]

export function ColorTokens() {
  return (
    <div className="space-y-8">
      {colorTokens.map((group) => (
        <div key={group.group} className="space-y-3">
          <p className="text-label text-secondary">{group.group}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.swatches.map((s) => (
              <div key={s.name} className="space-y-2">
                <div
                  className="h-14 w-full rounded-lg border border-border"
                  style={{ backgroundColor: s.value }}
                />
                <div className="space-y-0.5">
                  <p className="text-label text-foreground">{s.label}</p>
                  <p className="text-caption text-secondary font-mono">{s.hex}</p>
                  <p className="text-caption text-tertiary font-mono">--{s.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Typography Scale ───────────────────────────────── */
const typeSteps = [
  { cls: "text-display",   label: "Display",   spec: "32 / 700 / -4%",  sample: "Achieve more, together." },
  { cls: "text-heading-1", label: "Heading 1", spec: "24 / 700 / -3%",  sample: "Your progress this week" },
  { cls: "text-heading-2", label: "Heading 2", spec: "20 / 600 / -2.5%",sample: "Morning Momentum" },
  { cls: "text-title",     label: "Title",     spec: "17 / 600 / -1%",  sample: "Complete 3 workouts" },
  { cls: "text-body",      label: "Body",      spec: "15 / 400 / 0%",   sample: "Track habits with your group and stay accountable every day." },
  { cls: "text-body-sm",   label: "Body Small",spec: "14 / 400 / 0%",   sample: "You completed 5 tasks yesterday — great streak!" },
  { cls: "text-label",     label: "Label",     spec: "13 / 500 / 1%",   sample: "Due in 2 days" },
  { cls: "text-caption",   label: "Caption",   spec: "12 / 500 / 3%",   sample: "Last updated 4 minutes ago" },
  { cls: "text-overline",  label: "Overline",  spec: "11 / 600 / 8%",   sample: "Daily Challenges" },
]

export function TypographyScale() {
  return (
    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
      {typeSteps.map((step, i) => (
        <div key={step.label} className={cn("flex items-baseline gap-6 px-5 py-4", i % 2 === 1 && "bg-background")}>
          <div className="w-24 shrink-0 space-y-0.5">
            <p className="text-caption text-secondary">{step.label}</p>
            <p className="text-caption text-tertiary font-mono">{step.spec}</p>
          </div>
          <p className={cn(step.cls, "text-foreground truncate")}>{step.sample}</p>
        </div>
      ))}
    </div>
  )
}

/* ─── Spacing Scale ──────────────────────────────────── */
const spacingSteps = [
  { name: "1",  px: 4,   rem: "0.25rem" },
  { name: "2",  px: 8,   rem: "0.5rem"  },
  { name: "3",  px: 12,  rem: "0.75rem" },
  { name: "4",  px: 16,  rem: "1rem"    },
  { name: "5",  px: 20,  rem: "1.25rem" },
  { name: "6",  px: 24,  rem: "1.5rem"  },
  { name: "8",  px: 32,  rem: "2rem"    },
  { name: "10", px: 40,  rem: "2.5rem"  },
  { name: "12", px: 48,  rem: "3rem"    },
  { name: "16", px: 64,  rem: "4rem"    },
  { name: "20", px: 80,  rem: "5rem"    },
]

export function SpacingScale() {
  return (
    <div className="space-y-2">
      {spacingSteps.map((step) => (
        <div key={step.name} className="flex items-center gap-4">
          <div className="w-8 text-right shrink-0">
            <span className="text-caption text-secondary font-mono">{step.name}</span>
          </div>
          <div
            className="h-5 rounded-sm bg-accent/30 border border-accent/40 shrink-0"
            style={{ width: step.px }}
          />
          <div className="flex items-center gap-3">
            <span className="text-label text-foreground font-mono">{step.px}px</span>
            <span className="text-caption text-tertiary font-mono">{step.rem}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Radius Scale ───────────────────────────────────── */
const radiusSteps = [
  { label: "xs",   value: "calc(var(--radius) - 4px)", approx: "~6px"  },
  { label: "sm",   value: "calc(var(--radius) - 2px)", approx: "~8px"  },
  { label: "md",   value: "var(--radius)",              approx: "10px"  },
  { label: "lg",   value: "calc(var(--radius) + 4px)", approx: "~14px" },
  { label: "xl",   value: "calc(var(--radius) + 8px)", approx: "~18px" },
  { label: "2xl",  value: "calc(var(--radius) + 14px)",approx: "~24px" },
  { label: "full", value: "9999px",                     approx: "∞"     },
]

export function RadiusScale() {
  return (
    <div className="flex flex-wrap gap-6">
      {radiusSteps.map((r) => (
        <div key={r.label} className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 border-2 border-border bg-background-raised"
            style={{ borderRadius: r.value }}
          />
          <div className="text-center space-y-0.5">
            <p className="text-label text-foreground">radius-{r.label}</p>
            <p className="text-caption text-secondary font-mono">{r.approx}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
