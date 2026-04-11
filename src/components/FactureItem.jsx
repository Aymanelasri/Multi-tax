import React, { useEffect } from 'react';
import FormGroup from './ui/FormGroup';
import { useLang } from '../context/LanguageContext';
import { TVA_RATES, PAYMENT_MODES } from '../utils/constants';

const FactureItem = ({ id, data, onChange, onRemove }) => {
  const { t } = useLang();
  const set = (field, value) => onChange({ ...data, [field]: value });

  useEffect(() => {
    const mht = parseFloat(data.mht) || 0;
    const tx  = parseFloat(data.tx)  || 0;
    const tva = parseFloat((mht * tx / 100).toFixed(2));
    const ttc = parseFloat((mht + tva).toFixed(2));
    if (
      tva.toFixed(2) !== (parseFloat(data.tva) || 0).toFixed(2) ||
      ttc.toFixed(2) !== (parseFloat(data.ttc) || 0).toFixed(2)
    ) {
      onChange({ ...data, tva: tva.toFixed(2), ttc: ttc.toFixed(2) });
    }
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

  const sectionBar = {
    display: 'inline-block', width: 2, height: 10,
    background: 'var(--blue)', borderRadius: 2,
  };

  return (
    <div className="facture-item">
      {/* Header */}
      <div className="facture-item-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="facture-num-badge">#{data.ord || id}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontWeight: 500 }}>
            {data.num || 'Nouvelle facture'}
          </span>
        </div>
        <button className="btn-remove" onClick={() => onRemove(id)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          {t('btn_delete')}
        </button>
      </div>

      {/* Section: Facture */}
      <div style={sectionLabel}><span style={sectionBar}/>{t('block_facture')}</div>
      <div className="form-grid cols3" style={{ marginBottom: 16 }}>
        <FormGroup label={t('field_num')} required>
          <input type="text" value={data.num || ''} onChange={(e) => set('num', e.target.value)} placeholder="FAC-2024-001" />
        </FormGroup>
        <FormGroup label={t('field_designation')} required>
          <input type="text" value={data.des || ''} onChange={(e) => set('des', e.target.value)} placeholder="ex: Achat materiel" />
        </FormGroup>
        <FormGroup label={t('field_taux_tva')} required>
          <select value={data.tx || '20.00'} onChange={(e) => set('tx', e.target.value)}>
            {TVA_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
          </select>
        </FormGroup>
        <FormGroup label={t('field_mht')} required>
          <div className="number-wrap">
            <input type="number" step="0.01" min="0" value={data.mht || ''} onChange={(e) => set('mht', e.target.value)} placeholder="0.00" />
          </div>
        </FormGroup>
        <FormGroup label={t('field_tva')} required help={t('hint_ttc')}>
          <div className="number-wrap">
            <input type="number" step="0.01" min="0" value={data.tva || ''} onChange={(e) => set('tva', e.target.value)} placeholder="0.00" />
          </div>
        </FormGroup>
        <FormGroup label={t('field_ttc')}>
          <div className="number-wrap">
            <input type="number" step="0.01" value={data.ttc || ''} readOnly placeholder="auto" />
          </div>
        </FormGroup>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 16px' }} />

      {/* Section: Fournisseur */}
      <div style={sectionLabel}><span style={sectionBar}/>{t('block_fournisseur_label')}</div>
      <div className="form-grid cols3" style={{ marginBottom: 16 }}>
        <FormGroup label={t('field_if_fournisseur')} required help={t('hint_1_8_digits')}>
          <input
            type="text" value={data.if || ''} onChange={(e) => set('if', e.target.value)}
            placeholder="ex: 33006240"
            className={data.if && !ifValid ? 'invalid' : ''}
          />
          {data.if && !ifValid && <span className="field-error">{t('hint_1_8_digits')} requis</span>}
        </FormGroup>
        <FormGroup label={t('field_nom_rs')} required>
          <input type="text" value={data.nom || ''} onChange={(e) => set('nom', e.target.value)} placeholder="ex: ONEE" />
        </FormGroup>
        <FormGroup label="ICE" help={t('hint_ice')}>
          <input
            type="text" value={data.ice || ''} onChange={(e) => set('ice', e.target.value)}
            placeholder="001234567890123"
            className={data.ice && !iceValid ? 'invalid' : ''}
          />
          {data.ice && !iceValid && <span className="field-error">15 chiffres requis</span>}
        </FormGroup>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 16px' }} />

      {/* Section: Paiement */}
      <div style={sectionLabel}><span style={sectionBar}/>PAIEMENT</div>
      <div className="form-grid cols3">
        <FormGroup label={t('field_mp')} required>
          <select value={data.mp || '1'} onChange={(e) => set('mp', e.target.value)}>
            {PAYMENT_MODES.map((m) => <option key={m.value} value={m.value}>{t(`mp_${m.value}`)}</option>)}
          </select>
        </FormGroup>
        <FormGroup label={t('field_dpai')} required>
          <div className="date-wrap">
            <input type="date" value={data.dpai || ''} onChange={(e) => set('dpai', e.target.value)} />
          </div>
        </FormGroup>
        <FormGroup label={t('field_dfac')} required>
          <div className="date-wrap">
            <input type="date" value={data.dfac || ''} onChange={(e) => set('dfac', e.target.value)} />
          </div>
        </FormGroup>
        <FormGroup label={t('field_prorata')} help={t('hint_prorata')}>
          <div className="number-wrap">
            <input type="number" min="0" max="100" value={data.prorata || '100'} onChange={(e) => set('prorata', e.target.value)} placeholder="100" />
          </div>
        </FormGroup>
      </div>
    </div>
  );
};

export default FactureItem;
