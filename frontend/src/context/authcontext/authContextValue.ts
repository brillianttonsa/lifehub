import { createContext } from 'react'
import { AuthUser } from '../../api/authApi'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  connectionError: string | null
  signIn: (email: string, password: string) => Promise<AuthUser>
  signUp: (fullName: string, email: string, password: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
