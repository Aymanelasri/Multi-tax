import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import Navigation from '../components/Navigation';
import StepsNav from '../components/StepsNav';
import IdentificationForm from '../components/IdentificationForm';
import FactureList from '../components/FactureList';
import SummaryGrid from '../components/SummaryGrid';
import ValidationErrors from '../components/ValidationErrors';
import ImportExportPanel from '../components/ImportExportPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import useFormState from '../hooks/useFormState';
import { REGIMES } from '../utils/constants';
import { generateXML, highlightXML, validateFormData } from '../utils/xmlHelper';

/* ── Totals bar ─────────────────────────────────────────────────────────── */
const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';

const TotalsBar = ({ factures }) => {
  const ht  = factures.reduce((s, f) => s + (parseFloat(f.mht) || 0), 0);
  const tva = factures.reduce((s, f) => s + (parseFloat(f.tva) || 0), 0);
  const ttc = factures.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
  if (!factures.length) return null;
  return (
    <div style={{ background: '#0f2744', borderRadius: 10, padding: '14px 20px', marginBottom: 14, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', border: '1px solid #1e3a5f' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Totaux</span>
      {[['HT', ht, '#60A5FA'], ['TVA', tva, '#F59E0B'], ['TTC', ttc, '#34D399']].map(([label, val, color]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{fmt(val)}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Restore banner ─────────────────────────────────────────────────────── */
const RestoreBanner = ({ onRestore, onDismiss }) => (
  <div style={{ background: '#0f2744', border: '1px solid #1e3a5f', borderRadius: 10, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
    <span style={{ fontSize: '0.83rem', color: '#e2e8f0' }}>💾 Brouillon récupéré — Voulez-vous le restaurer ?</span>
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onRestore} style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Restaurer</button>
      <button onClick={onDismiss} style={{ padding: '6px 14px', borderRadius: 6, background: 'transparent', color: '#64748b', border: '1px solid #1F2937', fontSize: '0.78rem', cursor: 'pointer' }}>Ignorer</button>
    </div>
  </div>
);

/* ── Main ───────────────────────────────────────────────────────────────── */
const InvoiceGenerator = () => {
  const {
    currentStep, setCurrentStep,
    identification, updateIdentification,
    factures, addFacture, duplicateLastFacture, removeFacture, updateFactures,
    history, addToHistory, clearAutosave,
    autosaveBadge, restoreBanner, restoreDraft, dismissRestore,
  } = useFormState();

  const [generatedXML, setGeneratedXML] = useState('');
  const [liveXML, setLiveXML] = useState('');
  const [xmlErrors, setXmlErrors] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const xmlPanelRef = useRef(null);

  const toast = useCallback((msg) => { setToastMsg(msg); setShowToast(true); }, []);

  // Live XML preview
  useEffect(() => {
    if (currentStep === 3 && identification.identifiantFiscal) {
      try {
        setLiveXML(highlightXML(generateXML(
          identification.identifiantFiscal, identification.annee,
          identification.periode, identification.regime, factures
        )));
      } catch { setLiveXML(''); }
    }
  }, [identification, factures, currentStep]);

  const handleStepChange = useCallback((step) => {
    if (step > 1 && currentStep === 1) {
      if (!identification.identifiantFiscal?.trim() || !identification.annee || !identification.periode) {
        toast('Remplissez IF, Année et Période avant de continuer');
        return;
      }
    }
    setCurrentStep(step);
  }, [identification, currentStep, toast, setCurrentStep]);

  const handleGenerateXML = useCallback(() => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { setXmlErrors(errors); setGeneratedXML(''); toast('Erreurs de validation détectées'); return; }
    setXmlErrors([]);
    const xml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    setGeneratedXML(highlightXML(xml));
    addToHistory(identification, factures);
    toast('✓ XML généré avec succès');
  }, [identification, factures, toast, addToHistory]);

  const handleDownloadZIP = useCallback(async () => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { setXmlErrors(errors); toast('Corrigez les erreurs avant de télécharger'); return; }
    try {
      const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
      const fname = `releveDeduction_IF${identification.identifiantFiscal}_${identification.annee}_P${identification.periode}`;
      const zip = new JSZip();
      zip.file(`${fname}.xml`, plainXml);
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${fname}.zip`; a.click();
      URL.revokeObjectURL(url);
      addToHistory(identification, factures);
      clearAutosave();
      toast(`✓ ${fname}.zip téléchargé avec succès`);
    } catch (err) {
      toast(`Erreur lors de la génération ZIP : ${err.message || 'Vérifiez votre connexion'}`);
    }
  }, [identification, factures, toast, addToHistory, clearAutosave]);

  const handleDownloadXML = useCallback(() => {
    if (!generatedXML) return;
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    const fname = `releveDeduction_IF${identification.identifiantFiscal}_${identification.annee}_P${identification.periode}.xml`;
    const blob = new Blob([plainXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
    toast(`✓ ${fname} téléchargé`);
  }, [generatedXML, identification, factures, toast]);

  const handleCopyXML = useCallback(() => {
    if (!generatedXML) return;
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    navigator.clipboard.writeText(plainXml).then(() => toast('📋 XML copié dans le presse-papier'));
  }, [generatedXML, identification, factures, toast]);

  const handleLoadModule = useCallback((mod) => {
    if (mod.type === 'factures' && Array.isArray(mod.entries)) updateFactures(mod.entries);
    else if (mod.type === 'identification' && mod.entries?.[0]) updateIdentification(mod.entries[0]);
  }, [updateFactures, updateIdentification]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') { e.preventDefault(); handleDownloadZIP(); }
        if (e.key === 'd')     { e.preventDefault(); duplicateLastFacture(); }
        if (e.key === 'n')     { e.preventDefault(); addFacture(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDownloadZIP, duplicateLastFacture, addFacture]);

  const xmlContent = generatedXML || liveXML ||
    '<span style="color:#4B5563;font-style:italic">Remplissez les champs pour voir l\'aperçu XML en temps réel...</span>';

  return (
    <div className="container" style={{ position: 'relative' }}>
      <Navigation />

      {/* Page Header */}
      <div style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <h1 style={{
          fontSize: 'clamp(40px, 5vw, 64px)',
          fontWeight: 900,
          color: '#ffffff',
          marginBottom: '16px',
          letterSpacing: '-0.8px'
        }}>
          Générateur EDI <span style={{ color: '#00d4a0' }}>SIMPL-TVA</span>
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: 0,
          maxWidth: '700px'
        }}>
          Relevé des Déductions TVA — DGI Maroc. Saisissez vos données,<br />
          prévisualisez et téléchargez votre archive ZIP prête à envoyer.
        </p>
      </div>

      {/* Autosave badge */}
      {autosaveBadge && (
        <div style={{ position: 'fixed', bottom: 70, right: 24, background: '#0f2744', border: '1px solid #1e3a5f', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', color: '#34D399', zIndex: 9998, animation: 'fadeIn .2s ease' }}>
          💾 Sauvegardé
        </div>
      )}

      {/* Restore banner */}
      {restoreBanner && <RestoreBanner onRestore={restoreDraft} onDismiss={dismissRestore} />}

      <StepsNav currentStep={currentStep} onStepChange={handleStepChange} />

      {currentStep === 1 && (
        <IdentificationForm data={identification} onChange={updateIdentification} onNext={() => handleStepChange(2)} />
      )}

      {currentStep === 2 && (
        <>
          <FactureList
            factures={factures} onChange={updateFactures}
            onAddFacture={addFacture} onRemoveFacture={removeFacture}
            onPrev={() => handleStepChange(1)} onNext={() => handleStepChange(3)}
          />
          <TotalsBar factures={factures} />
          <ImportExportPanel factures={factures} identification={identification} onLoadModule={handleLoadModule} />
        </>
      )}

      {currentStep === 3 && (
        /* Desktop 2-col layout */
        <div className="gen-layout">
          {/* Left: form summary */}
          <div className="gen-left">
            <div className="panel active">
              <div className="panel-title">⚡ Génération du Fichier XML EDI</div>
              <p className="panel-subtitle">
                Vérifiez le résumé et téléchargez votre archive{' '}
                <code style={{ color: '#00d4a0', fontFamily: 'var(--mono)', fontSize: '13px' }}>.zip</code>{' '}
                prête à envoyer sur SIMPL-TVA.
              </p>
              <SummaryGrid factures={factures} identification={identification} regimes={REGIMES} />
              <TotalsBar factures={factures} />
              <ValidationErrors errors={xmlErrors} isVisible={xmlErrors.length > 0} />
              <Card title="Instructions d'envoi SIMPL-TVA">
                <ol style={{ paddingLeft: 18, lineHeight: 2.1, color: '#94a3b8', fontSize: '14px' }}>
                  <li>Cliquez sur <strong style={{ color: '#00d4a0' }}>Télécharger .zip</strong> — le fichier est créé automatiquement</li>
                  <li>Connectez-vous à <strong style={{ color: '#00d4a0' }}>SIMPL-TVA</strong> sur{' '}
                    <a href="https://www.tax.gov.ma" target="_blank" rel="noreferrer" style={{ color: '#00d4a0' }}>www.tax.gov.ma</a>
                  </li>
                  <li>Profil requis : <strong style={{ color: '#ffffff' }}>Rédacteur</strong></li>
                  <li>Allez dans <em>"Envoi EDI"</em> et uploadez votre fichier <code style={{ color: '#00d4a0', fontFamily: 'var(--mono)', fontSize: '12px' }}>.zip</code></li>
                  <li>Suivez le traitement dans le <strong style={{ color: '#ffffff' }}>Tableau de Bord EDI</strong></li>
                </ol>
              </Card>
              <Button variant="secondary" onClick={() => handleStepChange(2)} style={{ marginTop: 8 }}>← Retour</Button>
            </div>
          </div>

          {/* Right: sticky XML preview + actions */}
          <div className="gen-right" ref={xmlPanelRef}>
            <div className="gen-sticky">
              <Card title="Aperçu XML — Temps réel">
                <div className="xml-output" dangerouslySetInnerHTML={{ __html: xmlContent }} />
              </Card>
              <div className="output-actions" style={{ marginTop: 12 }}>
                <Button variant="primary" onClick={handleDownloadZIP} title="Raccourci: Ctrl+Enter">
                  📦 Télécharger .zip
                </Button>
                <Button variant="blue" onClick={handleGenerateXML}>⚙ Prévisualiser</Button>
                {generatedXML && (
                  <>
                    <Button variant="secondary" onClick={handleDownloadXML}>↓ .xml</Button>
                    <Button variant="accent3" onClick={handleCopyXML}>📋 Copier</Button>
                  </>
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: 8 }}>
                Raccourci : <kbd style={{ background: '#141d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', fontSize: '10px' }}>Ctrl+Enter</kbd> pour générer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          📋 Historique des générations
          {history.length > 0 && (
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
              {history.length}
            </span>
          )}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="hist-header">
            <span>Référence</span><span>Date</span><span className="hist-hide">Factures</span><span>Montant TTC</span><span>Statut</span>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.81rem' }}>
              Aucune génération pour cette session.
            </div>
          ) : (
            history.map((row) => (
              <div key={row.id} className="hist-row"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue-tint)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '0.76rem', color: 'var(--text)', fontFamily: 'var(--mono)' }}>{row.num}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-2)' }}>{row.date}</span>
                <span className="hist-hide" style={{ fontSize: '0.76rem', color: 'var(--text-2)' }}>{row.nbFactures} facture{row.nbFactures > 1 ? 's' : ''}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text)', fontWeight: 600 }}>{row.amount}</span>
                <span style={{ fontSize: '0.67rem', padding: '3px 9px', borderRadius: 6, background: 'var(--green-tint)', color: 'var(--green)', border: '1px solid var(--green-border)', fontWeight: 600 }}>
                  {row.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <Toast message={toastMsg} isVisible={showToast} />
    </div>
  );
};

export default InvoiceGenerator;
