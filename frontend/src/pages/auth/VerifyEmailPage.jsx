import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LanguageContext'
import api from '../../lib/api'

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(0)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState('')

  const { isAuthenticated } = useAuth()
  const { t } = useLang()
  const location = useLocation()
  const navigate = useNavigate()

  const email = location.state?.email

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/generateur', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Redirect to register if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true })
    }
  }, [email, navigate])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0 || resending) return

    setResending(true)
    setSuccess('')

    try {
      const response = await api.resendVerification(email)
      
      if (response.status === 'success') {
        setSuccess(
          t('lang') === 'FR' 
            ? 'Email de confirmation renvoyé !'
            : 'Confirmation email resent!'
        )
        setCountdown(60)
      }
    } catch (error) {
      console.error('Resend error:', error)
      setSuccess(
        t('lang') === 'FR'
          ? 'Erreur lors de l\'envoi. Réessayez plus tard.'
          : 'Error sending email. Please try again later.'
      )
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return null // Will redirect
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Content */}
        <div className="verify-content">
          <div className="verify-icon">✉️</div>
          <h1 className="verify-title">{t('auth_verify_title')}</h1>
          
          <div className="verify-text">
            <p>
              {t('lang') === 'FR' 
                ? 'Un lien de confirmation a été envoyé à'
                : 'A confirmation link was sent to'
              }
            </p>
            <div className="email-address">{email}</div>
            <p>
              {t('lang') === 'FR'
                ? 'Cliquez sur le lien dans l\'email pour activer votre compte.'
                : 'Click the link in the email to activate your account.'
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="auth-banner auth-banner-success">
              <span>{success}</span>
            </div>
          )}

          {/* Resend Button */}
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

          {/* Back to Login */}
          <Link to="/login" className="back-link">
            {t('auth_back_login')}
          </Link>
        </div>
      </div>

      <style jsx={true}>{`
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
      `}</style>
    </div>
  )
}