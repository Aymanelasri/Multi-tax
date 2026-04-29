import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user
  const isApproved = user && user.status === 'approved'
  const isPending = user && user.status === 'pending'
  const isAdmin = user && user.role === 'admin'

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
        
        // ✅ admin دايما يتخزن فـ localStorage
        if (userData.role === 'admin') {
          localStorage.setItem('token', newToken)
          localStorage.setItem('user', JSON.stringify(userData))
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
        } else if (remember) {
          localStorage.setItem('token', newToken)
          localStorage.setItem('user', JSON.stringify(userData))
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
        } else {
          sessionStorage.setItem('token', newToken)
          sessionStorage.setItem('user', JSON.stringify(userData))
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        
        setToken(newToken)
        setUser(userData)
        
        return { success: true, user: userData }
      }
    } catch (error) {
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
      // Check for specific error messages
      const errorMessage = error.message.toLowerCase()
      
      // Check for email-related errors
      if (errorMessage.includes('email')) {
        if (errorMessage.includes('already taken') || errorMessage.includes('already been taken')) {
          return { success: false, error: 'email_exists' }
        }
        return { success: false, error: 'email_exists' }
      }
      
      // Check for password confirmation mismatch
      if (errorMessage.includes('password')) {
        return { success: false, error: 'password_mismatch' }
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
      // Ignore logout errors, still clear local data
    } finally {
      clearAuth()
    }
  }

  const clearAuth = () => {
    // SECURITY: Clear ALL auth data from both storages
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    
    // Clear admin preferences if admin
    if (user?.role === 'admin') {
      localStorage.removeItem('adminTheme')
      localStorage.removeItem('adminLang')
    }
    
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