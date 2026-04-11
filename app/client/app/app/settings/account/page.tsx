'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { Button } from '@/components/ui/button'

type Method = { id: string; label: string; connected: boolean }

export default function AccountSettingsPage() {
  const router = useRouter()
  const [methods, setMethods] = useState<Method[]>([
    { id: 'telegram', label: 'Telegram', connected: true },
    { id: 'email', label: 'Email', connected: true },
    { id: 'google', label: 'Google', connected: false },
  ])

  const connectedCount = methods.filter((m) => m.connected).length

  const toggle = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        if (m.connected && connectedCount === 1) return m
        return { ...m, connected: !m.connected }
      }),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BackHeader title="Account" onBack={() => router.back()} />
      <div className="px-screen py-5 space-y-4">
        <section className="rounded-2xl border p-4">
          <h2 className="text-base font-semibold">Connected sign-in methods</h2>
          <p className="text-sm text-secondary mt-1">No primary method, no account merge. Last connected method cannot be unlinked.</p>
          <div className="mt-4 space-y-2">
            {methods.map((method) => (
              <div key={method.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-medium">{method.label}</p>
                  <p className="text-xs text-tertiary">{method.connected ? 'Connected' : 'Not connected'}</p>
                </div>
                <Button size="sm" variant={method.connected ? 'outline' : 'default'} onClick={() => toggle(method.id)}>
                  {method.connected ? 'Unlink' : 'Connect'}
                </Button>
              </div>
            ))}
          </div>
          {connectedCount === 1 && <p className="mt-3 text-xs text-destructive">Cannot unlink the last remaining method.</p>}
        </section>
      </div>
    </div>
  )
}
