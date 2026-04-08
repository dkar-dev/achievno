import { ROUTES } from "@/lib/achievno/constants"

export type TelegramStartParamResolution =
  | {
      type: "route"
      href: string
    }
  | {
      type: "none"
    }

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function resolveTelegramStartParam(
  startParam: string | null | undefined,
): TelegramStartParamResolution {
  if (!startParam) {
    return { type: "none" }
  }

  const normalized = safeDecode(startParam.trim())

  if (!normalized) {
    return { type: "none" }
  }

  if (normalized === "me") {
    return { type: "route", href: ROUTES.personalWorkspace }
  }

  if (normalized === "spaces") {
    return { type: "route", href: ROUTES.spaces }
  }

  if (normalized === "discover") {
    return { type: "route", href: ROUTES.discover }
  }

  if (normalized === "notifications") {
    return { type: "route", href: ROUTES.notifications }
  }

  if (normalized === "profile") {
    return { type: "route", href: ROUTES.profile }
  }

  if (normalized.startsWith("group:")) {
    const id = normalized.slice("group:".length).trim()
    if (id) {
      return { type: "route", href: ROUTES.group(id) }
    }
  }

  if (normalized.startsWith("achievement:")) {
    const id = normalized.slice("achievement:".length).trim()
    if (id) {
      return { type: "route", href: ROUTES.achievement(id) }
    }
  }

  if (normalized.startsWith("group-achievements:")) {
    const id = normalized.slice("group-achievements:".length).trim()
    if (id) {
      return { type: "route", href: ROUTES.groupAchievements(id) }
    }
  }

  if (normalized.startsWith("group-challenges:")) {
    const id = normalized.slice("group-challenges:".length).trim()
    if (id) {
      return { type: "route", href: ROUTES.groupChallenges(id) }
    }
  }

  if (normalized.startsWith("group-members:")) {
    const id = normalized.slice("group-members:".length).trim()
    if (id) {
      return { type: "route", href: ROUTES.groupMembers(id) }
    }
  }

  if (normalized.startsWith("group-info:")) {
    const id = normalized.slice("group-info:".length).trim()
    if (id) {
      return { type: "route", href: ROUTES.groupInfo(id) }
    }
  }

  return { type: "none" }
}
