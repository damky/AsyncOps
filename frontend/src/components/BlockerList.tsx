import { useState, useEffect } from 'react'
import { blockerService } from '../services/blockerService'
import { Blocker, BlockerList as BlockerListType } from '../types/blocker'
import BlockerCard from './BlockerCard'
import FilterMenu from './FilterMenu'

interface BlockerListProps {
  onResolve?: (blocker: Blocker) => void
  onArchiveChange?: () => void
  archived?: boolean
}

const BlockerList = ({ onResolve, onArchiveChange, archived = false }: BlockerListProps) => {
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [archivedFilter, setArchivedFilter] = useState<boolean>(archived)
  const [resolvingBlocker, setResolvingBlocker] = useState<Blocker | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const limit = 20

  const fetchBlockers = async () => {
    setLoading(true)
    setError('')
    try {
      const params: any = { page, limit, archived: archivedFilter }
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
  }, [page, statusFilter, archivedFilter])

  // Sync archived filter with prop changes
  useEffect(() => {
    setArchivedFilter(archived)
  }, [archived])

  const handleResolveClick = (blocker: Blocker) => {
    setResolvingBlocker(blocker)
    setResolutionNotes('')
  }

  const handleCancelResolve = () => {
    setResolvingBlocker(null)
    setResolutionNotes('')
  }

  const handleConfirmResolve = async () => {
    if (!resolvingBlocker) return
    
    // Prevent resolving archived blockers
    if (resolvingBlocker.archived) {
      alert('Cannot resolve archived blockers. Please unarchive first.')
      setResolvingBlocker(null)
      setResolutionNotes('')
      return
    }
    
    setIsResolving(true)
    try {
      const resolveData = {
        resolution_notes: resolutionNotes.trim() || null
      }
      console.log('Calling resolveBlocker API for blocker:', resolvingBlocker.id, 'with data:', resolveData)
      
      const result = await blockerService.resolveBlocker(resolvingBlocker.id, resolveData)
      console.log('Blocker resolved successfully:', result)
      
      // Refresh the blockers list
      await fetchBlockers()
      onResolve?.(resolvingBlocker)
      
      // Close the modal
      setResolvingBlocker(null)
      setResolutionNotes('')
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
    } finally {
      setIsResolving(false)
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
      {/* Resolution Modal */}
      {resolvingBlocker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Resolve Blocker</h2>
            {resolvingBlocker.archived && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#fff3cd',
                color: '#856404',
                borderRadius: '4px',
                fontSize: '0.875rem',
                border: '1px solid #ffc107'
              }}>
                This blocker is archived and cannot be resolved. Please unarchive it first.
              </div>
            )}
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Enter resolution notes (optional):
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how this blocker was resolved..."
              disabled={isResolving || resolvingBlocker.archived}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1rem',
                backgroundColor: resolvingBlocker.archived ? '#f5f5f5' : 'white',
                color: '#333',
                cursor: (isResolving || resolvingBlocker.archived) ? 'not-allowed' : 'text'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelResolve}
                disabled={isResolving}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isResolving ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={isResolving || resolvingBlocker.archived}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: (isResolving || resolvingBlocker.archived) ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (isResolving || resolvingBlocker.archived) ? 'not-allowed' : 'pointer'
                }}
              >
                {isResolving ? 'Resolving...' : resolvingBlocker.archived ? 'Archived (Cannot Resolve)' : 'Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                { label: 'Active', value: 'active' },
                { label: 'Resolved', value: 'resolved' }
              ]
            }
          }}
          onClearFilters={() => setPage(1)}
        />
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
              onResolve={handleResolveClick}
              onArchiveChange={onArchiveChange || fetchBlockers}
              showArchived={archivedFilter}
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
