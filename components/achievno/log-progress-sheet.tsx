'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * LOG PROGRESS BOTTOM SHEET
 * ═══════════════════════════════════════════════════════════════
 * Core interaction for logging achievement progress.
 * 
 * Behaviors:
 * - NO auto-focus on input (quick buttons are primary)
 * - Custom input is secondary interaction
 * - Save button is sticky at bottom
 * - Mark Complete is secondary action (lower emphasis)
 * - Auto-closes on success
 * - Shows toast notification (no modal)
 * - Uses optimistic updates
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useCallback, useState, useTransition } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AchievnoProgress } from '@/components/achievno/progress'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/achievno/types'

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface LogProgressSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  achievement: Achievement
  onLogProgress?: (value: number, note?: string) => Promise<void>
  onMarkComplete?: () => Promise<void>
}

// ─────────────────────────────────────────────────────────────────
// QUICK ADD BUTTONS
// ─────────────────────────────────────────────────────────────────

const QUICK_ADD_VALUES = [1, 5, 10] as const

// ─────────────────────────────────────────────────────────────────
// SPINNER COMPONENT
// ─────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('motion-spinner size-4', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

export function LogProgressSheet({
  open,
  onOpenChange,
  achievement,
  onLogProgress,
  onMarkComplete,
}: LogProgressSheetProps) {
  // State
  const [pendingValue, setPendingValue] = useState(0)
  const [customValue, setCustomValue] = useState('')
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)

  // Computed values
  const currentValue = achievement.currentValue
  const targetValue = achievement.targetValue
  const unit = achievement.unit || 'units'
  const remaining = targetValue - currentValue
  
  // Preview value (current + pending)
  const previewValue = Math.min(currentValue + pendingValue, targetValue)
  const previewPercent = Math.round((previewValue / targetValue) * 100)

  // Reset state when sheet closes
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setPendingValue(0)
      setCustomValue('')
      setNote('')
    }
    onOpenChange(isOpen)
  }, [onOpenChange])

  // Quick add handler
  const handleQuickAdd = useCallback((value: number) => {
    const newPending = Math.min(pendingValue + value, remaining)
    setPendingValue(newPending)
  }, [pendingValue, remaining])

  // Custom value handler
  const handleCustomValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomValue(val)
    
    const parsed = parseInt(val, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      setPendingValue(Math.min(parsed, remaining))
    } else if (val === '') {
      setPendingValue(0)
    }
  }, [remaining])

  // Save handler
  const handleSave = useCallback(() => {
    if (pendingValue <= 0 || !onLogProgress) return

    startTransition(async () => {
      try {
        await onLogProgress(pendingValue, note || undefined)
        
        // Show success toast
        toast({
          title: 'Progress saved',
          description: `Added ${pendingValue} ${unit}`,
        })
        
        // Auto-close sheet
        handleOpenChange(false)
      } catch {
        toast({
          title: 'Failed to save',
          description: 'Please try again',
          variant: 'destructive',
        })
      }
    })
  }, [pendingValue, note, unit, onLogProgress, handleOpenChange])

  // Mark complete handler
  const handleMarkComplete = useCallback(async () => {
    if (!onMarkComplete) return

    setIsMarkingComplete(true)
    try {
      await onMarkComplete()
      
      toast({
        title: 'Achievement completed',
        description: achievement.title,
      })
      
      handleOpenChange(false)
    } catch {
      toast({
        title: 'Failed to complete',
        description: 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setIsMarkingComplete(false)
    }
  }, [onMarkComplete, achievement.title, handleOpenChange])

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="bg-bg-elevated max-h-[85vh]">
        {/* Header */}
        <DrawerHeader className="px-5 pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-title">Log Progress</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm" className="text-secondary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {/* Current Progress */}
          <div className="mb-6">
            <p className="text-body text-secondary mb-1">
              Current: {currentValue} / {targetValue} {unit}
            </p>
            <div className="relative">
              <AchievnoProgress
                value={previewValue}
                max={targetValue}
                size="md"
                color="primary"
                className="motion-progress"
              />
              {pendingValue > 0 && (
                <p className="text-caption text-primary mt-1.5">
                  +{pendingValue} pending ({previewPercent}%)
                </p>
              )}
            </div>
          </div>

          {/* Quick Add Buttons (PRIMARY INTERACTION) */}
          <div className="mb-6">
            <p className="text-label text-secondary mb-2">Quick add</p>
            <div className="flex gap-2">
              {QUICK_ADD_VALUES.map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="lg"
                  className="flex-1 text-title font-semibold"
                  onClick={() => handleQuickAdd(value)}
                  disabled={remaining <= 0}
                >
                  +{value}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount (SECONDARY INTERACTION) */}
          <div className="mb-6">
            <label htmlFor="custom-amount" className="text-label text-secondary mb-2 block">
              Custom amount
            </label>
            <Input
              id="custom-amount"
              type="number"
              inputMode="numeric"
              min={0}
              max={remaining}
              value={customValue}
              onChange={handleCustomValueChange}
              placeholder="0"
              className="bg-bg-muted"
              // NO autoFocus - quick buttons are primary
            />
          </div>

          {/* Note (Optional) */}
          <div>
            <label htmlFor="progress-note" className="text-label text-secondary mb-2 block">
              Note (optional)
            </label>
            <Textarea
              id="progress-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="bg-bg-muted resize-none"
            />
          </div>
        </div>

        {/* Footer - Sticky at bottom */}
        <div className="sticky bottom-0 bg-bg-elevated border-t border-border-subtle px-5 py-4 safe-area-bottom">
          <div className="flex flex-col gap-2">
            {/* Save Progress - Primary CTA */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={pendingValue <= 0 || isPending}
            >
              {isPending && <Spinner className="mr-2" />}
              Save Progress
            </Button>

            {/* Mark Complete - Secondary action (lower emphasis) */}
            {remaining > 0 && onMarkComplete && (
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-secondary"
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
              >
                {isMarkingComplete && <Spinner className="mr-2" />}
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
