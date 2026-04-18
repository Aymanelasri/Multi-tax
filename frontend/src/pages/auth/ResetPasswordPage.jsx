import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext'
import AuthNavbar from '../../components/AuthNavbar'
import api from '../../lib/api'

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { lang } = useLang()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  // Set page title
  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Nouveau mot de passe — SIMPL-TVA' 
      : 'New Password — SIMPL-TVA'
  }, [lang])

  // Redirect if no token or email
  useEffect(() => {
    if (!token || !email) {
      navigate('/forgot-password', { replace: true })
    }
  }, [token, email, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      setError(lang === 'FR' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError(lang === 'FR' ? 'Le mot de passe doit contenir au moins 8 caractères' : 'Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const response = await api.resetPassword(token, email, formData.password, formData.password_confirmation)
      
      if (response.status === 'success') {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    } catch (err) {
      setError(
        lang === 'FR'
          ? 'Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.'
          : 'Invalid or expired reset link. Please request a new reset link.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const successStyles = {
      authLayout: {
        minHeight: '100vh',
        background: '#0a0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: '76px'
      },
      authCenter: {
        width: '100%',
        maxWidth: '480px'
      },
      successCard: {
        background: 'rgba(20, 29, 46, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center'
      },
      successIcon: {
        fontSize: '64px',
        marginBottom: '24px'
      },
      successTitle: {
        fontSize: '28px',
        fontWeight: 900,
        color: 'white',
        margin: '0 0 16px 0'
      },
      successMessage: {
        color: '#94a3b8',
        fontSize: '14px',
        lineHeight: 1.6,
        margin: '0 0 32px 0'
      },
      loadingDots: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px'
      },
      dot: {
        width: '8px',
        height: '8px',
        background: '#00d4a0',
        borderRadius: '50%',
        animation: 'bounce 1.4s infinite ease-in-out both'
      }
    }

    return (
      <>
        <AuthNavbar currentPage="reset" />
        <div style={successStyles.authLayout}>
          <div style={successStyles.authCenter}>
            <div style={successStyles.successCard}>
              <div style={successStyles.successIcon}>✅</div>
              <h1 style={successStyles.successTitle}>
                {lang === 'FR' ? 'Mot de passe modifié !' : 'Password changed!'}
              </h1>
              <p style={successStyles.successMessage}>
                {lang === 'FR'
                  ? 'Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.'
                  : 'Your password has been changed successfully. You will be redirected to the login page.'
                }
              </p>
              <div style={successStyles.loadingDots}>
                <div style={{...successStyles.dot, animationDelay: '-0.32s'}}></div>
                <div style={{...successStyles.dot, animationDelay: '-0.16s'}}></div>
                <div style={{...successStyles.dot, animationDelay: '0s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!token || !email) {
    return null // Will redirect
  }

  const formStyles = {
    authLayout: {
      minHeight: '100vh',
      background: '#0a0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      paddingTop: '76px',
      fontFamily: 'Sora, system-ui, sans-serif'
    },
    authCenter: {
      width: '100%',
      maxWidth: '480px'
    },
    formWrapper: {
      background: 'rgba(20, 29, 46, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '20px',
      padding: '50px 45px'
    },
    formHeader: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    resetIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    formTitle: {
      fontSize: '26px',
      fontWeight: 900,
      color: 'white',
      margin: '0 0 6px 0'
    },
    formSubtitle: {
      fontSize: '13px',
      color: '#64748b',
      margin: 0
    },
    errorBanner: {
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '13px',
      color: '#fca5a5',
      marginBottom: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    authForm: {
      marginBottom: '20px'
    },
    fieldGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '11px',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '6px'
    },
    passwordField: {
      position: 'relative'
    },
    input: {
      width: '100%',
      height: '48px',
      background: '#141d2e',
      border: '1.5px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '14px',
      padding: '0 50px 0 14px',
      fontFamily: 'Sora, sans-serif',
      transition: 'border 0.2s, box-shadow 0.2s',
      outline: 'none',
      boxSizing: 'border-box'
    },
    passwordToggle: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    submitButton: {
      width: '100%',
      height: '48px',
      background: '#00d4a0',
      color: '#0a0f1a',
      fontWeight: 800,
      fontSize: '15px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingDots: {
      display: 'flex',
      gap: '4px'
    },
    dot: {
      width: '4px',
      height: '4px',
      background: 'white',
      borderRadius: '50%',
      animation: 'bounce 1.4s infinite ease-in-out both'
    }
  }

  return (
    <>
      <AuthNavbar currentPage="reset" />
      <div style={formStyles.authLayout}>
        <div style={formStyles.authCenter}>
          <div style={formStyles.formWrapper}>
            {/* Form Header */}
            <div style={formStyles.formHeader}>
              <div style={formStyles.resetIcon}>🔑</div>
              <h1 style={formStyles.formTitle}>
                {lang === 'FR' ? 'Nouveau mot de passe' : 'New password'}
              </h1>
              <p style={formStyles.formSubtitle}>
                {lang === 'FR'
                  ? 'Choisissez un mot de passe sécurisé'
                  : 'Choose a secure password'
                }
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={formStyles.errorBanner}>
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form style={formStyles.authForm} onSubmit={handleSubmit}>
              <div style={formStyles.fieldGroup}>
                <label htmlFor="password" style={formStyles.label}>
                  {lang === 'FR' ? 'NOUVEAU MOT DE PASSE' : 'NEW PASSWORD'}
                </label>
                <div style={formStyles.passwordField}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoFocus
                    minLength={8}
                    style={formStyles.input}
                  />
                  <button
                    type="button"
                    style={formStyles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      {showPassword ? (
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div style={formStyles.fieldGroup}>
                <label htmlFor="password_confirmation" style={formStyles.label}>
                  {lang === 'FR' ? 'CONFIRMER LE MOT DE PASSE' : 'CONFIRM PASSWORD'}
                </label>
                <div style={formStyles.passwordField}>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    minLength={8}
                    style={formStyles.input}
                  />
                  <button
                    type="button"
                    style={formStyles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      {showConfirmPassword ? (
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...formStyles.submitButton,
                  opacity: loading ? 0.8 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? (
                  <div style={formStyles.loadingDots}>
                    <div style={{...formStyles.dot, animationDelay: '-0.32s'}}></div>
                    <div style={{...formStyles.dot, animationDelay: '-0.16s'}}></div>
                    <div style={{...formStyles.dot, animationDelay: '0s'}}></div>
                  </div>
                ) : (
                  lang === 'FR' ? 'Modifier le mot de passe →' : 'Change password →'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}