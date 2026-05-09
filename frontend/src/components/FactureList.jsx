import React from 'react';
import FactureItem from './FactureItem';
import Button from './ui/Button';
import { useLang } from '../context/LanguageContext';

const FactureList = ({ factures, onChange, onAddFacture, onRemoveFacture, onDuplicateFacture, onPrev, onNext }) => {
  const { t } = useLang();
  const handleChange = (id, newData) =>
    onChange(factures.map((f) => (f.id === id ? { ...f, ...newData } : f)));

  return (
    <div className="panel active" id="panel2">
      <div className="panel-title">
        <span className="icon" style={{ color: 'var(--primary-green)' }}>📄</span> {t('step2_section_title')}
      </div>
      <p className="panel-subtitle">{t('step2_section_sub')}</p>

      {factures.length === 0 ? (
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.01))', border: '1.5px dashed rgba(74,222,128,0.15)', borderRadius: 20, padding: '48px 24px', textAlign: 'center', marginBottom: 14, transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 14, color: 'var(--primary-green)' }}>📋</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, transition: 'color 0.3s ease' }}>Aucune facture ajoutée</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'color 0.3s ease' }}>Cliquez sur "Ajouter une facture" pour commencer</div>
        </div>
      ) : (
        <div className="facture-list">
          {factures.map((f) => (
            <FactureItem 
              key={f.id} 
              id={f.id} 
              data={f} 
              onChange={(newData) => handleChange(f.id, newData)} 
              onRemove={onRemoveFacture} 
              onDuplicate={onDuplicateFacture}
              allFactures={factures}
            />
          ))}
        </div>
      )}

      <div className="actions-row">
        <Button variant="blue" onClick={onAddFacture}>{t('btn_add_invoice')}</Button>
        <Button variant="secondary" onClick={onPrev}>{t('btn_prev_step2')}</Button>
        <Button variant="primary" onClick={onNext}>{t('btn_next_step2')}</Button>
      </div>
    </div>
  );
};

export default FactureList;
