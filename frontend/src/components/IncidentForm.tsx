import { useState, useEffect } from 'react'
import { Incident, IncidentCreate, IncidentUpdate } from '../types/incident'
import { incidentService } from '../services/incidentService'

interface IncidentFormProps {
  incident?: Incident | null
  onSuccess?: () => void
  onCancel?: () => void
}

const IncidentForm = ({ incident, onSuccess, onCancel }: IncidentFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (incident) {
      setTitle(incident.title)
      setDescription(incident.description)
      setSeverity(incident.severity)
    } else {
      setTitle('')
      setDescription('')
      setSeverity('medium')
    }
  }, [incident])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (incident) {
        const updateData: IncidentUpdate = { title, description, severity }
        await incidentService.updateIncident(incident.id, updateData)
      } else {
        const createData: IncidentCreate = { title, description, severity }
        await incidentService.createIncident(createData)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save incident')
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
        {incident ? 'Edit Incident' : 'Create Incident'}
      </h2>

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
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
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
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical'
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
          onChange={(e) => setSeverity(e.target.value as any)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

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
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Saving...' : incident ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default IncidentForm
