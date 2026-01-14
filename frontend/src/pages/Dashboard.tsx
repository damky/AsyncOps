import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

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
        <h1>AsyncOps Dashboard</h1>
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
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Welcome to AsyncOps</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Your async operations dashboard for remote teams.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>User Information</h3>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Status:</strong> {user?.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <Link
            to="/status"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = '#007bff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
            >
              <h3 style={{ marginBottom: '0.5rem', color: '#007bff' }}>Status Updates</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                View and create async status updates from your team
              </p>
            </div>
          </Link>

          <Link
            to="/incidents"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = '#dc3545'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
            >
              <h3 style={{ marginBottom: '0.5rem', color: '#dc3545' }}>Incidents</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Track and manage incidents with severity levels
              </p>
            </div>
          </Link>

          <Link
            to="/blockers"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = '#ffc107'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
            >
              <h3 style={{ marginBottom: '0.5rem', color: '#ffc107' }}>Blockers</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Identify and resolve blockers preventing progress
              </p>
            </div>
          </Link>

          <Link
            to="/decisions"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = '#28a745'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
            >
              <h3 style={{ marginBottom: '0.5rem', color: '#28a745' }}>Decision Log</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>
                Log decisions with full audit trail and historical context
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
