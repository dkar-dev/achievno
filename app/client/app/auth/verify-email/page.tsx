'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background px-screen py-10">
      <h1 className="text-display">Verify your email</h1>
      <p className="mt-3 text-body text-secondary">We sent a verification link to your email. Product access is blocked until verification succeeds.</p>
      <div className="mt-8 space-y-3">
        <Button className="w-full" onClick={() => router.push('/auth/sign-in')}>I verified, continue to sign in</Button>
        <Button variant="outline" className="w-full" onClick={() => router.push('/welcome')}>Back to welcome</Button>
      </div>
    </div>
  )
}
