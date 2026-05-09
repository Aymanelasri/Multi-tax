import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Toast from '../components/ui/Toast';
import { useLang } from '../context/LanguageContext';
import api from '../lib/api';

const ContactPage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: 'general',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subjects = [
    { value: 'general', label: t('subject_1') },
    { value: 'xml', label: t('subject_2') },
    { value: 'dgi', label: t('subject_3') },
    { value: 'import', label: t('subject_4') },
    { value: 'autre', label: t('subject_5') }
  ];

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = t('form_error_name');
    if (!formData.email.trim()) newErrors.email = t('form_error_email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('form_error_email_invalid');
    if (!formData.message.trim()) newErrors.message = t('form_error_message');
    if (formData.message.trim().length < 10) newErrors.message = t('contact_min_message');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast(t('form_error_check'));
      return;
    }

    setIsLoading(true);
    try {
      await api.submitContact(
        formData.nom,
        formData.email,
        formData.sujet,
        formData.message
      );
      toast(t('toast_contact_success'));
      setFormData({ nom: '', email: '', sujet: 'general', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Premium background grid - same as HomePage */}
      <div className="grid-bg" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'all 0.3s ease',
        background: document.documentElement.classList.contains('light')
          ? 'linear-gradient(135deg, rgba(0,212,160,0.20), transparent 32%), radial-gradient(circle at bottom right, rgba(59,130,246,0.16), transparent 35%), radial-gradient(circle at center, rgba(139,92,246,0.08), transparent 40%), linear-gradient(rgba(0,212,160,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,160,0.06) 1px, transparent 1px)'
          : 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.02) 50%, transparent 100%), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px)',
        backgroundSize: document.documentElement.classList.contains('light')
          ? 'auto, auto, auto, 60px 60px, 60px 60px'
          : '100% 100%, 80px 80px, 80px 80px',
        backgroundPosition: document.documentElement.classList.contains('light')
          ? 'top left, bottom right, center, center, center'
          : 'center'
      }} />
      
      <div style={{ background: 'transparent', minHeight: '100vh', position: 'relative', zIndex: 1, transition: 'background-color 0.3s ease' }}>
      <Navigation />

      <div style={{ padding: '88px 48px 32px', maxWidth: 'none' }}>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          letterSpacing: '-0.5px',
          transition: 'color 0.3s ease'
        }}>
          {t('contact_title')}
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          marginBottom: 0,
          maxWidth: '700px',
          transition: 'color 0.3s ease'
        }}>
          {t('contact_sub1')}<br />
          {t('contact_sub2')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        padding: '0 48px 48px',
        maxWidth: '1200px'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '24px',
          transition: 'all 0.3s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,160,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>●</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', transition: 'color 0.3s ease' }}>
            {t('card1_title')}
          </h3>
          <p style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#00d4a0',
            marginBottom: '8px'
          }}>
            {t('card1_email')}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, transition: 'color 0.3s ease' }}>
            {t('card1_text')}
          </p>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '24px',
          transition: 'all 0.3s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,160,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '18px',
            marginBottom: '12px'
          }}>📄</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', transition: 'color 0.3s ease' }}>
            {t('card2_title')}
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: '1.8',
            transition: 'color 0.3s ease'
          }}>
            <li>{t('card2_item1')}</li>
            <li>{t('card2_item2')}</li>
            <li>{t('card2_item3')}</li>
            <li>{t('card2_item4')}</li>
          </ul>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            fontStyle: 'italic',
            margin: 0,
            transition: 'color 0.3s ease'
          }}>
            {t('card2_note')}
          </p>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '24px',
          transition: 'all 0.3s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,160,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#ec4899',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>MA</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', transition: 'color 0.3s ease' }}>
            {t('card3_title')}
          </h3>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            margin: 0,
            transition: 'color 0.3s ease'
          }}>
            {t('card3_text1')} {t('card3_text2')}
          </p>
        </div>
      </div>

      <div style={{
        padding: '0 48px 80px',
        maxWidth: '640px'
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '24px',
          transition: 'color 0.3s ease'
        }}>
          {t('form_title')}
        </h2>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          transition: 'all 0.3s ease'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px',
                transition: 'color 0.3s ease'
              }}>
                {t('form_name')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder={t('form_placeholder_name')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `1px solid ${errors.nom ? '#ef4444' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  height: '44px'
                }}
                onFocus={(e) => {
                  if (!errors.nom) {
                    e.target.style.borderColor = '#00d4a0';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,212,160,0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.nom) {
                    e.target.style.borderColor = 'var(--border-subtle)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.nom && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.nom}</span>}
            </div>

            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px',
                transition: 'color 0.3s ease'
              }}>
                {t('form_email')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('form_placeholder_email')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `1px solid ${errors.email ? '#ef4444' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  height: '44px'
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#00d4a0';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,212,160,0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'var(--border-subtle)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.email && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px',
                transition: 'color 0.3s ease'
              }}>
                {t('form_subject')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  height: '44px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00d4a0';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,212,160,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {subjects.map(s => (
                  <option key={s.value} value={s.value} style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px',
                transition: 'color 0.3s ease'
              }}>
                {t('form_message')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder={t('form_placeholder_message')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: `1px solid ${errors.message ? '#ef4444' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  if (!errors.message) {
                    e.target.style.borderColor = '#00d4a0';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,212,160,0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.message) {
                    e.target.style.borderColor = 'var(--border-subtle)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.message && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 24px',
                height: '48px',
                background: isLoading ? '#888888' : '#00d4a0',
                color: '#0a0f1a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '8px',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.background = '#00c896')}
              onMouseLeave={(e) => !isLoading && (e.target.style.background = '#00d4a0')}
            >
              {isLoading ? '⏳ ' + t('form_sending') : t('btn_send')}
            </button>
          </form>
        </div>
      </div>

      <footer style={{
        background: 'var(--dark-bg)',
        borderTop: '1px solid var(--border)',
        padding: '48px',
        color: 'var(--text-muted)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
              EDI-TVA Maroc
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, transition: 'color 0.3s ease' }}>
              {t('footer_tagline')}
            </p>
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
              {t('footer_nav')}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => navigate('/')} 
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.3s' }} 
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} 
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  {t('nav_home')}
                </button>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => navigate('/generateur')} 
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.3s' }} 
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} 
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  {t('nav_generator')}
                </button>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => navigate('/societes')} 
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.3s' }} 
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} 
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  {t('nav_societes')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact')} 
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.3s' }} 
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} 
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  {t('nav_contact')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>
              {t('footer_legal')}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li style={{ marginBottom: '8px' }}><button onClick={() => navigate('/legal#mentions')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#00d4a0'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>{t('footer_mentions')}</button></li>
              <li style={{ marginBottom: '8px' }}><button onClick={() => navigate('/legal#confidentialite')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#00d4a0'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>{t('footer_privacy')}</button></li>
              <li><button onClick={() => navigate('/legal#conditions')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#00d4a0'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>{t('footer_terms')}</button></li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-dim)',
          transition: 'all 0.3s ease'
        }}>
          <div>{t('footer_copy')}</div>
          <div>{t('footer_badges')}</div>
        </div>
      </footer>

      <Toast message={toastMsg} isVisible={showToast} />
      </div>
    </>
  );
};

export default ContactPage;
