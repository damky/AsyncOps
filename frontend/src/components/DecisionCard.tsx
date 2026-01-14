import { Decision } from '../types/decision'
import { useAuth } from '../contexts/AuthContext'

interface DecisionCardProps {
  decision: Decision
  onView?: (decision: Decision) => void
  onEdit?: (decision: Decision) => void
  onDelete?: (decision: Decision) => void
}

const DecisionCard = ({ decision, onView, onEdit, onDelete }: DecisionCardProps) => {
  const { user } = useAuth()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const canEdit = user && (user.id === decision.created_by_id || user.role === 'admin')
  const canDelete = user && (user.id === decision.created_by_id || user.role === 'admin')

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        cursor: onView ? 'pointer' : 'default',
        borderLeft: '4px solid #007bff',
        transition: 'box-shadow 0.2s'
      }}
      onClick={() => onView?.(decision)}
      onMouseEnter={(e) => {
        if (onView) {
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
        }
      }}
      onMouseLeave={(e) => {
        if (onView) {
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>
          {decision.title}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(decision)
              }}
              style={{
                padding: '0.25rem 0.75rem',
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
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Are you sure you want to delete this decision? This action cannot be undone.')) {
                  onDelete(decision)
                }
              }}
              style={{
                padding: '0.25rem 0.75rem',
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
      </div>

      <div style={{ marginBottom: '0.75rem', color: '#666', fontSize: '0.875rem' }}>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Decision Date:</strong> {formatDate(decision.decision_date)}
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Created by:</strong> {decision.created_by?.full_name || 'Unknown'}
        </div>
        {decision.participants && decision.participants.length > 0 && (
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Participants:</strong>{' '}
            {decision.participants.map(p => p.user?.full_name || 'Unknown').join(', ')}
          </div>
        )}
      </div>

      <p style={{
        margin: '0.75rem 0',
        color: '#333',
        lineHeight: '1.6',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {decision.description}
      </p>

      {decision.tags && decision.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
          {decision.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#e9ecef',
                borderRadius: '16px',
                fontSize: '0.75rem',
                color: '#495057'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #e9ecef',
        fontSize: '0.75rem',
        color: '#6c757d'
      }}>
        Created: {formatDate(decision.created_at)} • Updated: {formatDate(decision.updated_at)}
      </div>
    </div>
  )
}

export default DecisionCard
