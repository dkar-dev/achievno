export type ApiErrorPayload = {
  code?: string
  message?: string
  fields?: Record<string, unknown>
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fields?: Record<string, unknown>

  constructor({
    status,
    message,
    code,
    fields,
  }: {
    status: number
    message: string
    code?: string
    fields?: Record<string, unknown>
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed. Please try again.'): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
