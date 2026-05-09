import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import AuthNavbar from '../../components/AuthNavbar'
import '../../styles/Auth.css'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, isAuthenticated } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Connexion — SIMPL-TVA' 
      : 'Sign In — SIMPL-TVA'
  }, [lang])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (location.state?.rejectionMessage) {
      setError('rejected')
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password, formData.remember)
      
      if (result.success) {
         if (result.user.role === 'admin') {
            navigate('/admin', { replace: true })
          } else if (result.user.status === 'pending') {
          navigate('/pending', { replace: true })
        } else if (result.user.status === 'approved') {
          const from = location.state?.from?.pathname || '/societes'
          navigate(from, { replace: true })
        } else {
          setError('invalid_credentials')
        }
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('invalid_credentials')
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (errorType) => {
    switch (errorType) {
      case 'email_not_verified':
        return lang === 'FR' 
          ? 'Vérifiez votre email. Un lien de confirmation vous a été envoyé.'
          : 'Please verify your email. A confirmation link was sent to you.'
      case 'rejected':
        return lang === 'FR'
          ? 'Votre demande a été refusée. Contactez l\'administrateur.'
          : 'Your request was rejected. Please contact the administrator.'
      case 'invalid_credentials':
        return lang === 'FR'
          ? 'Email ou mot de passe incorrect.'
          : 'Incorrect email or password.'
      default:
        return errorType
    }
  }

  return (
    <>
      <AuthNavbar currentPage="login" />
      <div className="auth-layout">
        <div className="auth-left">
          <img 
            src="/images/image 1.jpg" 
            alt="Login background"
            className="panel-image"
          />
        </div>

        <div className="auth-right">
          <div className="form-wrapper">
            <div className="form-header">
              <h1 className="form-title">
                {lang === 'FR' ? 'Bon retour !' : 'Welcome back!'}
              </h1>
              <p className="form-subtitle">
                {lang === 'FR' 
                  ? 'Accédez à votre espace privé'
                  : 'Access your private workspace'
                }
              </p>
            </div>

            {error && (
              <div className="error-banner">
                <span>⚠</span>
                <span>{getErrorMessage(error)}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="email">EMAIL</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>

              <div className="field-group">
                <label htmlFor="password">
                  {lang === 'FR' ? 'MOT DE PASSE' : 'PASSWORD'}
                </label>
                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
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

              <div className="form-options">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <label htmlFor="remember" className="checkbox-label">
                    <span className="custom-checkbox">
                      {formData.remember && <span className="checkmark">✓</span>}
                    </span>
                    <span className="checkbox-text">
                      {lang === 'FR' ? 'Se souvenir de moi' : 'Remember me'}
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  {lang === 'FR' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                </button>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                ) : (
                  lang === 'FR' ? 'Se connecter →' : 'Sign in →'
                )}
              </button>
            </form>

            <div className="bottom-link">
              <span className="link-text">
                {lang === 'FR' ? 'Pas encore de compte ? ' : 'Don\'t have an account? '}
              </span>
              <button
                className="link-button"
                onClick={() => navigate('/register')}
              >
                {lang === 'FR' ? 'Créer un compte →' : 'Create account →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
