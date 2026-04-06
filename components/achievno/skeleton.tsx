'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO SKELETON COMPONENTS
 * ═══════════════════════════════════════════════════════════════
 * Skeleton placeholders for async loading states.
 * 
 * Rules:
 * - Skeleton count for lists: 3-5 items
 * - Skeletons MUST preserve exact layout size (no shift on load)
 * - Card skeleton includes: title placeholder + progress placeholder
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────
// BASE SKELETON
// ─────────────────────────────────────────────────────────────────

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('motion-skeleton rounded', className)}
      {...props}
    />
  )
}

// ─────────────────────────────────────────────────────────────────
// SPACE ITEM SKELETON
// ─────────────────────────────────────────────────────────────────

export function SpaceItemSkeleton() {
  return (
    <div className="flex items-center gap-3 w-full px-4 py-3 bg-bg-elevated rounded-xl border border-border-subtle">
      {/* Avatar placeholder */}
      <div className="size-12 rounded-xl motion-skeleton shrink-0" />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="h-5 w-28 rounded motion-skeleton mb-1.5" />
        <div className="h-4 w-40 rounded motion-skeleton" />
      </div>
      
      {/* Chevron placeholder */}
      <div className="size-5 rounded motion-skeleton shrink-0" />
    </div>
  )
}

export function SpaceListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SpaceItemSkeleton key={i} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// GROUP HEADER SKELETON
// ─────────────────────────────────────────────────────────────────

export function GroupHeaderSkeleton() {
  return (
    <div className="p-4 bg-bg-elevated rounded-xl border border-border-subtle">
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar */}
        <div className="size-14 rounded-xl motion-skeleton shrink-0" />
        
        {/* Title & subtitle */}
        <div className="flex-1">
          <div className="h-6 w-32 rounded motion-skeleton mb-1.5" />
          <div className="h-4 w-24 rounded motion-skeleton" />
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1">
            <div className="h-8 w-10 rounded motion-skeleton mb-1" />
            <div className="h-3 w-16 rounded motion-skeleton" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// STATS GRID SKELETON
// ─────────────────────────────────────────────────────────────────

export function StatTileSkeleton() {
  return (
    <div className="p-3 bg-bg-elevated rounded-lg border border-border-subtle">
      <div className="h-8 w-10 rounded motion-skeleton mb-1" />
      <div className="h-3 w-14 rounded motion-skeleton" />
    </div>
  )
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <StatTileSkeleton key={i} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ACTIVITY ITEM SKELETON
// ─────────────────────────────────────────────────────────────────

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-2">
      {/* Avatar */}
      <div className="size-8 rounded-full motion-skeleton shrink-0" />
      
      {/* Content - max 2 lines */}
      <div className="flex-1 min-w-0">
        <div className="h-4 w-full rounded motion-skeleton mb-1" />
        <div className="h-4 w-3/4 rounded motion-skeleton" />
      </div>
      
      {/* Time */}
      <div className="h-3 w-10 rounded motion-skeleton shrink-0" />
    </div>
  )
}

export function ActivityListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityItemSkeleton key={i} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MEMBER ITEM SKELETON
// ─────────────────────────────────────────────────────────────────

export function MemberItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      {/* Avatar */}
      <div className="size-10 rounded-full motion-skeleton shrink-0" />
      
      {/* Name & role */}
      <div className="flex-1 min-w-0">
        <div className="h-4 w-24 rounded motion-skeleton mb-1" />
        <div className="h-3 w-16 rounded motion-skeleton" />
      </div>
    </div>
  )
}

export function MemberListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <MemberItemSkeleton key={i} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ACHIEVEMENT DETAIL SKELETON
// ─────────────────────────────────────────────────────────────────

export function AchievementDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="size-6 rounded-md motion-skeleton shrink-0" />
        <div className="flex-1">
          <div className="h-6 w-48 rounded motion-skeleton mb-2" />
          <div className="h-4 w-32 rounded motion-skeleton" />
        </div>
      </div>
      
      {/* Progress card */}
      <div className="p-4 bg-bg-elevated rounded-xl border border-border-subtle">
        <div className="h-4 w-20 rounded motion-skeleton mb-3" />
        <div className="h-2 w-full rounded-full motion-skeleton mb-2" />
        <div className="flex justify-between">
          <div className="h-3 w-16 rounded motion-skeleton" />
          <div className="h-3 w-12 rounded motion-skeleton" />
        </div>
      </div>
      
      {/* Description */}
      <div>
        <div className="h-4 w-24 rounded motion-skeleton mb-2" />
        <div className="h-4 w-full rounded motion-skeleton mb-1" />
        <div className="h-4 w-3/4 rounded motion-skeleton" />
      </div>
      
      {/* History section */}
      <div>
        <div className="h-4 w-20 rounded motion-skeleton mb-3" />
        <ActivityListSkeleton count={3} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PAGE SKELETONS
// ─────────────────────────────────────────────────────────────────

export function PersonalWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex-1 h-16 rounded-lg motion-skeleton" />
        <div className="flex-1 h-16 rounded-lg motion-skeleton" />
      </div>
      
      {/* Filter pills */}
      <div className="flex gap-2">
        <div className="h-8 w-16 rounded-full motion-skeleton" />
        <div className="h-8 w-20 rounded-full motion-skeleton" />
      </div>
      
      {/* Achievement cards */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <AchievementCardSkeletonSimple key={i} />
        ))}
      </div>
    </div>
  )
}

function AchievementCardSkeletonSimple() {
  return (
    <div className="p-4 bg-bg-elevated rounded-xl border border-border-subtle">
      {/* Title row */}
      <div className="flex items-start gap-3 mb-2">
        <div className="h-5 flex-1 rounded motion-skeleton" />
        <div className="size-8 rounded-lg motion-skeleton shrink-0" />
      </div>
      
      {/* Progress bar */}
      <div className="h-1 w-full rounded-full motion-skeleton mb-2" />
      
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-32 rounded motion-skeleton" />
        <div className="h-5 w-16 rounded-md motion-skeleton" />
      </div>
    </div>
  )
}

export function GroupWorkspaceSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4">
        <GroupHeaderSkeleton />
      </div>
      
      {/* Tabs */}
      <div className="flex gap-6 px-4 border-b border-border-subtle pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-16 rounded motion-skeleton" />
        ))}
      </div>
      
      {/* Tab content */}
      <div className="p-4">
        <ActivityListSkeleton count={4} />
      </div>
    </div>
  )
}
