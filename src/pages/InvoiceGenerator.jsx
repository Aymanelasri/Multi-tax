import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import Navigation from '../components/Navigation';
import Header from '../components/Header';
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

const InvoiceGenerator = () => {
  const {
    currentStep, setCurrentStep,
    identification, updateIdentification,
    factures, addFacture, removeFacture, updateFactures,
    history, addToHistory,
  } = useFormState();

  const [generatedXML, setGeneratedXML] = useState('');
  const [liveXML, setLiveXML] = useState('');
  const [xmlErrors, setXmlErrors] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showToastMsg = useCallback((msg) => {
    setToastMessage(msg); setShowToast(true);
  }, []);

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
        showToastMsg('Remplissez IF, Année et Période avant de continuer');
        return;
      }
    }
    setCurrentStep(step);
  }, [identification, currentStep, showToastMsg, setCurrentStep]);

  const handleGenerateXML = useCallback(() => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { setXmlErrors(errors); setGeneratedXML(''); showToastMsg('Erreurs de validation'); return; }
    setXmlErrors([]);
    const xml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    setGeneratedXML(highlightXML(xml));
    addToHistory(identification, factures);
    showToastMsg('XML généré avec succès');
  }, [identification, factures, showToastMsg, addToHistory]);

  const handleDownloadZIP = useCallback(async () => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { setXmlErrors(errors); showToastMsg('Corrigez les erreurs avant de télécharger'); return; }
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
    showToastMsg(`✓ ${fname}.zip téléchargé`);
  }, [identification, factures, showToastMsg, addToHistory]);

  const handleDownloadXML = useCallback(() => {
    if (!generatedXML) return;
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    const fname = `releveDeduction_IF${identification.identifiantFiscal}_${identification.annee}_P${identification.periode}.xml`;
    const blob = new Blob([plainXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
    showToastMsg(`✓ ${fname} téléchargé`);
  }, [generatedXML, identification, factures, showToastMsg]);

  const handleCopyXML = useCallback(() => {
    if (!generatedXML) return;
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    navigator.clipboard.writeText(plainXml).then(() => showToastMsg('XML copié dans le presse-papier'));
  }, [generatedXML, identification, factures, showToastMsg]);

  const handleLoadModule = useCallback((mod) => {
    if (mod.type === 'factures' && Array.isArray(mod.entries)) updateFactures(mod.entries);
    else if (mod.type === 'identification' && mod.entries?.[0]) updateIdentification(mod.entries[0]);
  }, [updateFactures, updateIdentification]);

  return (
    <div className="container">
      <Navigation />
      <Header />
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
          <ImportExportPanel factures={factures} identification={identification} onLoadModule={handleLoadModule} />
        </>
      )}

      {currentStep === 3 && (
        <div className="panel active">
          <div className="panel-title">⚡ Génération du Fichier XML EDI</div>
          <p className="panel-subtitle">
            Vérifiez le résumé, prévisualisez le XML et téléchargez votre archive{' '}
            <code style={{ color: 'var(--blue-h)', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>.zip</code>{' '}
            prête à envoyer sur SIMPL-TVA.
          </p>

          <SummaryGrid factures={factures} identification={identification} regimes={REGIMES} />
          <ValidationErrors errors={xmlErrors} isVisible={xmlErrors.length > 0} />

          <Card title="Aperçu XML — Temps réel">
            <div className="xml-output" dangerouslySetInnerHTML={{
              __html: generatedXML || liveXML ||
                '<span style="color:#4B5563;font-style:italic">Remplissez les champs pour voir l\'aperçu XML en temps réel...</span>',
            }} />
          </Card>

          <div className="output-actions">
            <Button variant="primary" onClick={handleDownloadZIP}>📦 Télécharger .zip</Button>
            <Button variant="blue" onClick={handleGenerateXML}>⚙ Prévisualiser XML</Button>
            {generatedXML && (
              <>
                <Button variant="secondary" onClick={handleDownloadXML}>↓ .xml</Button>
                <Button variant="accent3" onClick={handleCopyXML}>📋 Copier</Button>
              </>
            )}
            <Button variant="secondary" onClick={() => handleStepChange(2)}>← Retour</Button>
          </div>

          <Card title="Instructions d'envoi SIMPL-TVA">
            <ol style={{ paddingLeft: 18, lineHeight: 2.1, color: 'var(--text-2)', fontSize: '0.82rem' }}>
              <li>Cliquez sur <strong style={{ color: 'var(--blue-h)' }}>Télécharger .zip</strong> — le fichier est créé automatiquement</li>
              <li>Connectez-vous à <strong style={{ color: 'var(--blue-h)' }}>SIMPL-TVA</strong> sur{' '}
                <a href="https://www.tax.gov.ma" target="_blank" rel="noreferrer" style={{ color: 'var(--blue-h)' }}>www.tax.gov.ma</a>
              </li>
              <li>Profil requis : <strong style={{ color: 'var(--text)' }}>Rédacteur</strong></li>
              <li>Allez dans <em>"Envoi EDI"</em> et uploadez votre fichier{' '}
                <code style={{ color: 'var(--blue-h)', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>.zip</code>
              </li>
              <li>Suivez le traitement dans le <strong style={{ color: 'var(--text)' }}>Tableau de Bord EDI</strong></li>
            </ol>
          </Card>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 1fr 90px', padding: '9px 18px', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span>Référence</span><span>Date</span><span>Factures</span><span>Montant TTC</span><span>Statut</span>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.81rem' }}>
              Aucune génération pour cette session.
            </div>
          ) : (
            history.map((row) => (
              <div key={row.id}
                style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 1fr 90px', padding: '12px 18px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue-tint)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '0.76rem', color: 'var(--text)', fontFamily: 'var(--mono)' }}>{row.num}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-2)' }}>{row.date}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-2)' }}>{row.nbFactures} facture{row.nbFactures > 1 ? 's' : ''}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text)', fontWeight: 600 }}>{row.amount}</span>
                <span style={{ fontSize: '0.67rem', padding: '3px 9px', borderRadius: 6, background: 'var(--green-tint)', color: 'var(--green)', border: '1px solid var(--green-border)', fontWeight: 600 }}>
                  {row.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <Toast message={toastMessage} isVisible={showToast} />
    </div>
  );
};

export default InvoiceGenerator;
