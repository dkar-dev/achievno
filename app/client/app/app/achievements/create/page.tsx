"use client"

/**
 * ═══════════════════════════════════════════════════════════════
 * CREATE ACHIEVEMENT SCREEN
 * ═══════════════════════════════════════════════════════════════
 * Route: /app/achievements/create
 * Stepped form: Select Type → Details → Assignees → Review
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BackHeader } from "@/components/achievno/header"
import { AchievnoAvatar, AchievnoAvatarStack } from "@/components/achievno/avatar"
import { 
  AchievnoIcon, 
  IconTarget, 
  IconTrophy, 
  IconUsers,
  IconChevronRight,
  IconCalendar,
  IconCheck
} from "@/lib/achievno/icons"
import { cn } from "@/lib/utils"

type AchievementType = "personal" | "shared" | "challenge"
type Step = "type" | "details" | "assignees" | "review"

const STEPS: Step[] = ["type", "details", "assignees", "review"]
const STEP_LABELS = {
  type: "Select Type",
  details: "Details",
  assignees: "Assignees",
  review: "Review"
}

const ACHIEVEMENT_TYPES = [
  {
    type: "personal" as const,
    icon: IconTarget,
    title: "Individual Task",
    description: "For personal goals and self-improvement milestones"
  },
  {
    type: "shared" as const,
    icon: IconUsers,
    title: "Shared Goal",
    description: "For collaborative achievements with team members"
  },
  {
    type: "challenge" as const,
    icon: IconTrophy,
    title: "Race Challenge",
    description: "For competitive goals where first to finish wins"
  }
]

// Mock group members
const MOCK_MEMBERS = [
  { id: "1", name: "Alex Chen", avatar: null },
  { id: "2", name: "Bella Rodriguez", avatar: null },
  { id: "3", name: "Max Kim", avatar: null },
  { id: "4", name: "Sophie Lee", avatar: null },
]

export default function CreateAchievementPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("type")
  const [achievementType, setAchievementType] = useState<AchievementType | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  const currentStepIndex = STEPS.indexOf(currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case "type":
        return achievementType !== null
      case "details":
        return title.trim().length > 0
      case "assignees":
        return achievementType === "personal" || selectedAssignees.length > 0
      case "review":
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      // Skip assignees for personal achievements
      if (STEPS[nextIndex] === "assignees" && achievementType === "personal") {
        setCurrentStep("review")
      } else {
        setCurrentStep(STEPS[nextIndex])
      }
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      // Skip assignees when going back for personal achievements
      if (STEPS[prevIndex] === "assignees" && achievementType === "personal") {
        setCurrentStep("details")
      } else {
        setCurrentStep(STEPS[prevIndex])
      }
    } else {
      router.back()
    }
  }

  const handleCreate = () => {
    // Would submit to API
    router.push("/app/me")
  }

  const toggleAssignee = (id: string) => {
    setSelectedAssignees(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackHeader
        title="New Achievement"
        onBack={handleBack}
      />

      {/* Step Indicator */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            // Skip assignees indicator for personal
            if (step === "assignees" && achievementType === "personal") return null
            
            const isActive = step === currentStep
            const isCompleted = STEPS.indexOf(step) < currentStepIndex
            
            return (
              <div key={step} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-caption font-semibold",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "bg-secondary text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <AchievnoIcon icon={IconCheck} size="xs" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={cn(
                    "text-label hidden sm:block",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
                {index < STEPS.length - 1 && step !== "assignees" && (
                  <div className="w-8 h-px bg-border mx-2" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto">
        {/* Step 1: Select Type */}
        {currentStep === "type" && (
          <div className="p-5">
            <h2 className="text-heading mb-2">Choose Type</h2>
            <p className="text-body text-secondary mb-6">
              What kind of achievement do you want to create?
            </p>
            
            <div className="space-y-3">
              {ACHIEVEMENT_TYPES.map((item) => (
                <button
                  key={item.type}
                  onClick={() => setAchievementType(item.type)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    achievementType === item.type
                      ? "border-primary bg-accent-subtle"
                      : "border-border bg-surface hover:border-border-strong"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      achievementType === item.type
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    )}>
                      <AchievnoIcon icon={item.icon} size="md" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-title mb-1">{item.title}</h3>
                      <p className="text-label text-secondary">{item.description}</p>
                    </div>
                    {achievementType === item.type && (
                      <AchievnoIcon icon={IconCheck} className="text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === "details" && (
          <div className="p-5">
            <h2 className="text-heading mb-6">Achievement Details</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-label text-secondary mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="bg-input-surface border-input-border"
                />
              </div>
              
              <div>
                <label className="text-label text-secondary mb-2 block">Description (optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more context about this achievement..."
                  rows={4}
                  className="bg-input-surface border-input-border resize-none"
                />
              </div>
              
              <div>
                <label className="text-label text-secondary mb-2 block">Deadline (optional)</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-input-surface border-input-border"
                  />
                  <AchievnoIcon 
                    icon={IconCalendar} 
                    size="sm" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Assignees */}
        {currentStep === "assignees" && (
          <div className="p-5">
            <h2 className="text-heading mb-2">Assign Members</h2>
            <p className="text-body text-secondary mb-6">
              Select who will work on this {achievementType === "challenge" ? "challenge" : "goal"}
            </p>
            
            <div className="space-y-2">
              {MOCK_MEMBERS.map((member) => {
                const isSelected = selectedAssignees.includes(member.id)
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleAssignee(member.id)}
                    className={cn(
                      "w-full p-3 rounded-xl border flex items-center gap-3 transition-all",
                      isSelected
                        ? "border-primary bg-accent-subtle"
                        : "border-border bg-surface hover:border-border-strong"
                    )}
                  >
                    <AchievnoAvatar name={member.name} size="sm" />
                    <span className="text-body flex-1 text-left">{member.name}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}>
                      {isSelected && (
                        <AchievnoIcon icon={IconCheck} size="xs" className="text-primary-foreground" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === "review" && (
          <div className="p-5">
            <h2 className="text-heading mb-6">Review Achievement</h2>
            
            <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
              <div>
                <span className="text-caption text-secondary">Type</span>
                <p className="text-body mt-1">
                  {ACHIEVEMENT_TYPES.find(t => t.type === achievementType)?.title}
                </p>
              </div>
              
              <div>
                <span className="text-caption text-secondary">Title</span>
                <p className="text-title mt-1">{title}</p>
              </div>
              
              {description && (
                <div>
                  <span className="text-caption text-secondary">Description</span>
                  <p className="text-body text-secondary mt-1">{description}</p>
                </div>
              )}
              
              {deadline && (
                <div>
                  <span className="text-caption text-secondary">Deadline</span>
                  <p className="text-body mt-1">{new Date(deadline).toLocaleDateString()}</p>
                </div>
              )}
              
              {achievementType !== "personal" && selectedAssignees.length > 0 && (
                <div>
                  <span className="text-caption text-secondary">Assignees</span>
                  <div className="mt-2">
                    <AchievnoAvatarStack
                      users={MOCK_MEMBERS.filter(m => selectedAssignees.includes(m.id))}
                      size="sm"
                      max={5}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-5 border-t border-border safe-area-bottom">
        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={currentStep === "review" ? handleCreate : handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {currentStep === "review" ? "Create Achievement" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
