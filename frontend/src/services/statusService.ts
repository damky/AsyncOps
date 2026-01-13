import axios from 'axios'
import {
  StatusUpdate,
  StatusUpdateCreate,
  StatusUpdateUpdate,
  StatusUpdateList,
} from '../types/statusUpdate'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const statusService = {
  async getToken(): Promise<string | null> {
    return localStorage.getItem('token')
  },

  async createStatusUpdate(data: StatusUpdateCreate): Promise<StatusUpdate> {
    const token = await this.getToken()
    const response = await api.post<StatusUpdate>('/api/status', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getStatusUpdates(params?: {
    page?: number
    limit?: number
    author_id?: number
    start_date?: string
    end_date?: string
  }): Promise<StatusUpdateList> {
    const token = await this.getToken()
    const response = await api.get<StatusUpdateList>('/api/status', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getStatusUpdate(id: number): Promise<StatusUpdate> {
    const token = await this.getToken()
    const response = await api.get<StatusUpdate>(`/api/status/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async updateStatusUpdate(
    id: number,
    data: StatusUpdateUpdate
  ): Promise<StatusUpdate> {
    const token = await this.getToken()
    const response = await api.patch<StatusUpdate>(`/api/status/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async deleteStatusUpdate(id: number): Promise<void> {
    const token = await this.getToken()
    await api.delete(`/api/status/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
