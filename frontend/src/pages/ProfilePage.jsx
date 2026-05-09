import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navigation from '../components/Navigation'
import api from '../lib/api'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('info')
  const [isProfileLocked, setIsProfileLocked] = useState(false)
  const [remainingDays, setRemainingDays] = useState(0)
  const [editsRemaining, setEditsRemaining] = useState(2)

  const { user, refreshUser } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()

  // Set page title
  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Mon Profil — SIMPL-TVA' 
      : 'My Profile — SIMPL-TVA'
  }, [lang])

  // Load user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', '']
      setFormData({
        firstname: nameParts[0] || '',
        lastname: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // SECURITY: Admins have no edit limits
      if (user.role === 'admin') {
        setIsProfileLocked(false)
        setEditsRemaining(999) // Unlimited for admins
        return
      }

      // SECURITY: Use user-specific localStorage keys for regular users
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id
      
      // Check profile edit lock (2 edits max, 15 days lock)
      const editCount = parseInt(localStorage.getItem(`profileEditCount_${userId}`) || '0')
      const lastEdit = localStorage.getItem(`profileLastEdit_${userId}`)
      
      if (editCount >= 2 && lastEdit) {
        const lastEditDate = new Date(lastEdit)
        const now = new Date()
        const daysSinceEdit = Math.floor((now - lastEditDate) / (1000 * 60 * 60 * 24))
        const daysRemaining = 15 - daysSinceEdit
        
        if (daysRemaining > 0) {
          setIsProfileLocked(true)
          setRemainingDays(daysRemaining)
          setEditsRemaining(0)
        } else {
          localStorage.setItem(`profileEditCount_${userId}`, '0')
          localStorage.removeItem(`profileLastEdit_${userId}`)
          setIsProfileLocked(false)
          setEditsRemaining(2)
        }
      } else {
        setEditsRemaining(2 - editCount)
      }
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateInfo = () => {
    const newErrors = {}
    
    if (!formData.firstname.trim()) {
      newErrors.firstname = lang === 'FR' ? 'Le prénom est requis' : 'First name is required'
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = lang === 'FR' ? 'Le nom est requis' : 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = lang === 'FR' ? 'L\'email est requis' : 'Email is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = lang === 'FR' ? 'Le numéro de téléphone est requis' : 'Phone number is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = lang === 'FR' ? 'Mot de passe actuel requis' : 'Current password required'
    }
    if (!formData.newPassword) {
      newErrors.newPassword = lang === 'FR' ? 'Nouveau mot de passe requis' : 'New password required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = lang === 'FR' ? 'Minimum 8 caractères' : 'Minimum 8 characters'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = lang === 'FR' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    if (!validateInfo()) return
    
    if (isProfileLocked) {
      setErrors({ general: lang === 'FR' 
        ? `Profil verrouillé pour ${remainingDays} jour(s) restant(s)` 
        : `Profile locked for ${remainingDays} day(s) remaining` })
      return
    }
    
    setLoading(true)
    setSuccess('')
    setErrors({})
    
    try {
      await api.updateProfile({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone
      })
      
      // SECURITY: Only track edits for regular users, not admins
      if (user?.role !== 'admin') {
        const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id
        
        const currentCount = parseInt(localStorage.getItem(`profileEditCount_${userId}`) || '0')
        const newCount = currentCount + 1
        localStorage.setItem(`profileEditCount_${userId}`, newCount.toString())
        localStorage.setItem(`profileLastEdit_${userId}`, new Date().toISOString())
        
        const remaining = 2 - newCount
        setEditsRemaining(remaining)
        
        if (newCount >= 2) {
          setIsProfileLocked(true)
          setRemainingDays(15)
        }
      }
      
      setSuccess(lang === 'FR' ? 'Profil mis à jour avec succès' : 'Profile updated successfully')
      await refreshUser()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setErrors({ general: error.message || (lang === 'FR' ? 'Erreur lors de la mise à jour' : 'Error updating profile') })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!validatePassword()) return
    
    setLoading(true)
    setSuccess('')
    
    try {
      await api.updatePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      )
      
      setSuccess(lang === 'FR' ? 'Mot de passe mis à jour avec succès' : 'Password updated successfully')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      setErrors({})
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      const errorMessage = error.message || ''
      
      if (errorMessage.includes('actuel est incorrect') || errorMessage.includes('current password is incorrect')) {
        setErrors({
          currentPassword: lang === 'FR' 
            ? 'Le mot de passe actuel est incorrect.' 
            : 'Current password is incorrect.'
        })
      } else if (errorMessage.includes('doit être différent') || errorMessage.includes('must be different')) {
        setErrors({
          newPassword: lang === 'FR'
            ? 'Le nouveau mot de passe doit être différent de l\'ancien.'
            : 'New password must be different from the old one.'
        })
      } else if (errorMessage.includes('confirmation') || errorMessage.includes('ne correspond pas')) {
        setErrors({
          confirmPassword: lang === 'FR' 
            ? 'La confirmation du mot de passe ne correspond pas.' 
            : 'Password confirmation does not match.'
        })
      } else {
        setErrors({
          general: errorMessage || (lang === 'FR' 
            ? 'Erreur lors de la mise à jour du mot de passe' 
            : 'Error updating password')
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="profile-layout">
        <div className="profile-container">
          {/* Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {user?.name || `${formData.firstname} ${formData.lastname}`.trim() || 'Utilisateur'}
              </h1>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-status">
                {user?.status === 'approved' && (
                  <span className="status-badge approved">
                    ✓ {lang === 'FR' ? 'Compte approuvé' : 'Account approved'}
                  </span>
                )}
                {user?.status === 'pending' && (
                  <span className="status-badge pending">
                    ⏳ {lang === 'FR' ? 'En attente d\'approbation' : 'Pending approval'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              {lang === 'FR' ? 'Informations personnelles' : 'Personal Information'}
            </button>
            <button 
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              {lang === 'FR' ? 'Mot de passe' : 'Password'}
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="success-banner">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="error-banner">
              <span>⚠</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="tab-content">
              {isProfileLocked && (
                <div className="lock-banner">
                  <span>🔒</span>
                  <span>
                    {lang === 'FR' 
                      ? `Profil verrouillé pour ${remainingDays} jour(s) restant(s)` 
                      : `Profile locked for ${remainingDays} day(s) remaining`}
                  </span>
                </div>
              )}
              {!isProfileLocked && editsRemaining === 1 && (
                <div className="warning-banner">
                  <span>⚠️</span>
                  <span>
                    {lang === 'FR' 
                      ? 'Il vous reste 1 modification' 
                      : 'You have 1 edit remaining'}
                  </span>
                </div>
              )}
              <form onSubmit={handleUpdateInfo}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstname">
                      {lang === 'FR' ? 'PRÉNOM' : 'FIRST NAME'}
                    </label>
                    <input
                      id="firstname"
                      name="firstname"
                      type="text"
                      value={formData.firstname}
                      onChange={handleChange}
                      className={errors.firstname ? 'error' : ''}
                      disabled={isProfileLocked}
                      required
                    />
                    {errors.firstname && <span className="error-text">{errors.firstname}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastname">
                      {lang === 'FR' ? 'NOM' : 'LAST NAME'}
                    </label>
                    <input
                      id="lastname"
                      name="lastname"
                      type="text"
                      value={formData.lastname}
                      onChange={handleChange}
                      className={errors.lastname ? 'error' : ''}
                      disabled={isProfileLocked}
                      required
                    />
                    {errors.lastname && <span className="error-text">{errors.lastname}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">EMAIL</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    disabled={true}
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    required
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    {lang === 'FR' ? 'TÉLÉPHONE' : 'PHONE'}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="+212 6XX XXX XXX"
                    disabled={isProfileLocked}
                    required
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <button type="submit" className="submit-button" disabled={loading || isProfileLocked}>
                  {loading ? (
                    <div className="loading-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  ) : (
                    lang === 'FR' ? 'Mettre à jour' : 'Update'
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="tab-content">
              <form onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label htmlFor="currentPassword">
                    {lang === 'FR' ? 'MOT DE PASSE ACTUEL' : 'CURRENT PASSWORD'}
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={errors.currentPassword ? 'error' : ''}
                    required
                  />
                  {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    {lang === 'FR' ? 'NOUVEAU MOT DE PASSE' : 'NEW PASSWORD'}
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={errors.newPassword ? 'error' : ''}
                    minLength={8}
                    required
                  />
                  {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    {lang === 'FR' ? 'CONFIRMER LE MOT DE PASSE' : 'CONFIRM PASSWORD'}
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    minLength={8}
                    required
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <div className="loading-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  ) : (
                    lang === 'FR' ? 'Changer le mot de passe' : 'Change Password'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <style jsx={true}>{`
          .profile-layout {
            min-height: 100vh;
            background: var(--page-bg);
            padding-top: 56px;
            font-family: 'Sora', system-ui, sans-serif;
            transition: background-color 0.3s ease;
          }

          .profile-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .profile-header {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-bottom: 40px;
            padding: 32px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 20px;
            transition: all 0.3s ease;
          }
          
          :global(:root.light) .profile-header {
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          }

          .profile-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #00d4a0;
            color: #0a0f1a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 900;
            flex-shrink: 0;
          }

          .profile-info {
            flex: 1;
          }

          .profile-name {
            font-size: 28px;
            font-weight: 900;
            color: var(--text-primary);
            margin: 0 0 8px 0;
            transition: color 0.3s ease;
          }

          .profile-email {
            font-size: 16px;
            color: var(--text-muted);
            margin: 0 0 12px 0;
            transition: color 0.3s ease;
          }

          .profile-status {
            display: flex;
            gap: 8px;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .status-badge.approved {
            background: rgba(0, 212, 160, 0.15);
            color: #00d4a0;
            border: 1px solid rgba(0, 212, 160, 0.3);
          }

          .status-badge.pending {
            background: rgba(251, 191, 36, 0.15);
            color: #fcd34d;
            border: 1px solid rgba(251, 191, 36, 0.3);
          }
          
          :global(:root.light) .status-badge.pending {
            color: #d97706;
          }

          .profile-tabs {
            display: flex;
            gap: 4px;
            margin-bottom: 32px;
            background: var(--input-bg);
            border-radius: 12px;
            padding: 4px;
            transition: background-color 0.3s ease;
          }

          .tab {
            flex: 1;
            padding: 12px 20px;
            background: transparent;
            border: none;
            border-radius: 8px;
            color: var(--text-muted);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .tab.active {
            background: #00d4a0;
            color: #0a0f1a;
          }

          .tab:hover:not(.active) {
            color: var(--text-primary);
            background: var(--card-bg);
          }

          .success-banner {
            background: rgba(0, 212, 160, 0.08);
            border: 1px solid rgba(0, 212, 160, 0.25);
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            color: #00d4a0;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .error-banner {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.25);
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            color: #fca5a5;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          :global(:root.light) .error-banner {
            color: #ef4444;
          }

          .lock-banner, .warning-banner {
            background: rgba(251, 191, 36, 0.08);
            border: 1px solid rgba(251, 191, 36, 0.25);
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 14px;
            color: #fcd34d;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          :global(:root.light) .lock-banner,
          :global(:root.light) .warning-banner {
            color: #d97706;
          }

          .tab-content {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 32px;
            transition: all 0.3s ease;
          }
          
          :global(:root.light) .tab-content {
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
            transition: color 0.3s ease;
          }

          .form-group input {
            width: 100%;
            height: 48px;
            background: var(--input-bg);
            border: 1.5px solid var(--border-subtle);
            border-radius: 10px;
            color: var(--text-primary);
            font-size: 14px;
            padding: 0 14px;
            font-family: 'Sora', sans-serif;
            transition: all 0.3s ease;
            outline: none;
          }
          
          :global(:root.light) .form-group input {
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }

          .form-group input:hover:not(:focus):not(:disabled) {
            border-color: rgba(0,212,160,0.3);
          }
          
          :global(:root.light) .form-group input:hover:not(:focus):not(:disabled) {
            background: #ffffff;
            border-color: rgba(0,212,160,0.4);
          }

          .form-group input:focus {
            border-color: #00d4a0;
            box-shadow: 0 0 0 3px rgba(0, 212, 160, 0.12);
            background: var(--input-bg);
          }
          
          :global(:root.light) .form-group input:focus {
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(0, 212, 160, 0.15);
          }

          .form-group input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: var(--dark-bg);
          }

          .form-group input.error {
            border-color: #ef4444;
          }

          .error-text {
            color: #fca5a5;
            font-size: 11px;
            margin-top: 4px;
            display: block;
          }
          
          :global(:root.light) .error-text {
            color: #ef4444;
          }

          .submit-button {
            width: 100%;
            height: 48px;
            background: #00d4a0;
            color: #0a0f1a;
            font-weight: 800;
            font-size: 15px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 24px;
          }

          .submit-button:hover:not(:disabled) {
            background: #00b389;
            transform: translateY(-1px);
          }

          .submit-button:disabled {
            opacity: 0.8;
            cursor: not-allowed;
            transform: none;
          }

          .loading-dots {
            display: flex;
            gap: 4px;
          }

          .dot {
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
          }

          .dot:nth-child(1) { animation-delay: -0.32s; }
          .dot:nth-child(2) { animation-delay: -0.16s; }
          .dot:nth-child(3) { animation-delay: 0s; }

          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }

          @media (max-width: 768px) {
            .profile-container {
              padding: 20px 16px;
            }

            .profile-header {
              flex-direction: column;
              text-align: center;
              gap: 16px;
            }

            .form-grid {
              grid-template-columns: 1fr;
              gap: 0;
            }

            .tab-content {
              padding: 24px 20px;
            }
          }
        `}</style>
      </div>
    </>
  )
}