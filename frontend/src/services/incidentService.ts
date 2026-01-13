import axios from 'axios'
import {
  Incident,
  IncidentCreate,
  IncidentUpdate,
  IncidentStatusUpdate,
  IncidentAssign,
  IncidentList,
} from '../types/incident'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const incidentService = {
  async getToken(): Promise<string | null> {
    return localStorage.getItem('token')
  },

  async createIncident(data: IncidentCreate): Promise<Incident> {
    const token = await this.getToken()
    const response = await api.post<Incident>('/api/incidents', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getIncidents(params?: {
    page?: number
    limit?: number
    status?: string
    severity?: string
    assigned_to_id?: number
  }): Promise<IncidentList> {
    const token = await this.getToken()
    const response = await api.get<IncidentList>('/api/incidents', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getIncident(id: number): Promise<Incident> {
    const token = await this.getToken()
    const response = await api.get<Incident>(`/api/incidents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async updateIncident(
    id: number,
    data: IncidentUpdate
  ): Promise<Incident> {
    const token = await this.getToken()
    const response = await api.patch<Incident>(`/api/incidents/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async updateIncidentStatus(
    id: number,
    data: IncidentStatusUpdate
  ): Promise<Incident> {
    const token = await this.getToken()
    const response = await api.patch<Incident>(
      `/api/incidents/${id}/status`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },

  async assignIncident(id: number, data: IncidentAssign): Promise<Incident> {
    const token = await this.getToken()
    const response = await api.patch<Incident>(
      `/api/incidents/${id}/assign`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },
}
