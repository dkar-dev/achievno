'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * GLOBAL ERROR BOUNDARY
 * ═══════════════════════════════════════════════════════════════
 * Catches runtime errors and provides recovery option
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Achievno Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-sm">
        <h2 className="text-heading mb-2">Something went wrong</h2>
        <p className="text-body text-secondary mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button
          onClick={() => reset()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
