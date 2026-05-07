import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const AVATAR_COLORS = ['#00d4a0','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'];
const avatarColor = (nom) => AVATAR_COLORS[(nom?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (nom) => (nom || '?').slice(0, 2).toUpperCase();

const EMPTY = { if: '', nom: '', rc: '', ice: '', tp: '', cnss: '', adresse: '', ville: '', tel: '', email: '' };

const inputStyle = {
  background: '#0d1728', border: '1px solid rgba(255,255,255,0.12)',
  color: '#f0f4f8', borderRadius: 8, height: 44, padding: '0 14px',
  fontSize: '0.87rem', width: '100%', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const Modal = ({ societe, onClose, onSave, t, allSocietes }) => {
  const [form, setForm] = useState(societe ? { ...societe } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    // Clear error for this field when user types
    if (errors[k]) {
      setErrors(prev => ({ ...prev, [k]: '' }));
    }
  };

  const validateICE = (ice) => {
    if (!ice || ice.trim() === '') return t('error_ice_required');
    if (!/^\d+$/.test(ice)) return t('error_ice_numeric');
    if (ice.length !== 15) return t('error_ice_length');
    return '';
  };

  const handleSave = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!form.nom?.trim()) newErrors.nom = t('field_nom_rs') + ' requis';
    if (!form.if?.trim()) newErrors.if = t('field_if') + ' requis';
    if (!form.rc?.trim()) newErrors.rc = t('field_rc') + ' requis';
    if (!form.adresse?.trim()) newErrors.adresse = t('field_adresse') + ' requis';
    if (!form.ville?.trim()) newErrors.ville = t('field_ville') + ' requis';
    if (!form.tp?.trim()) newErrors.tp = t('error_tp_required');
    if (!form.cnss?.trim()) newErrors.cnss = t('error_cnss_required');
    
    // ICE validation (required + 15 digits)
    const iceError = validateICE(form.ice);
    if (iceError) newErrors.ice = iceError;
    
    // Uniqueness validation
    const editingId = societe?.id;
    allSocietes.forEach(s => {
      if (s.id === editingId) return;
      
      // ICE - unique always
      if (form.ice && s.ice && form.ice.trim() === s.ice.trim()) {
        newErrors.ice = 'ICE déjà utilisé';
      }
      
      // IF - unique always
      if (form.if && s.if && form.if.trim() === s.if.trim()) {
        newErrors.if = 'IF déjà utilisé';
      }
      
      // CNSS - unique always
      if (form.cnss && s.cnss && form.cnss.trim() === s.cnss.trim()) {
        newErrors.cnss = 'CNSS déjà utilisé';
      }
      
      // RC - unique per city
      if (form.rc && s.rc && form.rc.trim() === s.rc.trim()) {
        const sameVille = form.ville && s.ville && 
          form.ville.toLowerCase().trim() === s.ville.toLowerCase().trim();
        const noVille = !form.ville || !s.ville;
        
        if (sameVille) {
          newErrors.rc = 'RC déjà utilisé dans cette ville';
        } else if (noVille) {
          newErrors.rc_warning = 'RC potentiellement en doublon — précisez la ville';
        }
      }
    });
    
    if (Object.keys(newErrors).filter(k => k !== 'rc_warning').length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = document.querySelector('[data-error="true"]');
        if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    
    onSave(form);
  };

  const fields = [
    [{ key: 'nom', label: t('field_nom_rs'), required: true }, { key: 'if', label: t('field_if'), required: true }],
    [{ key: 'rc', label: t('field_rc'), required: true }, { key: 'ice', label: t('field_ice_required'), required: true, hint: t('hint_ice_digits'), maxLength: 15, numeric: true }],
    [{ key: 'tp', label: t('field_tp'), required: true }, { key: 'cnss', label: t('field_cnss'), required: true }],
    [{ key: 'adresse', label: t('field_adresse'), required: true }, { key: 'ville', label: t('field_ville'), required: true }],
    [{ key: 'tel', label: t('field_tel_optional') }, { key: 'email', label: t('field_email_optional') }],
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#141d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4f8', margin: 0 }}>
            {societe ? t('societes_modal_edit') : t('societes_modal_add')}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {fields.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14, alignItems: 'start' }}>
            {row.map(({ key, label, required, hint, maxLength, numeric }) => {
              const placeholders = {
                if: '12345678',
                nom: 'Société ABC',
                ice: '15 chiffres',
                rc: '',
                tp: '',
                cnss: '',
                adresse: '',
                ville: '',
                tel: '+212600000000',
                email: ''
              };
              
              const iceLength = key === 'ice' ? (form[key] || '').length : 0;
              const iceBorderColor = key === 'ice' 
                ? (iceLength === 0 ? 'rgba(255,255,255,0.08)' : iceLength === 15 ? '#00d4a0' : '#ef4444')
                : errors[key] ? '#ef4444' : 'rgba(255,255,255,0.08)';
              
              return (
                <div key={key} data-error={errors[key] ? 'true' : 'false'} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Label row - fixed height */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 20, marginBottom: 6 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {label}
                    </span>
                    {hint && (
                      <span style={{ 
                        fontSize: '10px', 
                        color: '#475569', 
                        fontWeight: 400, 
                        textTransform: 'none',
                        letterSpacing: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        ({hint})
                      </span>
                    )}
                  </div>
                  
                  {/* Input - fixed height */}
                  <input
                    value={form[key] || ''}
                    onChange={e => {
                      let val = e.target.value;
                      if (numeric) val = val.replace(/\D/g, '');
                      if (maxLength && val.length > maxLength) val = val.slice(0, maxLength);
                      set(key, val);
                    }}
                    placeholder={placeholders[key] || ''}
                    maxLength={maxLength}
                    style={{
                      ...inputStyle, 
                      color: form[key] ? '#f0f4f8' : '#64748b', 
                      borderColor: iceBorderColor, 
                      transition: 'border-color 0.2s',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => { if (key !== 'ice') e.target.style.borderColor = '#00d4a0'; }}
                    onBlur={e => { if (key !== 'ice') e.target.style.borderColor = errors[key] ? '#ef4444' : 'rgba(255,255,255,0.08)'; }}
                  />
                  
                  {/* ICE counter */}
                  {key === 'ice' && (
                    <div style={{ fontSize: '11px', marginTop: 4, color: iceLength === 15 ? '#00d4a0' : iceLength > 0 ? '#ef4444' : '#64748b', minHeight: 0 }}>
                      {iceLength} / 15 chiffres
                    </div>
                  )}
                  
                  {/* Error message */}
                  {errors[key] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', color: '#fca5a5', marginTop: 4, animation: 'fadeIn 0.15s ease', minHeight: 0 }}>
                      ✗ {errors[key]}
                    </div>
                  )}
                  
                  {/* Warning message for RC */}
                  {key === 'rc' && errors.rc_warning && !errors.rc && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', color: '#fcd34d', marginTop: 4, animation: 'fadeIn 0.15s ease', minHeight: 0 }}>
                      ⚠ {errors.rc_warning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>



        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
            {t('societes_cancel')}
          </button>
          <button 
            onClick={handleSave} 
            disabled={errors.ice || errors.if || errors.cnss || errors.rc}
            style={{ 
              padding: '10px 24px', 
              borderRadius: 8, 
              background: (errors.ice || errors.if || errors.cnss || errors.rc) 
                ? 'rgba(100,116,139,0.3)' 
                : 'linear-gradient(135deg,#10b981,#34d399)', 
              border: 'none', 
              color: (errors.ice || errors.if || errors.cnss || errors.rc) ? '#64748b' : '#000', 
              fontWeight: 700, 
              cursor: (errors.ice || errors.if || errors.cnss || errors.rc) ? 'not-allowed' : 'pointer', 
              fontSize: '0.85rem', 
              fontFamily: 'inherit',
              opacity: (errors.ice || errors.if || errors.cnss || errors.rc) ? 0.6 : 1
            }}
          >
            {t('societes_save')}
          </button>
        </div>
      </div>
    </div>
  );
};

const SocietesPage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const { isApproved } = useAuth();
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | societe object
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [confirmId, setConfirmId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding only if user hasn't dismissed it
    const seen = localStorage.getItem('onboarding_societes_seen');
    return !seen;
  });
  const [startDeclModal, setStartDeclModal] = useState(null); // null or societe object
  const [startDeclForm, setStartDeclForm] = useState({
    identifiantFiscal: '',
    annee: new Date().getFullYear().toString(),
    regime: '1',
    periode: '',
  });
  const [startDeclErr, setStartDeclErr] = useState('');
  const [periodeError, setPeriodeError] = useState('');

  // ✅ CRITICAL: Fetch societes from API on mount (never from localStorage)
  useEffect(() => {
    if (!isApproved) {
      setLoading(false);
      return;
    }

    const fetchSocietes = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.getSocietes();
        setSocietes(response.data || []);
      } catch (err) {
        setError(err.message);
        setSocietes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSocietes();
  }, [isApproved]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = societes.filter(s =>
      !q || [s.nom, s.if, s.ice, s.rc, s.ville].some(v => (v || '').toLowerCase().includes(q))
    );
    if (sort === 'name') list = [...list].sort((a, b) => a.nom.localeCompare(b.nom));
    else if (sort === 'recent') list = [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    else if (sort === 'used') list = [...list].sort((a, b) => (b.last_used || 0) - (a.last_used || 0));
    return list;
  }, [societes, search, sort]);

  // ✅ CRITICAL: Save to API, not localStorage
  const handleSave = async (form) => {
    try {
      setError('');
      if (modal?.id) {
        // Update existing
        const response = await api.updateSociete(modal.id, form);
        setSocietes(societes.map(s => s.id === modal.id ? response.data : s));
      } else {
        // Create new
        const response = await api.createSociete(form);
        setSocietes([...societes, response.data]);
      }
      setModal(null);
    } catch (err) {
      // Check if it's a validation error from backend
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Backend returned validation errors - show them in modal
        const backendErrors = err.response.data.errors;
        const errorMessages = Object.entries(backendErrors)
          .map(([field, messages]) => `${field.toUpperCase()}: ${messages.join(', ')}`)
          .join(' | ');
        setError(errorMessages);
      } else {
        setError(err.message);
      }
    }
  };

  // ✅ CRITICAL: Delete from API, not localStorage
  const handleDelete = async (id) => {
    try {
      setError('');
      await api.deleteSociete(id);
      setSocietes(societes.filter(s => s.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const dismissOnboarding = () => {
    localStorage.setItem('onboarding_societes_seen', 'true');
    setShowOnboarding(false);
  };

  const handleUse = async (s) => {
    // Don't increment usage here - only when declaration is completed
    setStartDeclForm({
      identifiantFiscal: s.if || '',
      ice: s.ice || '',
      annee: new Date().getFullYear().toString(),
      regime: '1',
      periode: '',
    });
    setStartDeclErr('');
    setPeriodeError('');
    setStartDeclModal(s);
  };

  const validatePeriode = (periode, regime) => {
    if (!periode || periode.trim() === '') {
      return 'La période est requise';
    }
    
    const num = parseInt(periode, 10);
    
    if (isNaN(num) || num.toString() !== periode.trim() || num < 0) {
      return 'La période doit être un nombre entier positif';
    }
    
    if (regime === '1') {
      if (num < 1 || num > 12) {
        return 'La période doit être entre 1 et 12 pour le régime mensuel';
      }
    } else if (regime === '2') {
      if (num < 1 || num > 4) {
        return 'La période doit être entre 1 et 4 pour le régime trimestriel';
      }
    }
    
    return '';
  };

  const handleStartDeclContinue = async () => {
    setStartDeclErr('');
    setPeriodeError('');
    
    // Validate fields
    if (!startDeclForm.identifiantFiscal?.trim()) {
      setStartDeclErr(t('error_1_8_digits'));
      return;
    }
    if (!/^\d{1,8}$/.test(startDeclForm.identifiantFiscal)) {
      setStartDeclErr(t('error_1_8_digits'));
      return;
    }
    if (!startDeclForm.annee?.trim()) {
      setStartDeclErr(t('field_annee') + ' requis');
      return;
    }
    
    // Validate période
    const periodeErr = validatePeriode(startDeclForm.periode, startDeclForm.regime);
    if (periodeErr) {
      setPeriodeError(periodeErr);
      return;
    }

    // ✅ Increment usage count ONLY when user clicks "Continuer →"
    try {
      const response = await api.incrementSocieteUsage(startDeclModal.id);
      setSocietes(societes.map(soc => soc.id === startDeclModal.id ? response.data : soc));
    } catch (err) {
      console.error('Failed to increment usage:', err);
    }

    // Navigate to generator with state
    navigate('/generateur', {
      state: {
        identification: startDeclForm,
        prefillFournisseur: {
          if: startDeclModal.if,
          nom: startDeclModal.nom,
          ice: startDeclModal.ice
        },
        skipToStep2: true
      }
    });
    setStartDeclModal(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c1f' }}>
      <Navigation />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '88px 48px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#f0f4f8', letterSpacing: '-1.5px', marginBottom: 8 }}>
              {t('societes_title')}
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>{t('societes_subtitle')}</p>
          </div>
          <button
            onClick={() => setModal('add')}
            disabled={loading}
            style={{ padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#34d399)', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(16,185,129,0.3)', opacity: loading ? 0.5 : 1 }}
          >
            {t('societes_add')}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#ef4444', fontSize: '0.85rem' }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid rgba(0,212,160,0.2)', borderTop: '3px solid #00d4a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 20 }} />
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('loading') || 'Chargement...'}</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Onboarding banner */}
        {!loading && showOnboarding && societes.length === 0 && (
          <div style={{ background: 'rgba(0,212,160,0.08)', border: '1px solid rgba(0,212,160,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '24px', flexShrink: 0 }}>💡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                {t('societes_onboarding_title')}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {t('societes_onboarding_subtitle')}
              </div>
            </div>
            <button
              onClick={dismissOnboarding}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', padding: 0, flexShrink: 0, lineHeight: 1 }}
            >
              × Compris
            </button>
          </div>
        )}

        {/* Search + Sort */}
        {!loading && societes.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('societes_search')}
              style={{ ...inputStyle, flex: 1, minWidth: 200, maxWidth: 360, height: 42 }}
              onFocus={e => e.target.style.borderColor = '#00d4a0'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ ...inputStyle, width: 160, height: 42, cursor: 'pointer', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 34, appearance: 'none', WebkitAppearance: 'none' }}
            >
              <option value="name">Nom A-Z</option>
              <option value="recent">Plus récent</option>
              <option value="used">Plus utilisé</option>
            </select>
          </div>
        )}

        {/* Empty state */}
        {!loading && societes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>🏢</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f4f8', marginBottom: 10 }}>{t('societes_empty')}</div>
            <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: 28 }}>{t('societes_empty_sub')}</div>
            <button onClick={() => setModal('add')} style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#34d399)', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('societes_add')}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(s => (
              <div
                key={s.id}
                style={{ background: '#141d2e', border: `1px solid ${confirmId === s.id ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: 20, transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => { if (confirmId !== s.id) e.currentTarget.style.borderColor = 'rgba(0,212,160,0.3)'; }}
                onMouseLeave={e => { if (confirmId !== s.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor(s.nom), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#0a0f1a', flexShrink: 0 }}>
                    {initials(s.nom)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f4f8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nom}</div>
                    {s.if && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>IF: {s.if}</div>}
                  </div>
                </div>

                {/* Card details */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {s.rc && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>RC: <span style={{ color: '#cbd5e1' }}>{s.rc}</span></div>}
                  {s.ice && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ICE: <span style={{ color: '#cbd5e1' }}>{s.ice}</span></div>}
                  {s.tp && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TP: <span style={{ color: '#cbd5e1' }}>{s.tp}</span></div>}
                  {s.cnss && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CNSS: <span style={{ color: '#cbd5e1' }}>{s.cnss}</span></div>}
                  {s.ville && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📍 <span style={{ color: '#cbd5e1' }}>{s.ville}</span></div>}
                  {s.last_used && <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2 }}>Dernière utilisation: {new Date(s.last_used).toLocaleDateString('fr-MA')}</div>}
                </div>

                {/* Card footer */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500 }}>
                    {t('societes_used_count')} {s.usage_count || 0}x
                  </span>

                  {confirmId === s.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Supprimer ?</span>
                      <button onClick={() => handleDelete(s.id)} style={{ padding: '3px 10px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit' }}>Oui</button>
                      <button onClick={() => setConfirmId(null)} style={{ padding: '3px 10px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit' }}>Non</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleUse(s)} style={{ padding: '5px 12px', fontSize: '0.75rem', background: 'rgba(0,212,160,0.1)', border: '1px solid rgba(0,212,160,0.25)', color: '#00d4a0', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,160,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,160,0.1)'}
                      >{t('societes_use')}</button>
                      <button onClick={() => setModal(s)} style={{ padding: '5px 12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >{t('societes_edit')}</button>
                      <button onClick={() => setConfirmId(s.id)} style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      >🗑</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && societes.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b', fontSize: '0.88rem' }}>
            Aucun résultat pour "{search}"
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          societe={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          t={t}
          allSocietes={societes}
        />
      )}

      {/* Start Declaration Modal */}
      {startDeclModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#141d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4f8', marginBottom: 8 }}>{t('societes_modal_start_title')}</h2>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
                {t('societes_modal_start_subtitle').replace('{{company}}', startDeclModal.nom)}
              </p>
            </div>

            {/* Step 1 fields */}
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00d4a0', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
                {t('societes_modal_start_header_info')}
              </label>

              {/* IF field */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                  {t('field_if')} <span style={{ color: '#00d4a0' }}>*</span>
                </label>
                <input
                  value={startDeclForm.identifiantFiscal}
                  onChange={e => setStartDeclForm({ ...startDeclForm, identifiantFiscal: e.target.value })}
                  style={inputStyle}
                  placeholder="1-8 chiffres"
                  onFocus={e => e.target.style.borderColor = '#00d4a0'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              {/* Année field */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                  {t('field_annee')} <span style={{ color: '#00d4a0' }}>*</span>
                </label>
                <input
                  type="number"
                  value={startDeclForm.annee}
                  onChange={e => setStartDeclForm({ ...startDeclForm, annee: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#00d4a0'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              {/* Régime field */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                  {t('field_regime')} <span style={{ color: '#00d4a0' }}>*</span>
                </label>
                <select
                  value={startDeclForm.regime}
                  onChange={e => setStartDeclForm({ ...startDeclForm, regime: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 34, appearance: 'none', WebkitAppearance: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#00d4a0'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                >
                  <option value="1">Mensuel</option>
                  <option value="2">Trimestriel</option>
                </select>
              </div>

              {/* Période field */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                  {t('field_periode')} <span style={{ color: '#00d4a0' }}>*</span>
                </label>
                <input
                  type="number"
                  value={startDeclForm.periode}
                  onChange={e => {
                    setStartDeclForm({ ...startDeclForm, periode: e.target.value });
                    setPeriodeError('');
                  }}
                  onBlur={() => {
                    const err = validatePeriode(startDeclForm.periode, startDeclForm.regime);
                    setPeriodeError(err);
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: periodeError ? '#ef4444' : 'rgba(255,255,255,0.12)'
                  }}
                  placeholder={startDeclForm.regime === '1' ? '1-12 (mensuel)' : '1-4 (trimestriel)'}
                  onFocus={e => { if (!periodeError) e.target.style.borderColor = '#00d4a0'; }}
                />
                {periodeError && (
                  <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ❌ {periodeError}
                  </div>
                )}
              </div>
            </div>

            {startDeclErr && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: 14 }}>⚠ {startDeclErr}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setStartDeclModal(null)} style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                {t('societes_modal_cancel')}
              </button>
              <button onClick={handleStartDeclContinue} disabled={!!periodeError} style={{ 
                padding: '10px 24px', 
                borderRadius: 8, 
                background: periodeError ? 'rgba(100,116,139,0.3)' : 'linear-gradient(135deg,#10b981,#34d399)', 
                border: 'none', 
                color: periodeError ? '#64748b' : '#000', 
                fontWeight: 700, 
                cursor: periodeError ? 'not-allowed' : 'pointer', 
                fontSize: '0.85rem', 
                fontFamily: 'inherit',
                opacity: periodeError ? 0.6 : 1
              }}>
                {t('societes_modal_continue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietesPage;
