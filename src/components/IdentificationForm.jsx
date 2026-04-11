import React from 'react';
import Card from './ui/Card';
import FormGroup from './ui/FormGroup';
import Button from './ui/Button';
import { REGIMES, REGIME_INFO } from '../utils/constants';

const IdentificationForm = ({ data, onChange, onNext, lang = 'fr' }) => {
  const regimeDef = REGIMES.find((r) => r.value === data.regime);
  const set = (field, value) => onChange({ ...data, [field]: value });
  const ifValid = !data.identifiantFiscal || /^\d{1,8}$/.test(data.identifiantFiscal.trim());
  const t = {
    fr: { title: 'Identification du Contribuable', sub: 'Entête de la déclaration — ces données constituent les balises racines du fichier XML EDI transmis à la DGI.', card: 'Informations fiscales', if: 'Identifiant Fiscal (IF)', year: 'Année', regime: 'Régime', period: 'Période', next: 'Suivant — Ajouter les factures →' },
    en: { title: 'Taxpayer Identification', sub: 'Declaration header — this data forms the root tags of the EDI XML file submitted to DGI.', card: 'Tax Information', if: 'Fiscal ID (IF)', year: 'Year', regime: 'Regime', period: 'Period', next: 'Next — Add invoices →' },
  }[lang] || {};
  return (
    <div className="panel active" id="panel1">
      <div className="panel-title">
        <span className="icon">🏢</span> {t.title}
      </div>
      <p className="panel-subtitle">{t.sub}</p>

      <Card title={t.card}>
        <div className="form-grid cols3" style={{ marginBottom: 20 }}>
          <FormGroup label={t.if} required help="1 à 8 chiffres">
            <input
              type="text"
              placeholder="ex: 16685940"
              value={data.identifiantFiscal || ''}
              onChange={(e) => set('identifiantFiscal', e.target.value)}
              className={data.identifiantFiscal && !ifValid ? 'invalid' : ''}
            />
            {data.identifiantFiscal && !ifValid && (
              <span className="field-error">⚠ 1 à 8 chiffres requis</span>
            )}
          </FormGroup>

          <FormGroup label={t.year} required>
            <div className="number-wrap">
              <input
                type="number"
                placeholder="2024"
                min="2015" max="2030"
                value={data.annee || ''}
                onChange={(e) => set('annee', e.target.value)}
              />
            </div>
          </FormGroup>

          <FormGroup label={t.regime} required>
            <select
              value={data.regime || '1'}
              onChange={(e) => onChange({ ...data, regime: e.target.value, periode: '' })}
            >
              {REGIMES.map((r) => (
                <option key={r.value} value={r.value}>{r.value} — {r.label}</option>
              ))}
            </select>
          </FormGroup>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 18px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'start' }}>
          <FormGroup label={t.period} required help={`1 à ${regimeDef?.maxPeriode || 12} — ${regimeDef?.label || ''}`}>
            <div className="number-wrap">
              <input
                type="number"
                placeholder="ex: 3"
                min="1"
                max={regimeDef?.maxPeriode || 12}
                value={data.periode || ''}
                onChange={(e) => set('periode', e.target.value)}
              />
            </div>
          </FormGroup>

          <div />
        </div>

        {REGIME_INFO[data.regime] && (
          <div className="regime-info">
            <div dangerouslySetInnerHTML={{ __html: REGIME_INFO[data.regime] }} />
          </div>
        )}
      </Card>

      <div className="actions-row">
        <Button variant="primary" onClick={onNext}>{t.next}</Button>
      </div>
    </div>
  );
};

export default IdentificationForm;
