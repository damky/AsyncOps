import { useState } from 'react'
import { Blocker } from '../types/blocker'
import { useAuth } from '../contexts/AuthContext'
import { blockerService } from '../services/blockerService'
import { getApiErrorMessage } from '../services/apiClient'

interface BlockerCardProps {
  blocker: Blocker
  onResolve?: (blocker: Blocker) => void
  onArchiveChange?: () => void
}

const BlockerCard = ({ blocker, onResolve, onArchiveChange }: BlockerCardProps) => {
  const { user } = useAuth()
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to archive this blocker?')) return
    
    setArchiving(true)
    try {
      await blockerService.archiveBlocker(blocker.id)
      onArchiveChange?.()
    } catch (err: unknown) {
      console.error('Failed to archive blocker:', err)
      alert(getApiErrorMessage(err, 'Failed to archive blocker'))
    } finally {
      setArchiving(false)
    }
  }

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setArchiving(true)
    try {
      await blockerService.unarchiveBlocker(blocker.id)
      onArchiveChange?.()
    } catch (err: unknown) {
      console.error('Failed to unarchive blocker:', err)
      alert(getApiErrorMessage(err, 'Failed to unarchive blocker'))
    } finally {
      setArchiving(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to permanently delete this archived blocker? This action cannot be undone.')) return
    
    setDeleting(true)
    try {
      await blockerService.deleteBlocker(blocker.id)
      onArchiveChange?.()
    } catch (err: unknown) {
      console.error('Failed to delete blocker:', err)
      alert(getApiErrorMessage(err, 'Failed to delete blocker'))
    } finally {
      setDeleting(false)
    }
  }

  const handleReopen = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    if (!window.confirm('Are you sure you want to reopen this blocker?')) return
    
    setReopening(true)
    try {
      await blockerService.reopenBlocker(blocker.id)
      onArchiveChange?.()
    } catch (err: unknown) {
      console.error('Failed to reopen blocker:', err)
      alert(getApiErrorMessage(err, 'Failed to reopen blocker'))
    } finally {
      setReopening(false)
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem',
      borderLeft: `4px solid ${blocker.status === 'active' ? '#dc3545' : '#28a745'}`,
      opacity: blocker.archived ? 0.7 : 1
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Reported by {blocker.reported_by?.full_name || 'Unknown'} • {formatDate(blocker.created_at)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: blocker.status === 'active' ? '#dc3545' : '#28a745',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500',
              textTransform: 'uppercase'
            }}
          >
            {blocker.status}
          </span>
          {blocker.status === 'resolved' && !blocker.archived && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '1.25rem',
                  lineHeight: 1
                }}
                title="More options"
              >
                ⋮
              </button>
              {showMenu && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.25rem',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '150px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleReopen}
                      disabled={reopening}
                      style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: reopening ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        color: '#333',
                        opacity: reopening ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!reopening) {
                          e.currentTarget.style.backgroundColor = '#f5f5f5'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {reopening ? 'Reopening...' : 'Reopen Blocker'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Description:</strong>
        <div style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{blocker.description}</div>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Impact:</strong>
        <div style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{blocker.impact}</div>
      </div>
      {blocker.resolution_notes && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          <strong>Resolution:</strong> {blocker.resolution_notes}
        </div>
      )}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginTop: '1rem',
        flexWrap: 'wrap'
      }}>
        {blocker.status === 'active' && !blocker.archived && onResolve && (
          <button
            onClick={() => onResolve(blocker)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Resolve Blocker
          </button>
        )}
        {!blocker.archived ? (
          <button
            onClick={handleArchive}
            disabled={archiving}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: archiving ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: archiving ? 0.6 : 1
            }}
          >
            {archiving ? 'Archiving...' : 'Archive'}
          </button>
        ) : (
          <>
            <button
              onClick={handleUnarchive}
              disabled={archiving}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: archiving ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: archiving ? 0.6 : 1
              }}
            >
              {archiving ? 'Unarchiving...' : 'Unarchive'}
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: deleting ? 0.6 : 1
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BlockerCard
