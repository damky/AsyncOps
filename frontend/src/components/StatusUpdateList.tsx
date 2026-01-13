import { useState, useEffect } from 'react'
import { statusService } from '../services/statusService'
import { StatusUpdate, StatusUpdateList as StatusUpdateListResponse } from '../types/statusUpdate'
import StatusUpdateCard from './StatusUpdateCard'

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
  const limit = 20

  const fetchStatusUpdates = async () => {
    setLoading(true)
    setError('')
    try {
      const data: StatusUpdateListResponse = await statusService.getStatusUpdates({
        page,
        limit,
      })
      setStatusUpdates(data.items)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load status updates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatusUpdates()
  }, [page])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this status update?')) {
      try {
        await statusService.deleteStatusUpdate(id)
        fetchStatusUpdates()
        onDelete?.(id)
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete status update')
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
