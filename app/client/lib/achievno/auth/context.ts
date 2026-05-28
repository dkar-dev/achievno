'use client'

import * as React from 'react'
import type {
  AuthAccount,
  AuthMeResponse,
  AuthProfile,
  SignInRequest,
  SignUpRequest,
  SignUpResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@/lib/achievno/api/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error'

export type AuthContextValue = {
  status: AuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  account: AuthAccount | null
  profile: AuthProfile | null
  error: string | null
  signIn: (payload: SignInRequest) => Promise<AuthMeResponse>
  signUp: (payload: SignUpRequest) => Promise<SignUpResponse>
  verifyEmail: (payload: VerifyEmailRequest) => Promise<VerifyEmailResponse>
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  reloadMe: () => Promise<AuthMeResponse | null>
}

export const AuthContext = React.createContext<AuthContextValue | null>(null)
