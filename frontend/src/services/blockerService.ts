import {
  Blocker,
  BlockerCreate,
  BlockerUpdate,
  BlockerResolve,
  BlockerList,
} from '../types/blocker'
import { apiClient } from './apiClient'

export const blockerService = {
  async createBlocker(data: BlockerCreate): Promise<Blocker> {
    const response = await apiClient.post<Blocker>('/api/blockers', data)
    return response.data
  },

  async getBlockers(params?: {
    page?: number
    limit?: number
    status?: string
    archived?: boolean
  }): Promise<BlockerList> {
    const response = await apiClient.get<BlockerList>('/api/blockers', { params })
    return response.data
  },

  async getBlocker(id: number): Promise<Blocker> {
    const response = await apiClient.get<Blocker>(`/api/blockers/${id}`)
    return response.data
  },

  async updateBlocker(id: number, data: BlockerUpdate): Promise<Blocker> {
    const response = await apiClient.patch<Blocker>(`/api/blockers/${id}`, data)
    return response.data
  },

  async resolveBlocker(id: number, data: BlockerResolve): Promise<Blocker> {
    const response = await apiClient.patch<Blocker>(
      `/api/blockers/${id}/resolve`,
      data
    )
    return response.data
  },

  async reopenBlocker(id: number): Promise<Blocker> {
    const response = await apiClient.patch<Blocker>(`/api/blockers/${id}/reopen`, {})
    return response.data
  },

  async archiveBlocker(id: number): Promise<Blocker> {
    const response = await apiClient.patch<Blocker>(`/api/blockers/${id}/archive`, {})
    return response.data
  },

  async unarchiveBlocker(id: number): Promise<Blocker> {
    const response = await apiClient.patch<Blocker>(
      `/api/blockers/${id}/unarchive`,
      {}
    )
    return response.data
  },

  async deleteBlocker(id: number): Promise<void> {
    await apiClient.delete(`/api/blockers/${id}`)
  },
}
