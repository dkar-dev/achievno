'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO TABS / SEGMENTS
 * ═══════════════════════════════════════════════════════════════
 * Segmented control and tab components
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────
// SEGMENTED CONTROL (pill-style)
// ─────────────────────────────────────────────────────────────────

interface SegmentedControlProps<T extends string> {
    value: T
    onChange: (value: T) => void
    options: { id: T; label: string }[]
    size?: 'sm' | 'md'
    className?: string
}

export function SegmentedControl<T extends string>({
                                                       value,
                                                       onChange,
                                                       options,
                                                       size = 'md',
                                                       className,
                                                   }: SegmentedControlProps<T>) {
    return (
        <div
            className={cn(
                'inline-flex bg-background-elevated rounded-xl p-1 gap-0.5',
                className
            )}
        >
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    className={cn(
                        'px-4 rounded-lg font-medium transition-all',
                        size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-label',
                        value === option.id
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-tertiary hover:text-secondary'
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────
// TAB BAR (for group workspace)
// ─────────────────────────────────────────────────────────────────

interface TabBarProps<T extends string> {
    value: T
    onChange: (value: T) => void
    tabs: { id: T; label: string }[]
    variant?: 'default' | 'underline'
    size?: 'default' | 'compact'
    className?: string
}

export function TabBar<T extends string>({
                                             value,
                                             onChange,
                                             tabs,
                                             variant = 'default',
                                             size = 'default',
                                             className,
                                         }: TabBarProps<T>) {
    if (variant === 'underline') {
        return (
            <div className={cn('flex border-b border-border', className)}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            'px-4 py-2.5 text-label font-medium transition-colors relative',
                            value === tab.id
                                ? 'text-foreground'
                                : 'text-tertiary hover:text-secondary'
                        )}
                    >
                        {tab.label}
                        {value === tab.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>
        )
    }

    const activeIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.id === value)
    )

    const isCompact = size === 'compact'
    const trackPaddingPx = 4
    const indicatorInset = `${trackPaddingPx}px`

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden bg-background-elevated',
                isCompact ? 'rounded-[20px] p-1' : 'rounded-full p-1',
                className
            )}
            role="tablist"
            aria-orientation="horizontal"
        >
            <div
                className="pointer-events-none absolute rounded-full bg-primary shadow-sm transition-[left] duration-200 ease-out"
                style={{
                    top: indicatorInset,
                    bottom: indicatorInset,
                    left: `calc(${indicatorInset} + ((100% - ${trackPaddingPx * 2}px) / ${tabs.length}) * ${activeIndex})`,
                    width: `calc((100% - ${trackPaddingPx * 2}px) / ${tabs.length})`,
                }}
            />

            <div
                className="relative z-10 grid"
                style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
            >
                {tabs.map((tab) => {
                    const isActive = value === tab.id

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                'relative z-10 min-w-0 text-center whitespace-nowrap transition-colors',
                                isCompact
                                    ? 'h-8 px-1 text-[14px] font-medium leading-none'
                                    : 'h-9 px-3 text-label font-medium',
                                isActive
                                    ? 'text-primary-foreground'
                                    : 'text-tertiary hover:text-secondary'
                            )}
                        >
                            <span className="block w-full text-center">{tab.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────
// FILTER PILLS
// ─────────────────────────────────────────────────────────────────

interface FilterPillsProps<T extends string> {
    value: T
    onChange: (value: T) => void
    options: { id: T; label: string }[]
    className?: string
}

export function FilterPills<T extends string>({
                                                  value,
                                                  onChange,
                                                  options,
                                                  className,
                                              }: FilterPillsProps<T>) {
    return (
        <div className={cn('flex gap-2 overflow-x-auto no-scrollbar', className)}>
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap border',
                        value === option.id
                            ? 'bg-primary/15 text-primary border-primary/25'
                            : 'bg-background-elevated text-secondary border-transparent hover:border-border-strong'
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}