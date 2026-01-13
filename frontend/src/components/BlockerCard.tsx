import { Blocker } from '../types/blocker'

interface BlockerCardProps {
  blocker: Blocker
  onResolve?: (blocker: Blocker) => void
}

const BlockerCard = ({ blocker, onResolve }: BlockerCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem',
      borderLeft: `4px solid ${blocker.status === 'active' ? '#dc3545' : '#28a745'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Reported by {blocker.reported_by?.full_name || 'Unknown'} • {formatDate(blocker.created_at)}
          </div>
        </div>
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
      {blocker.status === 'active' && onResolve && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => onResolve(blocker)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Resolve Blocker
          </button>
        </div>
      )}
    </div>
  )
}

export default BlockerCard
