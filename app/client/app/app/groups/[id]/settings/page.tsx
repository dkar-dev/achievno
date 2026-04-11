'use client'

import { useRouter } from 'next/navigation'
import { AchievnoAvatar } from '@/components/achievno/avatar'

const ITEMS = [
  'Profile',
  'Notifications',
  'Privacy',
  'Account',
  'Language',
  'Appearance',
  'About',
  'Logout',
] as const

export default function GroupSettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="safe-area-top border-b border-border-subtle px-screen py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AchievnoAvatar initials="DT" size="md" />
            <div>
              <p className="text-title font-semibold">Dev Team</p>
              <p className="text-caption text-secondary">8 members</p>
            </div>
          </div>
          <button className="text-2xl text-tertiary" onClick={() => router.back()}>×</button>
        </div>
      </div>

      <div className="px-screen py-3">
        {ITEMS.map((item) => (
          <button
            key={item}
            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-bg-muted"
            onClick={() => {
              if (item === 'Logout') router.push('/welcome')
            }}
          >
            <span className={item === 'Logout' ? 'text-destructive font-medium' : 'text-label font-medium'}>{item}</span>
            <span className="text-tertiary">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
