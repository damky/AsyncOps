import axios from 'axios'
import { User, LoginResponse } from '../types/user'
import { apiClient } from './apiClient'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      return response.data
    } catch (error: unknown) {
      // Log error for debugging
      console.error('Login error:', error)
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
      }
      throw error
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await apiClient.get<User>('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error: unknown) {
      // Silently handle 401 errors (invalid/expired token)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('Token expired or invalid')
      } else {
        console.error('getCurrentUser error:', error)
      }
      throw error
    }
  },

  async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await apiClient.post<User>('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    return response.data
  },
}
