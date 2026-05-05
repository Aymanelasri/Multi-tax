import React from 'react';

const XMLDetailsPanel = ({ identification, factures, lang = 'FR' }) => {
  if (!identification.identifiantFiscal || factures.length === 0) {
    return null;
  }

  const totalMHT = factures.reduce((s, f) => s + (parseFloat(f.mht) || 0), 0);
  const totalTVABrute = factures.reduce((s, f) => s + (parseFloat(f.tva) || 0), 0);
  const totalTVARecup = factures.reduce((s, f) => {
    const tva = parseFloat(f.tva) || 0;
    const prorata = parseFloat(f.prorata) || 100;
    return s + (tva * prorata / 100);
  }, 0);
  const totalTTC = factures.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
  const hasProrata = factures.some(f => parseFloat(f.prorata || 100) < 100);

  const fmt = (n) => n.toFixed(2);

  const getPaymentMode = (id) => {
    const modes = {
      '1': 'Espèces', '2': 'Chèque', '3': 'Prélèvement',
      '4': 'Virement', '5': 'Effet', '6': 'Compensation', '7': 'Autres'
    };
    return modes[id] || id;
  };

  return (
    <div style={{
      background: '#0a0f1a',
      border: '1px solid #1e3a5f',
      borderRadius: 12,
      padding: '20px',
      marginTop: 16,
      fontSize: '13px',
      fontFamily: 'var(--mono)',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#00d4a0',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '2px solid #1e3a5f',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        📋 DÉTAILS COMPLETS DE LA DÉCLARATION
      </div>

      {/* Identification Section */}
      <div style={{
        background: 'rgba(0,212,160,0.08)',
        border: '1px solid rgba(0,212,160,0.2)',
        borderRadius: 8,
        padding: '14px',
        marginBottom: 16
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#00d4a0', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🏢 IDENTIFICATION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <div>
            <span style={{ color: '#64748b' }}>Identifiant Fiscal:</span>
            <div style={{ color: '#ffffff', fontWeight: 700, marginTop: 2 }}>{identification.identifiantFiscal}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Année:</span>
            <div style={{ color: '#ffffff', fontWeight: 700, marginTop: 2 }}>{identification.annee}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Période:</span>
            <div style={{ color: '#ffffff', fontWeight: 700, marginTop: 2 }}>{identification.periode}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Régime:</span>
            <div style={{ color: '#ffffff', fontWeight: 700, marginTop: 2 }}>
              {identification.regime === '1' ? 'Mensuel' : identification.regime === '2' ? 'Trimestriel' : identification.regime}
            </div>
          </div>
        </div>
      </div>

      {/* Factures Section */}
      <div style={{
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 8,
        padding: '14px',
        marginBottom: 16
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#60A5FA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📄 FACTURES ({factures.length})
        </div>

        {factures.map((f, idx) => {
          const mht = parseFloat(f.mht) || 0;
          const tvaRaw = parseFloat(f.tva) || 0;
          const prorata = parseFloat(f.prorata) || 100;
          const tvaRecup = (tvaRaw * prorata / 100);
          const ttc = parseFloat(f.ttc) || 0;
          const tx = parseFloat(f.tx) || 0;

          return (
            <div key={f.id || idx} style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '12px',
              marginBottom: idx < factures.length - 1 ? 10 : 0
            }}>
              {/* Facture Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{
                  background: '#00d4a0',
                  color: '#0a0f1a',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  #{f.ord || idx + 1}
                </span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>
                  {f.num}
                </span>
                <span style={{ color: '#64748b', fontSize: '12px' }}>
                  {f.des}
                </span>
              </div>

              {/* Facture Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, fontSize: '12px' }}>
                {/* Montants */}
                <div>
                  <div style={{ color: '#64748b', marginBottom: 4 }}>💰 Montant HT</div>
                  <div style={{ color: '#60A5FA', fontWeight: 700 }}>{fmt(mht)} MAD</div>
                </div>

                <div>
                  <div style={{ color: '#64748b', marginBottom: 4 }}>📊 Taux TVA</div>
                  <div style={{ color: '#fbbf24', fontWeight: 700 }}>{fmt(tx)}%</div>
                </div>

                {prorata < 100 && (
                  <div>
                    <div style={{ color: '#64748b', marginBottom: 4 }}>📉 Prorata</div>
                    <div style={{ color: '#c4b5fd', fontWeight: 700 }}>{prorata}%</div>
                  </div>
                )}

                <div>
                  <div style={{ color: '#64748b', marginBottom: 4 }}>
                    {prorata < 100 ? '💵 TVA Brute' : '💵 TVA'}
                  </div>
                  <div style={{ color: prorata < 100 ? '#94a3b8' : '#00d4a0', fontWeight: 700 }}>
                    {fmt(tvaRaw)} MAD
                  </div>
                </div>

                {prorata < 100 && (
                  <div>
                    <div style={{ color: '#64748b', marginBottom: 4 }}>✅ TVA Récupérable</div>
                    <div style={{ color: '#00d4a0', fontWeight: 700 }}>{fmt(tvaRecup)} MAD</div>
                  </div>
                )}

                <div>
                  <div style={{ color: '#64748b', marginBottom: 4 }}>💳 Total TTC</div>
                  <div style={{ color: '#34D399', fontWeight: 700, fontSize: '14px' }}>{fmt(ttc)} MAD</div>
                </div>

                {/* Fournisseur */}
                <div style={{ gridColumn: '1 / -1', marginTop: 6, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#64748b', marginBottom: 6, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🏢 Fournisseur
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                    <div>
                      <span style={{ color: '#64748b' }}>IF: </span>
                      <span style={{ color: '#93c5fd', fontWeight: 600 }}>{f.if}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Nom: </span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{f.nom}</span>
                    </div>
                    {f.ice && (
                      <div>
                        <span style={{ color: '#64748b' }}>ICE: </span>
                        <span style={{ color: '#93c5fd', fontWeight: 600 }}>{f.ice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paiement */}
                <div style={{ gridColumn: '1 / -1', marginTop: 6, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#64748b', marginBottom: 6, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    💳 Paiement
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Mode: </span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{getPaymentMode(f.mp)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Date facture: </span>
                      <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{f.dfac}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Date paiement: </span>
                      <span style={{ color: '#c4b5fd', fontWeight: 600 }}>{f.dpai}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totaux Section */}
      <div style={{
        background: 'rgba(52,211,153,0.08)',
        border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: 8,
        padding: '14px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#34D399', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          📊 TOTAUX GÉNÉRAUX
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ color: '#64748b', marginBottom: 4 }}>Total HT</div>
            <div style={{ color: '#60A5FA', fontWeight: 700, fontSize: '16px' }}>{fmt(totalMHT)} MAD</div>
          </div>
          
          {hasProrata && (
            <div>
              <div style={{ color: '#64748b', marginBottom: 4 }}>TVA Brute</div>
              <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '16px' }}>{fmt(totalTVABrute)} MAD</div>
            </div>
          )}
          
          <div>
            <div style={{ color: '#64748b', marginBottom: 4 }}>
              {hasProrata ? 'TVA Récupérable' : 'TVA'}
            </div>
            <div style={{ color: '#00d4a0', fontWeight: 700, fontSize: '16px' }}>{fmt(totalTVARecup)} MAD</div>
          </div>
          
          <div>
            <div style={{ color: '#64748b', marginBottom: 4 }}>Total TTC</div>
            <div style={{ color: '#34D399', fontWeight: 700, fontSize: '18px' }}>{fmt(totalTTC)} MAD</div>
          </div>

          {hasProrata && (
            <div>
              <div style={{ color: '#64748b', marginBottom: 4 }}>TVA Non Récupérable</div>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '16px' }}>
                {fmt(totalTVABrute - totalTVARecup)} MAD
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: 6,
        fontSize: '11px',
        color: '#fcd34d',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>💡</span>
        <span>
          {hasProrata 
            ? `Prorata appliqué: TVA récupérable = ${fmt(totalTVARecup)} MAD (${fmt((totalTVARecup/totalTVABrute)*100)}% de ${fmt(totalTVABrute)} MAD)`
            : `Aucun prorata: TVA 100% récupérable`
          }
        </span>
      </div>
    </div>
  );
};

export default XMLDetailsPanel;
