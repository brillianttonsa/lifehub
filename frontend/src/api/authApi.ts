import { apiClient } from '../lib/apiClient'

export interface AuthUser {
  id: string
  email: string
  fullName: string
}

export interface AuthResponse {
  user: AuthUser
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  return response.data.user
}

export async function signup(fullName: string, email: string, password: string): Promise<AuthUser> {
  await apiClient.post<AuthResponse>('/auth/signup', {
    fullName,
    email,
    password,
  })

  return login(email, password)
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthResponse>('/auth/me')
  return response.data.user
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword })
}
