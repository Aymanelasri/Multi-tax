import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function UserDetailModal({ user, isOpen, onClose, onApprove, onReject, onDelete }) {
  const { t } = useLanguage()

  if (!isOpen || !user) return null

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

  const getStatusColor = (status) => {
    const colors = {
      approved: '#00d4a0',
      pending: '#fbbf24',
      rejected: '#ef4444'
    }
    return colors[status] || '#64748b'
  }

  const statusLabel = {
    approved: t('admin_approved'),
    pending: t('admin_pending'),
    rejected: t('admin_rejected')
  }

  return (
    <>
      <div className="admin-modal-overlay" onClick={onClose} />
      <div className="admin-modal">
        <button className="admin-modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-avatar">{getInitials(user.first_name, user.last_name)}</div>
          <div className="admin-modal-header-info">
            <h2>{user.first_name} {user.last_name}</h2>
            <p>{user.email}</p>
            <span className="admin-modal-status" style={{ color: getStatusColor(user.status) }}>
              {statusLabel[user.status]}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="admin-modal-actions">
          {user.status !== 'approved' && (
            <button className="admin-btn admin-btn-approve" onClick={() => { onApprove(user.id); onClose(); }}>
              {t('admin_approve')}
            </button>
          )}
          {user.status !== 'rejected' && (
            <button className="admin-btn admin-btn-reject" onClick={() => { onReject(user.id); onClose(); }}>
              {t('admin_reject')}
            </button>
          )}
          <button className="admin-btn admin-btn-delete" onClick={() => { onDelete(user.id); onClose(); }}>
            {t('admin_delete')}
          </button>
        </div>

        {/* User Information */}
        <section className="admin-modal-section">
          <h3>{t('admin_user_info')}</h3>
          <div className="admin-modal-grid-2">
            <div className="admin-modal-field">
              <label>{t('admin_first_name')}</label>
              <p>{user.first_name}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_last_name')}</label>
              <p>{user.last_name}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_email')}</label>
              <p>{user.email}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_phone')}</label>
              <p>{user.phone || '—'}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_company')}</label>
              <p>{user.company || '—'}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_status')}</label>
              <p style={{ color: getStatusColor(user.status) }}>
                {statusLabel[user.status]}
              </p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_email_verified')}</label>
              <p style={{ color: user.email_verified_at ? '#00d4a0' : '#ef4444' }}>
                {user.email_verified_at ? '✓' : '✗'}
              </p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_registration_date')}</label>
              <p>{formatDate(user.created_at)}</p>
            </div>
          </div>
        </section>

        {/* Activity */}
        <section className="admin-modal-section">
          <h3>{t('admin_activity')}</h3>
          <div className="admin-modal-grid-2">
            <div className="admin-modal-field">
              <label>{t('admin_total_logins')}</label>
              <p>{user.login_count || '0'}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_last_login')}</label>
              <p>{formatDate(user.last_login_at)}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_files_generated')}</label>
              <p>{user.declarations_count || '0'}</p>
            </div>
            <div className="admin-modal-field">
              <label>{t('admin_account_created')}</label>
              <p>{formatDate(user.created_at)}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
