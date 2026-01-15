import { useState, useEffect, useCallback } from 'react'
import { statusService } from '../services/statusService'
import { userService } from '../services/userService'
import { StatusUpdate, StatusUpdateList as StatusUpdateListResponse } from '../types/statusUpdate'
import { User } from '../types/user'
import StatusUpdateCard from './StatusUpdateCard'
import FilterMenu from './FilterMenu'
import { getApiErrorMessage } from '../services/apiClient'

interface StatusUpdateListProps {
  onEdit?: (status: StatusUpdate) => void
  onDelete?: (id: number) => void
}

const StatusUpdateList = ({ onEdit, onDelete }: StatusUpdateListProps) => {
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [authorFilter, setAuthorFilter] = useState<number | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const limit = 20

  // Load users for author filter
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

  const fetchStatusUpdates = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: {
        page: number
        limit: number
        author_id?: number
      } = { page, limit }
      if (authorFilter !== null) {
        params.author_id = authorFilter
      }
      
      const data: StatusUpdateListResponse = await statusService.getStatusUpdates(params)
      setStatusUpdates(data.items)
      setTotal(data.total)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load status updates'))
    } finally {
      setLoading(false)
    }
  }, [authorFilter, limit, page])

  useEffect(() => {
    fetchStatusUpdates()
  }, [fetchStatusUpdates])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this status update?')) {
      try {
        await statusService.deleteStatusUpdate(id)
        fetchStatusUpdates()
        onDelete?.(id)
      } catch (err: unknown) {
        alert(getApiErrorMessage(err, 'Failed to delete status update'))
      }
    }
  }

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
            author: {
              value: authorFilter,
              onChange: (value) => {
                setAuthorFilter(value)
                setPage(1)
              },
              options: users
            }
          }}
          onClearFilters={() => setPage(1)}
        />
      </div>
      {statusUpdates.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No status updates yet. Create one to get started!
        </div>
      ) : (
        <>
          {statusUpdates.map((status) => (
            <StatusUpdateCard
              key={status.id}
              status={status}
              onEdit={onEdit}
              onDelete={handleDelete}
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

export default StatusUpdateList
