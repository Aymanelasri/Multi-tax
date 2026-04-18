import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import api from '../lib/api'

export default function AdminOverview({ showToast }) {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    console.log('🚀 AdminOverview mounted - loading stats')
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log('📤 Fetching admin stats...')
      setLoading(true)
      const response = await api.get('/admin/stats')
      console.log('📥 Stats received:', response.data)
      setStats(response.data || {
        totalUsers: 0,
        pendingUsers: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalSocietes: 0,
        totalDeclarations: 0,
        newUsersThisMonth: 0,
        declarationsThisMonth: 0,
        avgSocietesPerUser: 0,
        avgDeclarationsPerUser: 0,
        recentActivity: []
      })
      setLastUpdate(new Date())
      showToast('Statistiques rechargées', 'success')
    } catch (error) {
      showToast('Erreur lors du chargement des statistiques', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getMinutesAgo = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 60000)
    return diff === 0 ? '0' : diff
  }

  if (loading || !stats) {
    return <div className="admin-page"><p>Chargement...</p></div>
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>{t('admin_dashboard')}</h1>
          <p className="admin-page-subtitle">{t('admin_dashboard_subtitle')}</p>
        </div>
        <div className="admin-page-actions">
          <span className="admin-last-update">
            {t('admin_last_update').replace('{{minutes}}', getMinutesAgo(lastUpdate))}
          </span>
          <button className="admin-refresh-btn" onClick={fetchStats}>{t('admin_refresh')}</button>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="admin-kpi-grid">
        {/* Total Users */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(0,212,160,0.15)' }}>
              👥
            </div>
            <span className="admin-kpi-label">{t('admin_total_users')}</span>
          </div>
          <div className="admin-kpi-value">{stats.totalUsers}</div>
          <div className="admin-kpi-trend" style={{ color: '#00d4a0' }}>
            +{stats.newUsersThisMonth} {t('admin_vs_last_month')}
          </div>
        </div>

        {/* Pending Users */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(251,191,36,0.15)' }}>
              ⏳
            </div>
            <span className="admin-kpi-label">{t('admin_pending_label')}</span>
          </div>
          <div className={`admin-kpi-value ${stats.pendingUsers > 0 ? 'pulse' : ''}`}>
            {stats.pendingUsers}
          </div>
          {stats.pendingUsers > 0 && (
            <div className="admin-kpi-badge">
              {t('admin_action_required')}
            </div>
          )}
        </div>

        {/* Total Companies */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
              🏢
            </div>
            <span className="admin-kpi-label">{t('admin_companies_count')}</span>
          </div>
          <div className="admin-kpi-value">{stats.totalSocietes}</div>
        </div>

        {/* Total Declarations */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(139,92,246,0.15)' }}>
              📄
            </div>
            <span className="admin-kpi-label">{t('admin_declarations_count')}</span>
          </div>
          <div className="admin-kpi-value">{stats.totalDeclarations}</div>
          <div className="admin-kpi-trend" style={{ color: '#8b5cf6' }}>
            +{stats.declarationsThisMonth} {t('admin_vs_last_month')}
          </div>
        </div>
      </div>

      {/* Row 2: Activity + Chart */}
      <div className="admin-row-2">
        {/* Recent Activity */}
        <div className="admin-card admin-card-activity">
          <h3>{t('admin_recent_activity')}</h3>
          <div className="admin-activity-list">
            {(stats.recentActivity || []).slice(0, 8).map((activity, idx) => (
              <div key={idx} className="admin-activity-item">
                <div className="admin-activity-dot" />
                <div className="admin-activity-info">
                  <p className="admin-activity-text">{activity.description || 'Activité'}</p>
                  <p className="admin-activity-meta">{activity.email || '—'}</p>
                </div>
                <span className="admin-activity-time">{activity.timeAgo || 'Maintenant'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Status Distribution */}
        <div className="admin-card admin-card-chart">
          <h3>{t('admin_user_distribution')}</h3>
          <div className="admin-donut-legend">
            <div className="admin-legend-item">
              <span className="admin-legend-dot" style={{ backgroundColor: '#00d4a0' }} />
              <span>{t('admin_approved')}: {stats.approvedCount} ({Math.round((stats.approvedCount || 0) / (stats.totalUsers || 1) * 100)}%)</span>
            </div>
            <div className="admin-legend-item">
              <span className="admin-legend-dot" style={{ backgroundColor: '#fbbf24' }} />
              <span>{t('admin_pending')}: {stats.pendingUsers} ({Math.round((stats.pendingUsers || 0) / (stats.totalUsers || 1) * 100)}%)</span>
            </div>
            <div className="admin-legend-item">
              <span className="admin-legend-dot" style={{ backgroundColor: '#ef4444' }} />
              <span>{t('admin_rejected')}: {stats.rejectedCount} ({Math.round((stats.rejectedCount || 0) / (stats.totalUsers || 1) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Additional Stats */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <p className="admin-stat-label">{t('admin_avg_companies')}</p>
          <p className="admin-stat-value">{(stats.avgSocietesPerUser || 0).toFixed(1)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">{t('admin_avg_declarations')}</p>
          <p className="admin-stat-value">{(stats.avgDeclarationsPerUser || 0).toFixed(1)}</p>
        </div>
      </div>
    </div>
  )
}
