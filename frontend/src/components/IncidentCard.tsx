import { Incident } from '../types/incident'
import { useAuth } from '../contexts/AuthContext'

interface IncidentCardProps {
  incident: Incident
  onView?: (incident: Incident) => void
}

const IncidentCard = ({ incident, onView }: IncidentCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc3545'
      case 'high': return '#fd7e14'
      case 'medium': return '#ffc107'
      case 'low': return '#28a745'
      default: return '#6c757d'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#dc3545'
      case 'in_progress': return '#007bff'
      case 'resolved': return '#28a745'
      case 'closed': return '#6c757d'
      default: return '#6c757d'
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1rem',
        cursor: onView ? 'pointer' : 'default',
        borderLeft: `4px solid ${getSeverityColor(incident.severity)}`
      }}
      onClick={() => onView?.(incident)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{incident.title}</h3>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Reported by {incident.reported_by?.full_name || 'Unknown'} • {formatDate(incident.created_at)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: getSeverityColor(incident.severity),
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500',
              textTransform: 'uppercase'
            }}
          >
            {incident.severity}
          </span>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: getStatusColor(incident.status),
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '500',
              textTransform: 'uppercase'
            }}
          >
            {incident.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
        {incident.description.length > 150
          ? `${incident.description.substring(0, 150)}...`
          : incident.description}
      </div>
      {incident.assigned_to && (
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Assigned to: {incident.assigned_to.full_name}
        </div>
      )}
    </div>
  )
}

export default IncidentCard
