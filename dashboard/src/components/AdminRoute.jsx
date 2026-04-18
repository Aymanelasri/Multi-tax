import React from 'react'
import { isAuthenticated, isAdmin } from '../services/auth'

/**
 * Protected route wrapper that checks authentication and admin role
 * Usage: <AdminRoute component={ComponentToRender} />
 */
export default function AdminRoute({ component: Component, ...rest }) {
  // Check if authenticated
  if (!isAuthenticated()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0f1a',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h1>Access Denied</h1>
        <p>Please login to access the admin dashboard</p>
        <a href="/login" style={{ color: '#00d4a0', textDecoration: 'none' }}>
          Go to Login
        </a>
      </div>
    )
  }

  // Check if admin
  if (!isAdmin()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0f1a',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h1>Unauthorized</h1>
        <p>You must be an admin to access this page</p>
        <a href="/" style={{ color: '#00d4a0', textDecoration: 'none' }}>
          Go to Home
        </a>
      </div>
    )
  }

  // All checks passed, render component
  return <Component {...rest} />
}
