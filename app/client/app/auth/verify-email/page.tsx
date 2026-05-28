'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/achievno/constants'
import { useAuth } from '@/lib/achievno/auth/use-auth'
import { getApiErrorMessage } from '@/lib/achievno/api/errors'
import { Spinner } from '@/components/ui/spinner'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const token = searchParams.get('token') || ''
  const verifiedTokenRef = React.useRef<string | null>(null)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>(() =>
    token ? 'loading' : 'idle',
  )
  const [error, setError] = React.useState<string | null>(null)

  const verifyToken = React.useCallback(
    async (nextToken: string) => {
      setStatus('loading')
      setError(null)
      try {
        await auth.verifyEmail({ token: nextToken })
        setStatus('success')
      } catch (caughtError) {
        setError(getApiErrorMessage(caughtError, 'Email verification failed.'))
        setStatus('error')
      }
    },
    [auth],
  )

  React.useEffect(() => {
    if (token && verifiedTokenRef.current !== token) {
      verifiedTokenRef.current = token
      void verifyToken(token)
    }
  }, [token, verifyToken])

  return (
    <div className="min-h-screen bg-background px-screen py-10">
      <h1 className="text-display">Verify your email</h1>
      <p className="mt-3 text-body text-secondary">We sent a verification link to your email. Product access is blocked until verification succeeds.</p>
      <div className="mt-6 rounded-xl border border-border-subtle bg-bg-muted px-4 py-3">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-label text-secondary">
            <Spinner size="sm" />
            Verifying email...
          </div>
        )}
        {status === 'success' && <p className="text-label text-green-700">Email verified. You can sign in now.</p>}
        {status === 'error' && <p className="text-label text-destructive">{error}</p>}
        {status === 'idle' && <p className="text-label text-secondary">Open the local verification link from sign-up to verify this account.</p>}
      </div>
      <div className="mt-8 space-y-3">
        {token && status === 'error' && (
          <Button className="w-full" onClick={() => verifyToken(token)}>Try verification again</Button>
        )}
        <Button className="w-full" disabled={status === 'loading'} onClick={() => router.push(ROUTES.signIn)}>Continue to sign in</Button>
        <Button variant="outline" className="w-full" onClick={() => router.push(ROUTES.welcome)}>Back to welcome</Button>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background px-screen py-10">
          <h1 className="text-display">Verify your email</h1>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-muted px-4 py-3 text-label text-secondary">
            <Spinner size="sm" />
            Loading verification...
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
