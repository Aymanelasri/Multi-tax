import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'
import RestrictedAccessMessage from './RestrictedAccessMessage'

export function ProtectedRoute({ children, requireAdmin = false, requireApproved = false }) {
  const { user, loading, isApproved } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (user.status === 'rejected') {
    return <Navigate to="/login" state={{ rejectionMessage: true }} replace />
  }

  // Check if page requires approval
  if (requireApproved && !isApproved) {
    return <RestrictedAccessMessage />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (user.status === 'pending') {
    return <Navigate to="/pending" replace />
  }

  if (user.status === 'rejected') {
    return <Navigate to="/login" state={{ rejectionMessage: true }} replace />
  }

  if (user.status !== 'approved') {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/generateur" replace />
  }

  return children
}