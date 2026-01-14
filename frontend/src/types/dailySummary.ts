export interface DailySummaryStatusUpdate {
  id: number
  title: string
  author: string
  created_at: string
}

export interface DailySummaryIncident {
  id: number
  title: string
  severity: string
  status: string
}

export interface DailySummaryBlocker {
  id: number
  description: string
  status: string
}

export interface DailySummaryDecision {
  id: number
  title: string
  decision_date: string
}

export interface DailySummaryStatistics {
  total_status_updates: number
  critical_incidents: number
  active_blockers: number
  decisions_last_7_days: number
}

export interface DailySummaryContent {
  status_updates: DailySummaryStatusUpdate[]
  incidents: DailySummaryIncident[]
  blockers: DailySummaryBlocker[]
  recent_decisions: DailySummaryDecision[]
  statistics: DailySummaryStatistics
}

export interface DailySummaryListItem {
  id: number
  summary_date: string
  status_updates_count: number
  incidents_count: number
  blockers_count: number
  decisions_count: number
  generated_at: string
}

export interface DailySummary {
  id: number
  summary_date: string
  content: DailySummaryContent
  status_updates_count: number
  incidents_count: number
  blockers_count: number
  decisions_count: number
  generated_at: string
}

export interface DailySummaryList {
  items: DailySummaryListItem[]
  total: number
  page: number
  limit: number
}
