"use client"

import { useState } from "react"
import {
  Plus, Trash2, ArrowRight, Check, Loader2,
  Search, Eye, EyeOff, AlertCircle, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Block wrapper ──────────────────────────────────── */
function Block({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-label text-secondary">{label}</p>
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   BUTTONS
══════════════════════════════════════════════════════ */
function Btn({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconOnly = false,
  disabled = false,
  children,
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
  iconOnly?: boolean
  disabled?: boolean
  children?: React.ReactNode
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed select-none shrink-0"

  const variants = {
    primary:   "bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.97]",
    secondary: "bg-background-raised text-foreground border border-border hover:bg-background-subtle active:scale-[0.97]",
    outline:   "bg-transparent text-foreground border border-border hover:bg-background-raised active:scale-[0.97]",
    ghost:     "bg-transparent text-foreground hover:bg-background-raised active:scale-[0.97]",
    danger:    "bg-danger text-danger-foreground hover:opacity-90 active:scale-[0.97]",
  }

  const sizes = {
    sm: iconOnly ? "h-8 w-8 text-label"   : "h-8 px-3 text-label",
    md: iconOnly ? "h-9 w-9 text-body-sm" : "h-9 px-4 text-body-sm",
    lg: iconOnly ? "h-11 w-11 text-body"  : "h-11 px-5 text-body",
  }

  return (
    <button disabled={disabled || loading} className={cn(base, variants[variant], sizes[size])}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {!iconOnly && children}
    </button>
  )
}

export function ButtonDemos() {
  return (
    <div className="space-y-8">
      <Block label="Variants">
        <div className="flex flex-wrap gap-3">
          <Btn variant="primary">Primary</Btn>
          <Btn variant="secondary">Secondary</Btn>
          <Btn variant="outline">Outline</Btn>
          <Btn variant="ghost">Ghost</Btn>
          <Btn variant="danger">Danger</Btn>
        </div>
      </Block>

      <Block label="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Btn variant="primary" size="sm">Small</Btn>
          <Btn variant="primary" size="md">Medium</Btn>
          <Btn variant="primary" size="lg">Large</Btn>
        </div>
      </Block>

      <Block label="With Icons">
        <div className="flex flex-wrap items-center gap-3">
          <Btn variant="primary" icon={<Plus className="h-4 w-4" />}>Add Achievement</Btn>
          <Btn variant="secondary" icon={<Check className="h-4 w-4" />}>Mark Done</Btn>
          <Btn variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>View Group</Btn>
          <Btn variant="danger" icon={<Trash2 className="h-4 w-4" />}>Remove</Btn>
        </div>
      </Block>

      <Block label="Icon-only">
        <div className="flex flex-wrap items-center gap-3">
          <Btn variant="primary" size="md" iconOnly icon={<Plus className="h-4 w-4" />} />
          <Btn variant="secondary" size="md" iconOnly icon={<Search className="h-4 w-4" />} />
          <Btn variant="outline" size="md" iconOnly icon={<ArrowRight className="h-4 w-4" />} />
          <Btn variant="ghost" size="md" iconOnly icon={<Trash2 className="h-4 w-4" />} />
        </div>
      </Block>

      <Block label="States">
        <div className="flex flex-wrap gap-3">
          <Btn variant="primary" loading>Loading</Btn>
          <Btn variant="primary" disabled>Disabled</Btn>
          <Btn variant="secondary" disabled>Disabled</Btn>
        </div>
      </Block>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   INPUTS
══════════════════════════════════════════════════════ */
function Input({
  label,
  placeholder,
  helper,
  error,
  disabled,
  type = "text",
  prefix,
  suffix,
}: {
  label?: string
  placeholder?: string
  helper?: string
  error?: string
  disabled?: boolean
  type?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === "password"

  return (
    <div className="space-y-1.5">
      {label && <label className="text-label text-foreground">{label}</label>}
      <div
        className={cn(
          "flex items-center h-10 rounded-lg border bg-input px-3 gap-2 transition-colors",
          error
            ? "border-danger focus-within:ring-2 focus-within:ring-danger/30"
            : "border-input-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {prefix && <span className="text-secondary shrink-0">{prefix}</span>}
        <input
          type={isPassword && !show ? "password" : "text"}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-body-sm text-foreground placeholder:text-foreground-tertiary outline-none disabled:cursor-not-allowed"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="text-secondary hover:text-foreground transition-colors shrink-0"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {suffix && !isPassword && <span className="text-secondary shrink-0">{suffix}</span>}
        {error && <AlertCircle className="h-4 w-4 text-danger shrink-0" />}
      </div>
      {(helper || error) && (
        <p className={cn("text-caption", error ? "text-danger" : "text-secondary")}>
          {error ?? helper}
        </p>
      )}
    </div>
  )
}

export function InputDemos() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Input label="Default" placeholder="Enter your name" helper="Displayed on your profile" />
      <Input label="With search icon" placeholder="Search achievements…" prefix={<Search className="h-4 w-4" />} />
      <Input label="Password" type="password" placeholder="Enter password" />
      <Input label="Error state" placeholder="user@email.com" error="This email is already in use." />
      <Input label="Disabled" placeholder="Cannot edit this field" disabled helper="This field is read-only" />
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   BADGES
══════════════════════════════════════════════════════ */
function Badge({
  variant = "neutral",
  dot = false,
  icon,
  children,
  size = "md",
}: {
  variant?: "neutral" | "success" | "danger" | "warning" | "accent"
  dot?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  size?: "sm" | "md"
}) {
  const variants = {
    neutral: "bg-background-raised text-foreground border border-border",
    success: "bg-success-subtle text-success border border-success/20",
    danger:  "bg-danger-subtle  text-danger  border border-danger/20",
    warning: "bg-accent-subtle  text-amber-700 border border-accent/20",
    accent:  "bg-accent         text-accent-foreground",
  }
  const dotColors = {
    neutral: "bg-foreground-tertiary",
    success: "bg-success",
    danger:  "bg-danger",
    warning: "bg-accent",
    accent:  "bg-accent-foreground",
  }
  const sizes = { sm: "h-5 px-2 text-caption gap-1", md: "h-6 px-2.5 text-label gap-1.5" }

  return (
    <span className={cn("inline-flex items-center font-medium rounded-full", variants[variant], sizes[size])}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {!dot && icon}
      {children}
    </span>
  )
}

export function BadgeDemos() {
  return (
    <div className="space-y-6">
      <Block label="Variants">
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="accent">Accent</Badge>
        </div>
      </Block>

      <Block label="With dot indicator">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" dot>Active</Badge>
          <Badge variant="danger" dot>Overdue</Badge>
          <Badge variant="warning" dot>In Progress</Badge>
          <Badge variant="neutral" dot>Paused</Badge>
        </div>
      </Block>

      <Block label="Sizes">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" size="sm" dot>Small</Badge>
          <Badge variant="success" size="md" dot>Medium</Badge>
        </div>
      </Block>

      <Block label="Usage examples">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" dot>On track</Badge>
          <Badge variant="danger" dot>Missed</Badge>
          <Badge variant="warning" dot>Due today</Badge>
          <Badge variant="accent">New</Badge>
          <Badge variant="neutral">Archived</Badge>
          <Badge variant="neutral">7-day streak</Badge>
        </div>
      </Block>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   CHIPS / TAGS
══════════════════════════════════════════════════════ */
function Chip({
  selected = false,
  removable = false,
  onRemove,
  children,
}: {
  selected?: boolean
  removable?: boolean
  onRemove?: () => void
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-label font-medium transition-all cursor-default select-none",
        selected
          ? "bg-accent text-accent-foreground"
          : "bg-background-raised text-foreground border border-border hover:border-border-strong"
      )}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className={cn(
            "rounded-full transition-colors -mr-1",
            selected ? "text-accent-foreground/70 hover:text-accent-foreground" : "text-foreground-tertiary hover:text-foreground"
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

export function ChipDemos() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All")
  const filters = ["All", "Health", "Learning", "Work", "Personal"]
  const [chips, setChips] = useState(["Fitness", "Reading", "Meditation", "Coding"])

  return (
    <div className="space-y-6">
      <Block label="Filter chips (interactive)">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Chip key={f} selected={selectedFilter === f} onClick={() => setSelectedFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </Block>

      <Block label="Removable tags">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <Chip key={c} removable onRemove={() => setChips((prev) => prev.filter((x) => x !== c))}>
              {c}
            </Chip>
          ))}
          {chips.length === 0 && <p className="text-body-sm text-tertiary">All tags removed</p>}
        </div>
      </Block>
    </div>
  )
}

// Add onClick support to Chip
function ChipClickable({
  selected = false,
  removable = false,
  onRemove,
  onClick,
  children,
}: {
  selected?: boolean
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-label font-medium transition-all select-none",
        selected
          ? "bg-accent text-accent-foreground"
          : "bg-background-raised text-foreground border border-border hover:border-border-strong"
      )}
    >
      {children}
      {removable && (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
          className={cn(
            "rounded-full transition-colors -mr-1",
            selected ? "text-accent-foreground/70 hover:text-accent-foreground" : "text-foreground-tertiary hover:text-foreground"
          )}
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  )
}

export function ChipDemosInteractive() {
  const [selected, setSelected] = useState<string>("All")
  const filters = ["All", "Health", "Learning", "Work", "Personal"]
  const [chips, setChips] = useState(["Fitness", "Reading", "Meditation", "Coding"])

  return (
    <div className="space-y-6">
      <Block label="Filter chips (tap to select)">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <ChipClickable key={f} selected={selected === f} onClick={() => setSelected(f)}>
              {f}
            </ChipClickable>
          ))}
        </div>
      </Block>

      <Block label="Removable tags">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <ChipClickable key={c} removable onRemove={() => setChips((p) => p.filter((x) => x !== c))}>
              {c}
            </ChipClickable>
          ))}
          {chips.length === 0 && (
            <p className="text-body-sm text-tertiary italic">All tags removed</p>
          )}
        </div>
      </Block>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════ */
function UnderlineTabs({ tabs }: { tabs: string[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="space-y-4">
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={cn(
              "px-4 py-2.5 text-label font-medium transition-colors relative",
              active === i
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent after:rounded-t-full"
                : "text-secondary hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <p className="text-body-sm text-secondary px-1">Showing content for: <span className="text-foreground font-medium">{tabs[active]}</span></p>
    </div>
  )
}

function SegmentedControl({ tabs }: { tabs: string[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="inline-flex p-1 rounded-lg bg-background-raised border border-border gap-0.5">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => setActive(i)}
          className={cn(
            "px-4 h-8 rounded-md text-label font-medium transition-all",
            active === i
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-secondary hover:text-foreground"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function TabDemos() {
  return (
    <div className="space-y-8">
      <Block label="Underline tabs">
        <UnderlineTabs tabs={["Overview", "Achievements", "Members", "Activity"]} />
      </Block>

      <Block label="Segmented control">
        <div className="space-y-4">
          <SegmentedControl tabs={["Week", "Month", "Year"]} />
          <SegmentedControl tabs={["My Goals", "Group Goals"]} />
          <SegmentedControl tabs={["List", "Grid"]} />
        </div>
      </Block>
    </div>
  )
}
