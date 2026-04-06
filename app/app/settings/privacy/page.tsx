"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * PRIVACY SETTINGS SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/settings/privacy
 * Configure profile visibility and data preferences
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { AchievnoHeader } from "@/components/achievno/header"
import { cn } from "@/lib/utils"

type ProfileVisibility = "public" | "groups" | "private"

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; description: string }[] = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can see your profile and achievements",
  },
  {
    value: "groups",
    label: "Groups Only",
    description: "Only members of your groups can see your profile",
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can see your achievements and progress",
  },
]

export default function PrivacySettingsPage() {
  const router = useRouter()
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>("groups")
  const [showOnLeaderboards, setShowOnLeaderboards] = useState(true)
  const [allowGroupInvites, setAllowGroupInvites] = useState(true)
  const [showActivityStatus, setShowActivityStatus] = useState(true)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AchievnoHeader
        title="Privacy"
        showBack
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-auto">
        {/* Profile Visibility */}
        <div className="p-5 border-b border-border">
          <h3 className="text-caption text-secondary mb-4">Profile Visibility</h3>
          <div className="space-y-2">
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setProfileVisibility(option.value)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all",
                  profileVisibility === option.value
                    ? "border-primary bg-accent-subtle"
                    : "border-border bg-surface hover:border-border-strong"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body font-medium">{option.label}</p>
                    <p className="text-label text-secondary">{option.description}</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    profileVisibility === option.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}>
                    {profileVisibility === option.value && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Other Privacy Settings */}
        <div className="p-5">
          <h3 className="text-caption text-secondary mb-4">Other Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-body font-medium">Show on Leaderboards</p>
                <p className="text-label text-secondary">Appear in challenge rankings</p>
              </div>
              <Switch checked={showOnLeaderboards} onCheckedChange={setShowOnLeaderboards} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-body font-medium">Allow Group Invites</p>
                <p className="text-label text-secondary">Let others invite you to groups</p>
              </div>
              <Switch checked={allowGroupInvites} onCheckedChange={setAllowGroupInvites} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-body font-medium">Show Activity Status</p>
                <p className="text-label text-secondary">Let others see when you were active</p>
              </div>
              <Switch checked={showActivityStatus} onCheckedChange={setShowActivityStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
