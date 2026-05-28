import { ApiError, type ApiErrorPayload } from '@/lib/achievno/api/errors'

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

type ApiRequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: unknown
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

function isJsonResponse(response: Response) {
  return response.headers.get('content-type')?.includes('application/json')
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  if (!isJsonResponse(response)) {
    return null
  }

  return response.json()
}

function normalizeErrorPayload(body: unknown): ApiErrorPayload {
  if (!body || typeof body !== 'object') {
    return {}
  }

  const maybeError = 'error' in body ? (body as { error?: unknown }).error : body
  if (!maybeError || typeof maybeError !== 'object') {
    return {}
  }

  const { code, message, fields } = maybeError as ApiErrorPayload
  return { code, message, fields }
}

export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const headers = new Headers(options.headers)
  let body: BodyInit | undefined

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body,
    credentials: 'include',
  })
  const responseBody = await parseResponseBody(response)

  if (!response.ok) {
    const payload = normalizeErrorPayload(responseBody)
    throw new ApiError({
      status: response.status,
      code: payload.code,
      fields: payload.fields,
      message: payload.message || `Request failed with HTTP ${response.status}.`,
    })
  }

  return responseBody as TResponse
}
