import {
  StatusUpdate,
  StatusUpdateCreate,
  StatusUpdateUpdate,
  StatusUpdateList,
} from '../types/statusUpdate'
import { apiClient } from './apiClient'

export const statusService = {
  async createStatusUpdate(data: StatusUpdateCreate): Promise<StatusUpdate> {
    const response = await apiClient.post<StatusUpdate>('/api/status', data)
    return response.data
  },

  async getStatusUpdates(params?: {
    page?: number
    limit?: number
    author_id?: number
    start_date?: string
    end_date?: string
  }): Promise<StatusUpdateList> {
    const response = await apiClient.get<StatusUpdateList>('/api/status', { params })
    return response.data
  },

  async getStatusUpdate(id: number): Promise<StatusUpdate> {
    const response = await apiClient.get<StatusUpdate>(`/api/status/${id}`)
    return response.data
  },

  async updateStatusUpdate(
    id: number,
    data: StatusUpdateUpdate
  ): Promise<StatusUpdate> {
    const response = await apiClient.patch<StatusUpdate>(`/api/status/${id}`, data)
    return response.data
  },

  async deleteStatusUpdate(id: number): Promise<void> {
    await apiClient.delete(`/api/status/${id}`)
  },
}
