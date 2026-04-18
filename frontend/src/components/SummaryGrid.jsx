import React from 'react';

const SummaryCard = ({ label, value, colorClass = '' }) => (
  <div className="summary-card">
    <div className="label">{label}</div>
    <div className={`value ${colorClass}`}>{value}</div>
  </div>
);

const SummaryGrid = ({ factures, identification, regimes }) => {
  const totalHT = factures.reduce((sum, f) => sum + (parseFloat(f.mht) || 0), 0);
  const totalTVA = factures.reduce((sum, f) => sum + (parseFloat(f.tva) || 0), 0);
  const totalTTC = totalHT + totalTVA;

  const regimeName = regimes.find(r => r.value === identification.regime)?.label || '';

  return (
    <div className="summary-grid" id="summaryGrid">
      <SummaryCard label="Nb Factures" value={factures.length} colorClass="blue" />
      <SummaryCard label="Total HT" value={`${totalHT.toFixed(2)} MAD`} colorClass="green" />
      <SummaryCard label="Total TVA" value={`${totalTVA.toFixed(2)} MAD`} colorClass="orange" />
      <SummaryCard label="Total TTC" value={`${totalTTC.toFixed(2)} MAD`} />
      <SummaryCard
        label="Période"
        value={`${identification.annee} / P${identification.periode}`}
        colorClass="blue"
      />
      <SummaryCard label="Régime" value={regimeName} />
    </div>
  );
};

export default SummaryGrid;
