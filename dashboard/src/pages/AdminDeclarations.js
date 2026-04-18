import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import api from '../lib/api'

export default function AdminDeclarations({ showToast }) {
  const { t } = useLanguage()
  const [declarations, setDeclarations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDeclarations()
  }, [])

  const fetchDeclarations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/declarations')
      setDeclarations(response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement des déclarations', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredDeclarations = declarations.filter(d =>
    !searchTerm || 
    d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="admin-page"><p>Chargement...</p></div>
  }

  return (
    <div className="admin-page">
      <h1>{t('admin_declarations')}</h1>

      {/* Search */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Rechercher par référence, utilisateur, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin_reference')}</th>
              <th>Utilisateur</th>
              <th>{t('admin_year')}</th>
              <th>{t('admin_period')}</th>
              <th>{t('admin_regime')}</th>
              <th>{t('admin_invoices')}</th>
              <th>{t('admin_total_ttc')}</th>
              <th>{t('admin_generated')}</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeclarations.map(declaration => (
              <tr key={declaration.id}>
                <td><code>{declaration.reference}</code></td>
                <td>{declaration.user_name}</td>
                <td>{declaration.annee}</td>
                <td>{declaration.periode}</td>
                <td>{declaration.regime}</td>
                <td>{declaration.invoices_count || 0}</td>
                <td>{declaration.total_ttc ? `${declaration.total_ttc} MAD` : '—'}</td>
                <td>{formatDate(declaration.created_at)}</td>
                <td>
                  <span className="admin-status-badge" style={{ 
                    color: declaration.status === 'generated' ? '#00d4a0' : '#fbbf24' 
                  }}>
                    {declaration.status === 'generated' ? t('admin_status_generated') : t('admin_status_draft')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDeclarations.length === 0 && (
        <div className="admin-empty-state">
          <p>Aucune déclaration trouvée</p>
        </div>
      )}
    </div>
  )
}
