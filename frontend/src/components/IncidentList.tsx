import { useState, useEffect, useCallback } from 'react'
import { incidentService } from '../services/incidentService'
import { userService } from '../services/userService'
import { Incident, IncidentList as IncidentListType } from '../types/incident'
import { User } from '../types/user'
import IncidentCard from './IncidentCard'
import FilterMenu from './FilterMenu'
import { getApiErrorMessage } from '../services/apiClient'

interface IncidentListProps {
  onView?: (incident: Incident) => void
  onArchiveChange?: () => void
  archived?: boolean
}

const IncidentList = ({ onView, onArchiveChange, archived = false }: IncidentListProps) => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [assignedToFilter, setAssignedToFilter] = useState<number | null>(null)
  const [archivedFilter, setArchivedFilter] = useState<boolean>(archived)
  const [users, setUsers] = useState<User[]>([])
  const limit = 20

  // Load users for assignment filter
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

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: {
        page: number
        limit: number
        archived: boolean
        status?: string
        severity?: string
        assigned_to_id?: number
      } = { page, limit, archived: archivedFilter }
      if (statusFilter) {
        params.status = statusFilter
      }
      if (severityFilter) {
        params.severity = severityFilter
      }
      if (assignedToFilter !== null) {
        params.assigned_to_id = assignedToFilter
      }
      
      const data: IncidentListType = await incidentService.getIncidents(params)
      setIncidents(data.items)
      setTotal(data.total)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load incidents'))
    } finally {
      setLoading(false)
    }
  }, [archivedFilter, assignedToFilter, limit, page, severityFilter, statusFilter])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  // Sync archived filter with prop changes
  useEffect(() => {
    setArchivedFilter(archived)
  }, [archived])

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
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem'
      }}>
        <FilterMenu
          filters={{
            status: {
              value: statusFilter,
              onChange: (value) => {
                setStatusFilter(value)
                setPage(1)
              },
              options: [
                { label: 'All Statuses', value: '' },
                { label: 'Open', value: 'open' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Resolved', value: 'resolved' },
                { label: 'Closed', value: 'closed' }
              ]
            },
            severity: {
              value: severityFilter,
              onChange: (value) => {
                setSeverityFilter(value)
                setPage(1)
              },
              options: [
                { label: 'All Severities', value: '' },
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Critical', value: 'critical' }
              ]
            },
            assignedTo: {
              value: assignedToFilter,
              onChange: (value) => {
                setAssignedToFilter(value)
                setPage(1)
              },
              options: users
            }
          }}
          onClearFilters={() => setPage(1)}
        />
      </div>

      {incidents.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No incidents found.
        </div>
      ) : (
        <>
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onView={onView}
              onAssignmentChange={fetchIncidents}
              onStatusChange={fetchIncidents}
              onArchiveChange={onArchiveChange || fetchIncidents}
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

export default IncidentList
