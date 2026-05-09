import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiDownload, HiDocumentText, HiFolder, HiTable } from 'react-icons/hi';
import Navigation from '../components/Navigation';
import Toast from '../components/ui/Toast';
import { useLang } from '../context/LanguageContext';
import api from '../lib/api';
import '../styles/historique-mobile.css';

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
      toast(t('historique_error'));
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
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generation.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast(t('historique_success'));
    } catch (error) {
      console.error('Download failed:', error);
      toast(t('historique_error') + ': ' + error.message);
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'XML': return <HiDocumentText size={24} color="#3b82f6" />;
      case 'ZIP': return <HiFolder size={24} color="#8b5cf6" />;
      case 'CSV': return <HiTable size={24} color="#10b981" />;
      default: return <HiDocumentText size={24} color="#64748b" />;
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
    <div style={{ background: 'var(--page-bg)', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      <Navigation />

      <div className="historique-page-header" style={{ padding: '80px 48px 32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <button
            onClick={() => navigate('/generateur')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.color = 'var(--text-muted)';
            }}
          >
            {t('historique_back')}
          </button>
        </div>

        <h1 className="historique-page-title" style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
          transition: 'color 0.3s ease'
        }}>
          📋 {t('historique_title')}
        </h1>
        <p className="historique-page-subtitle" style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          marginBottom: 0,
          maxWidth: '700px',
          transition: 'color 0.3s ease'
        }}>
          {t('historique_subtitle')}
        </p>
      </div>

      <div className="historique-content" style={{ padding: '0 48px 80px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
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
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', transition: 'color 0.3s ease' }}>{t('historique_loading')}</p>
          </div>
        ) : generations.length === 0 ? (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, marginBottom: '8px', transition: 'color 0.3s ease' }}>
              {t('historique_empty_title')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', transition: 'color 0.3s ease' }}>
              {t('historique_empty_text')}
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
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#00c896'}
              onMouseLeave={(e) => e.target.style.background = '#00d4a0'}
            >
              {t('historique_create_btn')}
            </button>
          </div>
        ) : (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            <div className="historique-table-header" style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 100px 120px 150px 120px',
              gap: '16px',
              padding: '16px 24px',
              background: 'var(--dark-bg)',
              borderBottom: '1px solid var(--border)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              transition: 'all 0.3s ease'
            }}>
              <div></div>
              <div>{t('historique_col_file')}</div>
              <div>{t('historique_col_type')}</div>
              <div>{t('historique_col_size')}</div>
              <div>{t('historique_col_date')}</div>
              <div style={{ textAlign: 'center' }}>{t('historique_col_action')}</div>
            </div>

            {generations.map((gen, index) => (
              <div
                key={gen.id}
                className="historique-table-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 100px 120px 150px 120px',
                  gap: '16px',
                  padding: '20px 24px',
                  borderBottom: index < generations.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'all 0.3s ease',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--input-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="historique-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getFileIcon(gen.file_type)}
                </div>

                <div className="historique-file-info">
                  <div className="historique-file-name" title={gen.file_name} style={{
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    wordBreak: 'break-word',
                    transition: 'color 0.3s ease'
                  }}>
                    {gen.file_name}
                  </div>
                  <div className="historique-file-ref" style={{ color: 'var(--text-dim)', fontSize: '12px', transition: 'color 0.3s ease' }}>
                    Réf: {gen.reference}
                  </div>
                </div>

                <div>
                  <span className="historique-type-badge" style={{
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

                <div className="historique-size" style={{ color: 'var(--text-muted)', fontSize: '13px', transition: 'color 0.3s ease' }}>
                  {formatFileSize(gen.file_size)}
                </div>

                <div className="historique-date" style={{ color: 'var(--text-muted)', fontSize: '13px', transition: 'color 0.3s ease' }}>
                  {formatDate(gen.created_at)}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    className="historique-download-btn"
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
                      transition: 'all 0.3s ease',
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
                    {downloading === gen.id ? '⏳' : <HiDownload size={16} />} {downloading === gen.id ? t('historique_downloading') : t('historique_download_btn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {generations.length > 0 && (
          <div className="historique-stats" style={{
            marginTop: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px', transition: 'color 0.3s ease' }}>
                {t('historique_stats_total')}
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, transition: 'color 0.3s ease' }}>
                {generations.length}
              </div>
            </div>

            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px', transition: 'color 0.3s ease' }}>
                {t('historique_stats_invoices')}
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, transition: 'color 0.3s ease' }}>
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
