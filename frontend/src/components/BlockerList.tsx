import { useState, useEffect } from 'react'
import { blockerService } from '../services/blockerService'
import { Blocker, BlockerList as BlockerListType } from '../types/blocker'
import BlockerCard from './BlockerCard'

interface BlockerListProps {
  onResolve?: (blocker: Blocker) => void
}

const BlockerList = ({ onResolve }: BlockerListProps) => {
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const limit = 20

  const fetchBlockers = async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = { page, limit }
      if (statusFilter) params.status = statusFilter
      
      const data: BlockerListType = await blockerService.getBlockers(params)
      setBlockers(data.items)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load blockers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockers()
  }, [page, statusFilter])

  const handleResolve = async (blocker: Blocker) => {
    console.log('Resolve blocker clicked for blocker:', blocker.id)
    
    const notes = window.prompt('Enter resolution notes (optional):')
    
    // If user cancels the prompt, abort the operation
    if (notes === null) {
      console.log('User cancelled resolution')
      return
    }
    
    try {
      const resolveData = {
        resolution_notes: notes && notes.trim() ? notes.trim() : null
      }
      console.log('Calling resolveBlocker API for blocker:', blocker.id, 'with data:', resolveData)
      
      const result = await blockerService.resolveBlocker(blocker.id, resolveData)
      console.log('Blocker resolved successfully:', result)
      
      // Refresh the blockers list
      await fetchBlockers()
      onResolve?.(blocker)
    } catch (err: any) {
      console.error('Error resolving blocker:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      })
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to resolve blocker'
      alert(`Error: ${errorMessage}`)
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
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {blockers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          No blockers found.
        </div>
      ) : (
        <>
          {blockers.map((blocker) => (
            <BlockerCard
              key={blocker.id}
              blocker={blocker}
              onResolve={handleResolve}
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

export default BlockerList
