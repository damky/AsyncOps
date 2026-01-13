import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import BlockerList from '../components/BlockerList'
import BlockerForm from '../components/BlockerForm'
import { Blocker } from '../types/blocker'

const Blockers = () => {
  const { user, logout } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingBlocker, setEditingBlocker] = useState<Blocker | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = () => {
    setEditingBlocker(null)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingBlocker(null)
    setRefreshKey(k => k + 1)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBlocker(null)
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
        <h1>Blockers</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <BlockerForm
            blocker={editingBlocker}
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
                + Report Blocker
              </button>
            </div>
            <BlockerList key={refreshKey} />
          </>
        )}
      </main>
    </div>
  )
}

export default Blockers
