import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import Navigation from '../components/Navigation'
import api from '../lib/api'

export default function DeclarationsPage() {
  const [historiques, setHistoriques] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { user, isAuthenticated } = useAuth()
  const { lang } = useLang()

  // Set page title
  useEffect(() => {
    document.title = lang === 'FR' 
      ? 'Mon Historique — SIMPL-TVA' 
      : 'My History — SIMPL-TVA'
  }, [lang])

  // ✅ CRITICAL: Fetch historiques from API on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchHistoriques = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.getHistorique()
        setHistoriques(response.data || [])
      } catch (err) {
        setError(err.message)
        setHistoriques([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistoriques()
  }, [isAuthenticated])

  // Helper function to get action label in French and English
  const getActionLabel = (action, language) => {
    const labels = {
      creation: { FR: '🆕 Création', EN: '🆕 Creation' },
      update: { FR: '✏️ Modification', EN: '✏️ Update' },
      generation: { FR: '⚡ Génération', EN: '⚡ Generation' },
      export: { FR: '📥 Export', EN: '📥 Export' },
    }
    return labels[action]?.[language] || action
  }

  return (
    <>
      <Navigation />
      <div className="declarations-layout">
        <div className="declarations-container">
          {/* Header */}
          <div className="declarations-header">
            <h1 className="page-title">
              {lang === 'FR' ? 'Mon Historique' : 'My History'}
            </h1>
            <p className="page-subtitle">
              {lang === 'FR' 
                ? 'Consultez toutes vos actions et opérations effectuées'
                : 'View all your actions and operations'
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="error-banner">
              ⚠ {error}
            </div>
          )}

          {/* Content */}
          <div className="declarations-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>{lang === 'FR' ? 'Chargement...' : 'Loading...'}</p>
              </div>
            ) : historiques.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">
                  {lang === 'FR' ? 'Aucun historique' : 'No history'}
                </h3>
                <p className="empty-message">
                  {lang === 'FR' 
                    ? 'Vous n\'avez encore effectué aucune action.'
                    : 'You haven\'t performed any actions yet.'
                  }
                </p>
                <button 
                  className="cta-button"
                  onClick={() => window.location.href = '/generateur'}
                >
                  {lang === 'FR' ? 'Aller au générateur' : 'Go to generator'}
                </button>
              </div>
            ) : (
              <div className="declarations-list">
                {historiques.map((h) => (
                  <div key={h.id} className="declaration-card">
                    <div className="card-header">
                      <div className="card-action-badge" data-action={h.action}>
                        {lang === 'FR' ? getActionLabel(h.action, 'FR') : getActionLabel(h.action, 'EN')}
                      </div>
                      <span className="card-date">
                        {new Date(h.created_at).toLocaleDateString(
                          lang === 'FR' ? 'fr-FR' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                    </div>
                    <div className="card-body">
                      <h3 className="card-description">{h.description}</h3>
                      {h.societe && (
                        <p className="card-societe">
                          <span className="label">{lang === 'FR' ? 'Société:' : 'Company:'}</span>
                          {h.societe.nom}
                        </p>
                      )}
                      {h.data && Object.keys(h.data).length > 0 && (
                        <div className="card-data">
                          {Object.entries(h.data).map(([key, value]) => (
                            <div key={key} className="data-item">
                              <span className="data-key">{key}:</span>
                              <span className="data-value">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style jsx={true}>{`
          .declarations-layout {
            min-height: 100vh;
            background: #0a0f1a;
            padding-top: 56px;
            font-family: 'Sora', system-ui, sans-serif;
          }

          .declarations-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .declarations-header {
            margin-bottom: 40px;
          }

          .page-title {
            font-size: clamp(28px, 4vw, 42px);
            font-weight: 900;
            color: #ffffff;
            margin: 0 0 12px 0;
            letter-spacing: -0.5px;
          }

          .page-subtitle {
            font-size: 16px;
            color: #94a3b8;
            line-height: 1.6;
            margin: 0;
            max-width: 600px;
          }

          .declarations-content {
            background: rgba(20, 29, 46, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            padding: 40px;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-state {
            text-align: center;
            color: #94a3b8;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid #00d4a0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .empty-state {
            text-align: center;
            max-width: 400px;
          }

          .empty-icon {
            font-size: 64px;
            margin-bottom: 24px;
          }

          .empty-title {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 16px 0;
          }

          .empty-message {
            font-size: 16px;
            color: #94a3b8;
            line-height: 1.6;
            margin: 0 0 32px 0;
          }

          .cta-button {
            background: #00d4a0;
            color: #0a0f1a;
            border: none;
            border-radius: 10px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .cta-button:hover {
            background: #00b389;
            transform: translateY(-1px);
          }

          .declarations-list {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .declaration-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.2s ease;
          }

          .declaration-card:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.12);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .card-action-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(0, 212, 160, 0.15);
            color: #00d4a0;
          }

          .card-action-badge[data-action="creation"] {
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
          }

          .card-action-badge[data-action="update"] {
            background: rgba(59, 130, 246, 0.15);
            color: #3b82f6;
          }

          .card-action-badge[data-action="generation"] {
            background: rgba(251, 191, 36, 0.15);
            color: #fbbf24;
          }

          .card-action-badge[data-action="export"] {
            background: rgba(139, 92, 246, 0.15);
            color: #a78bfa;
          }

          .card-date {
            font-size: 12px;
            color: #64748b;
          }

          .card-body {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .card-description {
            font-size: 16px;
            font-weight: 600;
            color: #e2e8f0;
            margin: 0;
          }

          .card-societe {
            font-size: 14px;
            color: #94a3b8;
            margin: 0;
          }

          .label {
            font-weight: 600;
            color: #cbd5e1;
            margin-right: 6px;
          }

          .card-data {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .data-item {
            display: flex;
            gap: 8px;
            font-size: 12px;
          }

          .data-key {
            color: #94a3b8;
            font-weight: 600;
          }

          .data-value {
            color: #cbd5e1;
            word-break: break-all;
          }

          .error-banner {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 24px;
            color: #ef4444;
            font-size: 14px;
          }

          @media (max-width: 768px) {
            .declarations-container {
              padding: 20px 16px;
            }

            .declarations-content {
              padding: 24px 20px;
            }

            .empty-icon {
              font-size: 48px;
            }

            .empty-title {
              font-size: 20px;
            }

            .empty-message {
              font-size: 14px;
            }
          }
        `}</style>
      </div>
    </>
  )
}