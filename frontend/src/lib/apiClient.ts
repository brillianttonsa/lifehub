import axios, { AxiosError } from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as { message?: string; error?: string }
    return data.message || data.error || 'Request failed'
  }

  return error instanceof Error ? error.message : 'An unexpected network error occurred.'
}
