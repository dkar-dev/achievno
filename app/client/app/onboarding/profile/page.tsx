'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ONBOARDING - PROFILE SETUP
 * ═══════════════════════════════════════════════════════════════
 * Route: /onboarding/profile
 * Step 1: Avatar, display name, bio
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { ROUTES } from '@/lib/achievno/constants'
import { IconCamera } from '@/lib/achievno/icons'
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

export default function OnboardingProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [displayName, setDisplayName] = React.useState('')

  const handleContinue = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    router.push(ROUTES.onboardingGoals)
  }

  const initials = displayName.trim()
    ? displayName.trim().split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with step indicator */}
      <div className="h-header flex items-center justify-center safe-area-top">
        <StepIndicator currentStep={0} totalSteps={3} />
      </div>

      <div className="flex-1 px-screen py-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-display mb-2">Set up your profile</h1>
          <p className="text-body text-secondary">
            Let others know who you are.
          </p>
        </div>

        {/* Avatar upload */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            className="relative group"
          >
            <AchievnoAvatar
              initials={initials}
              size="xl"
              variant="circle"
              className="size-24"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconCamera size={24} className="text-white" />
            </div>
          </button>
        </div>

        {/* Form */}
        <FieldGroup className="space-y-5">
          <Field>
            <FieldLabel>Display Name</FieldLabel>
            <Input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              required
              className="h-12 rounded-xl bg-background-input border-border-strong focus:border-primary"
            />
          </Field>

          <Field>
            <FieldLabel>
              Bio <span className="text-tertiary font-normal">(optional)</span>
            </FieldLabel>
            <Textarea
              placeholder="Tell us a bit about yourself..."
              rows={3}
              maxLength={200}
              className="rounded-xl bg-background-input border-border-strong focus:border-primary resize-none"
            />
          </Field>
        </FieldGroup>
      </div>

      {/* Bottom CTA */}
      <div className="px-screen pb-safe-area-bottom py-4 border-t border-border">
        <Button
          onClick={handleContinue}
          disabled={!displayName.trim() || isLoading}
          className={cn(
            'w-full h-12 rounded-xl text-base font-semibold',
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
  )
}
