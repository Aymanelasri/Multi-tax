import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import AuthNavbar from '../../components/AuthNavbar'

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

  const redirectPath = searchParams.get('redirect') || '/'

  // Set page title
  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Connexion — SIMPL-TVA' 
      : 'Sign In — SIMPL-TVA'
  }, [lang])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectPath])

  // Show rejection message if coming from rejected state
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
        // Redirect admin users to admin dashboard
        if (result.user.role === 'admin') {
          navigate('/admin', { replace: true })
        } else if (result.user.status === 'approved') {
          navigate(redirectPath, { replace: true })
        } else if (result.user.status === 'pending') {
          navigate('/pending', { state: { user: result.user }, replace: true })
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
      <div className="auth-layout p-0">
        {/* Left Column - Image Only */}
        <div className="auth-left">
          <img 
            src="/images/image 1.jpg" 
            alt="Login background"
            className="panel-image"
          />
        </div>

        {/* Right Column - Form */}
        <div className="auth-right">
          <div className="form-wrapper">
            {/* Form Header */}
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

            {/* Error Banner */}
            {error && (
              <div className="error-banner">
                <span>⚠</span>
                <span>{getErrorMessage(error)}</span>
              </div>
            )}

            {/* Form */}
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

            {/* Register Link */}
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

        <style jsx>{`
          .auth-layout {
            display: grid;
            grid-template-columns: 45% 55%;
            min-height: 100vh;
            padding-top: 56px;
            font-family: 'Sora', system-ui, sans-serif;
            animation: slideIn 0.2s ease-out;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
          }

          /* Left Column - Image Only */
          .auth-left {
            position: relative;
            overflow: hidden;
            border-radius: 0 20px 20px 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .panel-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.3s ease;
            filter: brightness(0.9) contrast(1.1) saturate(1.2);
          }

          .panel-image:hover {
            transform: scale(1.02);
          }

          /* Right Column */
          .auth-right {
            background: #0a0f1a;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px;
            overflow-y: auto;
          }

          .form-wrapper {
            width: 100%;
            max-width: 600px;
            background: rgba(20, 29, 46, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            padding: 60px 55px;
          }

          .form-header {
            margin-bottom: 32px;
          }

          .form-title {
            font-size: 26px;
            font-weight: 900;
            color: white;
            margin: 0 0 6px 0;
          }

          .form-subtitle {
            font-size: 13px;
            color: #64748b;
            margin: 0;
          }

          .error-banner {
            background: rgba(239,68,68,0.08);
            border: 1px solid rgba(239,68,68,0.25);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 13px;
            color: #fca5a5;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .auth-form {
            margin-bottom: 20px;
          }

          .field-group {
            margin-bottom: 18px;
          }

          .field-group label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
          }

          .field-group input {
            width: 100%;
            height: 48px;
            background: #141d2e;
            border: 1.5px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            color: white;
            font-size: 14px;
            padding: 0 14px;
            font-family: 'Sora', sans-serif;
            transition: border 0.2s, box-shadow 0.2s;
            outline: none;
          }

          .field-group input:hover:not(:focus) {
            border-color: rgba(255, 255, 255, 0.15);
          }

          .field-group input:focus {
            border-color: #00d4a0;
            box-shadow: 0 0 0 3px rgba(0,212,160,0.12);
          }

          .field-group input::placeholder {
            color: #334155;
          }

          .password-field {
            position: relative;
          }

          .password-toggle {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #475569;
            cursor: pointer;
            transition: color 0.2s;
          }

          .password-toggle:hover {
            color: #94a3b8;
          }

          .form-options {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .checkbox-input {
            display: none;
          }

          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #64748b;
            cursor: pointer;
            user-select: none;
          }

          .custom-checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #475569;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            background: transparent;
          }

          .checkbox-input:checked + .checkbox-label .custom-checkbox {
            background: #00d4a0;
            border-color: #00d4a0;
          }

          .checkmark {
            color: #0a0f1a;
            font-size: 12px;
            font-weight: bold;
          }

          .checkbox-text {
            user-select: none;
          }

          .forgot-link {
            font-size: 12px;
            color: #00d4a0;
            background: none;
            border: none;
            cursor: pointer;
            text-decoration: none;
          }

          .forgot-link:hover {
            text-decoration: underline;
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
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .submit-button:hover:not(:disabled) {
            background: #00b389;
            transform: translateY(-1px);
          }

          .submit-button:active:not(:disabled) {
            transform: translateY(0) scale(0.99);
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

          .bottom-link {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            margin-top: 8px;
          }

          .link-text {
            color: #64748b;
            font-size: 13px;
          }

          .link-button {
            color: #00d4a0;
            font-weight: 700;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 13px;
          }

          .link-button:hover {
            text-decoration: underline;
          }

          /* Tablet */
          @media (max-width: 900px) {
            .auth-layout {
              grid-template-columns: 1fr;
            }

            .auth-left {
              display: none;
            }

            .auth-right {
              padding: 40px 32px;
            }

            .form-wrapper {
              max-width: 480px;
            }
          }

          /* Mobile */
          @media (max-width: 599px) {
            .auth-right {
              padding: 28px 20px;
            }

            .form-wrapper {
              max-width: 100%;
            }

            .form-title {
              font-size: 22px;
            }

            .form-subtitle {
              font-size: 13px;
            }

            .field-group input {
              height: 52px;
              font-size: 16px;
              border-radius: 12px;
            }

            .submit-button {
              height: 52px;
              font-size: 16px;
              border-radius: 12px;
            }

            .password-toggle svg {
              width: 22px;
              height: 22px;
            }

            .checkbox-label input {
              width: 18px;
              height: 18px;
            }

            .checkbox-label span {
              font-size: 13px;
            }

            .bottom-link {
              font-size: 14px;
            }
          }

          /* Small Mobile */
          @media (max-width: 380px) {
            .auth-right {
              padding: 20px 16px;
            }

            .form-title {
              font-size: 20px;
            }

            .field-group input {
              height: 50px;
            }

            .submit-button {
              height: 50px;
            }
          }
        `}</style>
      </div>
    </>
  )
}