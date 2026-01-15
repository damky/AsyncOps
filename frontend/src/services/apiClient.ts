import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const isAuthRoute =
    config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/register')

  if (token && !isAuthRoute) {
    config.headers = {
      ...config.headers,
      Authorization: config.headers?.Authorization ?? `Bearer ${token}`,
    }
  }

  return config
})

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as { detail?: unknown; message?: unknown } | undefined
    const detail = data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => (typeof item?.msg === 'string' ? item.msg : null))
        .filter((message): message is string => !!message)

      if (messages.length > 0) {
        return messages.join('; ')
      }
    }

    if (typeof data?.message === 'string') {
      return data.message
    }

    if (status === 401) {
      return 'Your session has expired. Please log in again.'
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}
