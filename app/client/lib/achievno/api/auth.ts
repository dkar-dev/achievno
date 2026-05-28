import { apiFetch } from '@/lib/achievno/api/client'

const AUTH_BASE = '/api/v1/auth'

export type AuthAccount = {
  account_id: string
}

export type AuthProfile = {
  profile_id: string
  display_name: string
  username: string | null
}

export type SignUpRequest = {
  email: string
  password: string
  display_name: string
  username?: string | null
}

export type SignUpResponse = {
  account_id: string
  profile_id: string
  email_verification_required: true
  dev_verification_token?: string
}

export type VerifyEmailRequest = {
  token: string
}

export type VerifyEmailResponse = {
  verified: true
}

export type SignInRequest = {
  email: string
  password: string
}

export type AuthMeResponse = {
  authenticated: true
  account: AuthAccount
  profile: AuthProfile
}

export type RefreshResponse = {
  refreshed: true
}

export type SignOutResponse = {
  signed_out: true
}

export const authApi = {
  signUp(payload: SignUpRequest) {
    return apiFetch<SignUpResponse>(`${AUTH_BASE}/sign-up`, {
      method: 'POST',
      body: payload,
    })
  },
  verifyEmail(payload: VerifyEmailRequest) {
    return apiFetch<VerifyEmailResponse>(`${AUTH_BASE}/verify-email`, {
      method: 'POST',
      body: payload,
    })
  },
  signIn(payload: SignInRequest) {
    return apiFetch<AuthMeResponse>(`${AUTH_BASE}/sign-in`, {
      method: 'POST',
      body: payload,
    })
  },
  refresh() {
    return apiFetch<RefreshResponse>(`${AUTH_BASE}/refresh`, {
      method: 'POST',
    })
  },
  signOut() {
    return apiFetch<SignOutResponse>(`${AUTH_BASE}/sign-out`, {
      method: 'POST',
    })
  },
  me() {
    return apiFetch<AuthMeResponse>(`${AUTH_BASE}/me`)
  },
}
