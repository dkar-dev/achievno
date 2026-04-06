"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * EDIT PROFILE SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/profile/edit
 * Edit display name, bio, and avatar
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoAvatar } from "@/components/achievno/avatar"
import { AchievnoBadge } from "@/components/achievno/badge"
import { ConfirmModal } from "@/components/achievno/confirm-modal"
import { AchievnoIcon, IconCamera } from "@/lib/achievno/icons"
import { ROUTES, GOAL_CATEGORIES, UI } from "@/lib/achievno/constants"
import { cn } from "@/lib/utils"

// Mock user data
const MOCK_USER = {
  displayName: "Alex Johnson",
  bio: "Building products and tracking progress. Always learning, always growing.",
  goalCategories: ["learning", "fitness", "career"],
}

export default function EditProfilePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(MOCK_USER.displayName)
  const [bio, setBio] = useState(MOCK_USER.bio)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(MOCK_USER.goalCategories)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const hasChanges = 
    displayName !== MOCK_USER.displayName ||
    bio !== MOCK_USER.bio ||
    JSON.stringify(selectedCategories.sort()) !== JSON.stringify(MOCK_USER.goalCategories.sort())

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push(ROUTES.profile)
  }

  const handleBack = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true)
    } else {
      router.push(ROUTES.profile)
    }
  }

  const handleDiscard = () => {
    setShowDiscardConfirm(false)
    router.push(ROUTES.profile)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="Edit Profile"
        onBack={handleBack}
      />

      <div className="flex-1 overflow-auto">
        <div className="px-5 py-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <AchievnoAvatar name={displayName} size="xl" />
              <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <AchievnoIcon icon={IconCamera} size="sm" />
              </button>
            </div>
            <button className="mt-3 text-label text-primary">
              Change Photo
            </button>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-label text-secondary mb-2 block">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={UI.maxTitleLength}
              className="bg-input-surface border-input-border"
            />
            <p className="text-caption text-tertiary mt-1">
              {displayName.length}/{UI.maxTitleLength}
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-label text-secondary mb-2 block">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio..."
              rows={4}
              maxLength={UI.maxBioLength}
              className="bg-input-surface border-input-border resize-none"
            />
            <p className="text-caption text-tertiary mt-1">
              {bio.length}/{UI.maxBioLength}
            </p>
          </div>

          {/* Goal Interests */}
          <div>
            <label className="text-label text-secondary mb-2 block">Goal Interests</label>
            <p className="text-body text-tertiary mb-3">
              Select your focus areas.
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.id)
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-label font-medium transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border border-border text-secondary hover:border-border-strong"
                    )}
                  >
                    {category.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-5 py-4 border-t border-border safe-area-bottom">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!displayName.trim() || isSaving}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Discard Confirmation */}
      <ConfirmModal
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title="Discard changes?"
        description="Unsaved changes will be lost."
        confirmLabel="Discard"
        onConfirm={handleDiscard}
        variant="destructive"
      />
    </div>
  )
}
