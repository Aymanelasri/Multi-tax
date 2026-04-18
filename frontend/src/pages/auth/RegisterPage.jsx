import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import AuthNavbar from '../../components/AuthNavbar'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    terms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { register, isAuthenticated } = useAuth()
  const { t, lang } = useLang()
  const navigate = useNavigate()

  // Set page title
  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Inscription — SIMPL-TVA' 
      : 'Create Account — SIMPL-TVA'
  }, [lang])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/generateur', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return ''
    const labels = {
      FR: ['Faible', 'Moyen', 'Bon', 'Fort'],
      EN: ['Weak', 'Fair', 'Good', 'Strong']
    }
    return labels[lang === 'FR' ? 'FR' : 'EN'][passwordStrength - 1]
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return '#ef4444'
      case 2: return '#f59e0b'
      case 3: return '#3b82f6'
      case 4: return '#00d4a0'
      default: return '#374151'
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    // Check password confirmation match
    if (name === 'password_confirmation' || (name === 'password' && formData.password_confirmation)) {
      const password = name === 'password' ? value : formData.password
      const confirmation = name === 'password_confirmation' ? value : formData.password_confirmation
      
      if (confirmation && password !== confirmation) {
        setErrors(prev => ({
          ...prev,
          password_confirmation: lang === 'FR' 
            ? 'Les mots de passe ne correspondent pas'
            : 'Passwords do not match'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          password_confirmation: ''
        }))
      }
    }
  }

  const validateForm = () => {
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
    if (!formData.password) {
      newErrors.password = lang === 'FR' ? 'Le mot de passe est requis' : 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = lang === 'FR' ? 'Minimum 6 caractères' : 'Minimum 6 characters'
    }
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = lang === 'FR' 
        ? 'Les mots de passe ne correspondent pas'
        : 'Passwords do not match'
    }
    if (!formData.terms) {
      newErrors.terms = lang === 'FR' 
        ? 'Vous devez accepter les conditions'
        : 'You must accept the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await register(formData)
      
      if (result.success) {
        navigate('/verify-email', { 
          state: { email: formData.email },
          replace: true 
        })
      } else {
        if (result.error === 'email_exists') {
          setErrors({ 
            email: lang === 'FR' 
              ? 'Cet email est déjà utilisé.'
              : 'This email is already taken.'
          })
        } else {
          setErrors({ general: result.error })
        }
      }
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return formData.firstname.trim() && 
           formData.lastname.trim() && 
           formData.email.trim() && 
           formData.phone.trim() &&
           formData.password && 
           formData.password === formData.password_confirmation && 
           formData.terms
  }

  const passwordsMatch = formData.password && formData.password_confirmation && 
                         formData.password === formData.password_confirmation

  return (
    <>
      <AuthNavbar currentPage="register" />
      <div className="auth-layout p-0">
        {/* Left Column - Image Only */}
        <div className="auth-left">
          <img 
            src="https://images.unsplash.com/photo-1554224154-26032fced8bd?w=1600&h=1200&q=90&fit=crop" 
            alt="Tax registration background"
            className="panel-image"
          />
        </div>

        {/* Right Column - Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            {/* Header */}
            <div className="auth-header">
              <h1 className="auth-title">{t('auth_register_title')}</h1>
              <p className="auth-subtitle">{t('auth_register_sub')}</p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="auth-banner auth-banner-error">
                <span>{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Name Row */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="firstname">{t('auth_firstname')}</label>
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    placeholder={lang === 'FR' ? 'Mohammed' : 'John'}
                    value={formData.firstname}
                    onChange={handleChange}
                    className={errors.firstname ? 'error' : ''}
                    required
                    autoFocus
                  />
                  {errors.firstname && <span className="error-text">{errors.firstname}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastname">{t('auth_lastname')}</label>
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    placeholder={lang === 'FR' ? 'Benali' : 'Smith'}
                    value={formData.lastname}
                    onChange={handleChange}
                    className={errors.lastname ? 'error' : ''}
                    required
                  />
                  {errors.lastname && <span className="error-text">{errors.lastname}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">{t('auth_email')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth_email_placeholder')}
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">{t('auth_phone')}</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  required
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">{t('auth_password')}</label>
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁' : '👁🗨'}
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      {[1, 2, 3, 4].map(segment => (
                        <div 
                          key={segment}
                          className="strength-segment"
                          style={{ 
                            backgroundColor: segment <= passwordStrength 
                              ? getPasswordStrengthColor() 
                              : '#374151'
                          }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                )}
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="password_confirmation">
                  {lang === 'FR' ? 'Confirmer le mot de passe' : 'Confirm password'}
                </label>
                <div className="password-input">
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={errors.password_confirmation ? 'error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁' : '👁🗨'}
                  </button>
                  {formData.password_confirmation && (
                    <div className="password-match-icon">
                      {passwordsMatch ? (
                        <span className="match-success">✓</span>
                      ) : (
                        <span className="match-error">✗</span>
                      )}
                    </div>
                  )}
                </div>
                {errors.password_confirmation && (
                  <span className="error-text">{errors.password_confirmation}</span>
                )}
              </div>

              {/* Terms */}
              <div className="terms-checkbox-wrapper">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className={`checkbox-input ${errors.terms ? 'error' : ''}`}
                    required
                  />
                  <label htmlFor="terms" className="checkbox-label">
                    <span className="custom-checkbox">
                      {formData.terms && <span className="checkmark">✓</span>}
                    </span>
                    <span className="checkbox-text">
                      {lang === 'FR' ? (
                        <>J'accepte les <a href="/terms" target="_blank" className="terms-link">conditions d'utilisation</a> et la <a href="/privacy" target="_blank" className="terms-link">politique de confidentialité</a></>
                      ) : (
                        <>I accept the <a href="/terms" target="_blank" className="terms-link">terms and conditions</a> and <a href="/privacy" target="_blank" className="terms-link">privacy policy</a></>
                      )}
                    </span>
                  </label>
                </div>
                {errors.terms && <span className="error-text">{errors.terms}</span>}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading || !isFormValid()}
              >
                {loading ? t('auth_loading') : (
                  lang === 'FR' ? 'Créer mon compte →' : 'Create my account →'
                )}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="auth-footer">
              <p>
                {t('auth_have_account')}{' '}
                <Link to="/login" className="auth-link">
                  {lang === 'FR' ? 'Se connecter' : 'Sign in'}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <style jsx={true}>{`
          .auth-layout {
            display: flex;
            min-height: 100vh;
            padding-top: 56px;
            font-family: 'Inter', system-ui, sans-serif;
            opacity: 1;
            animation: fadeIn 0.2s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* Left Column - Image Only */
          .auth-left {
            flex: 0 0 40%;
            position: relative;
            overflow: hidden;
            border-radius: 0 8px 8px 0; 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .panel-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
            transition: transform 0.3s ease;
            filter: brightness(1.1) contrast(1.0) saturate(1.0);
          }

          .panel-image:hover {
            transform: scale(1.02);
          }

          .background-image {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background-image: url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: #0d1728;
          }

          .image-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(10, 15, 26, 0.7) 0%,
              rgba(10, 15, 26, 0.45) 35%,
              rgba(10, 15, 26, 0.85) 100%
            );
            z-index: 1;
          }

          .left-content {
            position: relative;
            z-index: 2;
            padding: 48px 44px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
          }

          .auth-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 48px;
          }

          .logo-square {
            width: 48px;
            height: 48px;
            background: #00d4a0;
            color: #0a0f1a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 18px;
            border-radius: 8px;
          }

          .logo-text {
            font-size: 20px;
            font-weight: 700;
            color: white;
            letter-spacing: -0.5px;
          }

          .auth-illustration {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
          }

          .mockup-card {
            background: rgba(20, 29, 46, 0.85);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(0,212,160,0.2);
            border-radius: 16px;
            padding: 24px;
            max-width: 340px;
            width: 100%;
          }

          .mockup-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .mockup-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: white;
          }

          .status-dot {
            width: 8px;
            height: 8px;
            background: #00d4a0;
            border-radius: 50%;
          }

          .mockup-badge {
            background: rgba(0,212,160,0.15);
            color: #00d4a0;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
          }

          .mockup-fields {
            margin-bottom: 16px;
          }

          .mockup-field {
            margin-bottom: 12px;
          }

          .field-label {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 4px;
          }

          .field-value {
            height: 36px;
            background: #0d1728;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 6px;
            display: flex;
            align-items: center;
            padding: 0 12px;
            font-size: 13px;
            color: #94a3b8;
          }

          .field-value.filled {
            color: #00d4a0;
            font-weight: 600;
          }

          .mockup-xml {
            background: #060d18;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            font-family: 'DM Mono', monospace;
            font-size: 11px;
            line-height: 1.4;
          }

          .xml-line {
            margin-bottom: 2px;
          }

          .xml-tag {
            color: #00d4a0;
          }

          .xml-muted {
            color: #64748b;
          }

          .xml-value {
            color: #00d4a0;
          }

          .xml-indent {
            color: #64748b;
          }

          .mockup-stats {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
          }

          .auth-tagline {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 32px;
            line-height: 1.4;
          }

          /* Right Column */
          .auth-right {
            flex: 0 0 60%;
            background: #0a0f1a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 48px;
            overflow-y: auto;
          }

          .auth-form-container {
            width: 100%;
            max-width: 520px;
            background: rgba(20, 29, 46, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            padding: 50px 45px;
          }

          .auth-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .auth-title {
            font-size: 28px;
            font-weight: 900;
            color: white;
            margin: 0 0 6px 0;
          }

          .auth-subtitle {
            font-size: 14px;
            color: #94a3b8;
            margin: 0;
          }

          .auth-banner {
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 13px;
            margin-bottom: 16px;
          }

          .auth-banner-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
          }

          .auth-form {
            margin-bottom: 24px;
          }

          .form-row-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
          }

          .form-group input {
            width: 100%;
            height: 48px;
            background: #141d2e;
            border: 1.5px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 0 14px;
            color: white;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .form-group input:hover:not(:focus) {
            border-color: rgba(255, 255, 255, 0.15);
          }

          .form-group input:focus {
            outline: none;
            border-color: #00d4a0;
            box-shadow: 0 0 0 3px rgba(0,212,160,0.12);
          }

          .form-group input.error {
            border-color: #ef4444;
          }

          .password-input {
            position: relative;
          }

          .password-toggle {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 16px;
            z-index: 2;
          }

          .password-match-icon {
            position: absolute;
            right: 45px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            z-index: 1;
          }

          .match-success {
            color: #00d4a0;
          }

          .match-error {
            color: #ef4444;
          }

          .password-strength {
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .strength-bar {
            flex: 1;
            display: flex;
            gap: 4px;
          }

          .strength-segment {
            flex: 1;
            height: 3px;
            border-radius: 2px;
            transition: background-color 0.3s;
          }

          .strength-label {
            font-size: 12px;
            font-weight: 500;
            min-width: 60px;
          }

          .terms-checkbox-wrapper {
            margin: 24px 0;
            padding: 16px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
          }

          .checkbox-container {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .checkbox-input {
            width: 20px !important;
            height: 20px !important;
            margin: 0 !important;
            cursor: pointer;
            opacity: 0;
            position: absolute;
          }

          .custom-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #475569;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            background: #141d2e;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .checkbox-input:checked + .checkbox-label .custom-checkbox {
            background: #00d4a0;
            border-color: #00d4a0;
          }

          .checkbox-input:checked + .checkbox-label .custom-checkbox .checkmark {
            color: #0a0f1a;
            font-weight: bold;
            font-size: 14px;
          }

          .checkbox-input.error + .checkbox-label .custom-checkbox {
            border-color: #ef4444;
          }

          .checkbox-text {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.5;
            cursor: pointer;
          }

          .terms-link {
            color: #00d4a0;
            text-decoration: none;
            font-weight: 600;
          }

          .terms-link:hover {
            text-decoration: underline;
          }

          .error-text {
            color: #fca5a5;
            font-size: 11px;
            margin-top: 4px;
            display: block;
          }

          .auth-button {
            width: 100%;
            height: 48px;
            background: #00d4a0;
            color: #0a0f1a;
            border: none;
            border-radius: 10px;
            font-weight: 800;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .auth-button:hover:not(:disabled) {
            background: #00b389;
            transform: translateY(-1px);
          }

          .auth-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          .auth-footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            margin-top: 8px;
          }

          .auth-footer p {
            color: #94a3b8;
            font-size: 14px;
            margin: 0;
          }

          .auth-link {
            color: #00d4a0;
            text-decoration: none;
            font-weight: 600;
          }

          .auth-link:hover {
            text-decoration: underline;
          }

          /* Mobile Layout */
          @media (max-width: 900px) {
            .auth-layout {
              flex-direction: column;
            }

            .auth-left {
              display: none;
            }

            .auth-right {
              flex: 1;
              padding: 32px 24px;
            }

            .auth-form-container {
              max-width: 100%;
            }

            .form-row-grid {
              grid-template-columns: 1fr;
              gap: 0;
            }
          }
        `}</style>
      </div>
    </>
  )
}