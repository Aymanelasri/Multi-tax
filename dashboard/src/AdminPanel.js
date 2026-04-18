import React, { useState, useEffect } from 'react'
import { useLanguage } from './context/LanguageContext'
import { getToken } from './services/auth'
import AdminSidebar from './components/AdminSidebar'
import AdminOverview from './pages/AdminOverview'
import AdminUsers from './pages/AdminUsers'
import AdminPending from './pages/AdminPending'
import AdminCompanies from './pages/AdminCompanies'
import AdminDeclarations from './pages/AdminDeclarations'
import AdminSettings from './pages/AdminSettings'
import Toast from './components/Toast'
import './styles/admin-dashboard.css'

function AdminPanel() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  const [toasts, setToasts] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🔐 Not Authenticated</h1>
          <p style={{ fontSize: '16px', color: '#888', marginBottom: '20px' }}>
            Please log in from the main application first.
          </p>
        </div>
        <a
          href="http://localhost:3000/login"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#00d4a0',
            color: '#0a0f1a',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#00b884'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#00d4a0'}
        >
          → Go to Login
        </a>
        <p style={{ marginTop: '30px', fontSize: '12px', color: '#555' }}>
          If you just logged in, try refreshing this page.
        </p>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="admin-main">
        {activeTab === 'overview' && <AdminOverview showToast={showToast} />}
        {activeTab === 'users' && <AdminUsers showToast={showToast} />}
        {activeTab === 'pending' && <AdminPending showToast={showToast} />}
        {activeTab === 'companies' && <AdminCompanies showToast={showToast} />}
        {activeTab === 'declarations' && <AdminDeclarations showToast={showToast} />}
        {activeTab === 'settings' && <AdminSettings showToast={showToast} />}
      </div>

      <div className="admin-toast-stack">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default AdminPanel
