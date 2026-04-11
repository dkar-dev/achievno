'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { TabBar } from '@/components/achievno/tabs'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/achievno/constants'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'challenges', label: 'Challenges' },
] as const

export default function FriendPage() {
  const router = useRouter()
  const [tab, setTab] = React.useState<(typeof tabs)[number]['id']>('overview')
  const [profileOpen, setProfileOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-bg-base">
      <BackHeader title="Friend" onBack={() => router.push(ROUTES.rootShell())} />
      <div className="px-screen py-4 space-y-4">
        <button className="w-full rounded-2xl border p-4 text-left" onClick={() => setProfileOpen(true)}>
          <p className="text-sm text-tertiary">Tap target</p>
          <p className="text-lg font-semibold">Alex Morgan</p>
        </button>
        <TabBar tabs={tabs as unknown as {id:string;label:string}[]} value={tab} onChange={(v)=>setTab(v as typeof tab)} />
        <div className="rounded-2xl border p-4 text-sm text-secondary">{tab === 'overview' && 'One-to-one overview summary'}{tab === 'achievements' && 'Friend achievements list'}{tab === 'challenges' && 'Friend challenges list'}</div>
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-50 bg-black/30">
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-background p-5 space-y-3">
            <p className="text-lg font-semibold">Compact profile</p>
            <button className="w-full rounded-xl border p-3 text-left">Notifications: On</button>
            <button className="w-full rounded-xl border p-3 text-left text-destructive" onClick={() => router.push(ROUTES.friendsRemoved)}>Remove friend</button>
            <Button variant="outline" className="w-full" onClick={() => setProfileOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  )
}
