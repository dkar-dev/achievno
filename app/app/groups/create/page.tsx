"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * CREATE GROUP SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/groups/create
 * Create a new group with name, description, and visibility
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AchievnoHeader } from "@/components/achievno/header"
import { AchievnoAvatar } from "@/components/achievno/avatar"
import { ConfirmModal } from "@/components/achievno/confirm-modal"
import { 
  AchievnoIcon, 
  IconCamera, 
  IconGlobe, 
  IconLock,
  IconUsers,
  IconCheck
} from "@/lib/achievno/icons"
import { ROUTES, UI, AVATAR_COLORS } from "@/lib/achievno/constants"
import { cn } from "@/lib/utils"

type GroupVisibility = "public" | "private"

const VISIBILITY_OPTIONS: { value: GroupVisibility; icon: typeof IconGlobe; label: string; description: string }[] = [
  {
    value: "public",
    icon: IconGlobe,
    label: "Public",
    description: "Anyone can discover and request to join",
  },
  {
    value: "private",
    icon: IconLock,
    label: "Private",
    description: "Only people you invite can join",
  },
]

export default function CreateGroupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<GroupVisibility>("public")
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0])
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const hasContent = name.trim().length > 0 || description.trim().length > 0

  const handleCreate = async () => {
    if (!name.trim()) return
    
    setIsCreating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Would return the new group ID
    router.push("/app/groups/new-group-id")
  }

  const handleBack = () => {
    if (hasContent) {
      setShowDiscardConfirm(true)
    } else {
      router.back()
    }
  }

  const handleDiscard = () => {
    setShowDiscardConfirm(false)
    router.back()
  }

  // Get initials from name
  const getInitials = (n: string) => {
    return n
      .trim()
      .split(" ")
      .map(word => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GR"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AchievnoHeader
        title="Create Group"
        showBack
        onBack={handleBack}
      />

      <div className="flex-1 overflow-auto">
        <div className="px-5 py-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold"
                style={{ backgroundColor: selectedColor, color: '#1A1200' }}
              >
                {getInitials(name)}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <AchievnoIcon icon={IconCamera} size="sm" />
              </button>
            </div>
            
            {/* Color Selection */}
            <div className="flex gap-2 mt-4">
              {AVATAR_COLORS.slice(0, 6).map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    selectedColor === color && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="text-label text-secondary mb-2 block">Group Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give your group a name"
              maxLength={50}
              className="bg-input-surface border-input-border"
            />
            <p className="text-caption text-tertiary mt-1">
              {name.length}/50
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-label text-secondary mb-2 block">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={4}
              maxLength={UI.maxDescriptionLength}
              className="bg-input-surface border-input-border resize-none"
            />
            <p className="text-caption text-tertiary mt-1">
              {description.length}/{UI.maxDescriptionLength}
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-label text-secondary mb-3 block">Visibility</label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setVisibility(option.value)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4",
                    visibility === option.value
                      ? "border-primary bg-accent-subtle"
                      : "border-border bg-surface hover:border-border-strong"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    visibility === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  )}>
                    <AchievnoIcon icon={option.icon} size="sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-medium">{option.label}</p>
                    <p className="text-label text-secondary">{option.description}</p>
                  </div>
                  {visibility === option.value && (
                    <AchievnoIcon icon={IconCheck} className="text-primary shrink-0 mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          {name && (
            <div>
              <label className="text-label text-secondary mb-3 block">Preview</label>
              <div className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: selectedColor, color: '#1A1200' }}
                  >
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-title truncate">{name}</h3>
                    <div className="flex items-center gap-2 text-label text-secondary">
                      <AchievnoIcon 
                        icon={visibility === "public" ? IconGlobe : IconLock} 
                        size="xs" 
                      />
                      <span>{visibility === "public" ? "Public" : "Private"}</span>
                      <span className="text-tertiary">|</span>
                      <AchievnoIcon icon={IconUsers} size="xs" />
                      <span>1 member</span>
                    </div>
                  </div>
                </div>
                {description && (
                  <p className="text-body text-secondary mt-3 line-clamp-2">{description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-5 py-4 border-t border-border safe-area-bottom">
        <Button
          onClick={handleCreate}
          disabled={!name.trim() || isCreating}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isCreating ? "Creating..." : "Create Group"}
        </Button>
      </div>

      {/* Discard Confirmation */}
      <ConfirmModal
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to leave without creating the group?"
        confirmLabel="Discard"
        onConfirm={handleDiscard}
        variant="destructive"
      />
    </div>
  )
}
