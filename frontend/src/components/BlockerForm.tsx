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
        {blocker ? 'Edit Blocker' : 'Create Blocker'}
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
          {loading ? 'Saving...' : blocker ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default BlockerForm
