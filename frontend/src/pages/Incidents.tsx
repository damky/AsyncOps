import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import IncidentList from '../components/IncidentList'
import IncidentForm from '../components/IncidentForm'
import { Incident } from '../types/incident'

const Incidents = () => {
  const { user, logout } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = () => {
    setEditingIncident(null)
    setShowForm(true)
  }

  const handleView = (incident: Incident) => {
    setEditingIncident(incident)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingIncident(null)
    setRefreshKey(k => k + 1)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingIncident(null)
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
        <h1>Incidents</h1>
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
          <IncidentForm
            incident={editingIncident}
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
                + Report Incident
              </button>
            </div>
            <IncidentList
              key={refreshKey}
              onView={handleView}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default Incidents
