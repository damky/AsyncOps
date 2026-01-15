import {
  Decision,
  DecisionCreate,
  DecisionUpdate,
  DecisionList,
  DecisionAuditLogResponse,
} from '../types/decision'
import { apiClient } from './apiClient'

export const decisionService = {
  async createDecision(data: DecisionCreate): Promise<Decision> {
    const response = await apiClient.post<Decision>('/api/decisions', data)
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
    const response = await apiClient.get<DecisionList>('/api/decisions', { params })
    return response.data
  },

  async getDecision(id: number): Promise<Decision> {
    const response = await apiClient.get<Decision>(`/api/decisions/${id}`)
    return response.data
  },

  async updateDecision(
    id: number,
    data: DecisionUpdate
  ): Promise<Decision> {
    const response = await apiClient.patch<Decision>(`/api/decisions/${id}`, data)
    return response.data
  },

  async deleteDecision(id: number): Promise<void> {
    await apiClient.delete(`/api/decisions/${id}`)
  },

  async getDecisionAudit(id: number): Promise<DecisionAuditLogResponse> {
    const response = await apiClient.get<DecisionAuditLogResponse>(
      `/api/decisions/${id}/audit`
    )
    return response.data
  },
}
