import React from 'react';
import FactureItem from './FactureItem';
import Button from './ui/Button';

const T = {
  fr: {
    title: 'Lignes du Relevé des Déductions',
    sub: "Chaque facture correspond à une balise <rd> dans le fichier XML EDI. Renseignez toutes les factures éligibles à la déduction TVA.",
    empty1: 'Aucune facture ajoutée',
    empty2: 'Cliquez sur "Ajouter une facture" pour commencer',
    add: '＋ Ajouter une facture',
    back: '← Retour',
    next: 'Suivant — Générer XML →',
  },
  en: {
    title: 'Deduction Statement Lines',
    sub: "Each invoice corresponds to an <rd> tag in the EDI XML file. Enter all invoices eligible for VAT deduction.",
    empty1: 'No invoices added',
    empty2: 'Click "Add an invoice" to get started',
    add: '＋ Add an invoice',
    back: '← Back',
    next: 'Next — Generate XML →',
  },
};

const FactureList = ({ factures, onChange, onAddFacture, onRemoveFacture, onPrev, onNext, lang = 'fr' }) => {
  const t = T[lang] || T.fr;
  const handleChange = (id, newData) =>
    onChange(factures.map((f) => (f.id === id ? { ...f, ...newData } : f)));

  return (
    <div className="panel active" id="panel2">
      <div className="panel-title">
        <span className="icon">📄</span> {t.title}
      </div>
      <p className="panel-subtitle">{t.sub}</p>

      {factures.length === 0 ? (
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.01))', border: '1.5px dashed rgba(74,222,128,0.15)', borderRadius: 20, padding: '48px 24px', textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>📋</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{t.empty1}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{t.empty2}</div>
        </div>
      ) : (
        <div className="facture-list">
          {factures.map((f) => (
            <FactureItem key={f.id} id={f.id} data={f} onChange={(newData) => handleChange(f.id, newData)} onRemove={onRemoveFacture} lang={lang} />
          ))}
        </div>
      )}

      <div className="actions-row">
        <Button variant="blue" onClick={onAddFacture}>{t.add}</Button>
        <Button variant="secondary" onClick={onPrev}>{t.back}</Button>
        <Button variant="primary" onClick={onNext}>{t.next}</Button>
      </div>
    </div>
  );
};

export default FactureList;
