"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * ACCOUNT SETTINGS SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/settings/account
 * Password change, account deletion, and other account management
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BackHeader } from "@/components/achievno/header"
import { ConfirmModal } from "@/components/achievno/confirm-modal"
import { 
  AchievnoIcon,
  IconKey,
  IconTrash,
  IconChevronRight,
  IconDownload
} from "@/lib/achievno/icons"
import { ROUTES } from "@/lib/achievno/constants"
import { cn } from "@/lib/utils"

export default function AccountSettingsPage() {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false)
    // In a real app, would call API then redirect
    router.push(ROUTES.welcome)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Account"
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-auto">
        {/* Account Info */}
        <div className="p-5 border-b border-border">
          <h3 className="text-caption text-secondary mb-4">Account Information</h3>
          <div className="bg-surface rounded-xl border border-border p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-label text-secondary">Email</span>
              <span className="text-body">alex@example.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-label text-secondary">Account Type</span>
              <span className="text-body">Free</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-5 border-b border-border">
          <h3 className="text-caption text-secondary mb-4">Security</h3>
          <button
            onClick={() => router.push("/app/settings/account/change-password")}
            className="w-full bg-surface rounded-xl border border-border p-4 flex items-center gap-4 hover:border-border-strong transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <AchievnoIcon icon={IconKey} className="text-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-body font-medium">Change Password</p>
              <p className="text-label text-secondary">Update your password</p>
            </div>
            <AchievnoIcon icon={IconChevronRight} size="sm" className="text-muted-foreground" />
          </button>
        </div>

        {/* Data */}
        <div className="p-5 border-b border-border">
          <h3 className="text-caption text-secondary mb-4">Your Data</h3>
          <button className="w-full bg-surface rounded-xl border border-border p-4 flex items-center gap-4 hover:border-border-strong transition-colors">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <AchievnoIcon icon={IconDownload} className="text-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-body font-medium">Export Data</p>
              <p className="text-label text-secondary">Download all your achievements and data</p>
            </div>
            <AchievnoIcon icon={IconChevronRight} size="sm" className="text-muted-foreground" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="p-5">
          <h3 className="text-caption text-destructive mb-4">Danger Zone</h3>
          <div className="bg-destructive-subtle rounded-xl border border-destructive/20 p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                <AchievnoIcon icon={IconTrash} className="text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-body font-medium text-destructive">Delete Account</p>
                <p className="text-label text-secondary mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Account?"
        description="This will permanently delete your account, all achievements, group memberships, and challenge history. This action cannot be undone."
        confirmLabel="Delete Account"
        onConfirm={handleDeleteAccount}
        variant="destructive"
      />
    </div>
  )
}
