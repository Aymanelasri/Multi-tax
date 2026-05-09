import React, { useState, useEffect } from 'react';
import { HiDownload, HiDocumentText, HiTable, HiExternalLink } from 'react-icons/hi';
import api from '../lib/api';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        return { color: 'var(--primary-green)', bg: 'rgba(0,212,160,0.08)', label: 'Succès' };
      case 'error':
        return { color: 'var(--red)', bg: 'rgba(239,68,68,0.08)', label: 'Erreur' };
      case 'pending':
        return { color: 'var(--amber)', bg: 'rgba(251,191,36,0.08)', label: 'En cours' };
      default:
        return { color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.06)', label: statut };
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
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 16
        }}>
          📋 Générations récentes
        </div>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '24px', marginBottom: 8 }}>⏳</div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 16
        }}>
          📋 Générations récentes
        </div>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--red)',
          fontSize: '14px'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="recent-gen-container" style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '24px',
      boxShadow: 'var(--shadow-md)',
      transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: '2px solid rgba(0,212,160,0.15)'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          letterSpacing: '-0.5px'
        }}>
          📋 Générations récentes
          {generations.length > 0 && (
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--primary-green)',
              background: 'var(--green-tint)',
              padding: '3px 10px',
              borderRadius: 20,
              border: '1px solid var(--green-border)'
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
              color: 'var(--primary-green)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-bright)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary-green)'}
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
          color: 'var(--text-muted)',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: 12 }}>📭</div>
          <div>Aucune génération récente</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {generations.map((gen) => {
            const statusConfig = getStatusConfig(gen.statut);
            
            return (
              <div
                  key={gen.id}
                  className="d-flex align-items-center p-3 border rounded"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--green-tint)';
                    e.currentTarget.style.borderColor = 'var(--green-border)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,212,160,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--input-bg)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                {/* File Icon */}
                <div className="flex-shrink-0" style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--green-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-green)',
                  border: '1px solid var(--green-border)',
                  boxShadow: '0 4px 12px rgba(0,212,160,0.12)'
                }}>
                  {getFileIcon(gen.file_type)}
                </div>

                {/* Content */}
                <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                  {/* Reference & Date */}
                  <div className="d-flex align-items-center flex-wrap" style={{ gap: '4px', marginBottom: 4 }}>
                    <span className="fw-bold text-truncate" style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--mono)',
                      maxWidth: '120px',
                      letterSpacing: '0.5px'
                    }}>
                      {gen.reference}
                    </span>
                    <span className="d-none d-sm-inline" style={{ color: '#334155', fontSize: '11px' }}>•</span>
                    <span className="text-truncate" style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)'
                    }}>
                      {formatDate(gen.created_at)}
                    </span>
                    <span className="d-none d-sm-inline" style={{ color: '#334155', fontSize: '11px' }}>•</span>
                    <span className="d-flex align-items-center" style={{
                      fontSize: '11px',
                      color: 'var(--primary-green)',
                      fontWeight: 600,
                      gap: 4
                    }}>
                      {gen.file_type === 'XML' && <HiDocumentText size={14} />}
                      {gen.file_type === 'ZIP' && <HiDocumentText size={14} />}
                      {(gen.file_type === 'XLSX' || gen.file_type === 'XLS') && <HiTable size={14} />}
                      {gen.file_type}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="d-flex align-items-center flex-wrap" style={{ gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span className="text-nowrap">
                      {gen.factures} {gen.factures === 1 ? 'facture' : 'factures'}
                    </span>
                    <span className="d-none d-sm-inline" style={{ color: '#334155' }}>•</span>
                    <span className="fw-semibold text-nowrap" style={{
                      color: 'var(--primary-green)',
                      fontFamily: 'var(--mono)',
                      fontSize: '13px',
                      fontWeight: 700
                    }}>
                      {parseFloat(gen.montant_ttc).toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} MAD
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0 badge text-nowrap" style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: statusConfig.bg,
                  color: statusConfig.color,
                  fontSize: '11px',
                  fontWeight: 800,
                  border: `1px solid ${statusConfig.color}40`,
                  boxShadow: `0 2px 8px ${statusConfig.color}20`
                }}>
                  {statusConfig.label}
                </div>

                {/* Download Button */}
                {gen.file_path && (
                  <button
                    className="btn btn-sm flex-shrink-0 p-0"
                    onClick={() => handleDownload(gen.id, gen.file_name)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: '1px solid var(--green-border)',
                      background: 'var(--green-tint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,212,160,0.12)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,212,160,0.25)';
                      e.currentTarget.style.transform = 'scale(1.05) rotate(3deg)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,212,160,0.18)';
                      e.currentTarget.style.borderColor = 'rgba(0,255,204,0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--green-tint)';
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,212,160,0.12)';
                      e.currentTarget.style.borderColor = 'var(--green-border)';
                    }}
                    title="Télécharger"
                  >
                    <HiDownload size={22} color="var(--primary-green)" style={{ strokeWidth: 2 }} />
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
