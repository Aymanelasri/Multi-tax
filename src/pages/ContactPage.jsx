import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Toast from '../components/ui/Toast';

const ContactPage = () => {
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
    { value: 'general', label: 'Question générale' },
    { value: 'xml', label: 'Problème de génération XML' },
    { value: 'dgi', label: 'Conformité DGI' },
    { value: 'import', label: 'Import / Export modules' },
    { value: 'autre', label: 'Autre' }
  ];

  const toast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';
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
      toast('✅ Message envoyé ! Nous vous répondrons sous 24h ouvrées.');
      setFormData({ nom: '', email: '', sujet: 'general', message: '' });
    } else {
      toast('⚠ Veuillez corriger les erreurs du formulaire');
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navigation />

      {/* Page Header */}
      <div style={{ padding: '60px 48px 32px', maxWidth: 'none' }}>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 800,
          color: '#0f2744',
          marginBottom: '12px',
          letterSpacing: '-0.5px'
        }}>
          Contactez EDI-TVA Maroc
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          lineHeight: '1.6',
          marginBottom: 0,
          maxWidth: '700px'
        }}>
          Notre support est disponible pour vous aider sur la génération de fichiers EDI, les questions DGI et les points essentiels d'usage.<br />
          Réponse rapide en jours ouvrés.
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
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f2744', marginBottom: '8px' }}>
            Support email
          </h3>
          <p style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#059669',
            marginBottom: '8px'
          }}>
            support@editvamaroc.ma
          </p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Réponse sous 24h ouvrées.
          </p>
        </div>

        {/* Card 2 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f2744', marginBottom: '12px' }}>
            À propos du support
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 12px 0',
            fontSize: '13px',
            color: '#475569',
            lineHeight: '1.8'
          }}>
            <li>Génération de fichiers EDI XML</li>
            <li>Conformité DGI SIMPL-TVA</li>
            <li>Import / Export de modules</li>
            <li>Problèmes de validation XML</li>
          </ul>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            fontStyle: 'italic',
            margin: 0
          }}>
            Nous répondons avec des conseils clairs pour vous aider à avancer rapidement.
          </p>
        </div>

        {/* Card 3 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f2744', marginBottom: '8px' }}>
            Ciblage Maroc
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#475569',
            lineHeight: '1.6',
            margin: 0
          }}>
            Le service est pensé pour les comptables, experts-comptables et entreprises au Maroc. Support en français et arabe, avec des formats adaptés aux exigences DGI.
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
          fontWeight: 700,
          color: '#0f2744',
          marginBottom: '24px'
        }}>
          Envoyer un message
        </h2>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nom */}
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px'
              }}>
                Nom complet <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: `1px solid ${errors.nom ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#0f2744',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.nom && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.nom}</span>}
            </div>

            {/* Email */}
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px'
              }}>
                Email professionnel <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: `1px solid ${errors.email ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#0f2744',
                  transition: 'border-color 0.2s'
                }}
              />
              {errors.email && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            {/* Sujet */}
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px'
              }}>
                Sujet <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#0f2744',
                  cursor: 'pointer'
                }}
              >
                {subjects.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '6px'
              }}>
                Message <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Décrivez votre problème ou question en détail..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: `1px solid ${errors.message ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#0f2744',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
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
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#16a34a'}
              onMouseLeave={(e) => e.target.style.background = '#22c55e'}
            >
              Envoyer le message →
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#0f2744',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '48px',
        color: '#ffffff'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Column 1 */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              EDI-TVA Maroc
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Générateur EDI SIMPL-TVA conforme aux standards DGI Maroc.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              Navigation
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li style={{ marginBottom: '8px' }}><a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Accueil</a></li>
              <li style={{ marginBottom: '8px' }}><a href="/generateur" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Générateur</a></li>
              <li><a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              Informations légales
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Mentions légales</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Confidentialité</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Conditions d'utilisation</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.6)'
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
