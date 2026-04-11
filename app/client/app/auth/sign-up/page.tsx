'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { BackHeader } from '@/components/achievno/header'
import { ROUTES } from '@/lib/achievno/constants'

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setError('Passwords do not match')
      return
    }
    router.push('/auth/verify-email')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BackHeader title="" onBack={() => router.push(ROUTES.welcome)} />
      <div className="flex-1 px-screen py-6">
        <h1 className="text-display mb-2">Create account</h1>
        <p className="text-body text-secondary mb-8">Email sign-up requires verification before product access.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field><FieldLabel>Email</FieldLabel><Input type="email" name="email" required /></Field>
            <Field><FieldLabel>Password</FieldLabel><Input type="password" name="password" required minLength={8} /></Field>
            <Field><FieldLabel>Confirm Password</FieldLabel><Input type="password" name="confirmPassword" required /></Field>
          </FieldGroup>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
        <p className="text-center text-label text-secondary mt-6">Already have an account? <Link href={ROUTES.signIn} className="text-primary">Sign in</Link></p>
      </div>
    </div>
  )
}
