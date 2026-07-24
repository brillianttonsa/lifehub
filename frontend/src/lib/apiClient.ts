import axios, { AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL 

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as Record<string, unknown>

    if (typeof data.message === 'string') {
      return data.message
    }

    if (data.error) {
      if (typeof data.error === 'string') {
        return data.error
      }
      if (typeof data.error === 'object' && data.error !== null && 'message' in data.error) {
        return String((data.error as Record<string, unknown>).message)
      }
      return JSON.stringify(data.error)
    }

    return 'Request failed'
  }

  return error instanceof Error ? error.message : 'An unexpected network error occurred.'
}