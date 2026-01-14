import axios from 'axios'
import {
  DailySummary,
  DailySummaryList,
} from '../types/dailySummary'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const summaryService = {
  async getToken(): Promise<string | null> {
    return localStorage.getItem('token')
  },

  async getSummaries(params?: {
    page?: number
    limit?: number
    start_date?: string
    end_date?: string
  }): Promise<DailySummaryList> {
    const token = await this.getToken()
    const response = await api.get<DailySummaryList>('/api/summaries', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getSummary(id: number): Promise<DailySummary> {
    const token = await this.getToken()
    const response = await api.get<DailySummary>(`/api/summaries/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async generateSummary(summaryDate?: string): Promise<DailySummary> {
    const token = await this.getToken()
    const response = await api.post<DailySummary>(
      '/api/summaries/generate',
      {},
      {
        params: summaryDate ? { summary_date: summaryDate } : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },
}
