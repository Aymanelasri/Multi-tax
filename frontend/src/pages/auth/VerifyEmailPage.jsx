import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import api from '../../lib/api'

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(0)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const { isAuthenticated } = useAuth()
  const { t } = useLang()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = location.state?.email
  const token = searchParams.get('token')

  // If token exists in URL, verify immediately
  useEffect(() => {
    if (token) {
      verifyEmailWithToken(token)
    }
  }, [token])

  const verifyEmailWithToken = async (verificationToken) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      // Redirect to login immediately (success or error)
      navigate('/login', { replace: true })
    } catch (err) {
      // Redirect to login even on error
      navigate('/login', { replace: true })
    }
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/generateur', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Redirect to register if no email and no token
  useEffect(() => {
    if (!email && !token) {
      navigate('/register', { replace: true })
    }
  }, [email, token, navigate])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    if (!email) {
      setError(t('lang') === 'FR' ? 'Email manquant' : 'Email missing')
      return
    }

    setResending(true)
    setSuccess('')
    setError('')

    try {
      const response = await api.resendVerification(email)
      
      if (response) {
        setSuccess(
          t('lang') === 'FR' 
            ? 'Email de confirmation renvoyé !'
            : 'Confirmation email resent!'
        )
        setCountdown(60)
      }
    } catch (err) {
      const errorMsg = err.message || (t('lang') === 'FR' ? 'Erreur lors de l\'envoi' : 'Error sending email')
      setError(errorMsg)
      setSuccess('')
    } finally {
      setResending(false)
    }
  }

  // Don't render if no email and no token
  if (!email && !token) {
    return null
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="verify-content">
          <div className="verify-icon">✉️</div>
          <h1 className="verify-title">{t('auth_verify_title')}</h1>
          
          <div className="verify-text">
            {email && (
              <>
                <p>
                  {t('lang') === 'FR' 
                    ? 'Un lien de confirmation a été envoyé à'
                    : 'A confirmation link was sent to'
                  }
                </p>
                <div className="email-address">{email}</div>
              </>
            )}
            <p>
              {t('lang') === 'FR'
                ? 'Cliquez sur le lien dans l\'email pour activer votre compte.'
                : 'Click the link in the email to activate your account.'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-banner auth-banner-error">
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-banner auth-banner-success">
              <span>{success}</span>
            </div>
          )}

          {/* Resend Button - only show if we have email */}
          {email && (
            <button
              className="resend-button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
            >
              {resending ? (
                t('lang') === 'FR' ? 'Envoi...' : 'Sending...'
              ) : countdown > 0 ? (
                t('lang') === 'FR' 
                  ? `Renvoyer dans ${countdown}s...`
                  : `Resend in ${countdown}s...`
              ) : (
                t('auth_resend_email')
              )}
            </button>
          )}

          {/* Back to Login */}
          <Link to="/login" className="back-link">
            {t('auth_back_login')}
          </Link>
        </div>
      </div>

      <style jsx={true}>{styles}</style>
    </div>
  )
}

const styles = `
  .auth-page {
    min-height: 100vh;
    background: #0a0f1a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .auth-card {
    background: #141d2e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 40px 36px;
    width: 100%;
    max-width: 480px;
  }

  .verify-content {
    text-align: center;
  }

  .verify-icon {
    font-size: 56px;
    margin-bottom: 24px;
  }

  .verify-title {
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin: 0 0 24px 0;
  }

  .verify-text {
    margin-bottom: 32px;
  }

  .verify-text p {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 12px 0;
  }

  .email-address {
    color: #00d4a0;
    font-weight: 600;
    font-size: 16px;
    margin: 16px 0;
    word-break: break-all;
  }

  .auth-banner {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .auth-banner-success {
    background: rgba(0, 212, 160, 0.1);
    border: 1px solid rgba(0, 212, 160, 0.3);
    color: #00d4a0;
  }

  .auth-banner-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .resend-button {
    width: 100%;
    height: 48px;
    background: transparent;
    color: #00d4a0;
    border: 1px solid #00d4a0;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 24px;
  }

  .resend-button:hover:not(:disabled) {
    background: rgba(0, 212, 160, 0.1);
  }

  .resend-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .back-link {
    color: #94a3b8;
    font-size: 13px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .back-link:hover {
    color: #00d4a0;
    text-decoration: underline;
  }
`
