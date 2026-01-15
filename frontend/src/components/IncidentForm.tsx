import { useState, useEffect } from 'react'
import {
  Incident,
  IncidentCreate,
  IncidentUpdate,
  IncidentStatusUpdate,
  IncidentStatus,
  IncidentSeverity,
} from '../types/incident'
import { incidentService } from '../services/incidentService'
import { userService } from '../services/userService'
import { User } from '../types/user'
import { getApiErrorMessage } from '../services/apiClient'

interface IncidentFormProps {
  incident?: Incident | null
  onSuccess?: () => void
  onCancel?: () => void
}

const IncidentForm = ({ incident, onSuccess, onCancel }: IncidentFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [status, setStatus] = useState<IncidentStatus>('open')
  const [assignedToId, setAssignedToId] = useState<number | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (incident) {
      setTitle(incident.title)
      setDescription(incident.description)
      setSeverity(incident.severity)
      setStatus(incident.status)
      setAssignedToId(incident.assigned_to_id || null)
      setResolutionNotes(incident.resolution_notes || '')
    } else {
      setTitle('')
      setDescription('')
      setSeverity('medium')
      setStatus('open')
      setAssignedToId(null)
      setResolutionNotes('')
    }
  }, [incident])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if incident is archived
    if (incident?.archived) {
      setError('Cannot edit archived incidents. Please unarchive first.')
      return
    }
    
    setError('')
    setLoading(true)

    try {
      if (incident) {
        // Update basic fields
        const updateData: IncidentUpdate = { 
          title, 
          description, 
          severity,
          assigned_to_id: assignedToId
        }
        await incidentService.updateIncident(incident.id, updateData)
        
        // Update status separately if it changed
        if (status !== incident.status) {
          const statusData: IncidentStatusUpdate = {
            status,
            resolution_notes: (status === 'resolved' || status === 'closed') && resolutionNotes ? resolutionNotes : undefined
          }
          await incidentService.updateIncidentStatus(incident.id, statusData)
        } else if ((status === 'resolved' || status === 'closed') && resolutionNotes && resolutionNotes !== incident.resolution_notes) {
          // Update resolution notes if status is resolved/closed and notes changed
          const statusData: IncidentStatusUpdate = {
            status,
            resolution_notes: resolutionNotes
          }
          await incidentService.updateIncidentStatus(incident.id, statusData)
        }
      } else {
        const createData: IncidentCreate = { 
          title, 
          description, 
          severity,
          assigned_to_id: assignedToId
        }
        await incidentService.createIncident(createData)
      }
      onSuccess?.()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to save incident'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem'
    }}>
      <h2 style={{ marginBottom: '1rem' }}>
        {incident ? (incident.archived ? 'View Archived Incident' : 'Edit Incident') : 'Create Incident'}
      </h2>
      
      {incident?.archived && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: '4px',
          fontSize: '0.875rem',
          border: '1px solid #ffc107'
        }}>
          This incident is archived and cannot be edited. Unarchive it to make changes.
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          disabled={incident?.archived}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            backgroundColor: incident?.archived ? '#f5f5f5' : 'white',
            color: '#333',
            cursor: incident?.archived ? 'not-allowed' : 'text'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={5000}
          rows={6}
          disabled={incident?.archived}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            backgroundColor: incident?.archived ? '#f5f5f5' : 'white',
            color: '#333',
            cursor: incident?.archived ? 'not-allowed' : 'text'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="severity" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Severity *
        </label>
        <select
          id="severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
          required
          disabled={incident?.archived}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            backgroundColor: incident?.archived ? '#f5f5f5' : 'white',
            color: '#333',
            cursor: incident?.archived ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="assignedTo" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Assign To
        </label>
        <select
          id="assignedTo"
          value={assignedToId || ''}
          onChange={(e) => setAssignedToId(e.target.value ? parseInt(e.target.value) : null)}
          disabled={incident?.archived}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            backgroundColor: incident?.archived ? '#f5f5f5' : 'white',
            color: '#333',
            cursor: incident?.archived ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {incident && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              disabled={incident?.archived}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: incident?.archived ? '#f5f5f5' : 'white',
                color: '#333',
                cursor: incident?.archived ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {(status === 'resolved' || status === 'closed') && (
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="resolutionNotes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Resolution Notes
              </label>
              <textarea
                id="resolutionNotes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="Optional: Add notes about how this incident was resolved..."
                disabled={incident?.archived}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  backgroundColor: incident?.archived ? '#f5f5f5' : 'white',
                  color: '#333',
                  cursor: incident?.archived ? 'not-allowed' : 'text'
                }}
              />
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || incident?.archived}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: incident?.archived ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || incident?.archived) ? 'not-allowed' : 'pointer',
            opacity: (loading || incident?.archived) ? 0.6 : 1
          }}
        >
          {loading ? 'Saving...' : incident?.archived ? 'Archived (Cannot Edit)' : incident ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default IncidentForm
