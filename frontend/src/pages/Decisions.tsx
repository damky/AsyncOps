import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DecisionList from '../components/DecisionList'
import DecisionForm from '../components/DecisionForm'
import { Decision } from '../types/decision'
import { decisionService } from '../services/decisionService'
import { DecisionAuditLogEntry } from '../types/decision'
import { getApiErrorMessage } from '../services/apiClient'

const Decisions = () => {
  const { user, logout } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null)
  const [viewingDecision, setViewingDecision] = useState<Decision | null>(null)
  const [auditLog, setAuditLog] = useState<DecisionAuditLogEntry[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = () => {
    setEditingDecision(null)
    setViewingDecision(null)
    setShowForm(true)
  }

  const handleView = async (decision: Decision) => {
    setViewingDecision(decision)
    setShowForm(false)
    setLoadingAudit(true)
    try {
      const audit = await decisionService.getDecisionAudit(decision.id)
      setAuditLog(audit.items)
    } catch (err) {
      console.error('Failed to load audit log:', err)
      setAuditLog([])
    } finally {
      setLoadingAudit(false)
    }
  }

  const handleEdit = (decision: Decision) => {
    setEditingDecision(decision)
    setViewingDecision(null)
    setShowForm(true)
  }

  const handleDelete = async (decision: Decision) => {
    try {
      await decisionService.deleteDecision(decision.id)
      setRefreshKey(k => k + 1)
      if (viewingDecision?.id === decision.id) {
        setViewingDecision(null)
      }
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, 'Failed to delete decision'))
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingDecision(null)
    setRefreshKey(k => k + 1)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingDecision(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #ddd'
      }}>
        <h1>Decision Log</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Home
          </Link>
          <span>Welcome, {user?.full_name}</span>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {showForm ? (
          <DecisionForm
            decision={editingDecision}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : viewingDecision ? (
          <div>
            <button
              onClick={() => {
                setViewingDecision(null)
                setAuditLog([])
              }}
              style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Back to List
            </button>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '1rem'
            }}>
              <h2 style={{ marginTop: 0 }}>{viewingDecision.title}</h2>
              <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
                <div><strong>Decision Date:</strong> {formatDate(viewingDecision.decision_date)}</div>
                <div><strong>Created by:</strong> {viewingDecision.created_by?.full_name || 'Unknown'}</div>
                {viewingDecision.participants && viewingDecision.participants.length > 0 && (
                  <div>
                    <strong>Participants:</strong>{' '}
                    {viewingDecision.participants.map(p => p.user?.full_name || 'Unknown').join(', ')}
                  </div>
                )}
              </div>
              {viewingDecision.tags && viewingDecision.tags.length > 0 && (
                <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {viewingDecision.tags.map((tag) => (
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
              <div style={{ marginBottom: '1rem' }}>
                <h3>Description</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{viewingDecision.description}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3>Context</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{viewingDecision.context}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3>Outcome</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{viewingDecision.outcome}</p>
              </div>
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e9ecef',
                fontSize: '0.875rem',
                color: '#6c757d'
              }}>
                Created: {formatDate(viewingDecision.created_at)} • Updated: {formatDate(viewingDecision.updated_at)}
              </div>
              {(user?.id === viewingDecision.created_by_id || user?.role === 'admin') && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(viewingDecision)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(viewingDecision)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>Audit Trail</h3>
              {loadingAudit ? (
                <div>Loading audit trail...</div>
              ) : auditLog.length === 0 ? (
                <div style={{ color: '#666' }}>No audit trail entries found.</div>
              ) : (
                <div style={{
                  position: 'relative',
                  paddingLeft: '2rem',
                  borderLeft: '2px solid #e9ecef'
                }}>
                  {auditLog.map((entry, index) => (
                    <div
                      key={entry.id}
                      style={{
                        position: 'relative',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: index < auditLog.length - 1 ? '1px solid #e9ecef' : 'none'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        left: '-0.5rem',
                        top: '0.25rem',
                        width: '1rem',
                        height: '1rem',
                        borderRadius: '50%',
                        backgroundColor: entry.change_type === 'created' ? '#28a745' : entry.change_type === 'updated' ? '#007bff' : '#dc3545',
                        border: '2px solid white',
                        boxShadow: '0 0 0 2px #e9ecef'
                      }} />
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>{entry.changed_by?.full_name || 'Unknown'}</strong>
                        {' '}
                        <span style={{ color: '#666', fontSize: '0.875rem' }}>
                          {entry.change_type === 'created' ? 'created' : entry.change_type === 'updated' ? 'updated' : 'deleted'} this decision
                        </span>
                        {' '}
                        <span style={{ color: '#999', fontSize: '0.75rem' }}>
                          {formatDate(entry.changed_at)}
                        </span>
                      </div>
                      {entry.change_type === 'updated' && entry.field_name && (
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          <div><strong>Field:</strong> {entry.field_name}</div>
                          {entry.old_value && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <strong>Old:</strong> <span style={{ color: '#dc3545' }}>{entry.old_value}</span>
                            </div>
                          )}
                          {entry.new_value && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <strong>New:</strong> <span style={{ color: '#28a745' }}>{entry.new_value}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCreate}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                + Create Decision
              </button>
            </div>
            <DecisionList
              key={refreshKey}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default Decisions
