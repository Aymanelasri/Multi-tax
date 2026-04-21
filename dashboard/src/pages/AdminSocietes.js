import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import api from '../lib/api'

export default function AdminSocietes({ showToast }) {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState(null)
  const [userSocietes, setUserSocietes] = useState({})
  const [loadingSocietes, setLoadingSocietes] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('📤 Fetching users with sociétés...')
      
      const response = await api.get('/admin/users-with-societes')
      console.log('📥 Full Response:', response)
      console.log('📥 Response Data:', response.data)
      
      let userData = []
      if (Array.isArray(response.data)) {
        userData = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        userData = response.data.data
      } else if (typeof response.data === 'object') {
        userData = Object.values(response.data).filter(item => typeof item === 'object')
      }
      
      console.log('✅ Processed Users:', userData)
      console.log('📊 User Count:', userData.length)
      
      setUsers(userData)
      
      if (userData.length === 0) {
        console.log('⚠️ No users with sociétés found')
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      showToast('Erreur lors du chargement des utilisateurs', 'error')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSocietes = async (userId) => {
    if (userSocietes[userId]) {
      setExpandedUser(expandedUser === userId ? null : userId)
      return
    }

    try {
      setLoadingSocietes(prev => ({ ...prev, [userId]: true }))
      console.log('📤 Fetching sociétés for user:', userId)
      
      const response = await api.get(`/admin/users/${userId}/societes`)
      console.log('📥 Sociétés Response:', response.data)
      
      let societesData = []
      if (Array.isArray(response.data)) {
        societesData = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        societesData = response.data.data
      }
      
      console.log('✅ Processed Sociétés:', societesData)
      
      setUserSocietes(prev => ({
        ...prev,
        [userId]: societesData
      }))
      
      setExpandedUser(expandedUser === userId ? null : userId)
    } catch (error) {
      console.error('❌ Error fetching sociétés:', error)
      showToast('Erreur lors du chargement des sociétés', 'error')
      setUserSocietes(prev => ({
        ...prev,
        [userId]: []
      }))
    } finally {
      setLoadingSocietes(prev => ({ ...prev, [userId]: false }))
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
  })

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || 'U'}${lastName?.[0] || 'S'}`.toUpperCase()
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
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#94a3b8',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div>Chargement des sociétés...</div>
        </div>
      </div>
    )
  }

  if (filteredUsers.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#94a3b8',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Aucune société trouvée
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            Aucun utilisateur n'a enregistré de sociétés pour le moment.
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '16px' }}>
            Debug: {users.length} utilisateurs chargés
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '8px',
        }}>
          🏢 Sociétés
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Gestion des sociétés enregistrées par utilisateur
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Rechercher par nom, email ou société..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={fetchUsers}
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(to right, #6366f1, #7c3aed)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        >
          🔄 Rafraîchir
        </button>
      </div>

      {/* Users List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredUsers.map(user => (
          <div key={user.id} style={{
            background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(2, 6, 23, 0.5))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {/* User Row */}
            <button
              onClick={() => fetchUserSocietes(user.id)}
              style={{
                width: '100%',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to bottom right, #6366f1, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}>
                  {getInitials(user.first_name, user.last_name)}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                    {user.societes_count || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Sociétés</div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: user.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: user.status === 'approved' ? '#86efac' : '#fcd34d',
                }}>
                  {user.status}
                </div>
                <div style={{ fontSize: '16px' }}>
                  {expandedUser === user.id ? '▼' : '▶'}
                </div>
              </div>
            </button>

            {/* Expanded Sociétés Section */}
            {expandedUser === user.id && (
              <div style={{
                borderTop: '1px solid rgba(51, 65, 85, 0.3)',
                background: 'rgba(2, 6, 23, 0.5)',
                padding: '16px 24px',
              }}>
                <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#a5b4fc', marginBottom: '16px' }}>
                  🏢 Sociétés de {user.name}
                </h4>

                {loadingSocietes[user.id] ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    ⏳ Chargement...
                  </div>
                ) : userSocietes[user.id] && userSocietes[user.id].length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userSocietes[user.id].map(societe => (
                      <div key={societe.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                        gap: '16px',
                        padding: '16px',
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                        borderRadius: '12px',
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>NOM</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{societe.nom}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>IF</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#a5b4fc', fontFamily: 'monospace' }}>{societe.if}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>ICE</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1', fontFamily: 'monospace' }}>{societe.ice || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>CRÉÉE LE</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#cbd5e1' }}>{formatDate(societe.created_at)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}>STATUT</div>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#86efac',
                          }}>✓ Actif</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: 'rgba(30, 41, 59, 0.3)',
                    borderRadius: '12px',
                    color: '#94a3b8',
                  }}>
                    📭 Aucune société enregistrée
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(2, 6, 23, 0.5))',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>UTILISATEURS</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#a5b4fc' }}>{filteredUsers.length}</div>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(2, 6, 23, 0.5))',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>TOTAL SOCIÉTÉS</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#86efac' }}>
            {filteredUsers.reduce((sum, user) => sum + (user.societes_count || 0), 0)}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(2, 6, 23, 0.5))',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: '600' }}>MOYENNE</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fcd34d' }}>
            {filteredUsers.length > 0 
              ? (filteredUsers.reduce((sum, user) => sum + (user.societes_count || 0), 0) / filteredUsers.length).toFixed(1)
              : '0'
            }
          </div>
        </div>
      </div>
    </div>
  )
}
