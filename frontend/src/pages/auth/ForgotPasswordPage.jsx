import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext'
import AuthNavbar from '../../components/AuthNavbar'
import api from '../../lib/api'
import '../../styles/Auth.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { lang } = useLang()

  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Mot de passe oublié — SIMPL-TVA' 
      : 'Forgot Password — SIMPL-TVA'
  }, [lang])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.forgotPassword(email)
      
      if (response.status === 'success') {
        setSent(true)
      }
    } catch (err) {
      setError(
        lang === 'FR'
          ? 'Erreur lors de l\'envoi. Vérifiez votre email et réessayez.'
          : 'Error sending email. Please check your email and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <>
        <AuthNavbar currentPage="forgot" />
        <div className="auth-layout">
          <div className="auth-left">
            <img 
              src="/images/image 1.jpg" 
              alt="Success background"
              className="panel-image"
            />
          </div>

          <div className="auth-right">
            <div className="form-wrapper">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
                <h2 className="form-title">
                  {lang === 'FR' ? 'Email envoyé !' : 'Email sent!'}
                </h2>
                <p className="form-subtitle" style={{ marginBottom: '24px' }}>
                  {lang === 'FR'
                    ? 'Un lien de réinitialisation a été envoyé à :'
                    : 'A reset link has been sent to:'
                  }
                </p>
                <div style={{ 
                  background: 'rgba(0, 212, 160, 0.1)', 
                  border: '1px solid rgba(0, 212, 160, 0.2)', 
                  borderRadius: '8px', 
                  padding: '12px 16px', 
                  color: '#00d4a0', 
                  fontWeight: 600, 
                  fontSize: '14px', 
                  marginBottom: '32px',
                  wordBreak: 'break-all',
                  transition: 'all 0.3s ease'
                }}>
                  {email}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/login" className="link-button" style={{ 
                    color: 'var(--auth-text-muted)', 
                    fontSize: '14px', 
                    textDecoration: 'none', 
                    padding: '12px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    ← {lang === 'FR' ? 'Retour à la connexion' : 'Back to login'}
                  </Link>
                  <button 
                    className="submit-button"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid var(--auth-border)',
                      color: 'var(--auth-text)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setSent(false)}
                  >
                    {lang === 'FR' ? 'Renvoyer l\'email' : 'Resend email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AuthNavbar currentPage="forgot" />
      <div className="auth-layout">
        <div className="auth-left">
          <img 
            src="/images/image 1.jpg" 
            alt="Forgot password background"
            className="panel-image"
          />
        </div>

        <div className="auth-right">
          <div className="form-wrapper">
            <div className="form-header" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔑</div>
              <h1 className="form-title">
                {lang === 'FR' ? 'Mot de passe oublié ?' : 'Forgot password?'}
              </h1>
              <p className="form-subtitle">
                {lang === 'FR'
                  ? 'Pas de souci, nous allons vous aider'
                  : 'No worries, we\'ll help you out'
                }
              </p>
            </div>

            {error && (
              <div className="error-banner">
                <span>⚠</span>
                <span>{error}</span>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
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
                  lang === 'FR' ? 'Envoyer le lien →' : 'Send reset link →'
                )}
              </button>
            </form>

            <div className="bottom-link">
              <Link to="/login" className="link-button">
                ← {lang === 'FR' ? 'Retour à la connexion' : 'Back to login'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
