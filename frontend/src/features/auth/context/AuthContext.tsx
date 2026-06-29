import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AuthUser,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from '../api/authApi'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrapSession() {
      try {
        await refreshSession()
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    bootstrapSession()

    return () => {
      cancelled = true
    }
  }, [refreshSession])

  const signIn = useCallback(async (email: string, password: string) => {
    const nextUser = await loginRequest(email, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const nextUser = await signupRequest(fullName, email, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      signIn,
      signUp,
      signOut,
      refreshSession,
    }),
    [isBootstrapping, refreshSession, signIn, signOut, signUp, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
