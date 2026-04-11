'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

function CreateAchievementContent() {
  const router = useRouter()
  const params = useSearchParams()
  const context = (params.get('context') ?? 'personal') as 'personal' | 'friend' | 'group'
  const entity = (params.get('entity') ?? 'achievement') as 'achievement' | 'challenge'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="min-h-screen bg-background">
      <BackHeader title={`New ${entity}`} onBack={() => router.back()} />
      <div className="px-screen py-5 space-y-4">
        <div className="rounded-xl border p-3 text-sm text-secondary">
          Context is inferred from entry surface: <b>{context}</b>. No explicit Personal/Friend/Group selector.
        </div>
        <div>
          <label className="text-sm">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>
        <Button className="w-full" disabled={!title.trim()} onClick={() => router.push('/app/spaces')}>
          Create
        </Button>
      </div>
    </div>
  )
}

export default function CreateAchievementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="px-screen py-5 text-sm text-secondary">Loading…</div>
        </div>
      }
    >
      <CreateAchievementContent />
    </Suspense>
  )
}
