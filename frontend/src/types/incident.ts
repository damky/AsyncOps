import { User } from './user'

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Incident {
  id: number
  reported_by_id: number
  assigned_to_id?: number | null
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  resolution_notes?: string | null
  created_at: string
  updated_at: string
  resolved_at?: string | null
  reported_by?: User | null
  assigned_to?: User | null
}

export interface IncidentCreate {
  title: string
  description: string
  severity?: IncidentSeverity
  assigned_to_id?: number | null
}

export interface IncidentUpdate {
  title?: string
  description?: string
  severity?: IncidentSeverity
  assigned_to_id?: number | null
}

export interface IncidentStatusUpdate {
  status: IncidentStatus
  resolution_notes?: string | null
}

export interface IncidentAssign {
  assigned_to_id?: number | null
}

export interface IncidentList {
  items: Incident[]
  total: number
  page: number
  limit: number
}
