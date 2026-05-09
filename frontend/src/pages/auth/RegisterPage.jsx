import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import AuthNavbar from '../../components/AuthNavbar'
import '../../styles/Auth.css'

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

  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Inscription — SIMPL-TVA' 
      : 'Create Account — SIMPL-TVA'
  }, [lang])

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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    if (name === 'phone' && value) {
      const phoneRegex = /^(\+212|0)(5|6|7)[0-9]{8}$/
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        setErrors(prev => ({
          ...prev,
          phone: lang === 'FR' ? 'Numéro de téléphone invalide' : 'Invalid phone number'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          phone: ''
        }))
      }
    }

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }

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
    } else {
      const phoneRegex = /^(\+212|0)(5|6|7)[0-9]{8}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = lang === 'FR' ? 'Numéro de téléphone invalide' : 'Invalid phone number'
      }
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
           formData.terms &&
           !errors.phone
  }

  const passwordsMatch = formData.password && formData.password_confirmation && 
                         formData.password === formData.password_confirmation

  return (
    <>
      <AuthNavbar currentPage="register" />
      <div className="auth-layout">
        <div className="auth-left">
          <img 
            src="/images/image3.jpg" 
            alt="Tax registration background"
            className="panel-image"
          />
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1 className="auth-title">{t('auth_register_title')}</h1>
              <p className="auth-subtitle">{t('auth_register_sub')}</p>
            </div>

            {errors.general && (
              <div className="auth-banner-error">
                <span>{errors.general}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="firstname">{t('auth_firstname')}</label>
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    placeholder={lang === 'FR' ? ' votre prénom' : 'your first name'}
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
                    placeholder={lang === 'FR' ? ' votre nom' : 'your last name'}
                    value={formData.lastname}
                    onChange={handleChange}
                    className={errors.lastname ? 'error' : ''}
                    required
                  />
                  {errors.lastname && <span className="error-text">{errors.lastname}</span>}
                </div>
              </div>

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

              <div className="form-group">
                <label htmlFor="phone">{lang === 'FR' ? 'TÉLÉPHONE' : 'PHONE'}</label>
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
      </div>
    </>
  )
}
