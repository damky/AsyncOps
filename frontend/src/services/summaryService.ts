import {
  DailySummary,
  DailySummaryList,
} from '../types/dailySummary'
import { apiClient } from './apiClient'

export const summaryService = {
  async getSummaries(params?: {
    page?: number
    limit?: number
    start_date?: string
    end_date?: string
  }): Promise<DailySummaryList> {
    const response = await apiClient.get<DailySummaryList>('/api/summaries', { params })
    return response.data
  },

  async getSummary(id: number): Promise<DailySummary> {
    const response = await apiClient.get<DailySummary>(`/api/summaries/${id}`)
    return response.data
  },

  async generateSummary(summaryDate?: string, forceUpdate: boolean = true): Promise<DailySummary> {
    const params: Record<string, string | boolean> = {}
    if (summaryDate) {
      params.summary_date = summaryDate
    }
    params.force_update = forceUpdate
    const response = await apiClient.post<DailySummary>(
      '/api/summaries/generate',
      {},
      {
        params: Object.keys(params).length > 0 ? params : undefined,
      }
    )
    return response.data
  },
}
