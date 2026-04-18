import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import api from '../lib/api'

export default function AdminPending({ showToast }) {
  const { t } = useLanguage()
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)

  useEffect(() => {
    console.log('🚀 AdminPending mounted - loading pending users')
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      console.log('📤 Fetching pending users...')
      setLoading(true)
      const response = await api.get('/admin/users/pending')
      console.log('📥 Pending users received:', response.data?.length, 'users')
      setPendingUsers(response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const handleApprove = async (userId, userName) => {
    setApproving(userId)
    try {
      console.log('📤 Approving user:', userId)
      await api.put(`/admin/users/${userId}/approve`)
      showToast(`✓ ${userName} approuvé — email envoyé`, 'success')
      fetchPendingUsers()
    } catch (error) {
      showToast('Erreur lors de l\'approbation', 'error')
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (userId, userName) => {
    setApproving(userId)
    try {
      console.log('📤 Rejecting user:', userId)
      await api.put(`/admin/users/${userId}/reject`)
      showToast(`✗ ${userName} rejeté`, 'success')
      fetchPendingUsers()
    } catch (error) {
      showToast('Erreur lors du rejet', 'error')
    } finally {
      setApproving(null)
    }
  }

  if (loading) {
    return <div className="admin-page"><p>Chargement...</p></div>
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="admin-page">
        <h1>{t('admin_pending')}</h1>
        <div className="admin-empty-state">
          <div className="admin-empty-icon">✅</div>
          <h2>{t('admin_no_pending')}</h2>
          <p>{t('admin_no_pending_sub')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h1>{t('admin_pending')}</h1>

      {/* Count Header */}
      <div className="admin-pending-header">
        {pendingUsers.length} utilisateur(s) {t('admin_pending_approval')}
      </div>

      {/* Pending Cards Grid */}
      <div className="admin-pending-grid">
        {pendingUsers.map(user => (
          <div key={user.id} className="admin-pending-card">
            <div className="admin-pending-card-top">
              <div className="admin-pending-avatar">{getInitials(user.first_name, user.last_name)}</div>
              <div className="admin-pending-info">
                <h3>{user.first_name} {user.last_name}</h3>
                <p className="admin-pending-email">{user.email}</p>
              </div>
              <span className="admin-pending-date">{formatDate(user.created_at)}</span>
            </div>

            <div className="admin-pending-details">
              <div className="admin-pending-detail-row">
                <span>Société:</span>
                <strong>{user.company || '—'}</strong>
              </div>
              <div className="admin-pending-detail-row">
                <span>Téléphone:</span>
                <strong>{user.phone || '—'}</strong>
              </div>
              <div className="admin-pending-detail-row">
                <span>Email vérifié:</span>
                <strong style={{ color: user.email_verified_at ? '#00d4a0' : '#ef4444' }}>
                  {user.email_verified_at ? '✓' : '✗'}
                </strong>
              </div>
              <div className="admin-pending-detail-row">
                <span>Inscrit le:</span>
                <strong>{formatDate(user.created_at)}</strong>
              </div>
            </div>

            <div className="admin-pending-actions">
              <button
                className="admin-pending-btn admin-pending-approve"
                onClick={() => handleApprove(user.id, `${user.first_name} ${user.last_name}`)}
                disabled={approving === user.id}
              >
                {approving === user.id ? '⏳' : '✓'} {t('admin_approve')}
              </button>
              <button
                className="admin-pending-btn admin-pending-reject"
                onClick={() => handleReject(user.id, `${user.first_name} ${user.last_name}`)}
                disabled={approving === user.id}
              >
                {approving === user.id ? '⏳' : '✗'} {t('admin_reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
