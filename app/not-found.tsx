import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/achievno/constants'

/**
 * ═══════════════════════════════════════════════════════════════
 * 404 NOT FOUND PAGE
 * ═══════════════════════════════════════════════════════════════
 */

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-sm">
        <h1 className="text-display text-primary mb-2">404</h1>
        <h2 className="text-heading mb-2">Page Not Found</h2>
        <p className="text-body text-secondary mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href={ROUTES.welcome}>Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
