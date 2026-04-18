import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../hooks/useLang'

export default function PendingPage() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLang()
  const location = useLocation()
  const navigate = useNavigate()

  const userData = user || location.state?.user

  // Redirect if authenticated (approved)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/generateur', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Redirect if no user data
  useEffect(() => {
    if (!userData) {
      navigate('/login', { replace: true })
    }
  }, [userData, navigate])

  if (!userData) {
    return null // Will redirect
  }

  const firstName = userData.name?.split(' ')[0] || 'Utilisateur'

  return (
    <div className="auth-page">
      <div className="auth-card pending-card">
        {/* Content */}
        <div className="pending-content">
          <div className="pending-icon">⏳</div>
          <h1 className="pending-title">{t('auth_pending_title')}</h1>
          
          <div className="pending-message">
            <p className="greeting">
              {t('lang') === 'FR' 
                ? `Bonjour ${firstName}, votre compte a bien été créé et votre email confirmé.`
                : `Hello ${firstName}, your account has been created and your email confirmed.`
              }
            </p>
            
            <div className="info-box">
              <p>
                {t('lang') === 'FR'
                  ? 'Notre équipe va examiner votre demande et vous enverrons un email dès que votre compte sera activé.'
                  : 'Our team will review your request and send you an email once your account is activated.'
                }
              </p>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="estimated-time">
            <p>
              {t('lang') === 'FR'
                ? 'Délai habituel : 24 à 48 heures ouvrées'
                : 'Usual processing time: 24 to 48 business hours'
              }
            </p>
          </div>

          {/* Contact Link */}
          <Link to="/contact" className="contact-link">
            {t('lang') === 'FR'
              ? 'Une question ? Contactez-nous →'
              : 'A question? Contact us →'
            }
          </Link>

          {/* Back Home Button */}
          <Link to="/" className="home-button">
            {t('auth_back_home')}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: #0a0f1a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .pending-card {
          max-width: 500px;
        }

        .auth-card {
          background: #141d2e;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 36px;
          width: 100%;
        }

        .pending-content {
          text-align: center;
        }

        .pending-icon {
          font-size: 56px;
          margin-bottom: 24px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .pending-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0 0 24px 0;
          line-height: 1.2;
        }

        .pending-message {
          margin-bottom: 32px;
        }

        .greeting {
          color: white;
          font-size: 16px;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }

        .info-box {
          background: rgba(0, 212, 160, 0.1);
          border: 1px solid rgba(0, 212, 160, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }

        .info-box p {
          color: #00d4a0;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .estimated-time {
          margin-bottom: 24px;
        }

        .estimated-time p {
          color: #64748b;
          font-size: 13px;
          margin: 0;
        }

        .contact-link {
          color: #00d4a0;
          font-size: 14px;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 32px;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        .home-button {
          display: inline-block;
          width: 100%;
          height: 48px;
          background: #00d4a0;
          color: #0a0f1a;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 800;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .home-button:hover {
          background: #00b890;
        }
      `}</style>
    </div>
  )
}