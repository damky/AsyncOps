import axios from 'axios'
import {
  Decision,
  DecisionCreate,
  DecisionUpdate,
  DecisionList,
  DecisionAuditLogResponse,
} from '../types/decision'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const decisionService = {
  async getToken(): Promise<string | null> {
    return localStorage.getItem('token')
  },

  async createDecision(data: DecisionCreate): Promise<Decision> {
    const token = await this.getToken()
    const response = await api.post<Decision>('/api/decisions', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getDecisions(params?: {
    page?: number
    limit?: number
    start_date?: string
    end_date?: string
    participant_id?: number
    tag?: string
    search?: string
  }): Promise<DecisionList> {
    const token = await this.getToken()
    const response = await api.get<DecisionList>('/api/decisions', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getDecision(id: number): Promise<Decision> {
    const token = await this.getToken()
    const response = await api.get<Decision>(`/api/decisions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async updateDecision(
    id: number,
    data: DecisionUpdate
  ): Promise<Decision> {
    const token = await this.getToken()
    const response = await api.patch<Decision>(`/api/decisions/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async deleteDecision(id: number): Promise<void> {
    const token = await this.getToken()
    await api.delete(`/api/decisions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  async getDecisionAudit(id: number): Promise<DecisionAuditLogResponse> {
    const token = await this.getToken()
    const response = await api.get<DecisionAuditLogResponse>(
      `/api/decisions/${id}/audit`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },
}
