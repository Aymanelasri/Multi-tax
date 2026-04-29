import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'
import RestrictedAccessMessage from './RestrictedAccessMessage'

/**
 * SECURITY: Protected route wrapper with comprehensive checks
 */
export function ProtectedRoute({ children, requireAdmin = false, requireApproved = false }) {
  const { user, loading, isApproved } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  // SECURITY: No user = redirect to login
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // SECURITY: Rejected users cannot access
  if (user.status === 'rejected') {
    return <Navigate to="/login" state={{ rejectionMessage: true }} replace />
  }

  // SECURITY: Check approval requirement
  if (requireApproved && !isApproved) {
    return <RestrictedAccessMessage />
  }

  // SECURITY: Check admin requirement
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

/**
 * SECURITY: Admin-only route with strict validation
 */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  // SECURITY: No user = redirect to login
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // SECURITY: Pending users go to pending page
  if (user.status === 'pending') {
    return <Navigate to="/pending" replace />
  }

  // SECURITY: Rejected users cannot access
  if (user.status === 'rejected') {
    return <Navigate to="/login" state={{ rejectionMessage: true }} replace />
  }

  // SECURITY: Must be approved
  if (user.status !== 'approved') {
    return <Navigate to="/login" replace />
  }

  // SECURITY: Must be admin role
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
}