import { useState, useEffect } from 'react'
import { Incident, IncidentAssign, IncidentStatusUpdate, IncidentStatus } from '../types/incident'
import { useAuth } from '../contexts/AuthContext'
import { incidentService } from '../services/incidentService'
import { userService } from '../services/userService'
import { User } from '../types/user'
import { getApiErrorMessage } from '../services/apiClient'

interface IncidentCardProps {
  incident: Incident
  onView?: (incident: Incident) => void
  onAssignmentChange?: () => void
  onStatusChange?: () => void
  onArchiveChange?: () => void
}

const IncidentCard = ({ incident, onView, onAssignmentChange, onStatusChange, onArchiveChange }: IncidentCardProps) => {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [assigning, setAssigning] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await userService.getUsersForAssignment()
        setUsers(userList)
      } catch (err) {
        console.error('Failed to load users:', err)
      }
    }
    fetchUsers()
  }, [])

  const handleAssignmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const newAssignedToId = e.target.value ? parseInt(e.target.value) : null
    setAssigning(true)
    try {
      const assignData: IncidentAssign = { assigned_to_id: newAssignedToId }
      await incidentService.assignIncident(incident.id, assignData)
      onAssignmentChange?.()
    } catch (err: unknown) {
      console.error('Failed to assign incident:', err)
      alert(getApiErrorMessage(err, 'Failed to assign incident'))
    } finally {
      setAssigning(false)
    }
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const newStatus = e.target.value as IncidentStatus
    if (newStatus === incident.status) return
    
    setChangingStatus(true)
    try {
      const statusData: IncidentStatusUpdate = { status: newStatus }
      await incidentService.updateIncidentStatus(incident.id, statusData)
      onStatusChange?.()
    } catch (err: unknown) {
      console.error('Failed to update status:', err)
      alert(getApiErrorMessage(err, 'Failed to update status'))
    } finally {
      setChangingStatus(false)
    }
  }

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to archive this incident?')) return
    
    setArchiving(true)
    try {
      await incidentService.archiveIncident(incident.id)
      onArchiveChange?.()
    } catch (err: unknown) {
      console.error('Failed to archive incident:', err)
      alert(getApiErrorMessage(err, 'Failed to archive incident'))
    } finally {
      setArchiving(false)
    }
  }

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setArchiving(true)
    try {
      await incidentService.unarchiveIncident(incident.id)
      onArchiveChange?.()
    } catch (err: unknown) {
      console.error('Failed to unarchive incident:', err)
      alert(getApiErrorMessage(err, 'Failed to unarchive incident'))
    } finally {
      setArchiving(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to permanently delete this archived incident? This action cannot be undone.')) return
    
    setDeleting(true)
    try {
      await incidentService.deleteIncident(incident.id)
      onArchiveChange?.()
    } catch (err: unknown) {
      console.error('Failed to delete incident:', err)
      alert(getApiErrorMessage(err, 'Failed to delete incident'))
    } finally {
      setDeleting(false)
    }
  }

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
        borderLeft: `4px solid ${getSeverityColor(incident.severity)}`,
        opacity: incident.archived ? 0.7 : 1
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
          <select
            value={incident.status}
            onChange={handleStatusChange}
            disabled={changingStatus || incident.archived}
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '0.25rem 0.5rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: (changingStatus || incident.archived) ? 'not-allowed' : 'pointer',
              opacity: (changingStatus || incident.archived) ? 0.6 : 1,
              backgroundColor: getStatusColor(incident.status),
              color: 'white',
              fontWeight: '500',
              textTransform: 'uppercase',
              minWidth: '100px'
            }}
          >
            <option value="open" style={{ backgroundColor: '#dc3545', color: 'white' }}>Open</option>
            <option value="in_progress" style={{ backgroundColor: '#007bff', color: 'white' }}>In Progress</option>
            <option value="resolved" style={{ backgroundColor: '#28a745', color: 'white' }}>Resolved</option>
            <option value="closed" style={{ backgroundColor: '#6c757d', color: 'white' }}>Closed</option>
          </select>
        </div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
        {incident.description.length > 150
          ? `${incident.description.substring(0, 150)}...`
          : incident.description}
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #eee'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          {incident.assigned_to ? (
            <>Assigned to: {incident.assigned_to.full_name}</>
          ) : (
            <>Unassigned</>
          )}
        </div>
        <select
          value={incident.assigned_to_id || ''}
          onChange={handleAssignmentChange}
          disabled={assigning || incident.archived}
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '0.25rem 0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.75rem',
            backgroundColor: 'white',
            color: '#333',
            cursor: (assigning || incident.archived) ? 'not-allowed' : 'pointer',
            opacity: (assigning || incident.archived) ? 0.6 : 1
          }}
        >
          <option value="">Unassign</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #eee'
      }}>
        {!incident.archived ? (
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

export default IncidentCard
