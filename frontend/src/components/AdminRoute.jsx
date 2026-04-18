import React from 'react'
import { Navigate } from 'react-router-dom'

/**
 * Protected route component for admin panel
 * Checks localStorage for token and user with admin role
 * Redirects to login if not authenticated or not admin
 */
export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  let user = null

  if (userStr) {
    try {
      user = JSON.parse(userStr)
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error)
    }
  }

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Not admin
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  // Authenticated and is admin
  return children
}

export default AdminRoute
