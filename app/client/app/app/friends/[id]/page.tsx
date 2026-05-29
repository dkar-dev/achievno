'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AchievnoAvatar } from '@/components/achievno/avatar'
import { AchievnoIcon, IconChevronRight, IconUsers } from '@/lib/achievno/icons'
import { ROUTES } from '@/lib/achievno/constants'

export default function FriendPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <div className="safe-area-top border-b border-border-subtle px-screen py-3">
        <div className="relative flex min-h-11 items-center justify-center">
          <button
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated"
            onClick={() => router.push(ROUTES.rootShell())}
            aria-label="Back"
          >
            <AchievnoIcon icon={IconChevronRight} className="rotate-180" />
          </button>
          <div className="inline-flex h-11 items-center rounded-full border border-border-subtle bg-bg-elevated px-5">
            <div className="text-center">
              <p className="text-lg font-semibold leading-none">Friend space</p>
              <p className="truncate text-xs text-secondary">Real connection {params.id}</p>
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <AchievnoAvatar name="Friend space" size="lg" variant="rounded" />
          </div>
        </div>
      </div>

      <main className="flex-1 px-screen py-5">
        <section className="space-y-4 rounded-xl border border-border-subtle bg-bg-elevated p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-bg-muted text-secondary">
              <AchievnoIcon icon={IconUsers} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-title font-semibold">No shared activity yet</h1>
              <p className="mt-1 text-label text-secondary">
                This friend space has no achievements or challenges to show.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => router.push(ROUTES.rootShell())}>
            Back to main
          </Button>
        </section>
      </main>
    </div>
  )
}
