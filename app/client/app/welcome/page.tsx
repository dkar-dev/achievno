'use client'

import Link from 'next/link'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ROUTES, APP_NAME, APP_TAGLINE } from '@/lib/achievno/constants'
import { IconAchievnoLogo } from '@/lib/achievno/icons'

const LANGS = ['EN', 'RU'] as const
const APPEARANCE = ['Light', 'Dark', 'System'] as const

export default function WelcomePage() {
  const [language, setLanguage] = React.useState<(typeof LANGS)[number]>('EN')
  const [appearance, setAppearance] = React.useState<(typeof APPEARANCE)[number]>('System')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex items-center justify-between px-screen pt-4 text-xs">
        <button className="rounded-full border border-border-subtle px-3 py-1" onClick={() => setLanguage(language === 'EN' ? 'RU' : 'EN')}>
          {language}
        </button>
        <button
          className="rounded-full border border-border-subtle px-3 py-1"
          onClick={() => setAppearance(APPEARANCE[(APPEARANCE.indexOf(appearance) + 1) % APPEARANCE.length])}
        >
          {appearance}
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center px-screen">
        <div className="relative z-10 text-center max-w-sm">
          <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary/15 mb-6">
            <IconAchievnoLogo size={52} className="text-primary" />
          </div>
          <h1 className="text-display mb-2"><span className="text-primary">{APP_NAME}</span></h1>
          <p className="text-body text-secondary mb-2">{APP_TAGLINE}</p>
          <p className="text-label text-tertiary">Track personal achievements and group progress.</p>
        </div>
      </div>

      <div className="relative z-10 px-screen pb-safe-area-bottom">
        <div className="py-6 space-y-3">
          <Button asChild className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold">
            <Link href={ROUTES.signUp}>Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl">
            <Link href={ROUTES.signIn}>Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
