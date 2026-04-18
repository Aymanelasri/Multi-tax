import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import './AuthNavbar.css'

export default function AuthNavbar({ currentPage }) {
  const navigate = useNavigate()
  const { lang, toggleLang } = useLang()

  return (
    <nav className="auth-navbar">
      {/* Left - Logo */}
      <div className="navbar-left" onClick={() => navigate('/')}>
        <div className="navbar-logo-badge">ST</div>
        <span className="navbar-logo-text">
          <span className="navbar-simpl">SIMPL-</span>
          <span className="navbar-tva">TVA</span>
        </span>
      </div>

      {/* Center - Empty */}
      <div className="navbar-center"></div>

      {/* Right - Language toggle + Auth links */}
      <div className="navbar-right">
        {/* Language Toggle */}
        <div className="lang-toggle">
          <button 
            className={lang === 'FR' ? 'active' : 'inactive'}
            onClick={() => lang !== 'FR' && toggleLang()}
          >
            FR
          </button>
          <span className="lang-separator">|</span>
          <button 
            className={lang === 'EN' ? 'active' : 'inactive'}
            onClick={() => lang !== 'EN' && toggleLang()}
          >
            EN
          </button>
        </div>

        {/* Auth Links */}
        <div className="auth-links">
          {currentPage === 'login' ? (
            <>
              <span className="auth-text">
                {lang === 'FR' ? 'Pas de compte ? ' : 'No account? '}
              </span>
              <button 
                className="auth-link"
                onClick={() => navigate('/register')}
              >
                {lang === 'FR' ? 'S\'inscrire →' : 'Sign up →'}
              </button>
            </>
          ) : (
            <>
              <span className="auth-text">
                {lang === 'FR' ? 'Déjà un compte ? ' : 'Already have an account? '}
              </span>
              <button 
                className="auth-link"
                onClick={() => navigate('/login')}
              >
                {lang === 'FR' ? 'Se connecter →' : 'Sign in →'}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}