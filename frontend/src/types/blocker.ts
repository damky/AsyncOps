import { User } from './user'

export type BlockerStatus = 'active' | 'resolved'

export interface Blocker {
  id: number
  reported_by_id: number
  description: string
  impact: string
  status: BlockerStatus
  resolution_notes?: string | null
  related_status_id?: number | null
  related_incident_id?: number | null
  created_at: string
  updated_at: string
  resolved_at?: string | null
  reported_by?: User | null
}

export interface BlockerCreate {
  description: string
  impact: string
  related_status_id?: number | null
  related_incident_id?: number | null
}

export interface BlockerUpdate {
  description?: string
  impact?: string
  related_status_id?: number | null
  related_incident_id?: number | null
}

export interface BlockerResolve {
  resolution_notes?: string | null
}

export interface BlockerList {
  items: Blocker[]
  total: number
  page: number
  limit: number
}
