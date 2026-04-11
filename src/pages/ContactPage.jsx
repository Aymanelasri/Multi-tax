import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Toast from '../components/ui/Toast';
import { useLang } from '../context/LanguageContext';

const ContactPage = () => {
  const { t } = useLang();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: 'general',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      toast(t('toast_contact_success'));
      setFormData({ nom: '', email: '', sujet: 'general', message: '' });
    } else {
      toast(t('form_error_check'));
    }
  };

  return (
    <div style={{ background: '#0a0f1a', minHeight: '100vh' }}>
      <Navigation />

      {/* Page Header */}
      <div style={{ padding: '60px 48px 32px', maxWidth: 'none' }}>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 900,
          color: '#ffffff',
          marginBottom: '12px',
          letterSpacing: '-0.5px'
        }}>
          {t('contact_title')}
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: 0,
          maxWidth: '700px'
        }}>
          {t('contact_sub1')}<br />
          {t('contact_sub2')}
        </p>
      </div>

      {/* 3-Column Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        padding: '0 48px 48px',
        maxWidth: '1200px'
      }}>
        {/* Card 1 */}
        <div style={{
          background: '#141d2e',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '24px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,160,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
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
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            {t('card1_text')}
          </p>
        </div>

        {/* Card 2 */}
        <div style={{
          background: '#141d2e',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '24px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,160,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
            {t('card2_title')}
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.8'
          }}>
            <li>{t('card2_item1')}</li>
            <li>{t('card2_item2')}</li>
            <li>{t('card2_item3')}</li>
            <li>{t('card2_item4')}</li>
          </ul>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            fontStyle: 'italic',
            margin: 0
          }}>
            {t('card2_note')}
          </p>
        </div>

        {/* Card 3 */}
        <div style={{
          background: '#141d2e',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '24px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,160,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            {t('card3_title')}
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.6',
            margin: 0
          }}>
            {t('card3_text1')} {t('card3_text2')}
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div style={{
        padding: '0 48px 80px',
        maxWidth: '640px'
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '24px'
        }}>
          {t('form_title')}
        </h2>

        <div style={{
          background: '#141d2e',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nom */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px'
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
                  border: `1px solid ${errors.nom ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '8px',
                  background: '#0d1728',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
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
                    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.nom && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.nom}</span>}
            </div>

            {/* Email */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px'
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
                  border: `1px solid ${errors.email ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '8px',
                  background: '#0d1728',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
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
                    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.email && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            {/* Sujet */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px'
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
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  background: '#0d1728',
                  color: '#ffffff',
                  cursor: 'pointer',
                  height: '44px',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00d4a0';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,212,160,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {subjects.map(s => (
                  <option key={s.value} value={s.value} style={{ background: '#0d1728', color: '#ffffff' }}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '6px'
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
                  border: `1px solid ${errors.message ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '8px',
                  background: '#0d1728',
                  color: '#ffffff',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  if (!errors.message) {
                    e.target.style.borderColor = '#00d4a0';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,212,160,0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.message) {
                    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.message && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 24px',
                height: '48px',
                background: '#00d4a0',
                color: '#0a0f1a',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#00c896'}
              onMouseLeave={(e) => e.target.style.background = '#00d4a0'}
            >
              {t('btn_send')}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#060d18',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '48px',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Column 1 */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>
              EDI-TVA Maroc
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Générateur EDI SIMPL-TVA conforme aux standards DGI Maroc.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
              Navigation
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li style={{ marginBottom: '8px' }}><a href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>Accueil</a></li>
              <li style={{ marginBottom: '8px' }}><a href="/generateur" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>Générateur</a></li>
              <li><a href="/contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>Contact</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
              Informations légales
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li style={{ marginBottom: '8px' }}><button onClick={() => {}} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>Mentions légales</button></li>
              <li style={{ marginBottom: '8px' }}><button onClick={() => {}} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>Confidentialité</button></li>
              <li><button onClick={() => {}} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>Conditions d'utilisation</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)'
        }}>
          <div>© 2025 EDI-TVA Maroc — Générateur EDI SIMPL-TVA conforme DGI Maroc.</div>
          <div>100% local · Gratuit · Conforme DGI</div>
        </div>
      </footer>

      <Toast message={toastMsg} isVisible={showToast} />
    </div>
  );
};

export default ContactPage;
