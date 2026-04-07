'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO SIGN IN SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /auth/sign-in
 * Email + password authentication
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { BackHeader } from '@/components/achievno/header'
import { ROUTES } from '@/lib/achievno/constants'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Demo: always succeed and redirect
    setIsLoading(false)
    router.push(ROUTES.spaces)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BackHeader
        title=""
        onBack={() => router.push(ROUTES.welcome)}
      />

      <div className="flex-1 px-screen py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display mb-2">Welcome back</h1>
          <p className="text-body text-secondary">
            Sign in to continue tracking your achievements.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={isLoading}
                className="h-12 rounded-xl bg-background-input border-border-strong focus:border-primary"
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Password</FieldLabel>
                <Link
                  href={ROUTES.forgotPassword}
                  className="text-label text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-12 rounded-xl bg-background-input border-border-strong focus:border-primary"
              />
            </Field>
          </FieldGroup>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/25">
              <p className="text-label text-destructive">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full h-12 rounded-xl text-base font-semibold',
              'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-label text-secondary mt-6">
          {"Don't have an account? "}
          <Link href={ROUTES.signUp} className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
