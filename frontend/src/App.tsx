import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import StatusUpdates from './pages/StatusUpdates'
import Incidents from './pages/Incidents'
import Blockers from './pages/Blockers'
import Decisions from './pages/Decisions'
import DailySummaries from './pages/DailySummaries'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/status"
            element={
              <PrivateRoute>
                <StatusUpdates />
              </PrivateRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <PrivateRoute>
                <Incidents />
              </PrivateRoute>
            }
          />
          <Route
            path="/blockers"
            element={
              <PrivateRoute>
                <Blockers />
              </PrivateRoute>
            }
          />
          <Route
            path="/decisions"
            element={
              <PrivateRoute>
                <Decisions />
              </PrivateRoute>
            }
          />
          <Route
            path="/summaries"
            element={
              <PrivateRoute>
                <DailySummaries />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
