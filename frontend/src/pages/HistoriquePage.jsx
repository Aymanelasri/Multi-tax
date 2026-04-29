import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Toast from '../components/ui/Toast';
import { useLang } from '../context/LanguageContext';
import api from '../lib/api';

const HistoriquePage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      setLoading(true);
      const response = await api.getGenerations();
      setGenerations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch generations:', error);
      toast('❌ Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (generation) => {
    try {
      setDownloading(generation.id);
      const blob = await api.downloadGeneration(generation.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generation.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast('✅ Fichier téléchargé avec succès');
    } catch (error) {
      console.error('Download failed:', error);
      toast('❌ Erreur lors du téléchargement: ' + error.message);
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'XML': return '📄';
      case 'ZIP': return '📦';
      case 'CSV': return '📊';
      default: return '📁';
    }
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'XML': return '#3b82f6';
      case 'ZIP': return '#8b5cf6';
      case 'CSV': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ background: '#0a0f1a', minHeight: '100vh' }}>
      <Navigation />

      {/* Page Header */}
      <div style={{ padding: '80px 48px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <button
            onClick={() => navigate('/generateur')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              e.target.style.color = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.15)';
              e.target.style.color = '#94a3b8';
            }}
          >
            ← Retour au générateur
          </button>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 900,
          color: '#ffffff',
          marginBottom: '12px',
          letterSpacing: '-0.5px'
        }}>
          📋 Historique des téléchargements
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: 0,
          maxWidth: '700px'
        }}>
          Consultez et téléchargez à nouveau vos fichiers EDI générés.
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '0 48px 80px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{
            background: '#141d2e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0,212,160,0.2)',
              borderTop: '3px solid #00d4a0',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Chargement de l'historique...</p>
          </div>
        ) : generations.length === 0 ? (
          <div style={{
            background: '#141d2e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Aucun téléchargement
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              Vous n'avez pas encore généré de fichiers EDI.
            </p>
            <button
              onClick={() => navigate('/generateur')}
              style={{
                padding: '12px 24px',
                background: '#00d4a0',
                color: '#0a0f1a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#00c896'}
              onMouseLeave={(e) => e.target.style.background = '#00d4a0'}
            >
              Créer une déclaration →
            </button>
          </div>
        ) : (
          <div style={{
            background: '#141d2e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 100px 120px 150px 120px',
              gap: '16px',
              padding: '16px 24px',
              background: 'rgba(0,0,0,0.2)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              <div></div>
              <div>Nom du fichier</div>
              <div>Type</div>
              <div>Taille</div>
              <div>Date</div>
              <div style={{ textAlign: 'center' }}>Action</div>
            </div>

            {/* Table Body */}
            {generations.map((gen, index) => (
              <div
                key={gen.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 100px 120px 150px 120px',
                  gap: '16px',
                  padding: '20px 24px',
                  borderBottom: index < generations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.2s ease',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Icon */}
                <div style={{ fontSize: '24px' }}>
                  {getFileIcon(gen.file_type)}
                </div>

                {/* File Name */}
                <div>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {gen.file_name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>
                    Réf: {gen.reference}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: `${getFileTypeColor(gen.file_type)}20`,
                    color: getFileTypeColor(gen.file_type),
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}>
                    {gen.file_type}
                  </span>
                </div>

                {/* Size */}
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  {formatFileSize(gen.file_size)}
                </div>

                {/* Date */}
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  {formatDate(gen.created_at)}
                </div>

                {/* Download Button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleDownload(gen)}
                    disabled={downloading === gen.id}
                    style={{
                      padding: '8px 16px',
                      background: downloading === gen.id ? '#374151' : '#00d4a0',
                      color: downloading === gen.id ? '#9ca3af' : '#0a0f1a',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: downloading === gen.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: downloading === gen.id ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (downloading !== gen.id) {
                        e.target.style.background = '#00c896';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (downloading !== gen.id) {
                        e.target.style.background = '#00d4a0';
                      }
                    }}
                  >
                    {downloading === gen.id ? '⏳' : '↓'} Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {generations.length > 0 && (
          <div style={{
            marginTop: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: '#141d2e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
                Total des fichiers
              </div>
              <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>
                {generations.length}
              </div>
            </div>

            <div style={{
              background: '#141d2e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
                Total des factures
              </div>
              <div style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>
                {generations.reduce((sum, gen) => sum + (gen.factures || 0), 0)}
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast message={toastMsg} isVisible={showToast} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .table-grid {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HistoriquePage;
