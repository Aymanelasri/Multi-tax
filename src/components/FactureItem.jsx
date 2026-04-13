import React, { useState, useEffect } from 'react';
import FormGroup from './ui/FormGroup';
import { useLang } from '../context/LanguageContext';
import { TVA_RATES, PAYMENT_MODES } from '../utils/constants';

const LS_SOC = 'edi_societes';
const loadSocietes = () => { try { return JSON.parse(localStorage.getItem(LS_SOC) || '[]'); } catch { return []; } };
const saveSocietes = (d) => localStorage.setItem(LS_SOC, JSON.stringify(d));

const ActionBtn = ({ onClick, title, color = '#94a3b8', children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 28, height: 28, borderRadius: 6, border: 'none',
      background: 'rgba(255,255,255,0.05)', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
  >
    {children}
  </button>
);

const FactureItem = ({ id, data, onChange, onRemove, onDuplicate }) => {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(!data.num);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSocPicker, setShowSocPicker] = useState(false);
  const [societes] = useState(loadSocietes);
  const set = (field, value) => onChange({ ...data, [field]: value });

  useEffect(() => {
    const mht = parseFloat(data.mht) || 0;
    const tx  = parseFloat(data.tx)  || 0;
    const tva = parseFloat((mht * tx / 100).toFixed(2));
    const ttc = parseFloat((mht + tva).toFixed(2));
    if (
      tva.toFixed(2) !== (parseFloat(data.tva) || 0).toFixed(2) ||
      ttc.toFixed(2) !== (parseFloat(data.ttc) || 0).toFixed(2)
    ) onChange({ ...data, tva: tva.toFixed(2), ttc: ttc.toFixed(2) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.mht, data.tx]);

  useEffect(() => {
    const mht = parseFloat(data.mht) || 0;
    const tva = parseFloat(data.tva) || 0;
    const ttc = (mht + tva).toFixed(2);
    if (ttc !== data.ttc) onChange({ ...data, ttc });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tva]);

  const ifValid  = !data.if  || /^\d{1,8}$/.test(data.if.trim());
  const iceValid = !data.ice || /^\d{15}$/.test(data.ice.trim());

  const sectionLabel = {
    fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-3)',
    letterSpacing: '0.09em', textTransform: 'uppercase',
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7,
  };
  const sectionBar = { display: 'inline-block', width: 2, height: 10, background: 'var(--green)', borderRadius: 2 };

  return (
    <div className="facture-item" style={{ padding: 0, overflow: 'hidden' }}>

      {/* ── Collapsed header row ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 20px', cursor: 'pointer',
          borderBottom: open ? '1px solid rgba(74,222,128,0.1)' : 'none',
        }}
        onClick={() => { if (!confirmDelete) setOpen(o => !o); }}
      >
        {/* chevron */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>

        <span className="facture-num-badge">#{data.ord || id}</span>

        <span style={{ fontSize: '0.82rem', color: 'var(--text-2)', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data.num || (lang === 'FR' ? 'Nouvelle facture' : 'New invoice')}
        </span>

        {data.mht && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--mono)', flexShrink: 0 }}>
            {parseFloat(data.ttc || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
          </span>
        )}

        {/* CRUD buttons */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {confirmDelete ? (
            <>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-2)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                {lang === 'FR' ? 'Supprimer ?' : 'Delete?'}
              </span>
              <button onClick={() => onRemove(id)} style={{ padding: '3px 10px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 5, cursor: 'pointer' }}>
                {lang === 'FR' ? 'Oui' : 'Yes'}
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ padding: '3px 10px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-2)', borderRadius: 5, cursor: 'pointer' }}>
                {lang === 'FR' ? 'Non' : 'No'}
              </button>
            </>
          ) : (
            <>
              <ActionBtn onClick={() => setOpen(o => !o)} title={lang === 'FR' ? 'Modifier' : 'Edit'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </ActionBtn>
              <ActionBtn onClick={() => onDuplicate(id)} title={lang === 'FR' ? 'Dupliquer' : 'Duplicate'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </ActionBtn>
              <ActionBtn onClick={() => setConfirmDelete(true)} title={lang === 'FR' ? 'Supprimer' : 'Delete'} color="#ef4444">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </ActionBtn>
            </>
          )}
        </div>
      </div>

      {/* ── Expanded content ── */}
      {open && (
        <div style={{ padding: '20px 22px 22px' }}>

          {/* Section: Facture */}
          <div style={sectionLabel}><span style={sectionBar}/>{t('block_facture')}</div>
          <div className="form-grid cols3" style={{ marginBottom: 16 }}>
            <FormGroup label={t('field_num')} required>
              <input type="text" value={data.num || ''} onChange={e => set('num', e.target.value)} placeholder="FAC-2024-001" />
            </FormGroup>
            <FormGroup label={t('field_dfac')} required>
              <div className="date-wrap">
                <input type="date" value={data.dfac || ''} onChange={e => set('dfac', e.target.value)} />
              </div>
            </FormGroup>
            <FormGroup label={t('field_designation')} required>
              <input type="text" value={data.des || ''} onChange={e => set('des', e.target.value)} placeholder={lang === 'FR' ? 'ex: Achat matériel' : 'e.g. Equipment purchase'} />
            </FormGroup>
            <FormGroup label={t('field_mht')} required>
              <div className="number-wrap">
                <input type="number" step="0.01" min="0" value={data.mht || ''} onChange={e => set('mht', e.target.value)} placeholder="0.00" />
              </div>
            </FormGroup>
            <FormGroup label={t('field_tva')} required help={t('hint_ttc')}>
              <div className="number-wrap">
                <input type="number" step="0.01" min="0" value={data.tva || ''} onChange={e => set('tva', e.target.value)} placeholder="0.00" />
              </div>
            </FormGroup>
            <FormGroup label={t('field_ttc')}>
              <div className="number-wrap">
                <input type="number" step="0.01" value={data.ttc || ''} readOnly placeholder="auto" />
              </div>
            </FormGroup>
          </div>

          <div style={{ height: 1, background: 'rgba(74,222,128,0.08)', margin: '4px 0 16px' }} />

          {/* Section: Fournisseur */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={sectionLabel}><span style={sectionBar}/>{t('block_fournisseur_label')}</div>
            {societes.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSocPicker(p => !p)}
                  style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'transparent', border: '1px solid rgba(0,212,160,0.3)', color: '#00d4a0', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                >
                  {t('societes_choose')}
                </button>
                {showSocPicker && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 50, background: '#141d2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, minWidth: 240, maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    {societes.map(s => (
                      <button key={s.id} onClick={() => {
                        onChange({ ...data, if: s.if || '', nom: s.nom || '', ice: s.ice || '' });
                        const updated = societes.map(x => x.id === s.id ? { ...x, usageCount: (x.usageCount || 0) + 1, lastUsed: Date.now() } : x);
                        saveSocietes(updated);
                        setShowSocPicker(false);
                      }} style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#f0f4f8', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,160,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 600 }}>{s.nom}</div>
                        {s.if && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>IF: {s.if}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="form-grid cols3" style={{ marginBottom: 16 }}>
            <FormGroup label={t('field_if_fournisseur')} required help={t('hint_1_8_digits')}>
              <input type="text" value={data.if || ''} onChange={e => set('if', e.target.value)} placeholder="ex: 33006240" className={data.if && !ifValid ? 'invalid' : ''} />
              {data.if && !ifValid && <span className="field-error">{t('error_1_8_digits')}</span>}
            </FormGroup>
            <FormGroup label={t('field_nom_rs')} required>
              <input type="text" value={data.nom || ''} onChange={e => set('nom', e.target.value)} placeholder="ex: ONEE" />
            </FormGroup>
            <FormGroup label="ICE" help={t('hint_ice')}>
              <input type="text" value={data.ice || ''} onChange={e => set('ice', e.target.value)} placeholder="001234567890123" className={data.ice && !iceValid ? 'invalid' : ''} />
              {data.ice && !iceValid && <span className="field-error">15 {lang === 'FR' ? 'chiffres requis' : 'digits required'}</span>}
            </FormGroup>
          </div>

          <div style={{ height: 1, background: 'rgba(74,222,128,0.08)', margin: '4px 0 16px' }} />

          {/* Section: Paiement */}
          <div style={sectionLabel}><span style={sectionBar}/>{lang === 'FR' ? 'PAIEMENT' : 'PAYMENT'}</div>
          <div className="form-grid cols3" style={{ marginBottom: 16 }}>
            <FormGroup label={t('field_taux_tva')} required>
              <select value={data.tx || '20.00'} onChange={e => set('tx', e.target.value)}>
                {TVA_RATES.map(r => <option key={r} value={r}>{parseFloat(r)}%</option>)}
              </select>
            </FormGroup>
            <FormGroup label={t('field_mp')} required>
              <select value={data.mp || '1'} onChange={e => set('mp', e.target.value)}>
                {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{t(`mp_${m.value}`)}</option>)}
              </select>
            </FormGroup>
            <FormGroup label={t('field_dpai')} required>
              <div className="date-wrap">
                <input type="date" value={data.dpai || ''} onChange={e => set('dpai', e.target.value)} />
              </div>
            </FormGroup>
            <FormGroup label={t('field_prorata')} help={t('hint_prorata')}>
              <div className="number-wrap">
                <input type="number" min="0" max="100" value={data.prorata || '100'} onChange={e => set('prorata', e.target.value)} placeholder="100" />
              </div>
            </FormGroup>
          </div>

          {/* Save / collapse button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: '6px 18px', fontSize: '0.8rem' }} onClick={() => setOpen(false)}>
              ✓ {lang === 'FR' ? 'Enregistrer' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactureItem;
