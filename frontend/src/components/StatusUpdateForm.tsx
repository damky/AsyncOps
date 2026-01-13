import { useState, useEffect } from 'react'
import { StatusUpdate, StatusUpdateCreate, StatusUpdateUpdate } from '../types/statusUpdate'
import { statusService } from '../services/statusService'

interface StatusUpdateFormProps {
  status?: StatusUpdate | null
  onSuccess?: () => void
  onCancel?: () => void
}

const StatusUpdateForm = ({ status, onSuccess, onCancel }: StatusUpdateFormProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status) {
      setTitle(status.title)
      setContent(status.content)
      setTags(status.tags || [])
    } else {
      setTitle('')
      setContent('')
      setTags([])
    }
  }, [status])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (status) {
        // Update existing
        const updateData: StatusUpdateUpdate = {
          title,
          content,
          tags: tags.length > 0 ? tags : null,
        }
        await statusService.updateStatusUpdate(status.id, updateData)
      } else {
        // Create new
        const createData: StatusUpdateCreate = {
          title,
          content,
          tags: tags.length > 0 ? tags : null,
        }
        await statusService.createStatusUpdate(createData)
      }
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save status update')
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
        {status ? 'Edit Status Update' : 'Create Status Update'}
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
        <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Content *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={10000}
          rows={8}
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
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
          {content.length} / 10,000 characters
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="tags" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Tags
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add a tag and press Enter"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
          {loading ? 'Saving...' : status ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default StatusUpdateForm
