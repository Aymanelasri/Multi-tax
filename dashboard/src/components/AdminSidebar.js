import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const { t, toggleLanguage, language } = useLanguage()

  // Get admin info from localStorage
  const userStr = localStorage.getItem('user')
  let user = null
  if (userStr) {
    try {
      user = JSON.parse(userStr)
    } catch (error) {
      console.error('Failed to parse user:', error)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || 'A'}${lastName?.[0] || 'D'}`.toUpperCase()
  }

  const navItems = [
    { id: 'overview', label: t('admin_overview'), emoji: '📊' },
    { id: 'users', label: t('admin_users'), emoji: '👥' },
    { id: 'pending', label: t('admin_pending'), emoji: '⏳', badge: true },
    { id: 'companies', label: t('admin_companies'), emoji: '🏢' },
    { id: 'declarations', label: t('admin_declarations'), emoji: '📄' },
    { id: 'settings', label: t('admin_settings'), emoji: '⚙️' },
  ]

  const adminName = user?.name || 'Admin'
  const adminEmail = user?.email || 'admin@tax.ma'
  const nameArray = adminName.split(' ')
  const adminFirstName = nameArray[0] || 'Admin'
  const adminLastName = nameArray[1] || 'Panel'

  return (
    <aside className="admin-sidebar">
      {/* Admin Header */}
      <div className="admin-sidebar-header">
        <div className="admin-avatar">
          {getInitials(adminFirstName, adminLastName)}
        </div>
        <div className="admin-header-info">
          <div className="admin-name">{adminName}</div>
          <span className="admin-badge">ADMIN</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="admin-nav-emoji">{item.emoji}</span>
            <span className="admin-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <button className="admin-lang-toggle" onClick={toggleLanguage}>
          {language === 'FR' ? 'EN' : 'FR'}
        </button>
      </div>
    </aside>
  )
}
