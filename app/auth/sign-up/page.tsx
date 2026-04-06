'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO SIGN UP SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /auth/sign-up
 * New user registration
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

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Demo: always succeed and redirect to onboarding
    setIsLoading(false)
    router.push(ROUTES.onboardingProfile)
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
          <h1 className="text-display mb-2">Create account</h1>
          <p className="text-body text-secondary">
            Start tracking your achievements today.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={isLoading}
                className="h-12 rounded-xl bg-background-input border-border-strong focus:border-primary"
              />
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                name="password"
                placeholder="Create a password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isLoading}
                className="h-12 rounded-xl bg-background-input border-border-strong focus:border-primary"
              />
              <p className="text-caption text-tertiary normal-case mt-1.5">
                At least 8 characters
              </p>
            </Field>

            <Field>
              <FieldLabel>Confirm Password</FieldLabel>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                autoComplete="new-password"
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-label text-secondary mt-6">
          Already have an account?{' '}
          <Link href={ROUTES.signIn} className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
