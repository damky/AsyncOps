import axios from 'axios'
import { User } from '../types/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const userService = {
  async getToken(): Promise<string | null> {
    return localStorage.getItem('token')
  },

  async getUsersForAssignment(): Promise<User[]> {
    const token = await this.getToken()
    const response = await api.get<User[]>('/api/users/for-assignment', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}
