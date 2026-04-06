'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO LOADING & ERROR STATES
 * ═══════════════════════════════════════════════════════════════
 * Components for async state handling.
 * 
 * Loading Rules:
 * - Buttons: spinner on LEFT of label, keep text visible, disable
 * - Forms: inputs remain visible during submit
 * 
 * Error Rules:
 * - Inline error + retry button
 * - No full-screen error unless blocking
 * - Error focus ring: red
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const spinnerSizes = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('motion-spinner', spinnerSizes[size], className)}
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
// LOADING BUTTON
// ─────────────────────────────────────────────────────────────────

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
}

/**
 * Button with loading state.
 * - Spinner appears on LEFT of label
 * - Text remains visible
 * - Button is disabled during loading
 */
export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Spinner size="sm" className="mr-2" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

// ─────────────────────────────────────────────────────────────────
// INLINE ERROR
// ─────────────────────────────────────────────────────────────────

interface InlineErrorProps {
  message: string
  onRetry?: () => void
  className?: string
}

/**
 * Inline error state with optional retry button.
 * - No full-screen error
 * - Compact, inline display
 */
export function InlineError({ message, onRetry, className }: InlineErrorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-destructive', className)}>
      {/* Error icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      
      <span className="text-label flex-1">{message}</span>
      
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Retry
        </Button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// LIST ERROR STATE
// ─────────────────────────────────────────────────────────────────

interface ListErrorProps {
  message?: string
  onRetry?: () => void
  className?: string
}

/**
 * Error state for list loading failures.
 * Centered layout with retry action.
 */
export function ListError({
  message = 'Failed to load',
  onRetry,
  className,
}: ListErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 px-4', className)}>
      {/* Error icon */}
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-destructive"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      
      <p className="text-label text-secondary text-center mb-3">{message}</p>
      
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// PAGE LOADING OVERLAY
// ─────────────────────────────────────────────────────────────────

interface PageLoadingProps {
  message?: string
}

/**
 * Full-page loading state (only for initial page load).
 */
export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <Spinner size="lg" className="text-primary mb-3" />
      <p className="text-label text-secondary">{message}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ASYNC BOUNDARY
// ─────────────────────────────────────────────────────────────────

interface AsyncBoundaryProps {
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  loadingFallback?: React.ReactNode
  errorFallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Wrapper component for async data states.
 * Handles loading, error, and success states.
 */
export function AsyncBoundary({
  loading,
  error,
  onRetry,
  loadingFallback,
  errorFallback,
  children,
}: AsyncBoundaryProps) {
  if (loading) {
    return <>{loadingFallback || <PageLoading />}</>
  }

  if (error) {
    return (
      <>
        {errorFallback || (
          <ListError message={error.message || 'Something went wrong'} onRetry={onRetry} />
        )}
      </>
    )
  }

  return <>{children}</>
}
