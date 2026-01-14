import { User } from './user'

export interface DecisionParticipant {
  id: number
  user_id: number
  user?: User | null
  created_at: string
}

export interface Decision {
  id: number
  created_by_id: number
  title: string
  description: string
  context: string
  outcome: string
  decision_date: string
  tags?: string[] | null
  created_at: string
  updated_at: string
  created_by?: User | null
  participants?: DecisionParticipant[] | null
}

export interface DecisionCreate {
  title: string
  description: string
  context: string
  outcome: string
  decision_date: string
  tags?: string[] | null
  participant_ids?: number[] | null
}

export interface DecisionUpdate {
  title?: string
  description?: string
  context?: string
  outcome?: string
  decision_date?: string
  tags?: string[] | null
  participant_ids?: number[] | null
}

export interface DecisionList {
  items: Decision[]
  total: number
  page: number
  limit: number
}

export interface DecisionAuditLogEntry {
  id: number
  decision_id: number
  changed_by_id: number
  change_type: 'created' | 'updated' | 'deleted'
  field_name?: string | null
  old_value?: string | null
  new_value?: string | null
  changed_at: string
  changed_by?: User | null
}

export interface DecisionAuditLogResponse {
  items: DecisionAuditLogEntry[]
}
