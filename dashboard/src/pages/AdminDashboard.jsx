import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getToken } from '../services/auth'
import api from '../lib/api'
import {
  LineChart,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

// Suppress ResizeObserver warnings
if (typeof window !== 'undefined') {
  const originalError = console.error
  console.error = (...args) => {
    if (args[0]?.includes?.('ResizeObserver loop completed')) return
    originalError(...args)
  }
}

// ============ THEME SYSTEM ============
const THEMES = {
  dark: {
    bgMain: '#0a0f1a',
    bgSidebar: '#0d1728',
    bgCard: '#141d2e',
    bgCardHover: '#1a2540',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.12)',
    accentGreen: '#00d4a0',
    accentAmber: '#fbbf24',
    accentBlue: '#0099ff',
    accentPurple: '#8b5cf6',
  },
  light: {
    bgMain: '#f8fafc',
    bgSidebar: '#ffffff',
    bgCard: '#ffffff',
    bgCardHover: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    border: 'rgba(15,23,42,0.08)',
    borderHover: 'rgba(15,23,42,0.12)',
    accentGreen: '#10b981',
    accentAmber: '#f59e0b',
    accentBlue: '#3b82f6',
    accentPurple: '#8b5cf6',
  }
}

// ============ HOOKS ============
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// ============ COMPONENTS ============

