import { DailySummaryListItem } from '../types/dailySummary'

interface DailySummaryCardProps {
  summary: DailySummaryListItem
  onView?: (summary: DailySummaryListItem) => void
}

const DailySummaryCard = ({ summary, onView }: DailySummaryCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div
      onClick={() => onView?.(summary)}
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        cursor: onView ? 'pointer' : 'default',
        border: '2px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (onView) {
          e.currentTarget.style.borderColor = '#17a2b8'
        }
      }}
      onMouseLeave={(e) => {
        if (onView) {
          e.currentTarget.style.borderColor = 'transparent'
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>
            Summary for {formatDate(summary.summary_date)}
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Generated at {formatDateTime(summary.generated_at)}
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#495057' }}>
            Status: {summary.status_updates_count}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#495057' }}>
            Incidents: {summary.incidents_count}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#495057' }}>
            Blockers: {summary.blockers_count}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#495057' }}>
            Decisions: {summary.decisions_count}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DailySummaryCard
