import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { summaryService } from '../services/summaryService'
import {
  DailySummaryList as DailySummaryListType,
  DailySummaryListItem,
} from '../types/dailySummary'
import DailySummaryCard from './DailySummaryCard'
import { getApiErrorMessage } from '../services/apiClient'

interface DailySummaryListProps {
  onView?: (summary: DailySummaryListItem) => void
}

export interface DailySummaryListRef {
  refresh: () => void
}

const DailySummaryList = forwardRef<DailySummaryListRef, DailySummaryListProps>(
  ({ onView }, ref) => {
    const [summaries, setSummaries] = useState<DailySummaryListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const limit = 20

    const fetchSummaries = useCallback(async () => {
      setLoading(true)
      setError('')
      try {
        const params: {
          page: number
          limit: number
          start_date?: string
          end_date?: string
        } = { page, limit }
        if (startDate) {
          params.start_date = startDate
        }
        if (endDate) {
          params.end_date = endDate
        }

        const data: DailySummaryListType = await summaryService.getSummaries(params)
        setSummaries(data.items)
        setTotal(data.total)
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load daily summaries'))
      } finally {
        setLoading(false)
      }
    }, [endDate, limit, page, startDate])

    useEffect(() => {
      fetchSummaries()
    }, [fetchSummaries])

    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchSummaries()
      },
    }))

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fee',
        color: '#c33',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      <div style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(1)
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(1)
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
              setPage(1)
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No daily summaries found.
        </div>
      ) : (
        <>
          {summaries.map((summary) => (
            <DailySummaryCard
              key={summary.id}
              summary={summary}
              onView={onView}
            />
          ))}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            padding: '1rem',
            borderTop: '1px solid #ddd'
          }}>
            <div>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: page === 1 ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: page * limit >= total ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: page * limit >= total ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
  }
)

DailySummaryList.displayName = 'DailySummaryList'

export default DailySummaryList
