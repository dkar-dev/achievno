"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * NOTIFICATION SETTINGS SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/settings/notifications
 * Configure push and email notification preferences
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { BackHeader } from "@/components/achievno/header"
import { cn } from "@/lib/utils"

interface NotificationSetting {
  id: string
  label: string
  description: string
  pushEnabled: boolean
  emailEnabled: boolean
}

const INITIAL_SETTINGS: NotificationSetting[] = [
  {
    id: "achievements",
    label: "Achievements",
    description: "Completions and progress updates",
    pushEnabled: true,
    emailEnabled: false,
  },
  {
    id: "challenges",
    label: "Challenges",
    description: "Rankings and results",
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    id: "groups",
    label: "Groups",
    description: "New members and activity",
    pushEnabled: true,
    emailEnabled: false,
  },
  {
    id: "invites",
    label: "Invites",
    description: "Group invitations",
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    id: "reminders",
    label: "Reminders",
    description: "Upcoming deadlines",
    pushEnabled: true,
    emailEnabled: false,
  },
]

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const [masterPush, setMasterPush] = useState(true)
  const [masterEmail, setMasterEmail] = useState(true)

  const updateSetting = (id: string, field: "pushEnabled" | "emailEnabled", value: boolean) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const toggleMasterPush = (enabled: boolean) => {
    setMasterPush(enabled)
    if (!enabled) {
      setSettings(prev => prev.map(s => ({ ...s, pushEnabled: false })))
    }
  }

  const toggleMasterEmail = (enabled: boolean) => {
    setMasterEmail(enabled)
    if (!enabled) {
      setSettings(prev => prev.map(s => ({ ...s, emailEnabled: false })))
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Notifications"
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-auto">
        {/* Master Toggles */}
        <div className="p-5 border-b border-border">
          <h3 className="text-caption text-secondary mb-4">Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body font-medium">Push</p>
                <p className="text-label text-secondary">On-device notifications</p>
              </div>
              <Switch checked={masterPush} onCheckedChange={toggleMasterPush} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body font-medium">Email</p>
                <p className="text-label text-secondary">Summaries and important updates</p>
              </div>
              <Switch checked={masterEmail} onCheckedChange={toggleMasterEmail} />
            </div>
          </div>
        </div>

        {/* Individual Settings */}
        <div className="p-5">
          <h3 className="text-caption text-secondary mb-4">By type</h3>
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.id} className="bg-surface rounded-xl border border-border p-4">
                <div className="mb-3">
                  <p className="text-body font-medium">{setting.label}</p>
                  <p className="text-label text-secondary">{setting.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-background rounded-lg px-3 py-2">
                    <span className="text-label text-secondary">Push</span>
                    <Switch
                      checked={setting.pushEnabled && masterPush}
                      onCheckedChange={(v) => updateSetting(setting.id, "pushEnabled", v)}
                      disabled={!masterPush}
                    />
                  </div>
                  <div className="flex items-center justify-between bg-background rounded-lg px-3 py-2">
                    <span className="text-label text-secondary">Email</span>
                    <Switch
                      checked={setting.emailEnabled && masterEmail}
                      onCheckedChange={(v) => updateSetting(setting.id, "emailEnabled", v)}
                      disabled={!masterEmail}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
