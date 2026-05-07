import React from 'react';
import Card from './ui/Card';
import FormGroup from './ui/FormGroup';
import Button from './ui/Button';
import { useLang } from '../context/LanguageContext';
import { REGIMES, REGIME_INFO } from '../utils/constants';

const IdentificationForm = ({ data, onChange, onNext, onOpenSocietesModal }) => {
  const { t } = useLang();
  const regimeDef = REGIMES.find((r) => r.value === data.regime);
  const set = (field, value) => onChange({ ...data, [field]: value });
  const ifValid = !data.identifiantFiscal || /^\d{1,8}$/.test(data.identifiantFiscal.trim());
  
  const [periodeError, setPeriodeError] = React.useState('');
  
  // Validate période based on regime
  const validatePeriode = (periode, regime) => {
    if (!periode || periode.trim() === '') {
      return t('error_periode_required') || 'La période est requise';
    }
    
    const num = parseInt(periode, 10);
    
    // Check if it's a valid integer
    if (isNaN(num) || num.toString() !== periode.trim() || num < 0) {
      return 'La période doit être un nombre entier positif';
    }
    
    // Validate based on regime
    if (regime === '1') { // Mensuel
      if (num < 1 || num > 12) {
        return 'La période doit être entre 1 et 12 pour le régime mensuel';
      }
    } else if (regime === '2') { // Trimestriel
      if (num < 1 || num > 4) {
        return 'La période doit être entre 1 et 4 pour le régime trimestriel';
      }
    }
    
    return '';
  };
  
  // Handle période blur
  const handlePeriodeBlur = () => {
    const error = validatePeriode(data.periode, data.regime);
    setPeriodeError(error);
  };
  
  // Handle période change
  const handlePeriodeChange = (value) => {
    set('periode', value);
    if (periodeError) {
      const error = validatePeriode(value, data.regime);
      setPeriodeError(error);
    }
  };
  
  // Get placeholder based on regime
  const getPeriodePlaceholder = () => {
    if (data.regime === '1') return '1 - 12';
    if (data.regime === '2') return '1 - 4';
    return 'ex: 3';
  };
  
  // Handle next with validation
  const handleNext = () => {
    const error = validatePeriode(data.periode, data.regime);
    if (error) {
      setPeriodeError(error);
      return;
    }
    onNext();
  };
  return (
    <div className="panel active" id="panel1">
      <div className="panel-title" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, marginBottom: 6 }}>
        {t('section1_title')}
      </div>
      <p className="panel-subtitle">{t('section1_sub')}</p>

      <Card>
        {/* Section header */}
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '20px',
          paddingLeft: '14px',
          borderLeft: '3px solid #00d4a0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          | {t('field_if').split('(')[0].trim().toUpperCase()}
        </div>

        <div className="form-grid cols3" style={{ marginBottom: 20 }}>
          <FormGroup label={t('field_if')} required help={t('hint_1_8_digits')}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="ex: 16685940"
                value={data.identifiantFiscal || ''}
                onChange={(e) => set('identifiantFiscal', e.target.value)}
                className={data.identifiantFiscal && !ifValid ? 'invalid' : ''}
                style={{ flex: 1 }}
              />
            
            </div>
            {data.identifiantFiscal && !ifValid && (
              <span className="field-error">{t('error_1_8_digits')}</span>
            )}
          </FormGroup>

          <FormGroup label={t('field_annee')} required>
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

          <FormGroup label={t('field_regime')} required>
            <select
              value={data.regime || '1'}
              onChange={(e) => {
                const newRegime = e.target.value;
                onChange({ ...data, regime: newRegime, periode: '' });
                setPeriodeError('');
              }}
            >
              {REGIMES.map((r) => (
                <option key={r.value} value={r.value}>{t(`regime_${r.value}`)}</option>
              ))}
            </select>
          </FormGroup>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0 20px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'start' }}>
          <FormGroup label={t('field_periode')} required help={`1 à ${regimeDef?.maxPeriode || 12}`}>
            <div className="number-wrap">
              <input
                type="number"
                placeholder={getPeriodePlaceholder()}
                min="1"
                max={regimeDef?.maxPeriode || 12}
                value={data.periode || ''}
                onChange={(e) => handlePeriodeChange(e.target.value)}
                onBlur={handlePeriodeBlur}
                className={periodeError ? 'invalid' : ''}
              />
            </div>
            {periodeError && (
              <span className="field-error">❌ {periodeError}</span>
            )}
          </FormGroup>

          {regimeDef?.label && (
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              paddingTop: '8px'
            }}>
              <span style={{ fontWeight: 700, color: '#00d4a0' }}>{t(`regime_${regimeDef.value}`).split('—')[1]?.trim()}:</span> {regimeDef.desc || ''}
            </div>
          )}
        </div>

        {REGIME_INFO[data.regime] && (
          <div className="regime-info">
            <div dangerouslySetInnerHTML={{ __html: REGIME_INFO[data.regime] }} />
          </div>
        )}
      </Card>

      <div className="actions-row">
        <Button variant="primary" onClick={handleNext} disabled={!!periodeError}>{t('btn_next_step1')}</Button>
      </div>
    </div>
  );
};

export default IdentificationForm;
