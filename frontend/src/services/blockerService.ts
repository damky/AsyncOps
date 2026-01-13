import axios from 'axios'
import {
  Blocker,
  BlockerCreate,
  BlockerUpdate,
  BlockerResolve,
  BlockerList,
} from '../types/blocker'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const blockerService = {
  async getToken(): Promise<string | null> {
    return localStorage.getItem('token')
  },

  async createBlocker(data: BlockerCreate): Promise<Blocker> {
    const token = await this.getToken()
    const response = await api.post<Blocker>('/api/blockers', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getBlockers(params?: {
    page?: number
    limit?: number
    status?: string
    archived?: boolean
  }): Promise<BlockerList> {
    const token = await this.getToken()
    const response = await api.get<BlockerList>('/api/blockers', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getBlocker(id: number): Promise<Blocker> {
    const token = await this.getToken()
    const response = await api.get<Blocker>(`/api/blockers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async updateBlocker(id: number, data: BlockerUpdate): Promise<Blocker> {
    const token = await this.getToken()
    const response = await api.patch<Blocker>(`/api/blockers/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async resolveBlocker(id: number, data: BlockerResolve): Promise<Blocker> {
    const token = await this.getToken()
    const response = await api.patch<Blocker>(
      `/api/blockers/${id}/resolve`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },

  async archiveBlocker(id: number): Promise<Blocker> {
    const token = await this.getToken()
    const response = await api.patch<Blocker>(
      `/api/blockers/${id}/archive`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },

  async unarchiveBlocker(id: number): Promise<Blocker> {
    const token = await this.getToken()
    const response = await api.patch<Blocker>(
      `/api/blockers/${id}/unarchive`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },

  async deleteBlocker(id: number): Promise<void> {
    const token = await this.getToken()
    await api.delete(`/api/blockers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
