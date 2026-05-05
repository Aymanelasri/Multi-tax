import React, { useState, useEffect } from 'react';
import { HiDownload, HiDocumentText, HiTable, HiExternalLink } from 'react-icons/hi';
import api from '../lib/api';

const RecentGenerations = ({ onRefresh = 0, limit = 5 }) => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/generations/recent?limit=${limit}`);
      
      if (response.data.success) {
        setGenerations(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch generations:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, [onRefresh]);

  const handleDownload = async (id, fileName) => {
    try {
      const blob = await api.downloadGeneration(id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const getStatusConfig = (statut) => {
    switch (statut?.toLowerCase()) {
      case 'success':
        return {
          color: '#00d4a0',
          bg: 'rgba(0,212,160,0.1)',
          label: 'Succès'
        };
      case 'error':
        return {
          color: '#ef4444',
          bg: 'rgba(239,68,68,0.1)',
          label: 'Erreur'
        };
      case 'pending':
        return {
          color: '#fbbf24',
          bg: 'rgba(251,191,36,0.1)',
          label: 'En cours'
        };
      default:
        return {
          color: '#94a3b8',
          bg: 'rgba(148,163,184,0.1)',
          label: statut
        };
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toUpperCase()) {
      case 'XML':
      case 'ZIP':
        return <HiDocumentText size={22} />;
      case 'XLSX':
      case 'XLS':
        return <HiTable size={22} />;
      default:
        return <HiDocumentText size={22} />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div style={{
        background: '#0a0f1a',
        border: '1px solid #1e3a5f',
        borderRadius: 12,
        padding: '20px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#e2e8f0',
          marginBottom: 16
        }}>
          📋 Générations récentes
        </div>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <div style={{ fontSize: '24px', marginBottom: 8 }}>⏳</div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#0a0f1a',
        border: '1px solid #1e3a5f',
        borderRadius: 12,
        padding: '20px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#e2e8f0',
          marginBottom: 16
        }}>
          📋 Générations récentes
        </div>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0a0f1a',
      border: '1px solid #1e3a5f',
      borderRadius: 12,
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #1e3a5f'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📋 Générations récentes
          {generations.length > 0 && (
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 8px',
              borderRadius: 12
            }}>
              {generations.length}
            </span>
          )}
        </div>

        {generations.length > 0 && (
          <a
            href="/historique"
            style={{
              fontSize: '12px',
              color: '#00d4a0',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#00ffcc'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#00d4a0'}
          >
            Voir tout
            <HiExternalLink size={15} />
          </a>
        )}
      </div>

      {/* Content */}
      {generations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: 12 }}>📭</div>
          <div>Aucune génération récente</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {generations.map((gen) => {
            const statusConfig = getStatusConfig(gen.statut);
            
            return (
              <div
                key={gen.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0,212,160,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {/* File Icon */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(0,212,160,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#00d4a0'
                }}>
                  {getFileIcon(gen.file_type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Reference & Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#ffffff',
                      fontFamily: 'var(--mono)'
                    }}>
                      {gen.reference}
                    </span>
                    <span style={{ color: '#334155' }}>•</span>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      {formatDate(gen.created_at)}
                    </span>
                    <span style={{ color: '#334155' }}>•</span>
                    <span style={{
                      fontSize: '11px',
                      color: '#00d4a0',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {gen.file_type === 'XML' && <HiDocumentText size={14} />}
                      {gen.file_type === 'ZIP' && <HiDocumentText size={14} />}
                      {(gen.file_type === 'XLSX' || gen.file_type === 'XLS') && <HiTable size={14} />}
                      {gen.file_type}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    <span>
                      {gen.factures} {gen.factures === 1 ? 'facture' : 'factures'}
                    </span>
                    <span style={{ color: '#334155' }}>•</span>
                    <span style={{
                      fontWeight: 600,
                      color: '#00d4a0',
                      fontFamily: 'var(--mono)'
                    }}>
                      {parseFloat(gen.montant_ttc).toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} MAD
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: statusConfig.bg,
                  color: statusConfig.color,
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {statusConfig.label}
                </div>

                {/* Download Button */}
                {gen.file_path && (
                  <button
                    onClick={() => handleDownload(gen.id, gen.file_name)}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 6,
                      border: 'none',
                      background: '#0d1728',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1a2236';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0d1728';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Télécharger"
                  >
                    <HiDownload size={26} color="#00ffcc" style={{ strokeWidth: 2 }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentGenerations;
