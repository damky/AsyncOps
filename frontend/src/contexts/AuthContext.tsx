import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types/user'
import { authService } from '../services/authService'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // Fetch user info - silently fail if token is invalid
      authService.getCurrentUser(storedToken)
        .then(setUser)
        .catch((error) => {
          // Token is invalid or expired, clear it
          console.log('Invalid token, clearing storage')
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      setToken(response.access_token)
      localStorage.setItem('token', response.access_token)
      
      // Fetch user info
      const userData = await authService.getCurrentUser(response.access_token)
      setUser(userData)
    } catch (error: any) {
      console.error('AuthContext login error:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // During hot-reload, context might be temporarily undefined
    // Return a default context to prevent crashes
    console.warn('useAuth called outside AuthProvider, returning default context')
    return {
      user: null,
      token: null,
      login: async () => { throw new Error('AuthProvider not available') },
      logout: () => {},
      isAuthenticated: false,
      loading: false,
    }
  }
  return context
}
