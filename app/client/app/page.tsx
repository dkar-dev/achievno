import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/achievno/constants'

/**
 * ═══════════════════════════════════════════════════════════════
 * ROOT PAGE REDIRECT
 * ═══════════════════════════════════════════════════════════════
 * Redirects to welcome screen for unauthenticated users
 * In production, this would check auth state and redirect accordingly
 * ═══════════════════════════════════════════════════════════════
 */

export default function RootPage() {
  // In production: check auth state and redirect to /app/spaces if authenticated
  redirect(ROUTES.welcome)
}
