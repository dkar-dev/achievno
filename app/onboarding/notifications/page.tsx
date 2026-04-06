'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO ONBOARDING - NOTIFICATIONS
 * ═══════════════════════════════════════════════════════════════
 * Route: /onboarding/notifications
 * Step 3: Request notification permission
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/achievno/constants'
import { IconBell, IconCheckCircle } from '@/lib/achievno/icons'
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

const notificationBenefits = [
  'Reminders for upcoming deadlines',
  'Updates when teammates complete goals',
  'Group activity and challenge results',
]

export default function OnboardingNotificationsPage() {
  const router = useRouter()
  const [isRequesting, setIsRequesting] = React.useState(false)

  const handleAllow = async () => {
    setIsRequesting(true)
    
    // In a real app, this would request notification permission
    // For demo, we just simulate and redirect
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Try to request permission if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        await Notification.requestPermission()
      } catch {
        // Permission request failed, continue anyway
      }
    }
    
    router.push(ROUTES.spaces)
  }

  const handleSkip = () => {
    router.push(ROUTES.spaces)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with step indicator */}
      <div className="h-header flex items-center justify-center safe-area-top">
        <StepIndicator currentStep={2} totalSteps={3} />
      </div>

      <div className="flex-1 px-screen py-6 flex flex-col">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-display mb-2">Notifications</h1>
          <p className="text-body text-secondary">
            Stay on top of goals and group activity.
          </p>
        </div>

        {/* Illustration card */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm bg-background-surface rounded-2xl border border-border p-6">
            {/* Bell icon */}
            <div className="flex justify-center mb-6">
              <div className="size-20 rounded-2xl bg-primary/15 flex items-center justify-center">
                <IconBell size={40} className="text-primary" />
              </div>
            </div>

            {/* Benefits list */}
            <ul className="space-y-3">
              {notificationBenefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <IconCheckCircle size={20} className="text-success shrink-0" />
                  <span className="text-label text-secondary">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-screen pb-safe-area-bottom py-4 border-t border-border">
        <div className="space-y-3">
          <Button
            onClick={handleAllow}
            disabled={isRequesting}
            className={cn(
              'w-full h-12 rounded-xl text-base font-semibold',
              'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
          >
            {isRequesting ? 'Enabling...' : 'Enable notifications'}
          </Button>
          <Button
            onClick={handleSkip}
            variant="ghost"
            disabled={isRequesting}
            className="w-full h-12 rounded-xl text-base font-medium text-secondary hover:text-foreground"
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  )
}
