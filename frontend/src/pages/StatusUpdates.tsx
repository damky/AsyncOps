import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import StatusUpdateList from '../components/StatusUpdateList'
import StatusUpdateForm from '../components/StatusUpdateForm'
import { StatusUpdate } from '../types/statusUpdate'

const StatusUpdates = () => {
  const { user, logout } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingStatus, setEditingStatus] = useState<StatusUpdate | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = () => {
    setEditingStatus(null)
    setShowForm(true)
  }

  const handleEdit = (status: StatusUpdate) => {
    setEditingStatus(status)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingStatus(null)
    setRefreshKey(k => k + 1)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingStatus(null)
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
        <h1>Status Updates</h1>
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
          <StatusUpdateForm
            status={editingStatus}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
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
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                + Create Status Update
              </button>
            </div>
            <StatusUpdateList
              key={refreshKey}
              onEdit={handleEdit}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default StatusUpdates
