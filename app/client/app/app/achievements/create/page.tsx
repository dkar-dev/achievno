'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BackHeader } from '@/components/achievno/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function CreateAchievementPage() {
  const router = useRouter()
  const [context, setContext] = useState<'personal' | 'friend' | 'group'>('personal')
  const [entity, setEntity] = useState<'achievement' | 'challenge'>('achievement')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qContext = params.get('context')
    const qEntity = params.get('entity')

    if (qContext === 'friend' || qContext === 'group' || qContext === 'personal') {
      setContext(qContext)
    }

    if (qEntity === 'challenge' || qEntity === 'achievement') {
      setEntity(qEntity)
    }
  }, [])

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
        <Button className="w-full" disabled={!title.trim()} onClick={() => router.push('/app/spaces')}>Create</Button>
      </div>
    </div>
  )
}
