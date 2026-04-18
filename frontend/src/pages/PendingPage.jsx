import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import AuthNavbar from '../components/AuthNavbar'

export default function PendingPage() {
  const { lang } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'En attente d\'approbation — SIMPL-TVA' 
      : 'Pending Approval — SIMPL-TVA'
  }, [lang])

  const styles = {
    layout: {
      minHeight: '100vh',
      background: '#0a0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      paddingTop: '76px'
    },
    center: {
      width: '100%',
      maxWidth: '480px'
    },
    card: {
      background: 'rgba(20, 29, 46, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '20px',
      padding: '60px 40px',
      textAlign: 'center'
    },
    icon: {
      fontSize: '64px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 900,
      color: 'white',
      margin: '0 0 16px 0'
    },
    message: {
      color: '#94a3b8',
      fontSize: '14px',
      lineHeight: 1.6,
      margin: '0 0 32px 0'
    },
    button: {
      background: '#00d4a0',
      color: '#0a0f1a',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  }

  return (
    <>
      <AuthNavbar />
      <div style={styles.layout}>
        <div style={styles.center}>
          <div style={styles.card}>
            <div style={styles.icon}>⏳</div>
            <h1 style={styles.title}>
              {lang === 'FR' ? 'En attente d\'approbation' : 'Pending Approval'}
            </h1>
            <p style={styles.message}>
              {lang === 'FR'
                ? 'Votre compte est en cours de révision par un administrateur. Vous recevrez un email une fois votre compte approuvé.'
                : 'Your account is being reviewed by an administrator. You will receive an email once your account is approved.'
              }
            </p>
            <button 
              style={styles.button}
              onClick={() => navigate('/login')}
              onMouseEnter={e => e.target.style.background = '#00b389'}
              onMouseLeave={e => e.target.style.background = '#00d4a0'}
            >
              {lang === 'FR' ? 'Retour à la connexion' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}