import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import api from '../lib/api'

export default function AdminCompanies({ showToast }) {
  const { t } = useLanguage()
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    filterCompanies()
  }, [companies, searchTerm])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/societes')
      setCompanies(response.data || [])
    } catch (error) {
      showToast('Erreur lors du chargement des sociétés', 'error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    let filtered = companies
    if (searchTerm) {
      filtered = companies.filter(c =>
        c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.if_value?.includes(searchTerm) ||
        c.ice_value?.includes(searchTerm) ||
        c.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredCompanies(filtered)
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="admin-page"><p>Chargement...</p></div>
  }

  return (
    <div className="admin-page">
      <h1>{t('admin_companies')}</h1>

      {/* Search */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Rechercher par nom, IF, ICE, email..."
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
              <th>{t('admin_companies')}</th>
              <th>{t('admin_if')}</th>
              <th>{t('admin_ice')}</th>
              <th>{t('admin_city')}</th>
              <th>{t('admin_owner')}</th>
              <th>{t('admin_usage')}</th>
              <th>{t('admin_created')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => (
              <tr key={company.id}>
                <td>{company.nom}</td>
                <td>{company.if_value}</td>
                <td>{company.ice_value || '—'}</td>
                <td>{company.ville || '—'}</td>
                <td><small>{company.owner_email}</small></td>
                <td style={{ color: '#3b82f6' }}>{company.usage_count || 0}</td>
                <td>{formatDate(company.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCompanies.length === 0 && (
        <div className="admin-empty-state">
          <p>Aucune sociétéenregistrée</p>
        </div>
      )}
    </div>
  )
}
