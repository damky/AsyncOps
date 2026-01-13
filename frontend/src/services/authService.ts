import axios from 'axios'
import { User, LoginResponse } from '../types/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      return response.data
    } catch (error: any) {
      // Log error for debugging
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      throw error
    }
  },

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await api.get<User>('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error: any) {
      // Silently handle 401 errors (invalid/expired token)
      if (error.response?.status === 401) {
        console.log('Token expired or invalid')
      } else {
        console.error('getCurrentUser error:', error)
      }
      throw error
    }
  },

  async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await api.post<User>('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    return response.data
  },
}
