"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * SETTINGS HUB SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/settings
 * Central settings navigation
 * ═══════════════════════════════════════════════════════════════
 */

import { useRouter } from "next/navigation"
import { BackHeader } from "@/components/achievno/header"
import { 
  AchievnoIcon,
  IconBell,
  IconShield,
  IconUser,
  IconChevronRight,
  IconInfo
} from "@/lib/achievno/icons"
import { cn } from "@/lib/utils"

const SETTINGS_SECTIONS = [
  {
    title: "Preferences",
    items: [
      {
        id: "notifications",
        icon: IconBell,
        label: "Notifications",
        description: "Push and email preferences",
        route: "/app/settings/notifications",
      },
      {
        id: "privacy",
        icon: IconShield,
        label: "Privacy",
        description: "Profile visibility and data",
        route: "/app/settings/privacy",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "account",
        icon: IconUser,
        label: "Account Settings",
        description: "Password and account management",
        route: "/app/settings/account",
      },
    ],
  },
  {
    title: "About",
    items: [
      {
        id: "about",
        icon: IconInfo,
        label: "About Achievno",
        description: "Version 2.0.0",
        route: null,
      },
    ],
  },
]

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Settings"
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-auto">
        <div className="py-4">
          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-5 text-caption text-secondary mb-2">
                {section.title}
              </h3>
              <div className="bg-surface border-y border-border divide-y divide-border">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.route && router.push(item.route)}
                    disabled={!item.route}
                    className={cn(
                      "w-full px-5 py-4 flex items-center gap-4 text-left transition-colors",
                      item.route && "hover:bg-secondary/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <AchievnoIcon icon={item.icon} className="text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-body font-medium block">{item.label}</span>
                      <span className="text-label text-secondary">{item.description}</span>
                    </div>
                    {item.route && (
                      <AchievnoIcon icon={IconChevronRight} size="sm" className="text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
