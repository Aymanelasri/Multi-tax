import React, { useState, useEffect } from 'react';
import FormGroup from './ui/FormGroup';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocietes } from '../hooks/useSocietes';
import { TVA_RATES, PAYMENT_MODES } from '../utils/constants';
import { validateInvoice } from '../utils/dgiValidation';
import { Copy, Pencil, Trash2 } from 'lucide-react';

const getSocietesKey = (userId) => userId ? `edi_societes_user_${userId}` : 'edi_societes';
const loadSocietes = (userId) => { try { return JSON.parse(localStorage.getItem(getSocietesKey(userId)) || '[]'); } catch { return []; } };
const saveSocietes = (d, userId) => localStorage.setItem(getSocietesKey(userId), JSON.stringify(d));

const ActionBtn = ({ onClick, title, color = 'var(--text-muted)', children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 32, height: 32, borderRadius: 6, border: 'none',
      background: 'transparent', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
      padding: 0,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'var(--green-tint)';
      e.currentTarget.style.transform = 'scale(1.05)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {children}
  </button>
);

const FactureItem = ({ id, data, onChange, onRemove, onDuplicate, allFactures }) => {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { societes: apiSocietes, loading: loadingSocietes } = useSocietes();
  const [open, setOpen] = useState(!data.num);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSocPicker, setShowSocPicker] = useState(false);
  const [societes] = useState(loadSocietes);
  const set = (field, value) => onChange({ ...data, [field]: value });

  // Detect next invoice number based on pattern
  const detectNextNum = () => {
    const existingInvoices = allFactures.filter(f => f.id !== id && f.num && f.num.trim() !== '');
    
    if (existingInvoices.length === 0) {
      return `FAC-${new Date().getFullYear()}-001`;
    }
    
    const lastNum = existingInvoices[existingInvoices.length - 1]?.num;
    if (!lastNum) return `FAC-${new Date().getFullYear()}-001`;
    
    // Extract: PREFIX + NUMBER + SUFFIX
    const match = lastNum.match(/^(.*?)(\d+)([^\d]*)$/);
    
    if (!match) return lastNum + '-1';
    
    const prefix = match[1];
    const numPart = match[2];
    const suffix = match[3];
    
    const nextNum = parseInt(numPart) + 1;
    const padded = String(nextNum).padStart(numPart.length, '0');
    
    return `${prefix}${padded}${suffix}`;
  };

  // Check for duplicate invoice number
  const isDuplicate = allFactures.some(f => 
    f.id !== id && f.num && data.num && 
    f.num.trim().toLowerCase() === data.num.trim().toLowerCase()
  );

  useEffect(() => {
    const mht = parseFloat(data.mht) || 0;
    const tx  = parseFloat(data.tx)  || 0;
    const prorata = parseFloat(data.prorata) || 100;
    
    if (mht > 0 && tx > 0) {
      const tvaRaw = parseFloat((mht * tx / 100).toFixed(2));
      const tvaRecuperable = parseFloat((tvaRaw * prorata / 100).toFixed(2));
      const ttc = parseFloat((mht + tvaRecuperable).toFixed(2));
      
      if (
        tvaRaw.toFixed(2) !== (parseFloat(data.tva) || 0).toFixed(2) ||
        ttc.toFixed(2) !== (parseFloat(data.ttc) || 0).toFixed(2)
      ) onChange({ ...data, tva: tvaRaw.toFixed(2), ttc: ttc.toFixed(2) });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.mht, data.tx, data.prorata]);

  useEffect(() => {
    const mht = parseFloat(data.mht) || 0;
    const tvaRaw = parseFloat(data.tva) || 0;
    const prorata = parseFloat(data.prorata) || 100;
    const tvaRecuperable = parseFloat((tvaRaw * prorata / 100).toFixed(2));
    const ttc = (mht + tvaRecuperable).toFixed(2);
    if (ttc !== data.ttc) onChange({ ...data, ttc });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tva, data.prorata]);

  const ifValid  = !data.if  || /^\d{1,8}$/.test(data.if.trim());
  const iceValid = !data.ice || /^\d{15}$/.test(data.ice.trim());

  // RULE 1: Espèces limit (warning)
  const mht = parseFloat(data.mht) || 0;
  const tvaRaw = parseFloat(data.tva) || 0;
  const prorata = parseFloat(data.prorata) || 100;
  const tvaRecuperable = (tvaRaw * prorata / 100);
  const ttc = mht + tvaRecuperable;
  const cashWarning = String(data.mp) === '1' && ttc > 5000;

  // RULE 2: TVA recovery deadline (blocking error)
  const getTvaDeadlineError = () => {
    if (!data.dfac || !data.dpai) return null;
    const invoiceDate = new Date(data.dfac);
    const paymentDate = new Date(data.dpai);
    const diffMonths = (paymentDate - invoiceDate) / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths > 12) {
      return { diffMonths: Math.round(diffMonths) };
    }
    return null;
  };
  const tvaDeadlineError = getTvaDeadlineError();

  const sectionLabel = {
    fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)',
    letterSpacing: '0.09em', textTransform: 'uppercase',
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7,
  };
  const sectionBar = { display: 'inline-block', width: 2, height: 10, background: 'var(--primary-green)', borderRadius: 2 };

  const getStatus = (inv) => {
    const validation = validateInvoice(inv, 0, { annee: '', periode: '', regime: '1' });
    
    if (validation.errors.length > 0) return 'error';
    if (validation.warnings.length > 0) return 'warning';
    
    const required = [
      inv.num, inv.nom, inv.ice, 
      inv.mht, inv.tva, inv.dpai, inv.dfac
    ];
    const filled = required.filter(v => 
      v && String(v).trim() !== ''
    ).length;
    
    if (filled === 0) return 'empty';
    if (filled === required.length) return 'complete';
    return 'partial';
  };

  const getPaymentModeLabel = (mpId) => {
    const modes = {
      '1': 'Espèces', '2': 'Chèque', '3': 'Prélèvement',
      '4': 'Virement', '5': 'Effet', '6': 'Compensation', '7': 'Autres'
    };
    return modes[mpId] || '';
  };

  const status = getStatus(data);
  const statusColor = status === 'complete' ? 'var(--primary-green)' : (status === 'partial' || status === 'warning') ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="facture-item" style={{ padding: 0, overflow: 'hidden' }}>

      {/* ── Collapsed header row ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 16px', gap: 12, flexWrap: 'wrap',
          borderBottom: open ? '1px solid rgba(74,222,128,0.1)' : 'none',
        }}
      >
        {/* LEFT SECTION */}
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => { if (!confirmDelete) setOpen(o => !o); }}>
          {/* Row 1 - main info */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Badge */}
            <span style={{
              background: 'var(--green-tint)', color: 'var(--primary-green)',
              fontSize: '11px', fontWeight: 700, padding: '3px 8px',
              borderRadius: 20, flexShrink: 0
            }}>
              #{data.ord || id}
            </span>

            {/* Invoice number */}
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: data.num ? 'var(--text-primary)' : 'var(--text-dim)'
            }}>
              {data.num || (lang === 'FR' ? 'Nouvelle facture' : 'New invoice')}
            </span>

            {/* Separator */}
            {data.nom && <span style={{ color: '#334155' }}>·</span>}

            {/* Supplier name */}
            {data.nom && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {data.nom}
              </span>
            )}
          </div>

          {/* Row 2 - secondary info pills */}
          {(data.if || data.ice || data.dfac || data.tx || data.mp) && (
            <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
              {/* IF pill */}
              {data.if && (
                <span style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.12)',
                  color: 'var(--blue)', fontSize: '10px', fontWeight: 600,
                  padding: '2px 8px', borderRadius: 12
                }}>
                  IF: {data.if}
                </span>
              )}

              {/* ICE pill */}
              {data.ice && (
                <span style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  color: '#93c5fd', fontSize: '10px', fontWeight: 600,
                  padding: '2px 8px', borderRadius: 12
                }}>
                  ICE: {data.ice}
                </span>
              )}

              {/* Date facture pill */}
              {data.dfac && (
                <span style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: '#c4b5fd', fontSize: '10px',
                  padding: '2px 8px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  📅 {data.dfac}
                  {tvaDeadlineError && <span style={{ color: '#ef4444' }}>✗</span>}
                </span>
              )}

              {/* TVA rate pill */}
              {data.tx && (
                <span style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: '#fcd34d', fontSize: '10px',
                  padding: '2px 8px', borderRadius: 12,
                  display: window.innerWidth <= 640 ? 'none' : 'inline'
                }}>
                  TVA {data.tx}%
                </span>
              )}

              {/* Prorata pill - only if < 100 */}
              {parseFloat(data.prorata || 100) < 100 && (
                <span style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: '#c4b5fd', fontSize: '10px',
                  padding: '2px 8px', borderRadius: 12
                }}>
                  {data.prorata}%
                </span>
              )}

              {/* Payment mode pill */}
              {data.mp && (
                <span style={{
                  background: 'rgba(0,0,0,0)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)', fontSize: '10px',
                  padding: '2px 8px', borderRadius: 12,
                  display: window.innerWidth <= 640 ? 'none' : 'inline'
                }}>
                  {getPaymentModeLabel(data.mp)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            {/* TTC amount */}
            <div style={{
              fontSize: parseFloat(data.ttc || 0) > 0 ? '14px' : '13px',
              fontWeight: parseFloat(data.ttc || 0) > 0 ? 700 : 400,
              color: parseFloat(data.ttc || 0) > 0 ? 'var(--text-primary)' : 'var(--text-dim)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              {parseFloat(data.ttc || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
              {cashWarning && <span style={{ color: '#fbbf24', fontSize: '12px' }}>⚠</span>}
            </div>

            {/* HT/TVA sub-line */}
            {parseFloat(data.mht || 0) > 0 && window.innerWidth > 640 && (() => {
              const mht = parseFloat(data.mht || 0);
              const tvaRaw = parseFloat(data.tva || 0);
              const prorata = parseFloat(data.prorata || 100);
              const tvaRecup = prorata < 100 ? (tvaRaw * prorata / 100).toFixed(2) : tvaRaw.toFixed(2);
              const label = prorata < 100 ? 'TVA récup' : 'TVA';
              return (
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: 2 }}>
                  HT: {mht.toFixed(2)} · {label}: {tvaRecup}
                </div>
              );
            })()}
          </div>

          {/* Status dot */}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: statusColor, flexShrink: 0
          }} />
        </div>

        {/* ACTION BUTTONS */}
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
                <Pencil size={16} strokeWidth={2} />
              </ActionBtn>
              <ActionBtn onClick={() => onDuplicate(id)} title={lang === 'FR' ? 'Dupliquer' : 'Duplicate'}>
                <Copy size={16} strokeWidth={2} />
              </ActionBtn>
              <ActionBtn onClick={() => setConfirmDelete(true)} title={lang === 'FR' ? 'Supprimer' : 'Delete'} color="#ef4444">
                <Trash2 size={16} strokeWidth={2} />
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
              <input 
                type="text" 
                value={data.num || ''} 
                onChange={e => set('num', e.target.value)} 
                placeholder={detectNextNum()}
                className={isDuplicate ? 'invalid' : ''}
              />
              {isDuplicate && (
                <span className="field-error">
                  {lang === 'FR' ? 'Ce numéro existe déjà' : 'This number already exists'}
                </span>
              )}
            </FormGroup>
            <FormGroup label={t('field_dfac')} required>
              <div className="date-wrap">
                <input type="date" value={data.dfac || ''} onChange={e => set('dfac', e.target.value)} />
              </div>
              {tvaDeadlineError && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8
                }}>
                  <span>✗</span>
                  <span>
                    {lang === 'FR' 
                      ? `Délai dépassé — La TVA ne peut pas être récupérée après 12 mois. Date facture : ${data.dfac}, Date paiement : ${data.dpai} (${tvaDeadlineError.diffMonths} mois d'écart)`
                      : `Deadline exceeded — VAT cannot be recovered after 12 months. Invoice: ${data.dfac}, Payment: ${data.dpai} (${tvaDeadlineError.diffMonths} months apart)`
                    }
                  </span>
                </div>
              )}
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
            {(apiSocietes.length > 0 || societes.length > 0) && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSocPicker(p => !p)}
                  style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'transparent', border: '1px solid var(--green-border)', color: 'var(--primary-green)', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                >
                  {loadingSocietes ? '⏳' : '🏢'} {t('societes_choose')}
                </button>
                {showSocPicker && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 50, background: 'var(--gen-modal-bg)', border: '1px solid var(--gen-modal-border)', borderRadius: 10, minWidth: 240, maxHeight: 220, overflowY: 'auto', boxShadow: 'var(--shadow-lg)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
                    {loadingSocietes ? (
                      <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Chargement...</div>
                    ) : apiSocietes.length > 0 ? (
                      apiSocietes.map(s => (
                        <button key={s.id} onClick={() => {
                          onChange({ ...data, if: s.if || '', nom: s.nom || '', ice: s.ice || '' });
                          setShowSocPicker(false);
                        }} style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--green-tint)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 600 }}>{s.nom}</div>
                          {s.if && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>IF: {s.if}</div>}
                        </button>
                      ))
                    ) : societes.length > 0 ? (
                      societes.map(s => (
                        <button key={s.id} onClick={() => {
                          onChange({ ...data, if: s.if || '', nom: s.nom || '', ice: s.ice || '' });
                          const updated = societes.map(x => x.id === s.id ? { ...x, usageCount: (x.usageCount || 0) + 1, lastUsed: Date.now() } : x);
                          saveSocietes(updated);
                          setShowSocPicker(false);
                        }} style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--green-tint)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 600 }}>{s.nom}</div>
                          {s.if && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>IF: {s.if}</div>}
                        </button>
                      ))
                    ) : (
                      <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Aucune société</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="form-grid cols3" style={{ marginBottom: 16 }}>
            <FormGroup label={t('field_if_fournisseur')} required help={t('hint_1_8_digits')}>
              <input type="text" value={data.if || ''} onChange={e => set('if', e.target.value)} placeholder="ex: 12345678" className={data.if && !ifValid ? 'invalid' : ''} />
              {data.if && !ifValid && <span className="field-error">{t('error_1_8_digits')}</span>}
            </FormGroup>
            <FormGroup label={t('field_nom_rs')} required>
              <input type="text" value={data.nom || ''} onChange={e => set('nom', e.target.value)} placeholder="ex: Société ABC" />
            </FormGroup>
            <FormGroup label="ICE" >
              <input type="text" value={data.ice || ''} onChange={e => set('ice', e.target.value)} placeholder="000123456789013" className={data.ice && !iceValid ? 'invalid' : ''} />
              {data.ice && !iceValid && <span className="field-error">15 {lang === 'FR' ? 'chiffres requis' : 'digits required'}</span>}
            </FormGroup>
          </div>

          <div style={{ height: 1, background: 'rgba(74,222,128,0.08)', margin: '4px 0 16px' }} />

          {/* Section: Paiement */}
          <div style={sectionLabel}><span style={sectionBar}/>{lang === 'FR' ? 'PAIEMENT' : 'PAYMENT'}</div>
          <div className="form-grid cols3" style={{ marginBottom: 16 }}>
            <FormGroup label={t('field_taux_tva')} required>
              <select value={data.tx || ''} onChange={e => set('tx', e.target.value)}>
                <option value="" disabled>── {lang === 'FR' ? 'Sélectionner le taux TVA' : 'Select VAT rate'} ──</option>
                {TVA_RATES.map(r => <option key={r} value={r}>{parseFloat(r)}%</option>)}
              </select>
            </FormGroup>
            <FormGroup label={t('field_mp')} required>
              <select value={data.mp || ''} onChange={e => set('mp', e.target.value)}>
                <option value="" disabled>── {lang === 'FR' ? 'Sélectionner le mode de paiement' : 'Select payment mode'} ──</option>
                {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{t(`mp_${m.value}`)}</option>)}
              </select>
              {cashWarning && (
                <div style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.25)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#fcd34d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8
                }}>
                  <span>⚠</span>
                  <span>
                    {lang === 'FR'
                      ? `Paiement en espèces limité à 5 000 MAD selon la réglementation DGI. TTC actuel : ${ttc.toFixed(2)} MAD`
                      : `Cash payment limited to 5,000 MAD per DGI regulations. Current total: ${ttc.toFixed(2)} MAD`
                    }
                  </span>
                </div>
              )}
            </FormGroup>
            <FormGroup label={t('field_dpai')} required>
              <div className="date-wrap">
                <input type="date" value={data.dpai || ''} onChange={e => set('dpai', e.target.value)} />
              </div>
            </FormGroup>
            <FormGroup label={t('field_prorata')}>
              <div className="number-wrap">
                <input type="number" min="0" max="100" value={data.prorata || '100'} onChange={e => set('prorata', e.target.value)} placeholder="100" />
              </div>
              {parseFloat(data.prorata || 100) < 100 && parseFloat(data.tva || 0) > 0 && (() => {
                const tvaRaw = parseFloat(data.tva) || 0;
                const prorata = parseFloat(data.prorata) || 100;
                const tvaRecuperable = (tvaRaw * prorata / 100).toFixed(2);
                const tvaPerdue = (tvaRaw - tvaRecuperable).toFixed(2);
                return (
                  <div style={{
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginTop: 8,
                    fontSize: '12px'
                  }}>
                    <div style={{ color: '#93c5fd', marginBottom: 4 }}>
                      ℹ Calcul prorata ({prorata}%)
                    </div>
                    <div style={{ color: '#ffffff' }}>
                      TVA récupérable: <strong style={{ color: 'var(--primary-green)' }}>{tvaRecuperable} MAD</strong>
                    </div>
                    <div style={{ color: '#94a3b8', marginTop: 2 }}>
                      TVA non récupérable: {tvaPerdue} MAD
                    </div>
                  </div>
                );
              })()}
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
