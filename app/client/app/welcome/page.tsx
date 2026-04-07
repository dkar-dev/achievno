/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO WELCOME SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /welcome
 * Guest entry point with sign in / sign up options
 * ═══════════════════════════════════════════════════════════════
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES, APP_NAME, APP_TAGLINE } from '@/lib/achievno/constants'
import { IconAchievnoLogo } from '@/lib/achievno/icons'

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero section with abstract background */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-screen">
        {/* Abstract decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[5%] w-48 h-48 bg-info/10 rounded-full blur-[80px]" />
          <div className="absolute top-[40%] right-[20%] w-32 h-32 bg-challenge/10 rounded-full blur-[60px]" />
          
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary/15 mb-6">
            <IconAchievnoLogo size={40} className="text-primary" />
          </div>

          {/* Brand */}
          <h1 className="text-display mb-2">
            <span className="text-primary">{APP_NAME}</span>
          </h1>
          
          <p className="text-body text-secondary mb-2">
            {APP_TAGLINE}
          </p>
          
          <p className="text-label text-tertiary">
            Track personal achievements and group progress.
            <br />
            Celebrate wins together.
          </p>
        </div>
      </div>

      {/* CTA zone - pinned to bottom */}
      <div className="relative z-10 px-screen pb-safe-area-bottom">
        <div className="py-6 space-y-3">
          {/* Primary CTA */}
          <Button
            asChild
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
          >
            <Link href={ROUTES.signUp}>
              Get Started
            </Link>
          </Button>

          {/* Secondary CTA */}
          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-xl border-border-strong bg-background-elevated hover:bg-background-input text-foreground text-base font-medium"
          >
            <Link href={ROUTES.signIn}>
              Sign In
            </Link>
          </Button>
        </div>

        {/* Terms */}
        <p className="text-center text-caption text-tertiary pb-4 normal-case">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
