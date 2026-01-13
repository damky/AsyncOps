import { StatusUpdate } from '../types/statusUpdate'
import { useAuth } from '../contexts/AuthContext'

interface StatusUpdateCardProps {
  status: StatusUpdate
  onEdit?: (status: StatusUpdate) => void
  onDelete?: (id: number) => void
}

const StatusUpdateCard = ({ status, onEdit, onDelete }: StatusUpdateCardProps) => {
  const { user } = useAuth()
  const isAuthor = user?.id === status.user_id

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem'
      }}>
        <div>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{status.title}</h3>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            By {status.user?.full_name || 'Unknown'} • {formatDate(status.created_at)}
          </div>
        </div>
        {isAuthor && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onEdit && (
              <button
                onClick={() => onEdit(status)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(status.id)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <div style={{
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
        marginBottom: '0.5rem'
      }}>
        {status.content}
      </div>
      {status.tags && status.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {status.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#495057'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default StatusUpdateCard
