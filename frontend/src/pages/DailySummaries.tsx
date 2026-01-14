import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DailySummaryList from '../components/DailySummaryList'
import { summaryService } from '../services/summaryService'
import {
  DailySummary,
  DailySummaryListItem,
} from '../types/dailySummary'

const DailySummaries = () => {
  const { user, logout } = useAuth()
  const [viewingSummary, setViewingSummary] = useState<DailySummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [generateMessage, setGenerateMessage] = useState('')

  const handleView = async (summary: DailySummaryListItem) => {
    setLoadingSummary(true)
    setSummaryError('')
    try {
      const fullSummary = await summaryService.getSummary(summary.id)
      setViewingSummary(fullSummary)
    } catch (err: any) {
      setSummaryError(err.response?.data?.detail || 'Failed to load daily summary')
      setViewingSummary(null)
    } finally {
      setLoadingSummary(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true)
    setSummaryError('')
    setGenerateMessage('')
    try {
      const summary = await summaryService.generateSummary()
      setGenerateMessage(`Generated summary for ${formatDate(summary.summary_date)}.`)
    } catch (err: any) {
      setSummaryError(err.response?.data?.detail || 'Failed to generate daily summary')
    } finally {
      setGeneratingSummary(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #ddd'
      }}>
        <h1>Daily Summaries</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.role === 'admin' && (
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: generatingSummary ? '#8ab5e0' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: generatingSummary ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {generatingSummary ? 'Generating...' : 'Generate Summary'}
            </button>
          )}
          <Link
            to="/dashboard"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Home
          </Link>
          <span>Welcome, {user?.full_name}</span>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {viewingSummary ? (
          <div>
            <button
              onClick={() => {
                setViewingSummary(null)
                setSummaryError('')
              }}
              style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Back to List
            </button>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '1rem'
            }}>
              <h2 style={{ marginTop: 0 }}>
                Summary for {formatDate(viewingSummary.summary_date)}
              </h2>
              <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
                Generated at {formatDateTime(viewingSummary.generated_at)}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                  <strong>Status Updates:</strong> {viewingSummary.status_updates_count}
                </div>
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                  <strong>Active Incidents:</strong> {viewingSummary.incidents_count}
                </div>
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                  <strong>Active Blockers:</strong> {viewingSummary.blockers_count}
                </div>
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                  <strong>Recent Decisions:</strong> {viewingSummary.decisions_count}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3>Status Updates</h3>
                {viewingSummary.content.status_updates.length === 0 ? (
                  <div style={{ color: '#666' }}>No status updates in the last 24 hours.</div>
                ) : (
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {viewingSummary.content.status_updates.map((update) => (
                      <li key={update.id} style={{ marginBottom: '0.5rem' }}>
                        <strong>{update.title}</strong> by {update.author} • {formatDateTime(update.created_at)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3>Active Incidents</h3>
                {viewingSummary.content.incidents.length === 0 ? (
                  <div style={{ color: '#666' }}>No active incidents.</div>
                ) : (
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {viewingSummary.content.incidents.map((incident) => (
                      <li key={incident.id} style={{ marginBottom: '0.5rem' }}>
                        <strong>{incident.title}</strong> ({incident.severity}) • {incident.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3>Active Blockers</h3>
                {viewingSummary.content.blockers.length === 0 ? (
                  <div style={{ color: '#666' }}>No active blockers.</div>
                ) : (
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {viewingSummary.content.blockers.map((blocker) => (
                      <li key={blocker.id} style={{ marginBottom: '0.5rem' }}>
                        {blocker.description} • {blocker.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3>Recent Decisions</h3>
                {viewingSummary.content.recent_decisions.length === 0 ? (
                  <div style={{ color: '#666' }}>No decisions in the last 7 days.</div>
                ) : (
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {viewingSummary.content.recent_decisions.map((decision) => (
                      <li key={decision.id} style={{ marginBottom: '0.5rem' }}>
                        <strong>{decision.title}</strong> • {formatDate(decision.decision_date)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3>Statistics</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    Total status updates: {viewingSummary.content.statistics.total_status_updates}
                  </div>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    Critical incidents: {viewingSummary.content.statistics.critical_incidents}
                  </div>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    Active blockers: {viewingSummary.content.statistics.active_blockers}
                  </div>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    Decisions (7 days): {viewingSummary.content.statistics.decisions_last_7_days}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {generateMessage && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#e6f7ff',
                color: '#0c5460',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {generateMessage}
              </div>
            )}
            {summaryError && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {summaryError}
              </div>
            )}
            {loadingSummary ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading summary...</div>
            ) : (
              <DailySummaryList onView={handleView} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default DailySummaries
