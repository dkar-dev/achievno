'use client'

import * as React from 'react'
import { authApi, type AuthAccount, type AuthMeResponse, type AuthProfile } from '@/lib/achievno/api/auth'
import { ApiError, getApiErrorMessage } from '@/lib/achievno/api/errors'
import { AuthContext, type AuthContextValue, type AuthStatus } from '@/lib/achievno/auth/context'

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = React.useState<AuthStatus>('loading')
  const [account, setAccount] = React.useState<AuthAccount | null>(null)
  const [profile, setProfile] = React.useState<AuthProfile | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const applyAuthenticatedState = React.useCallback((payload: AuthMeResponse) => {
    setAccount(payload.account)
    setProfile(payload.profile)
    setError(null)
    setStatus('authenticated')
  }, [])

  const clearAuthenticatedState = React.useCallback(() => {
    setAccount(null)
    setProfile(null)
    setStatus('unauthenticated')
  }, [])

  const reloadMe = React.useCallback(async () => {
    setStatus((currentStatus) => (currentStatus === 'authenticated' ? currentStatus : 'loading'))
    try {
      const payload = await authApi.me()
      applyAuthenticatedState(payload)
      return payload
    } catch (caughtError) {
      setAccount(null)
      setProfile(null)
      if (caughtError instanceof ApiError && [401, 403].includes(caughtError.status)) {
        setError(null)
        setStatus('unauthenticated')
      } else {
        setError(getApiErrorMessage(caughtError, 'Authentication check failed.'))
        setStatus('error')
      }
      return null
    }
  }, [applyAuthenticatedState, clearAuthenticatedState])

  React.useEffect(() => {
    void reloadMe()
  }, [reloadMe])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      account,
      profile,
      error,
      async signIn(payload) {
        const response = await authApi.signIn(payload)
        applyAuthenticatedState(response)
        return response
      },
      async signUp(payload) {
        return authApi.signUp(payload)
      },
      async verifyEmail(payload) {
        return authApi.verifyEmail(payload)
      },
      async refresh() {
        try {
          await authApi.refresh()
          await reloadMe()
        } catch (caughtError) {
          clearAuthenticatedState()
          setError(getApiErrorMessage(caughtError))
          throw caughtError
        }
      },
      async signOut() {
        try {
          await authApi.signOut()
        } finally {
          setError(null)
          clearAuthenticatedState()
        }
      },
      reloadMe,
    }),
    [account, applyAuthenticatedState, clearAuthenticatedState, error, profile, reloadMe, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
