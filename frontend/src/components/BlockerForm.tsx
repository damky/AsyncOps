import { useState, useEffect } from 'react'
import { Blocker, BlockerCreate, BlockerUpdate } from '../types/blocker'
import { blockerService } from '../services/blockerService'

interface BlockerFormProps {
  blocker?: Blocker | null
  onSuccess?: () => void
  onCancel?: () => void
}

const BlockerForm = ({ blocker, onSuccess, onCancel }: BlockerFormProps) => {
  const [description, setDescription] = useState('')
  const [impact, setImpact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (blocker) {
      setDescription(blocker.description)
      setImpact(blocker.impact)
    } else {
      setDescription('')
      setImpact('')
    }
  }, [blocker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if blocker is archived
    if (blocker?.archived) {
      setError('Cannot edit archived blockers. Please unarchive first.')
      return
    }
    
    setError('')
    setLoading(true)

    try {
      if (blocker) {
        const updateData: BlockerUpdate = { description, impact }
        await blockerService.updateBlocker(blocker.id, updateData)
      } else {
        const createData: BlockerCreate = { description, impact }
        await blockerService.createBlocker(createData)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save blocker')
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
        {blocker ? (blocker.archived ? 'View Archived Blocker' : 'Edit Blocker') : 'Create Blocker'}
      </h2>
      
      {blocker?.archived && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: '4px',
          fontSize: '0.875rem',
          border: '1px solid #ffc107'
        }}>
          This blocker is archived and cannot be edited. Unarchive it to make changes.
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
        <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={2000}
          rows={4}
          disabled={blocker?.archived}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            backgroundColor: blocker?.archived ? '#f5f5f5' : 'white',
            cursor: blocker?.archived ? 'not-allowed' : 'text'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="impact" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Impact *
        </label>
        <textarea
          id="impact"
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          required
          maxLength={1000}
          rows={3}
          disabled={blocker?.archived}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            backgroundColor: blocker?.archived ? '#f5f5f5' : 'white',
            cursor: blocker?.archived ? 'not-allowed' : 'text'
          }}
        />
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
          disabled={loading || blocker?.archived}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: blocker?.archived ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || blocker?.archived) ? 'not-allowed' : 'pointer',
            opacity: (loading || blocker?.archived) ? 0.6 : 1
          }}
        >
          {loading ? 'Saving...' : blocker?.archived ? 'Archived (Cannot Edit)' : blocker ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default BlockerForm
