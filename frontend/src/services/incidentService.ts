import {
  Incident,
  IncidentCreate,
  IncidentUpdate,
  IncidentStatusUpdate,
  IncidentAssign,
  IncidentList,
} from '../types/incident'
import { apiClient } from './apiClient'

export const incidentService = {
  async createIncident(data: IncidentCreate): Promise<Incident> {
    const response = await apiClient.post<Incident>('/api/incidents', data)
    return response.data
  },

  async getIncidents(params?: {
    page?: number
    limit?: number
    status?: string
    severity?: string
    assigned_to_id?: number
    archived?: boolean
  }): Promise<IncidentList> {
    const response = await apiClient.get<IncidentList>('/api/incidents', { params })
    return response.data
  },

  async getIncident(id: number): Promise<Incident> {
    const response = await apiClient.get<Incident>(`/api/incidents/${id}`)
    return response.data
  },

  async updateIncident(
    id: number,
    data: IncidentUpdate
  ): Promise<Incident> {
    const response = await apiClient.patch<Incident>(`/api/incidents/${id}`, data)
    return response.data
  },

  async updateIncidentStatus(
    id: number,
    data: IncidentStatusUpdate
  ): Promise<Incident> {
    const response = await apiClient.patch<Incident>(
      `/api/incidents/${id}/status`,
      data
    )
    return response.data
  },

  async assignIncident(id: number, data: IncidentAssign): Promise<Incident> {
    const response = await apiClient.patch<Incident>(
      `/api/incidents/${id}/assign`,
      data
    )
    return response.data
  },

  async archiveIncident(id: number): Promise<Incident> {
    const response = await apiClient.patch<Incident>(`/api/incidents/${id}/archive`, {})
    return response.data
  },

  async unarchiveIncident(id: number): Promise<Incident> {
    const response = await apiClient.patch<Incident>(`/api/incidents/${id}/unarchive`, {})
    return response.data
  },

  async deleteIncident(id: number): Promise<void> {
    await apiClient.delete(`/api/incidents/${id}`)
  },
}
