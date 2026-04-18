import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Computed states
  const isAuthenticated = !!user
  const isApproved = user && user.status === 'approved'
  const isPending = user && user.status === 'pending'
  const isAdmin = user && user.role === 'admin'

  // Check for existing token on app load
  // CSRF token will be fetched automatically before first API call
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      refreshUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const refreshUser = async (authToken = token) => {
    if (!authToken) {
      setLoading(false)
      return
    }

    try {
      const userData = await api.getUser(authToken)
      setUser(userData.data)
    } catch (error) {
      // Token is invalid, clear it
      clearAuth()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, remember = false) => {
    try {
      const response = await api.login(email, password)
      
      if (response.status === 'success') {
        const { token: newToken, user: userData } = response
        
        // Store token based on remember preference
        if (remember) {
          localStorage.setItem('token', newToken)
          sessionStorage.removeItem('token')
        } else {
          sessionStorage.setItem('token', newToken)
          localStorage.removeItem('token')
        }
        
        // Always store user object in localStorage for dashboard access
        localStorage.setItem('user', JSON.stringify(userData))
        
        setToken(newToken)
        setUser(userData)
        
        return { success: true, user: userData }
      }
    } catch (error) {
      // Handle different error cases
      if (error.message.includes('email_not_verified')) {
        return { success: false, error: 'email_not_verified' }
      }
      if (error.message.includes('pending_approval')) {
        return { success: false, error: 'pending_approval' }
      }
      if (error.message.includes('rejected')) {
        return { success: false, error: 'rejected' }
      }
      return { success: false, error: 'invalid_credentials' }
    }
  }

  const register = async (data) => {
    try {
      const response = await api.register(
        data.firstname,
        data.lastname,
        data.email,
        data.phone,
        data.password,
        data.password_confirmation
      )
      
      if (response.status === 'success') {
        return { success: true, message: 'registered' }
      }
    } catch (error) {
      if (error.message.includes('email')) {
        return { success: false, error: 'email_exists' }
      }
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await api.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
    }
  }

  const clearAuth = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isApproved,
    isPending,
    isAdmin,
    login,
    register,
    logout,
    refreshUser,
    clearAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}