function AnimatedCounter({ target, duration = 1000 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return count.toLocaleString()
}

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function KPICard({ title, value, icon, color, trend, onClick, theme, isMobile }) {
  const [isHovered, setIsHovered] = useState(false)

  const getGradient = (c) => {
    const gradients = {
      green: `linear-gradient(135deg, rgba(0,212,160,0.2), rgba(0,212,160,0.05))`,
      amber: `linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))`,
      blue: `linear-gradient(135deg, rgba(0,153,255,0.2), rgba(0,153,255,0.05))`,
      purple: `linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))`
    }
    return gradients[c] || gradients.green
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 28,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? `0 12px 40px rgba(129, 140, 248, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)` : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={{ background: getGradient(color), width: 60, height: 60, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textMuted, marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, marginBottom: 8, color: theme.textPrimary }}>
        <AnimatedCounter target={value} />
      </div>
      {trend && <div style={{ fontSize: 13, fontWeight: 600, color: theme.accentGreen }}>
        {trend}
      </div>}
    </div>
  )
}

// ============ MAIN COMPONENT ============
export default function AdminDashboard() {
  // Use language context
  const { language, t, toggleLanguage } = useLanguage()
  const windowSize = useWindowSize()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [theme, setTheme] = useState('light')
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', email: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [messages, setMessages] = useState([])
  const [expandedMessage, setExpandedMessage] = useState(null)
  const [deleteUserId, setDeleteUserId] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({ name: '', email: '', status: 'pending', role: 'user' })
  const [editLoading, setEditLoading] = useState(false)
  const [societes, setSocietes] = useState([])
  const [societesLoading, setSocietesLoading] = useState(false)
  const [societesSearchTerm, setSocietesSearchTerm] = useState('')
  const [societesSortBy, setSocietiesSortBy] = useState('recent')
  const [expandedManagerId, setExpandedManagerId] = useState(null)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', status: 'pending', role: 'user' })
  const [addUserLoading, setAddUserLoading] = useState(false)
  const pageSize = 10

  const currentTheme = THEMES[theme]

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme') || 'light'
    setTheme(savedTheme)
  }, [])

  // Save theme to localStorage
  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('adminTheme', newTheme)
  }

  // Authentication Check
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken()
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.role === 'admin') {
            setIsAuthenticated(true)
            setProfileData({ name: user.name || '', email: user.email || '' })
          } else {
            setIsAuthenticated(false)
          }
        } catch (error) {
          setIsAuthenticated(false)
        }
      }
      setAuthLoading(false)
    }

    checkAuth()
  }, [])

  // Fetch Stats
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/stats')
        setStats(response.data)
      } catch (error) {
        showToast('Erreur lors du chargement des statistiques', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'overview') fetchStats()
  }, [activeTab, isAuthenticated])

  // Fetch Users
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/users')
        setUsers(response.data || [])
      } catch (error) {
        showToast('Erreur lors du chargement des utilisateurs', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'users') fetchUsers()
  }, [activeTab, isAuthenticated])

  // Fetch Pending
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchPending = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/users/pending')
        setPendingUsers(response.data || [])
      } catch (error) {
        showToast('Erreur lors du chargement', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === 'pending') fetchPending()
  }, [activeTab, isAuthenticated])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handlers
  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`)
      showToast('Utilisateur approuvé', 'success')
      setPendingUsers(pendingUsers.filter(u => u.id !== userId))
    } catch (error) {
      showToast('Erreur lors de l\'approbation', 'error')
    }
  }

  const handleReject = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/reject`)
      showToast('Utilisateur rejeté', 'success')
      setPendingUsers(pendingUsers.filter(u => u.id !== userId))
    } catch (error) {
      showToast('Erreur lors du rejet', 'error')
    }
  }

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true)
      await api.put('/admin/profile', profileData)
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...profileData }))
      showToast('Profil mis à jour', 'success')
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error')
      return
    }
    try {
      setPasswordLoading(true)
      await api.put('/admin/password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Mot de passe mis à jour', 'success')
    } catch (error) {
      showToast('Erreur lors de la mise à jour du mot de passe', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  // FIX BUG 3: Logout button with proper redirect
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('adminTheme')
    localStorage.removeItem('adminLang')
    window.location.href = 'http://localhost:3000/login'
  }

  // Fetch messages - FIX BUG 6
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchMessages = async () => {
      try {
        const response = await api.get('/admin/messages')
        // Extract data array from paginated response
        setMessages(response.data.data || response.data || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    if (activeTab === 'messages') fetchMessages()
  }, [activeTab, isAuthenticated])

  // Fetch Sociétés
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchSocietes = async () => {
      try {
        setSocietesLoading(true)
        const response = await api.get('/admin/societes')
        setSocietes(response.data || [])
      } catch (error) {
        console.error('Error fetching societes:', error)
        showToast('Erreur lors du chargement des sociétés', 'error')
      } finally {
        setSocietesLoading(false)
      }
    }

    if (activeTab === 'societes') fetchSocietes()
  }, [activeTab, isAuthenticated])

  // Mark message as read - FIX BUG 6
  const handleMarkMessageAsRead = async (messageId) => {
    try {
      await api.put(`/admin/messages/${messageId}/read`)
      setMessages(messages.map(m => m.id === messageId ? { ...m, status: 'read' } : m))
      showToast('Message marqué comme lu', 'success')
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  // Edit user handler
  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name || (user.firstname + ' ' + user.lastname),
      email: user.email,
      status: user.status,
      role: user.role || 'user'
    })
  }

  const handleSaveEdit = async () => {
    try {
      setEditLoading(true)
      await api.put(`/admin/users/${editingUser.id}`, editFormData)
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editFormData } : u))
      showToast('Utilisateur mis à jour', 'success')
      setEditingUser(null)
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error')
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      showToast('Veuillez remplir tous les champs', 'error')
      return
    }
    try {
      setAddUserLoading(true)
      const response = await api.post('/admin/users', newUserData)
      setUsers([...users, response.data])
      showToast('Utilisateur créé avec succès', 'success')
      setShowAddUserForm(false)
      setNewUserData({ name: '', email: '', password: '', status: 'pending', role: 'user' })
    } catch (error) {
      showToast('Erreur lors de la création de l\'utilisateur', 'error')
    } finally {
      setAddUserLoading(false)
    }
  }

  // Loading screens
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: currentTheme.bgMain, color: currentTheme.textPrimary }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔄</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Vérification...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: currentTheme.bgMain, color: currentTheme.textPrimary }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔐</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Accès refusé</div>
          <div style={{ color: currentTheme.textMuted, marginBottom: 30 }}>Connectez-vous en tant qu'administrateur</div>
          <a href="http://localhost:3000/login" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: currentTheme.accentGreen,
            color: currentTheme.bgMain,
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 800
          }}>
            Aller à la connexion
          </a>
        </div>
      </div>
    )
  }

  const isMobile = windowSize.width < 600
  const isTablet = windowSize.width >= 600 && windowSize.width < 1014
  const isSmallScreen = windowSize.width < 1014

  const getInitials = (name) => {
    if (!name) return 'AD'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Filter and paginate users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getActivityColor = (type) => {
    const colors = {
      new_user: currentTheme.accentGreen,
      pending: currentTheme.accentAmber,
      declaration: currentTheme.accentBlue,
      rejected: '#ef4444',
      approved: currentTheme.accentGreen
    }
    return colors[type] || currentTheme.textMuted
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        if (loading || !stats) {
          return <div style={{ padding: '40px 20px', textAlign: 'center', color: currentTheme.textMuted }}>Chargement...</div>
        }
        console.log('Stats data:', stats)

        return (
          <div>
            {/* Page Header */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: isMobile ? 20 : 42, fontWeight: 800, marginBottom: 8, color: currentTheme.textPrimary }}>{t('hello_admin')} 👋</div>
              <div style={{ fontSize: isMobile ? 13 : 16, color: currentTheme.textMuted, marginBottom: 16 }}>{t('platform_info')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, color: currentTheme.accentGreen }}><Clock /></div>
                <div style={{ fontSize: isMobile ? 12 : 13, color: currentTheme.textMuted, fontWeight: 600 }}>
                  {new Date().toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* KPI Cards - 4 columns on desktop, 2 on tablet, 1 on mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 24, marginBottom: 40 }}>
              <KPICard title={t('total_users_label')} value={stats.totalUsers || 0} icon="👥" color="green" trend={`+${stats.newUsersThisMonth || 0} ${t('this_month')}`} onClick={() => setActiveTab('users')} theme={currentTheme} isMobile={isMobile} />
              <KPICard title={t('pending_users')} value={stats.pendingUsers || 0} icon="⏳" color="amber" trend={stats.pendingUsers > 0 ? t('action_required') : t('up_to_date')} onClick={() => setActiveTab('pending')} theme={currentTheme} isMobile={isMobile} />
              <KPICard title={t('companies_label')} value={stats.totalSocietes || 0} icon="🏢" color="blue" trend={`${stats.avgSocietesPerUser?.toFixed(1) || 0} ${t('average')}`} onClick={() => setActiveTab('societes')} theme={currentTheme} isMobile={isMobile} />
              <KPICard title={t('messages_label')} value={stats.unreadMessagesCount || 0} icon="📧" color="purple" trend={t('unread')} onClick={() => setActiveTab('messages')} theme={currentTheme} isMobile={isMobile} />
            </div>

            {/* Info Banner */}
            <div style={{ background: theme === 'light' ? 'rgba(16,185,129,0.08)' : 'rgba(0,212,160,0.08)', border: `1px solid ${theme === 'light' ? 'rgba(16,185,129,0.2)' : 'rgba(0,212,160,0.2)'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 40, color: currentTheme.textMuted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span>{language === 'FR' ? 'Les déclarations sont gérées directement par les utilisateurs dans leurs comptes respectifs.' : 'Declarations are managed directly by users in their respective accounts.'}</span>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 0.8fr', gap: 24, marginBottom: 40 }}>
              {/* Line Chart */}
              <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(12px)', transition: 'all 0.3s ease', boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, marginBottom: 24, color: currentTheme.textPrimary }}>📈 {t('user_evolution')}</div>
                <div style={{ height: isMobile ? 250 : 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyUsers || []}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={currentTheme.accentGreen} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={currentTheme.accentGreen} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={currentTheme.accentGreen}
                        fill="url(#lineGradient)"
                        isAnimationActive={true}
                      />
                      <XAxis dataKey="month" stroke={currentTheme.textMuted} tick={{ fill: currentTheme.textMuted, fontSize: 12 }} />
                      <YAxis stroke={currentTheme.textMuted} tick={{ fill: currentTheme.textMuted, fontSize: 12 }} allowDecimals={false} tickCount={3} />
                      <Tooltip
                        contentStyle={{
                          background: currentTheme.bgCard,
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: 8,
                          color: currentTheme.textPrimary
                        }}
                        labelStyle={{ color: currentTheme.accentGreen }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart */}
              <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(12px)', transition: 'all 0.3s ease', boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, marginBottom: 24, color: currentTheme.textPrimary }}>👥 {t('user_distribution')}</div>
                <div style={{ height: isMobile ? 250 : 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: t('approved_label'), value: stats.userStatus?.approved || 0 },
                          { name: t('pending_users'), value: stats.userStatus?.pending || 0 },
                          { name: t('rejected_label'), value: stats.userStatus?.rejected || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        <Cell fill={currentTheme.accentGreen} />
                        <Cell fill={currentTheme.accentAmber} />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: currentTheme.bgCard,
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: 8,
                          color: currentTheme.textPrimary
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 20 }}>
                  {[
                    { label: t('approved_label'), color: currentTheme.accentGreen, value: stats.userStatus?.approved || 0 },
                    { label: t('pending_users'), color: currentTheme.accentAmber, value: stats.userStatus?.pending || 0 },
                    { label: t('rejected_label'), color: '#ef4444', value: stats.userStatus?.rejected || 0 }
                  ].map((item, idx) => {
                    const total = (stats.userStatus?.approved || 0) + (stats.userStatus?.pending || 0) + (stats.userStatus?.rejected || 0)
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: currentTheme.textMuted }}>
                          <div style={{ fontWeight: 600, color: currentTheme.textPrimary }}>{item.label}</div>
                          <div style={{ fontSize: 11 }}>{item.value} ({percentage}%)</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
              <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 24, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 16, boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: theme === 'light' ? 'rgba(16,185,129,0.1)' : 'rgba(0,212,160,0.15)' }}>📊</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted }}>{t('average_companies')}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: currentTheme.textPrimary }}>{stats.avgSocietesPerUser?.toFixed(1) || 0}</div>
                </div>
              </div>
              <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 24, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 16, boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: theme === 'light' ? 'rgba(59,130,246,0.1)' : 'rgba(0,153,255,0.15)' }}>📈</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted }}>{t('average_declarations')}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: currentTheme.textPrimary }}>{stats.avgDeclarationsPerUser?.toFixed(1) || 0}</div>
                </div>
              </div>
              <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 24, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 16, boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: theme === 'light' ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.15)' }}>⚡</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted }}>{t('active_user_label')}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4, color: currentTheme.textPrimary }}>{stats.mostActiveUser?.name || stats.mostActiveUser?.firstname ? `${stats.mostActiveUser?.firstname || ''} ${stats.mostActiveUser?.lastname || ''}`.trim() : '—'}</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'users':
        return (
          <div>
            <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: isMobile ? 20 : 42, fontWeight: 800, marginBottom: 8, color: currentTheme.textPrimary }}>{t('users')}</div>
                <div style={{ fontSize: isMobile ? 13 : 16, color: currentTheme.textMuted }}>{t('manage_users')}</div>
              </div>
              <button
                onClick={() => setShowAddUserForm(true)}
                style={{
                  padding: '12px 24px',
                  background: theme === 'light' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00d4a0, #0099ff)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(16,185,129,0.2)' : '0 4px 12px rgba(0,212,160,0.2)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = theme === 'light' ? '0 6px 20px rgba(16,185,129,0.3)' : '0 6px 20px rgba(0,212,160,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = theme === 'light' ? '0 4px 12px rgba(16,185,129,0.2)' : '0 4px 12px rgba(0,212,160,0.2)'
                }}
              >
                ➕ {t('add_user')}
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                style={{
                  padding: '10px 16px',
                  background: currentTheme.bgCard,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  flex: 1,
                  minWidth: 200,
                  fontFamily: 'inherit'
                }}
              />
              {['all', 'approved', 'pending', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => { setFilterStatus(status); setCurrentPage(1) }}
                  style={{
                    padding: '10px 16px',
                    background: filterStatus === status ? currentTheme.accentGreen : currentTheme.bgCard,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: 8,
                    color: filterStatus === status ? currentTheme.bgMain : currentTheme.textSecondary,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {status === 'all' ? t('all_status') : status === 'approved' ? t('approved') : status === 'pending' ? t('pending') : t('rejected')}
                </button>
              ))}
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: currentTheme.textMuted }}>{t('loading')}</div>
            ) : paginatedUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: currentTheme.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: currentTheme.textPrimary, marginBottom: 8 }}>{t('no_users')}</div>
              </div>
            ) : (
              <div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: `linear-gradient(90deg, rgba(0,212,160,0.08), rgba(0,153,255,0.08))`, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>{t('user_label')}</th>
                        {!isMobile && <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>{t('email_label')}</th>}
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>{t('status_label')}</th>
                        {!isMobile && <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted }}>{t('registered_label')}</th>}
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted }}>{t('actions_label')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: `1px solid ${currentTheme.border}`, transition: 'all 0.2s ease' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4a0, #0099ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: currentTheme.bgMain }}>
                                {getInitials((user.firstname || '') + ' ' + (user.lastname || ''))}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: currentTheme.textPrimary }}>{user.name || (user.firstname + ' ' + user.lastname)}</div>
                                <div style={{ fontSize: 12, color: currentTheme.textMuted }}>{user.company || '—'}</div>
                              </div>
                            </div>
                          </td>
                          {!isMobile && <td style={{ padding: '16px 20px', color: currentTheme.textSecondary, fontSize: 14 }}>{user.email}</td>}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              background: user.status === 'approved' ? 'rgba(0,212,160,0.1)' : user.status === 'pending' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                              color: user.status === 'approved' ? currentTheme.accentGreen : user.status === 'pending' ? currentTheme.accentAmber : '#ef4444',
                              border: user.status === 'approved' ? `1px solid rgba(0,212,160,0.2)` : user.status === 'pending' ? `1px solid rgba(251,191,36,0.2)` : `1px solid rgba(239,68,68,0.2)`
                            }}>
                              {user.status === 'approved' ? '✓' : user.status === 'pending' ? '⏳' : '✗'} {user.status}
                            </span>
                          </td>
                          {!isMobile && <td style={{ padding: '16px 20px', color: currentTheme.textSecondary, fontSize: 14 }}>{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</td>}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleEditUser(user)}
                                style={{
                                  padding: '4px 12px',
                                  background: 'transparent',
                                  border: '1px solid #3b82f6',
                                  borderRadius: 6,
                                  color: '#3b82f6',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {e.target.style.background = 'rgba(59,130,246,0.1)'}}
                                onMouseLeave={(e) => {e.target.style.background = 'transparent'}}
                                title="Modifier"
                              >
                                {t('edit_user')}
                              </button>
                              <button
                                onClick={() => {
                                  if (deleteUserId === user.id) {
                                    api.delete(`/admin/users/${user.id}`).then(() => {
                                      showToast('Utilisateur supprimé', 'success')
                                      setUsers(users.filter(u => u.id !== user.id))
                                      setDeleteUserId(null)
                                    }).catch(() => {
                                      showToast('Erreur lors de la suppression', 'error')
                                      setDeleteUserId(null)
                                    })
                                  } else {
                                    showToast(`Cliquez à nouveau pour confirmer la suppression de ${user.name}`, 'warning')
                                    setDeleteUserId(user.id)
                                    setTimeout(() => setDeleteUserId(null), 3000)
                                  }
                                }}
                                style={{
                                  padding: '4px 12px',
                                  background: deleteUserId === user.id ? 'rgba(239,68,68,0.2)' : 'transparent',
                                  border: '1px solid #ef4444',
                                  borderRadius: 6,
                                  color: '#ef4444',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  fontFamily: 'inherit',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => !deleteUserId && (e.target.style.background = 'rgba(239,68,68,0.1)')}
                                onMouseLeave={(e) => !deleteUserId && (e.target.style.background = 'transparent')}
                                title={deleteUserId === user.id ? t('confirm_delete') : t('delete_user')}
                              >
                                {deleteUserId === user.id ? '✓ ' + t('confirm_delete') : t('delete_user')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '10px 16px',
                        background: currentTheme.bgCard,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: 8,
                        color: currentTheme.textSecondary,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '10px 16px',
                          background: currentPage === page ? currentTheme.accentGreen : currentTheme.bgCard,
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: 8,
                          color: currentPage === page ? currentTheme.bgMain : currentTheme.textSecondary,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          fontSize: 12
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '10px 16px',
                        background: currentTheme.bgCard,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: 8,
                        color: currentTheme.textSecondary,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 'pending':
        return (
          <div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: isMobile ? 20 : 42, fontWeight: 800, marginBottom: 8, color: currentTheme.textPrimary }}>{t('pending_approval')}</div>
              <div style={{ fontSize: isMobile ? 13 : 16, color: currentTheme.textMuted }}>{t('approve_reject')}</div>
            </div>

            {/* Loading screens */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: currentTheme.textMuted }}>{t('loading')}</div>
            ) : pendingUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: currentTheme.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: currentTheme.textPrimary, marginBottom: 8 }}>{t('no_pending')}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {pendingUsers.map(user => (
                  <div key={user.id} style={{
                    background: currentTheme.bgCard,
                    border: `3px solid rgba(251,191,36,0.3)`,
                    borderTop: '3px solid #fbbf24',
                    borderRadius: 16,
                    padding: 20,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${currentTheme.border}` }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: currentTheme.bgMain, flexShrink: 0 }}>
                        {getInitials((user.first_name || '') + ' ' + (user.last_name || ''))}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: currentTheme.textPrimary }}>{user.first_name} {user.last_name}</div>
                        <div style={{ fontSize: 13, color: currentTheme.textMuted }}>{user.email}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      {[['Société', user.company], ['Téléphone', user.phone], ['Email vérifié', user.email_verified_at ? '✓' : '✗']].map(([label, value], idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: currentTheme.textMuted }}>
                          <span>{label}:</span>
                          <span style={{ fontWeight: 600, color: currentTheme.textPrimary }}>{value || '—'}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button
                        onClick={() => handleApprove(user.id)}
                        style={{
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #00d4a0, #00b884)',
                          border: 'none',
                          borderRadius: 8,
                          color: currentTheme.bgMain,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontFamily: 'inherit',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        ✓ {t('approve')}
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        style={{
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          border: 'none',
                          borderRadius: 8,
                          color: 'white',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontFamily: 'inherit',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        ✗ {t('reject')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'messages':
        // FIX BUG 6: Messages tab
        return (
          <div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: isMobile ? 20 : 42, fontWeight: 800, marginBottom: 8, color: currentTheme.textPrimary }}>{t('messages')}</div>
              <div style={{ fontSize: isMobile ? 13 : 16, color: currentTheme.textMuted }}>{t('contact_messages')}</div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: currentTheme.textMuted }}>{t('loading')}</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: currentTheme.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📧</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: currentTheme.textPrimary, marginBottom: 8 }}>{t('no_messages')}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {messages.map(msg => (
                  <div key={msg.id}>
                    <div
                      onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                      style={{
                        background: currentTheme.bgCard,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: 12,
                        padding: 16,
                        backdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: msg.status === 'unread' ? currentTheme.accentAmber : currentTheme.accentGreen, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: currentTheme.textPrimary, fontSize: 13 }}>{msg.name}</span>
                            <span style={{ color: currentTheme.textMuted, fontSize: 12 }}>{msg.email}</span>
                          </div>
                          <div style={{ color: currentTheme.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{msg.subject}</div>
                          <div style={{ color: currentTheme.textMuted, fontSize: 12 }}>{msg.message?.substring(0, 50)}...</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: msg.status === 'unread' ? `rgba(251,191,36,0.1)` : `rgba(0,212,160,0.1)`, color: msg.status === 'unread' ? currentTheme.accentAmber : currentTheme.accentGreen }}>
                          {msg.status === 'unread' ? t('unread') : 'Lu'}
                        </span>
                        <span style={{ fontSize: 12, color: currentTheme.textMuted }}>{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    {expandedMessage === msg.id && (
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0,212,160,0.3)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 16, backdropFilter: 'blur(12px)' }}>
                        <div style={{ marginBottom: 16, color: currentTheme.textPrimary, fontSize: 13, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                        {msg.status === 'unread' && (
                          <button onClick={() => handleMarkMessageAsRead(msg.id)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00d4a0, #00b884)', color: currentTheme.bgMain, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>{t('mark_as_read')}</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'societes':
        const managersWithSocietes = users.map(user => ({
          ...user,
          societes: societes.filter(s => s.user_id === user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        })).filter(user => user.societes.length > 0)
        
        return (
          <div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: isMobile ? 20 : 42, fontWeight: 800, marginBottom: 8, color: currentTheme.textPrimary }}>{t('companies')}</div>
              <div style={{ fontSize: isMobile ? 13 : 16, color: currentTheme.textMuted }}>{language === 'FR' ? 'Sociétés par manager' : 'Companies by manager'}</div>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={language === 'FR' ? 'Rechercher par nom, IF ou ICE...' : 'Search by name, IF or ICE...'}
                value={societesSearchTerm}
                onChange={(e) => setSocietesSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 250,
                  padding: '12px 16px',
                  background: currentTheme.bgCard,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit'
                }}
              />
              <select
                value={societesSortBy}
                onChange={(e) => setSocietiesSortBy(e.target.value)}
                style={{
                  padding: '12px 16px',
                  background: currentTheme.bgCard,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="recent">{language === 'FR' ? 'Plus récentes' : 'Most Recent'}</option>
                <option value="oldest">{language === 'FR' ? 'Plus anciennes' : 'Oldest'}</option>
                <option value="name">{language === 'FR' ? 'Nom (A-Z)' : 'Name (A-Z)'}</option>
              </select>
            </div>

            {societesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: currentTheme.textMuted }}>{t('loading')}</div>
            ) : managersWithSocietes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: currentTheme.textMuted }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🏢</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: currentTheme.textPrimary, marginBottom: 8 }}>{language === 'FR' ? 'Aucune société trouvée' : 'No companies found'}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                {managersWithSocietes.map(manager => {
                  const managerSocietes = manager.societes.filter(s => 
                    s.nom?.toLowerCase().includes(societesSearchTerm.toLowerCase()) ||
                    s.if?.toLowerCase().includes(societesSearchTerm.toLowerCase()) ||
                    s.ice?.toLowerCase().includes(societesSearchTerm.toLowerCase())
                  ).sort((a, b) => {
                    if (societesSortBy === 'recent') {
                      return new Date(b.created_at) - new Date(a.created_at)
                    } else if (societesSortBy === 'oldest') {
                      return new Date(a.created_at) - new Date(b.created_at)
                    } else if (societesSortBy === 'name') {
                      return a.nom?.localeCompare(b.nom)
                    }
                    return 0
                  })
                  
                  return (
                    <div key={manager.id} style={{
                      background: currentTheme.bgCard,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: 16,
                      overflow: 'hidden',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.2s ease'
                    }}>
                      {/* Manager Header */}
                      <button
                        onClick={() => setExpandedManagerId(expandedManagerId === manager.id ? null : manager.id)}
                        style={{
                          width: '100%',
                          padding: 20,
                          background: 'linear-gradient(135deg, rgba(0,212,160,0.1), rgba(0,153,255,0.05))',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,160,0.15), rgba(0,153,255,0.1))'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,160,0.1), rgba(0,153,255,0.05))'}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4a0, #0099ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: currentTheme.bgMain, flexShrink: 0 }}>
                          {getInitials((manager.firstname || '') + ' ' + (manager.lastname || ''))}
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: currentTheme.textPrimary }}>{manager.firstname} {manager.lastname}</div>
                          <div style={{ fontSize: 12, color: currentTheme.textMuted }}>{manager.email}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20, fontWeight: 900, color: currentTheme.accentGreen }}>{managerSocietes.length}</span>
                          <span style={{ fontSize: 20, color: currentTheme.textMuted }}>{expandedManagerId === manager.id ? '▼' : '▶'}</span>
                        </div>
                      </button>

                      {/* Societes List */}
                      {expandedManagerId === manager.id && (
                        <div style={{ padding: 20, borderTop: `1px solid ${currentTheme.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {managerSocietes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: currentTheme.textMuted, fontSize: 13 }}>
                              {language === 'FR' ? 'Aucune société trouvée' : 'No companies found'}
                            </div>
                          ) : (
                            managerSocietes.map(societe => (
                              <div key={societe.id} style={{
                                padding: 12,
                                background: 'rgba(0,212,160,0.05)',
                                border: '1px solid rgba(0,212,160,0.2)',
                                borderRadius: 8,
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,160,0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,212,160,0.05)'}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: currentTheme.textPrimary }}>{societe.nom}</div>
                                    <div style={{ fontSize: 11, color: currentTheme.textMuted, marginTop: 2 }}>IF: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{societe.if}</span></div>
                                  </div>
                                  <div style={{ fontSize: 11, color: currentTheme.accentGreen, fontWeight: 600 }}>
                                    {societe.created_at ? new Date(societe.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                                  </div>
                                </div>
                                {societe.ice && (
                                  <div style={{ fontSize: 11, color: currentTheme.textMuted }}>ICE: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{societe.ice}</span></div>
                                )}
                                {societe.ville && (
                                  <div style={{ fontSize: 11, color: currentTheme.textMuted, marginTop: 4 }}>Ville: <span style={{ fontWeight: 600 }}>{societe.ville}</span></div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'settings':
        return (
          <div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: isMobile ? 20 : 42, fontWeight: 800, marginBottom: 8, color: currentTheme.textPrimary }}>{t('settings')}</div>
              <div style={{ fontSize: isMobile ? 13 : 16, color: currentTheme.textMuted }}>{t('manage_account')}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: windowSize.width < 900 ? '1fr' : '1fr 1fr', gap: 32 }}>
              {/* Profile Card */}
              <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(12px)', boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: currentTheme.textPrimary }}>👤 {t('admin_profile')}</div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('full_name')}</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: currentTheme.bgMain,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: 8,
                      color: currentTheme.textPrimary,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('email_label')}</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: currentTheme.bgMain,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: 8,
                      color: currentTheme.textPrimary,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: theme === 'light' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00d4a0, #0099ff)',
                    border: 'none',
                    borderRadius: 8,
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: profileLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: profileLoading ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: theme === 'light' ? '0 4px 12px rgba(16,185,129,0.2)' : '0 4px 12px rgba(0,212,160,0.2)'
                  }}
                >
                  {profileLoading ? '⏳ ' + t('save') : '💾 ' + t('save')}
                </button>
              </div>

              {/* Password Card */}
              <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(12px)', boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: currentTheme.textPrimary }}>🔐 {t('change_password')}</div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('current_password')}</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: currentTheme.bgMain,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: 8,
                      color: currentTheme.textPrimary,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('new_password')}</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: currentTheme.bgMain,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: 8,
                      color: currentTheme.textPrimary,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('confirm_password')}</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: currentTheme.bgMain,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: 8,
                      color: currentTheme.textPrimary,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
                <button
                  onClick={handleSavePassword}
                  disabled={passwordLoading}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: theme === 'light' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #00d4a0, #0099ff)',
                    border: 'none',
                    borderRadius: 8,
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: passwordLoading ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: theme === 'light' ? '0 4px 12px rgba(239,68,68,0.2)' : '0 4px 12px rgba(0,212,160,0.2)'
                  }}
                >
                  {passwordLoading ? '⏳ ' + t('update') : '🔐 ' + t('update')}
                </button>
              </div>
            </div>

            {/* ISSUE 1 FIX: Mobile-only theme and language preferences */}
            {isMobile && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: currentTheme.textPrimary }}>⚙️ {t('preferences')}</div>
                <div style={{ background: currentTheme.bgCard, border: `1px solid ${currentTheme.border}`, borderRadius: 16, padding: 28, backdropFilter: 'blur(12px)', boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 12 }}>🌙 {t('theme')}</label>
                    <button
                      onClick={handleToggleTheme}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: theme === 'light' ? 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))' : 'linear-gradient(135deg, rgba(0,153,255,0.15), rgba(139,92,246,0.15))',
                        border: `1px solid ${theme === 'light' ? 'rgba(59,130,246,0.2)' : 'rgba(0,153,255,0.2)'}`,
                        borderRadius: 8,
                        color: currentTheme.accentBlue,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        padding: '12px 16px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = theme === 'light' ? '0 4px 12px rgba(59,130,246,0.15)' : '0 8px 24px rgba(0,153,255,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      {theme === 'dark' ? '☀️ ' + t('light_mode') : '🌙 ' + t('dark_mode')}
                    </button>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 12 }}>🌐 {t('language')}</label>
                    <button
                      onClick={toggleLanguage}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: theme === 'light' ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(16,185,129,0.1))' : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(0,212,160,0.15))',
                        border: `1px solid ${theme === 'light' ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.2)'}`,
                        borderRadius: 8,
                        color: currentTheme.accentPurple,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = theme === 'light' ? '0 4px 12px rgba(139,92,246,0.15)' : '0 8px 24px rgba(139,92,246,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      {language === 'FR' ? 'English (EN)' : 'Français (FR)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const userStr = localStorage.getItem('user')
  let adminName = 'Admin'
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      adminName = user.name || 'Admin'
    } catch (error) {
      console.log('Parse error')
    }
  }

  // FIX BUG 4: Add icons to nav items + FIX BUG 5: Remove Déclarations tab + FIX BUG 6: Add Messages tab
  const navItems = [
    { id: 'overview', label: t('dashboard'), emoji: '▦', icon: 'grid' },
    { id: 'users', label: t('users'), emoji: '👥', icon: 'people' },
    { id: 'societes', label: t('companies'), emoji: '🏢', icon: 'building', badge: false },
    { id: 'pending', label: t('pending'), emoji: '⏳', icon: 'clock', badge: stats?.pendingUsers > 0 },
    { id: 'messages', label: t('messages'), emoji: '📧', icon: 'envelope', badge: messages.filter(m => m.status === 'unread').length > 0 },
    { id: 'settings', label: t('settings'), emoji: '⚙️', icon: 'gear' }
  ]

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      background: theme === 'light' ? '#f8fafc' : '#020617',
      color: currentTheme.textPrimary,
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dark Overlay for Mobile Sidebar */}
      {isSmallScreen && sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 240,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      {/* Hamburger Button */}
      {isSmallScreen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: 12,
            left: 16,
            zIndex: 300,
            background: '#141d2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'white',
            fontSize: 18,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease'
          }}
          title="Toggle sidebar"
        >
          ☰
        </button>
      )}

      {/* Mobile Top Bar - FIX: Mobile navigation only */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: currentTheme.bgSidebar,
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 200,
          backdropFilter: 'blur(10px)'
        }}>
          {/* Left: Avatar + Admin text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4a0, #0099ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: currentTheme.bgMain }}>
              {getInitials(adminName)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: currentTheme.textPrimary }}>Admin</span>
          </div>
          {/* Right: Theme + Language toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleToggleTheme}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: currentTheme.bgCard,
                border: `1px solid ${currentTheme.border}`,
                color: currentTheme.textSecondary,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Theme toggle"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={toggleLanguage}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: currentTheme.bgCard,
                border: `1px solid ${currentTheme.border}`,
                color: currentTheme.textSecondary,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Language toggle"
            >
              {language === 'FR' ? 'EN' : 'FR'}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar - Premium Floating Design */}
      <aside style={{
        position: isMobile ? 'fixed' : isSmallScreen ? 'fixed' : 'fixed',
        bottom: isMobile ? 0 : isSmallScreen && !isMobile ? '16px' : '16px',
        top: isSmallScreen && !isMobile ? 'auto' : isMobile ? 'auto' : '16px',
        left: isMobile ? 0 : isSmallScreen && !isMobile ? '16px' : '16px',
        width: isSmallScreen && !isMobile ? 240 : isMobile ? '100%' : isTablet ? 80 : 280,
        height: isMobile ? 70 : isSmallScreen && !isMobile ? 'auto' : 'calc(100vh - 32px)',
        background: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : isMobile ? 'rgba(30, 27, 75, 0.6)' : 'rgba(15, 23, 42, 0.4)',
        backdropFilter: isMobile ? 'blur(8px)' : 'blur(16px)',
        border: isMobile ? `1px solid ${theme === 'light' ? 'rgba(15,23,42,0.1)' : 'rgba(255, 255, 255, 0.08)'}` : `1px solid ${theme === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: isMobile ? 0 : isSmallScreen && !isMobile ? 24 : 32,
        borderTop: isMobile ? `1px solid ${theme === 'light' ? 'rgba(15,23,42,0.1)' : 'rgba(255, 255, 255, 0.08)'}` : 'none',
        borderRight: isMobile ? 'none' : 'none',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        justifyContent: isMobile ? 'space-around' : 'flex-start',
        alignItems: 'center',
        padding: isMobile ? '8px 0' : isTablet ? '20px 12px' : '24px 20px',
        zIndex: isSmallScreen && !isMobile ? (sidebarOpen ? 250 : -1) : 1000,
        transform: isSmallScreen && !isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-300px)') : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.3s ease',
        opacity: isSmallScreen && !isMobile && !sidebarOpen ? 0 : 1,
        pointerEvents: isSmallScreen && !isMobile && !sidebarOpen ? 'none' : 'auto'
      }}>
        {/* Header */}
        {!isMobile && (
          <div style={{
            padding: isTablet ? '0 12px 12px' : '0 20px 24px',
            borderBottom: `1px solid ${currentTheme.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            justifyContent: isTablet ? 'center' : 'flex-start'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4a0, #0099ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: currentTheme.bgMain }}>
              {getInitials(adminName)}
            </div>
            {!isTablet && (
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: currentTheme.textPrimary }}>{adminName}</div>
                <div style={{ display: 'inline-block', background: 'rgba(0, 212, 160, 0.15)', color: '#00d4a0', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 4, marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: 8,
          padding: isMobile ? 0 : '0 12px',
          overflowY: isMobile ? 'visible' : 'auto',
          width: '100%',
          justifyContent: isMobile ? 'space-around' : 'flex-start'
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? 0 : 12,
                padding: isMobile ? '4px' : isTablet ? '8px' : '12px 16px',
                width: isMobile ? 'auto' : isTablet ? '48px' : 'auto',
                height: isMobile ? '48px' : 'auto',
                background: activeTab === item.id ? isTablet || isMobile ? 'rgba(0,212,160,0.15)' : 'linear-gradient(135deg, rgba(0,212,160,0.2), rgba(0,153,255,0.1))' : 'transparent',
                borderLeft: activeTab === item.id && !isMobile && !isTablet ? '3px solid #00d4a0' : 'none',
                borderRadius: isTablet || isMobile ? 8 : 12,
                color: activeTab === item.id ? '#00d4a0' : currentTheme.textSecondary,
                cursor: 'pointer',
                fontSize: isMobile ? 11 : 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <span style={{ fontSize: isMobile ? 20 : 16 }}>{item.emoji}</span>
              {!isTablet && !isMobile && <span>{item.label}</span>}
              {item.badge && (
                <div style={{
                  position: 'absolute',
                  top: isMobile ? -4 : 'auto',
                  right: isMobile ? -4 : 'auto',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 1.5s infinite'
                }}>
                  {stats?.pendingUsers}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {!isMobile && (
          <div style={{
            padding: '0 12px',
            borderTop: `1px solid ${currentTheme.border}`,
            marginTop: 'auto',
            paddingTop: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            width: '100%',
            justifyContent: 'center'
          }}>
            {/* ISSUE 1 FIX: Hide theme and language toggles on mobile */}
            {!isMobile && (
              <>
                <button
                  onClick={handleToggleTheme}
                  style={{
                    padding: isTablet ? '8px' : '10px 16px',
                    background: currentTheme.bgCard,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: 8,
                    color: currentTheme.textSecondary,
                    cursor: 'pointer',
                    fontSize: isTablet ? 14 : 12,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    width: isTablet ? '32px' : 'auto',
                    height: isTablet ? '32px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Theme toggle"
                >
                  {isTablet ? (theme === 'dark' ? '☀️' : '🌙') : (theme === 'dark' ? '☀️ Light' : '🌙 Dark')}
                </button>
                {/* FIX BUG 2: Language toggle */}
                <button
                  onClick={toggleLanguage}
                  style={{
                    padding: isTablet ? '8px' : '10px 16px',
                    background: currentTheme.bgCard,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: 8,
                    color: currentTheme.textSecondary,
                    cursor: 'pointer',
                    fontSize: isTablet ? 14 : 12,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    width: isTablet ? '32px' : 'auto',
                    height: isTablet ? '32px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Language toggle"
                >
                  {isTablet ? '🌐' : (language === 'FR' ? '🌐 English' : '🌐 Français')}
                </button>
              </>
            )}
            {/* FIX BUG 3: Logout button */}
            <button
              onClick={handleLogout}
              style={{
                padding: isTablet ? '8px' : '10px 16px',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
                border: `1px solid rgba(239,68,68,0.2)`,
                borderRadius: 8,
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: isTablet ? 14 : 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                width: isTablet ? '32px' : 'auto',
                height: isTablet ? '32px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isTablet ? '🚪' : `🚪 ${t('logout')}`}
            </button>
          </div>
        )}
      </aside>

      {/* Main Content - Premium Layout */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginLeft: isMobile ? 0 : isSmallScreen ? 0 : isTablet ? 120 : 320,
        marginTop: isMobile ? 48 : 0,
        paddingBottom: isMobile ? 70 : 32,
        padding: isMobile ? '16px 16px 70px 16px' : isTablet ? '32px 24px' : '40px 48px',
        background: theme === 'light' ? '#f8fafc' : '#020617',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isMobile ? 16 : 24, fontSize: isMobile ? 11 : 13, color: currentTheme.textMuted }}>
          <span style={{ cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', color: currentTheme.textMuted }}>Admin</span>
          <span>/</span>
          <span style={{ fontWeight: 500, color: currentTheme.accentGreen }}>{navItems.find(item => item.id === activeTab)?.label}</span>
        </div>

        {/* Content */}
        {renderContent()}
      </main>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}
        onClick={() => setShowAddUserForm(false)}
        >
          <div style={{
            background: currentTheme.bgCard,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: 20,
            padding: 32,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            backdropFilter: 'blur(16px)',
            boxShadow: theme === 'light' ? '0 20px 60px rgba(0,0,0,0.15)' : '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: currentTheme.textPrimary }}>
              ➕ {t('new_user')}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('full_name')}</label>
              <input
                type="text"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder={t('enter_name')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('email')}</label>
              <input
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder={t('enter_email')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('password')}</label>
              <input
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder={t('enter_password')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('status')}</label>
              <select
                value={newUserData.status}
                onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="pending">{t('pending')}</option>
                <option value="approved">{t('approved')}</option>
                <option value="rejected">{t('rejected')}</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>{t('role')}</label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="user">{language === 'FR' ? 'Utilisateur' : 'User'}</option>
                <option value="admin">{language === 'FR' ? 'Administrateur' : 'Admin'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleAddUser}
                disabled={addUserLoading}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: theme === 'light' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00d4a0, #0099ff)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: addUserLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: addUserLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(16,185,129,0.2)' : '0 4px 12px rgba(0,212,160,0.2)'
                }}
              >
                {addUserLoading ? '⏳ ' + t('create') : '➕ ' + t('create')}
              </button>
              <button
                onClick={() => setShowAddUserForm(false)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: theme === 'light' ? 'rgba(107,114,128,0.1)' : 'transparent',
                  border: `1px solid ${theme === 'light' ? 'rgba(107,114,128,0.3)' : currentTheme.border}`,
                  borderRadius: 8,
                  color: theme === 'light' ? '#374151' : currentTheme.textSecondary,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}
        onClick={() => setEditingUser(null)}
        >
          <div style={{
            background: currentTheme.bgCard,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: 20,
            padding: 32,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            backdropFilter: 'blur(16px)',
            boxShadow: theme === 'light' ? '0 20px 60px rgba(0,0,0,0.15)' : '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: currentTheme.textPrimary }}>
              ✏️ Modifier l'utilisateur
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>Nom complet</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>Statut</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: currentTheme.textMuted, marginBottom: 8 }}>Rôle</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: currentTheme.bgMain,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: 8,
                  color: currentTheme.textPrimary,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: theme === 'light' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00d4a0, #0099ff)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: editLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(16,185,129,0.2)' : '0 4px 12px rgba(0,212,160,0.2)'
                }}
              >
                {editLoading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
              </button>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: theme === 'light' ? 'rgba(107,114,128,0.1)' : 'transparent',
                  border: `1px solid ${theme === 'light' ? 'rgba(107,114,128,0.3)' : currentTheme.border}`,
                  borderRadius: 8,
                  color: theme === 'light' ? '#374151' : currentTheme.textSecondary,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? 90 : 20,
          right: 20,
          background: toast.type === 'success' ? 'linear-gradient(135deg, #00d4a0, #00b884)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: toast.type === 'success' ? currentTheme.bgMain : 'white',
          padding: '16px 24px',
          borderRadius: 8,
          fontWeight: 700,
          zIndex: 3000,
          animation: 'slideUp 0.3s ease',
          transition: 'all 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
