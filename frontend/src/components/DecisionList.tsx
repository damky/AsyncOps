import { useState, useEffect } from 'react'
import { decisionService } from '../services/decisionService'
import { userService } from '../services/userService'
import { Decision, DecisionList as DecisionListType } from '../types/decision'
import { User } from '../types/user'
import DecisionCard from './DecisionCard'

interface DecisionListProps {
  onView?: (decision: Decision) => void
  onEdit?: (decision: Decision) => void
  onDelete?: (decision: Decision) => void
}

const DecisionList = ({ onView, onEdit, onDelete }: DecisionListProps) => {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [participantFilter, setParticipantFilter] = useState<number | null>(null)
  const [tagFilter, setTagFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const limit = 20

  // Load users for participant filter
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await userService.getUsersForAssignment()
        setUsers(usersData)
      } catch (err) {
        console.error('Failed to load users:', err)
      }
    }
    loadUsers()
  }, [])

  const fetchDecisions = async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = { page, limit }
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (participantFilter) params.participant_id = participantFilter
      if (tagFilter) params.tag = tagFilter
      if (searchQuery) params.search = searchQuery
      
      const data: DecisionListType = await decisionService.getDecisions(params)
      setDecisions(data.items)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load decisions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDecisions()
  }, [page, startDate, endDate, participantFilter, tagFilter, searchQuery])

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
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Participant
            </label>
            <select
              value={participantFilter || ''}
              onChange={(e) => {
                setParticipantFilter(e.target.value ? parseInt(e.target.value) : null)
                setPage(1)
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Participants</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Tag
            </label>
            <input
              type="text"
              value={tagFilter}
              onChange={(e) => {
                setTagFilter(e.target.value)
                setPage(1)
              }}
              placeholder="Filter by tag"
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
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search title/description"
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
              setParticipantFilter(null)
              setTagFilter('')
              setSearchQuery('')
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

      {decisions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No decisions found.
        </div>
      ) : (
        <>
          {decisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
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

export default DecisionList
