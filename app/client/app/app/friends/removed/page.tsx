'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BackHeader } from '@/components/achievno/header'

export default function RemovedFriendsPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background">
      <BackHeader title="Removed friends" onBack={() => router.back()} />
      <div className="px-screen py-5 space-y-3">
        <div className="rounded-xl border p-4">
          <p className="font-medium">Alex Morgan</p>
          <p className="text-sm text-secondary">Restore requires acceptance. Old history returns only after acceptance.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm">Send restore invite</Button>
            <Button size="sm" variant="outline">Decline pending</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
