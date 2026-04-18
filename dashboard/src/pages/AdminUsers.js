import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import UserDetailModal from '../components/UserDetailModal'
import api from '../lib/api'

export default function AdminUsers({ showToast }) {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmingAction, setConfirmingAction] = useState(null)

  useEffect(() => {
    console.log('🚀 AdminUsers mounted - loading users')
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [users, searchTerm, filterStatus, sortBy])

  const fetchUsers = async () => {
    try {
      console.log('📤 Fetching users list...')
      setLoading(true)
      const response = await api.get('/admin/users')
      console.log('📥 Users received:', response.data?.length, 'users')
      setUsers(response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement des utilisateurs', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus

      return matchesSearch && matchesStatus
    })

    if (sortBy === 'az') {
      filtered.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`))
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
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

  const handleApprove = (userId) => {
    setConfirmingAction({ userId, action: 'approve' })
  }

  const handleReject = (userId) => {
    setConfirmingAction({ userId, action: 'reject' })
  }

  const handleDelete = (userId) => {
    setConfirmingAction({ userId, action: 'delete' })
  }

  const confirmAction = async () => {
    if (!confirmingAction) return

    try {
      if (confirmingAction.action === 'approve') {
        await api.put(`/admin/users/${confirmingAction.userId}/approve`)
        showToast('Utilisateur approuvé', 'success')
      } else if (confirmingAction.action === 'reject') {
        await api.put(`/admin/users/${confirmingAction.userId}/reject`)
        showToast('Utilisateur rejeté', 'success')
      } else if (confirmingAction.action === 'delete') {
        await api.delete(`/admin/users/${confirmingAction.userId}`)
        showToast('Utilisateur supprimé', 'success')
      }
      fetchUsers()
      setConfirmingAction(null)
    } catch (error) {
      showToast('Erreur lors de l\'action', 'error')
    }
  }

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const startIdx = (currentPage - 1) * pageSize + 1
  const endIdx = Math.min(currentPage * pageSize, filteredUsers.length)

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

  if (loading) {
    return <div className="admin-page"><p>{t('admin_loading') || 'Chargement...'}</p></div>
  }

  return (
    <div className="admin-page">
      <h1>{t('admin_users')}</h1>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder={t('admin_search_users')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
        
        <div className="admin-filter-pills">
          {['all', 'approved', 'pending', 'rejected'].map(status => (
            <button
              key={status}
              className={`admin-filter-pill ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? t('admin_all') : statusLabel[status]}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="admin-sort-dropdown"
        >
          <option value="recent">{t('admin_sort_recent')}</option>
          <option value="az">{t('admin_sort_az')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin_user')}</th>
              <th>{t('admin_email')}</th>
              <th>{t('admin_status')}</th>
              <th>{t('admin_companies_count')}</th>
              <th>{t('admin_declarations_count')}</th>
              <th>{t('admin_registered')}</th>
              <th>{t('admin_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id} className={confirmingAction?.userId === user.id ? 'confirming' : ''}>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-avatar-small">{getInitials(user.first_name, user.last_name)}</div>
                    <div>
                      <p className="admin-user-name">{user.first_name} {user.last_name}</p>
                      <p className="admin-user-company">{user.company || '—'}</p>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className="admin-status-badge" style={{ color: getStatusColor(user.status) }}>
                    {statusLabel[user.status]}
                  </span>
                </td>
                <td style={{ color: '#3b82f6' }}>🏢 {user.societes_count || 0}</td>
                <td style={{ color: '#8b5cf6' }}>📄 {user.declarations_count || 0}</td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  {confirmingAction?.userId === user.id ? (
                    <div className="admin-confirmation-inline">
                      <span className="admin-confirm-text">{t('admin_confirm')}</span>
                      <button className="admin-confirm-yes" onClick={confirmAction}>{t('admin_yes')} ✓</button>
                      <button className="admin-confirm-no" onClick={() => setConfirmingAction(null)}>{t('admin_no')} ✗</button>
                    </div>
                  ) : (
                    <div className="admin-actions-cell">
                      <button
                        className="admin-action-btn"
                        onClick={() => {
                          setSelectedUser(user)
                          setModalOpen(true)
                        }}
                        title={t('admin_view')}
                      >
                        👁
                      </button>
                      {user.status !== 'approved' && (
                        <button
                          className="admin-action-btn admin-action-approve"
                          onClick={() => handleApprove(user.id)}
                          title={t('admin_approve')}
                        >
                          ✓
                        </button>
                      )}
                      {user.status !== 'rejected' && (
                        <button
                          className="admin-action-btn admin-action-reject"
                          onClick={() => handleReject(user.id)}
                          title={t('admin_reject')}
                        >
                          ✗
                        </button>
                      )}
                      <button
                        className="admin-action-btn admin-action-delete"
                        onClick={() => handleDelete(user.id)}
                        title={t('admin_delete')}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <p>
          {t('admin_display_of')
            .replace('{{start}}', startIdx)
            .replace('{{end}}', endIdx)
            .replace('{{total}}', filteredUsers.length)}
        </p>
      </div>

      {/* Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedUser(null)
        }}
        onApprove={(userId) => {
          handleApprove(userId)
          setModalOpen(false)
        }}
        onReject={(userId) => {
          handleReject(userId)
          setModalOpen(false)
        }}
        onDelete={(userId) => {
          handleDelete(userId)
          setModalOpen(false)
        }}
      />
    </div>
  )
}
