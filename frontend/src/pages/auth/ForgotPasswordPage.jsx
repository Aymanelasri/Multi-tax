import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../../context/LanguageContext'
import AuthNavbar from '../../components/AuthNavbar'
import api from '../../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { lang } = useLang()

  // Set page title
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
          {/* Left Column - Branding */}
          <div className="auth-left">
            {/* Background Image */}
            <div className="background-image"></div>
            
            {/* Dark Overlay */}
            <div className="image-overlay"></div>
            
            {/* Content */}
            <div className="left-content">
              {/* Top - Logo */}
              <div className="auth-logo">
                <div className="logo-badge">ST</div>
                <span className="logo-text">
                  <span className="logo-simpl">SIMPL-</span>
                  <span className="logo-tva">TVA</span>
                </span>
              </div>

              {/* Middle - Success Message */}
              <div className="auth-content">
                <div className="success-icon">📧</div>
                <h1 className="success-headline">
                  {lang === 'FR' 
                    ? 'Email envoyé avec succès !'
                    : 'Email sent successfully!'
                  }
                </h1>
                <p className="success-subtitle">
                  {lang === 'FR'
                    ? 'Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.'
                    : 'Check your inbox and follow the instructions to reset your password.'
                  }
                </p>
                
                <div className="email-display">
                  <div className="email-icon">✉️</div>
                  <div className="email-text">{email}</div>
                </div>
              </div>

              {/* Bottom - Help Text */}
              <div className="help-text">
                {lang === 'FR' 
                  ? 'Vous n\'avez pas reçu l\'email ? Vérifiez vos spams ou réessayez.'
                  : 'Didn\'t receive the email? Check your spam folder or try again.'
                }
              </div>
            </div>
          </div>

          {/* Right Column - Success Card */}
          <div className="auth-right">
            <div className="form-wrapper">
              <div className="success-card">
                <div className="success-icon-large">✅</div>
                <h2 className="success-title">
                  {lang === 'FR' ? 'Email envoyé !' : 'Email sent!'}
                </h2>
                <p className="success-description">
                  {lang === 'FR'
                    ? 'Un lien de réinitialisation a été envoyé à :'
                    : 'A reset link has been sent to:'
                  }
                </p>
                <div className="email-address">{email}</div>
                
                <div className="success-actions">
                  <Link to="/login" className="back-button">
                    ← {lang === 'FR' ? 'Retour à la connexion' : 'Back to login'}
                  </Link>
                  <button 
                    className="resend-button"
                    onClick={() => setSent(false)}
                  >
                    {lang === 'FR' ? 'Renvoyer l\'email' : 'Resend email'}
                  </button>
                </div>
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
            }

            /* Left Column */
            .auth-left {
              position: relative;
              overflow: hidden;
              padding: 0;
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
            }

            .auth-logo {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .logo-badge {
              width: 40px;
              height: 40px;
              background: #00d4a0;
              color: #0a0f1a;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 16px;
              border-radius: 10px;
            }

            .logo-text {
              font-size: 20px;
              font-weight: 800;
            }

            .logo-simpl {
              color: white;
            }

            .logo-tva {
              color: #00d4a0;
            }

            .auth-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              text-align: left;
              margin-top: 20px;
            }

            .success-icon {
              font-size: 64px;
              margin-bottom: 24px;
            }

            .success-headline {
              font-size: clamp(28px, 3vw, 36px);
              font-weight: 900;
              color: white;
              line-height: 1.2;
              margin: 0 0 16px 0;
            }

            .success-subtitle {
              font-size: 14px;
              color: #94a3b8;
              margin: 0 0 32px 0;
              line-height: 1.7;
            }

            .email-display {
              background: rgba(0, 212, 160, 0.1);
              border: 1px solid rgba(0, 212, 160, 0.3);
              border-radius: 12px;
              padding: 16px 20px;
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .email-icon {
              font-size: 20px;
            }

            .email-text {
              color: #00d4a0;
              font-weight: 600;
              font-size: 14px;
              word-break: break-all;
            }

            .help-text {
              font-size: 12px;
              color: #64748b;
              text-align: center;
              line-height: 1.5;
            }

            /* Right Column */
            .auth-right {
              background: #0a0f1a;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 48px;
            }

            .form-wrapper {
              width: 100%;
              max-width: 400px;
              background: rgba(20, 29, 46, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.06);
              border-radius: 20px;
              padding: 40px 36px;
            }

            .success-card {
              text-align: center;
            }

            .success-icon-large {
              font-size: 64px;
              margin-bottom: 24px;
            }

            .success-title {
              font-size: 24px;
              font-weight: 900;
              color: white;
              margin: 0 0 16px 0;
            }

            .success-description {
              color: #94a3b8;
              font-size: 14px;
              margin: 0 0 16px 0;
            }

            .email-address {
              background: rgba(0, 212, 160, 0.1);
              border: 1px solid rgba(0, 212, 160, 0.2);
              border-radius: 8px;
              padding: 12px 16px;
              color: #00d4a0;
              font-weight: 600;
              font-size: 14px;
              margin-bottom: 32px;
              word-break: break-all;
            }

            .success-actions {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .back-button {
              color: #94a3b8;
              font-size: 14px;
              text-decoration: none;
              padding: 12px 0;
              transition: color 0.2s;
            }

            .back-button:hover {
              color: #00d4a0;
            }

            .resend-button {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: white;
              padding: 12px 20px;
              border-radius: 8px;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.2s;
            }

            .resend-button:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: rgba(255, 255, 255, 0.2);
            }

            /* Mobile */
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
            }
          `}</style>
        </div>
      </>
    )
  }

  return (
    <>
      <AuthNavbar currentPage="forgot" />
      <div className="auth-layout">
        {/* Left Column - Branding */}
        <div className="auth-left">
          {/* Background Image */}
          <div className="background-image"></div>
          
          {/* Dark Overlay */}
          <div className="image-overlay"></div>
          
          {/* Content */}
          <div className="left-content">
            {/* Top - Logo */}
            <div className="auth-logo">
              <div className="logo-badge">ST</div>
              <span className="logo-text">
                <span className="logo-simpl">SIMPL-</span>
                <span className="logo-tva">TVA</span>
              </span>
            </div>

            {/* Middle - Forgot Password Info */}
            <div className="auth-content">
              <div className="platform-label">RÉCUPÉRATION</div>
              <h1 className="main-headline">
                {lang === 'FR' 
                  ? 'Récupérez votre accès en quelques clics.'
                  : 'Recover your access in a few clicks.'
                }
              </h1>
              <p className="main-subtitle">
                {lang === 'FR'
                  ? 'Entrez votre email et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.'
                  : 'Enter your email and we\'ll send you a secure link to reset your password.'
                }
              </p>
              
              <div className="feature-pills">
                <div className="pill">🔒 Lien sécurisé</div>
                <div className="pill">⚡ Envoi instantané</div>
                <div className="pill">✓ Simple & rapide</div>
              </div>
            </div>

            {/* Bottom - Security Note */}
            <div className="security-note">
              <div className="security-icon">🛡️</div>
              <div className="security-text">
                {lang === 'FR' 
                  ? 'Vos données restent protégées. Le lien expire automatiquement après 24h.'
                  : 'Your data stays protected. The link expires automatically after 24h.'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="auth-right">
          <div className="form-wrapper">
            {/* Form Header */}
            <div className="form-header">
              <div className="forgot-icon">🔑</div>
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

            {/* Error Banner */}
            {error && (
              <div className="error-banner">
                <span>⚠</span>
                <span>{error}</span>
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

            {/* Back Link */}
            <div className="bottom-link">
              <Link to="/login" className="link-button">
                ← {lang === 'FR' ? 'Retour à la connexion' : 'Back to login'}
              </Link>
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

          /* Left Column */
          .auth-left {
            position: relative;
            overflow: hidden;
            padding: 0;
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
          }

          .auth-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .logo-badge {
            width: 40px;
            height: 40px;
            background: #00d4a0;
            color: #0a0f1a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 16px;
            border-radius: 10px;
          }

          .logo-text {
            font-size: 20px;
            font-weight: 800;
          }

          .logo-simpl {
            color: white;
          }

          .logo-tva {
            color: #00d4a0;
          }

          .auth-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: left;
            margin-top: 20px;
          }

          .platform-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.15em;
            color: #00d4a0;
            text-transform: uppercase;
            margin-bottom: 16px;
          }

          .main-headline {
            font-size: clamp(28px, 3vw, 40px);
            font-weight: 900;
            color: white;
            line-height: 1.2;
            margin: 0;
          }

          .main-subtitle {
            font-size: 14px;
            color: #94a3b8;
            margin: 12px 0 0 0;
            line-height: 1.7;
          }

          .feature-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 24px;
          }

          .pill {
            background: rgba(0,212,160,0.08);
            border: 1px solid rgba(0,212,160,0.2);
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 12px;
            color: #00d4a0;
            font-weight: 600;
          }

          .security-note {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(0, 212, 160, 0.05);
            border: 1px solid rgba(0, 212, 160, 0.15);
            border-radius: 12px;
            padding: 16px 20px;
          }

          .security-icon {
            font-size: 20px;
          }

          .security-text {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
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
            max-width: 400px;
            background: rgba(20, 29, 46, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            padding: 40px 36px;
          }

          .form-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .forgot-icon {
            font-size: 48px;
            margin-bottom: 20px;
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
            margin-bottom: 24px;
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

          .link-button {
            color: #94a3b8;
            font-size: 13px;
            text-decoration: none;
            transition: color 0.2s;
          }

          .link-button:hover {
            color: #00d4a0;
          }

          /* Mobile */
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
          }
        `}</style>
      </div>
    </>
  )
}