'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { BackHeader } from '@/components/achievno/header'
import { ROUTES } from '@/lib/achievno/constants'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { Spinner } from '@/components/ui/spinner'

export default function SignUpPage() {
  const router = useRouter()
  const auth = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await auth.signUp({
        email: String(formData.get('email') || ''),
        password,
        display_name: String(formData.get('display_name') || ''),
      })
      const params = new URLSearchParams()
      if (response.dev_verification_token) {
        params.set('token', response.dev_verification_token)
      }
      router.push(params.size > 0 ? `${ROUTES.verifyEmail}?${params.toString()}` : ROUTES.verifyEmail)
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'Sign-up failed. Please check the form and try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BackHeader title="" onBack={() => router.push(ROUTES.welcome)} />
      <div className="flex-1 px-screen py-6">
        <h1 className="text-display mb-2">Create account</h1>
        <p className="text-body text-secondary mb-8">Email sign-up requires verification before product access.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field><FieldLabel>Display name</FieldLabel><Input type="text" name="display_name" required minLength={2} disabled={isLoading} /></Field>
            <Field><FieldLabel>Email</FieldLabel><Input type="email" name="email" autoComplete="email" required disabled={isLoading} /></Field>
            <Field><FieldLabel>Password</FieldLabel><Input type="password" name="password" autoComplete="new-password" required minLength={8} disabled={isLoading} /></Field>
            <Field><FieldLabel>Confirm Password</FieldLabel><Input type="password" name="confirmPassword" autoComplete="new-password" required disabled={isLoading} /></Field>
          </FieldGroup>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
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
        <p className="text-center text-label text-secondary mt-6">Already have an account? <Link href={ROUTES.signIn} className="text-primary">Sign in</Link></p>
      </div>
    </div>
  )
}
