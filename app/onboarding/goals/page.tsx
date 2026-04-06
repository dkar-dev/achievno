'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ONBOARDING - GOAL PREFERENCES
 * ═══════════════════════════════════════════════════════════════
 * Route: /onboarding/goals
 * Step 2: Select goal categories
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES, GOAL_CATEGORIES } from '@/lib/achievno/constants'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// Step indicator dots
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'size-2 rounded-full transition-colors',
            i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary' : 'bg-border-strong'
          )}
        />
      ))}
    </div>
  )
}

export default function OnboardingGoalsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedGoals, setSelectedGoals] = React.useState<Set<string>>(new Set())

  const toggleGoal = (id: string) => {
    const newSelected = new Set(selectedGoals)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedGoals(newSelected)
  }

  const handleContinue = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push(ROUTES.onboardingNotifications)
  }

  const handleSkip = () => {
    router.push(ROUTES.onboardingNotifications)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with step indicator */}
      <div className="h-header flex items-center justify-center safe-area-top">
        <StepIndicator currentStep={1} totalSteps={3} />
      </div>

      <div className="flex-1 px-screen py-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-display mb-2">What do you track?</h1>
          <p className="text-body text-secondary">
            Pick your focus areas. Changeable later.
          </p>
        </div>

        {/* Goal chips grid */}
        <div className="flex flex-wrap gap-2">
          {GOAL_CATEGORIES.map((category) => {
            const isSelected = selectedGoals.has(category.id)
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleGoal(category.id)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-label font-medium transition-all border',
                  isSelected
                    ? 'border-transparent text-foreground'
                    : 'border-border-strong bg-transparent text-secondary hover:border-border-strong hover:bg-background-elevated'
                )}
                style={isSelected ? {
                  backgroundColor: `${category.color}20`,
                  borderColor: `${category.color}40`,
                  color: category.color,
                } : undefined}
              >
                {category.label}
              </button>
            )
          })}
        </div>

        {/* Selection count */}
        <p className="text-label text-tertiary mt-4">
          {selectedGoals.size === 0 ? 'Select at least one to continue' : `${selectedGoals.size} selected`}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="px-screen pb-safe-area-bottom py-4 border-t border-border">
        <div className="flex gap-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl border-border-strong bg-background-elevated hover:bg-background-input text-foreground text-base font-medium"
          >
            Skip
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedGoals.size === 0 || isLoading}
            className={cn(
              'flex-1 h-12 rounded-xl text-base font-semibold',
              'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
