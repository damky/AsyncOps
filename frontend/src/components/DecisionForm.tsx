import { useState, useEffect } from 'react'
import { Decision, DecisionCreate, DecisionUpdate } from '../types/decision'
import { decisionService } from '../services/decisionService'
import { userService } from '../services/userService'
import { User } from '../types/user'
import { getApiErrorMessage } from '../services/apiClient'

interface DecisionFormProps {
  decision?: Decision | null
  onSuccess?: () => void
  onCancel?: () => void
}

const DecisionForm = ({ decision, onSuccess, onCancel }: DecisionFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [context, setContext] = useState('')
  const [outcome, setOutcome] = useState('')
  const [decisionDate, setDecisionDate] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [participantIds, setParticipantIds] = useState<number[]>([])
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
    if (decision) {
      setTitle(decision.title)
      setDescription(decision.description)
      setContext(decision.context)
      setOutcome(decision.outcome)
      setDecisionDate(decision.decision_date)
      setTags(decision.tags || [])
      setParticipantIds(decision.participants?.map(p => p.user_id) || [])
    } else {
      setTitle('')
      setDescription('')
      setContext('')
      setOutcome('')
      setDecisionDate(new Date().toISOString().split('T')[0])
      setTags([])
      setTagInput('')
      setParticipantIds([])
    }
  }, [decision])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleToggleParticipant = (userId: number) => {
    if (participantIds.includes(userId)) {
      setParticipantIds(participantIds.filter(id => id !== userId))
    } else {
      setParticipantIds([...participantIds, userId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (decision) {
        const updateData: DecisionUpdate = {
          title,
          description,
          context,
          outcome,
          decision_date: decisionDate,
          tags: tags.length > 0 ? tags : undefined,
          participant_ids: participantIds.length > 0 ? participantIds : undefined
        }
        await decisionService.updateDecision(decision.id, updateData)
      } else {
        const createData: DecisionCreate = {
          title,
          description,
          context,
          outcome,
          decision_date: decisionDate,
          tags: tags.length > 0 ? tags : undefined,
          participant_ids: participantIds.length > 0 ? participantIds : undefined
        }
        await decisionService.createDecision(createData)
      }
      onSuccess?.()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to save decision'))
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
        {decision ? 'Edit Decision' : 'Create Decision'}
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
        <label htmlFor="decisionDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Decision Date *
        </label>
        <input
          id="decisionDate"
          type="date"
          value={decisionDate}
          onChange={(e) => setDecisionDate(e.target.value)}
          required
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
        <label htmlFor="context" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Context *
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          required
          maxLength={5000}
          rows={4}
          placeholder="What led to this decision?"
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
        <label htmlFor="outcome" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Outcome *
        </label>
        <textarea
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          required
          maxLength={5000}
          rows={4}
          placeholder="What is the expected or actual outcome?"
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#e9ecef',
                  borderRadius: '16px',
                  fontSize: '0.875rem'
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#6c757d',
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Participants
        </label>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '0.5rem'
        }}>
          {users.map((user) => (
            <label
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={participantIds.includes(user.id)}
                onChange={() => handleToggleParticipant(user.id)}
                style={{ marginRight: '0.5rem' }}
              />
              <span>{user.full_name} ({user.email})</span>
            </label>
          ))}
        </div>
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
          {loading ? 'Saving...' : decision ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default DecisionForm
