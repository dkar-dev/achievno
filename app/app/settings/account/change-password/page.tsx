"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * CHANGE PASSWORD SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/settings/account/change-password
 * Update account password
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoIcon, IconEye, IconEyeOff, IconCheck } from "@/lib/achievno/icons"
import { cn } from "@/lib/utils"

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", check: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", check: (p: string) => /[0-9]/.test(p) },
]

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allRequirementsMet = PASSWORD_REQUIREMENTS.every(req => req.check(newPassword))
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const canSubmit = currentPassword && allRequirementsMet && passwordsMatch

  const handleSave = async () => {
    if (!canSubmit) return
    
    setIsSaving(true)
    setError(null)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Would validate current password and update
    router.back()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Change Password"
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-5 space-y-6">
          {/* Current Password */}
          <div>
            <label className="text-label text-secondary mb-2 block">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-input-surface border-input-border pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <AchievnoIcon icon={showCurrentPassword ? IconEyeOff : IconEye} size="sm" />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-label text-secondary mb-2 block">New Password</label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-input-surface border-input-border pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <AchievnoIcon icon={showNewPassword ? IconEyeOff : IconEye} size="sm" />
              </button>
            </div>
            
            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-3 space-y-2">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const met = req.check(newPassword)
                  return (
                    <div key={req.id} className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center",
                        met ? "bg-success" : "bg-secondary"
                      )}>
                        {met && <AchievnoIcon icon={IconCheck} size="xs" className="text-success-foreground" />}
                      </div>
                      <span className={cn(
                        "text-label",
                        met ? "text-success" : "text-secondary"
                      )}>
                        {req.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-label text-secondary mb-2 block">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={cn(
                  "bg-input-surface border-input-border pr-12",
                  confirmPassword && !passwordsMatch && "border-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <AchievnoIcon icon={showConfirmPassword ? IconEyeOff : IconEye} size="sm" />
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-label text-destructive mt-2">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="bg-destructive-subtle rounded-xl p-3">
              <p className="text-label text-destructive">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-5 border-t border-border safe-area-bottom">
        <Button
          onClick={handleSave}
          disabled={!canSubmit || isSaving}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  )
}
