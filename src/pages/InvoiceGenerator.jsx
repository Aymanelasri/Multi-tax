import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useLang } from '../context/LanguageContext';
import { REGIMES } from '../utils/constants';
import { generateXML, highlightXML, validateFormData } from '../utils/xmlHelper';

/* ── Totals bar ─────────────────────────────────────────────────────────── */
const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';

const TotalsBar = ({ factures, t }) => {
  const ht  = factures.reduce((s, f) => s + (parseFloat(f.mht) || 0), 0);
  const tva = factures.reduce((s, f) => s + (parseFloat(f.tva) || 0), 0);
  const ttc = factures.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
  if (!factures.length) return null;
  return (
    <div style={{ background: '#0f2744', borderRadius: 10, padding: '14px 20px', marginBottom: 14, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', border: '1px solid #1e3a5f' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>{t('totals_label')}</span>
      {[[t('label_ht'), ht, '#60A5FA'], [t('label_tva_short'), tva, '#F59E0B'], [t('label_ttc_short'), ttc, '#34D399']].map(([label, val, color]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{fmt(val)}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Restore banner ─────────────────────────────────────────────────────── */
const RestoreBanner = ({ onRestore, onDismiss, t }) => (
  <div style={{ background: '#0f2744', border: '1px solid #1e3a5f', borderRadius: 10, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
    <span style={{ fontSize: '0.83rem', color: '#e2e8f0' }}>💾 {t('draft_saved')} — {t('draft_restore_ask')}</span>
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onRestore} style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>{t('btn_restore')}</button>
      <button onClick={onDismiss} style={{ padding: '6px 14px', borderRadius: 6, background: 'transparent', color: '#64748b', border: '1px solid #1F2937', fontSize: '0.78rem', cursor: 'pointer' }}>{t('btn_dismiss')}</button>
    </div>
  </div>
);

/* ── Main ───────────────────────────────────────────────────────────────── */
const InvoiceGenerator = () => {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentStep, setCurrentStep,
    identification, updateIdentification,
    factures, addFacture, duplicateFacture, duplicateLastFacture, removeFacture, updateFactures,
    history, addToHistory, clearAutosave,
    autosaveBadge, restoreBanner, restoreDraft, dismissRestore,
  } = useFormState();

  const [generatedXML, setGeneratedXML] = useState('');
  const [liveXML, setLiveXML] = useState('');
  const [xmlErrors, setXmlErrors] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const xmlPanelRef = useRef(null);
  const prefillProcessedRef = useRef(false);

  const toast = useCallback((msg) => { setToastMsg(msg); setShowToast(true); }, []);

  // Handle prefill from location state (from Societes page "Utiliser" button)
  useEffect(() => {
    if (location.state && !prefillProcessedRef.current) {
      prefillProcessedRef.current = true;
      const { identification: prefillIdent, prefillFournisseur, skipToStep2 } = location.state;
      
      // Pre-fill identification if provided
      if (prefillIdent) {
        updateIdentification(prefillIdent);
      }
      
      // Add pre-filled fournisseur as first invoice if provided
      if (prefillFournisseur) {
        const newFacture = {
          id: 1, ord: '1',
          num: '', des: '', mht: '', tva: '', ttc: '',
          if: prefillFournisseur.if || '', nom: prefillFournisseur.nom || '', ice: prefillFournisseur.ice || '',
          tx: '20.00', prorata: '100', mp: '1', dpai: '', dfac: '',
        };
        // Only add if no factures exist
        if (factures.length === 0) {
          addFacture();
          // Update the first facture with prefilled supplier data
          setTimeout(() => {
            updateFactures([(f) => ({ ...f, ...newFacture })]);
          }, 100);
        }
      }
      
      // Skip to step 2 if requested
      if (skipToStep2) {
        setTimeout(() => setCurrentStep(2), 150);
      }
    }
  }, [location.state, updateIdentification, addFacture, updateFactures, factures.length, setCurrentStep]);

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
        toast(t('gen_step1_error'));
        return;
      }
    }
    setCurrentStep(step);
  }, [identification, currentStep, toast, setCurrentStep, t]);

  const handleGenerateXML = useCallback(() => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { setXmlErrors(errors); setGeneratedXML(''); toast(t('xml_validation_error')); return; }
    setXmlErrors([]);
    const xml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    setGeneratedXML(highlightXML(xml));
    addToHistory(identification, factures);
    toast(t('xml_generated'));
  }, [identification, factures, toast, addToHistory, t]);

  const handleDownloadZIP = useCallback(async () => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { setXmlErrors(errors); toast(t('gen_zip_error')); return; }
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
      toast(t('gen_zip_success').replace('{filename}', fname));
    } catch (err) {
      toast(`Erreur lors de la génération ZIP : ${err.message || 'Vérifiez votre connexion'}`);
    }
  }, [identification, factures, toast, addToHistory, clearAutosave, t]);

  const handleDownloadXML = useCallback(() => {
    if (!generatedXML) return;
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    const fname = `releveDeduction_IF${identification.identifiantFiscal}_${identification.annee}_P${identification.periode}.xml`;
    const blob = new Blob([plainXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
    toast(t('xml_downloaded').replace('{filename}', fname));
  }, [generatedXML, identification, factures, toast, t]);

  const handleCopyXML = useCallback(() => {
    if (!generatedXML) return;
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    navigator.clipboard.writeText(plainXml).then(() => toast(t('xml_copied')));
  }, [generatedXML, identification, factures, toast, t]);

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
    `<span style="color:#4B5563;font-style:italic">${t('xml_placeholder')}</span>`;

  return (
    <div className="container" style={{ position: 'relative' }}>
      <Navigation />

      {/* Page Header */}
      <div style={{ paddingTop: '40px', paddingBottom: '28px' }}>
        <h1 style={{
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '10px',
          letterSpacing: '-0.5px'
        }}>
          {t('gen_page_title')} <span style={{ color: '#00d4a0' }}>SIMPL-TVA</span>
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: 0,
          maxWidth: '600px'
        }}>
          {t('gen_page_subtitle')}
        </p>
      </div>

      {/* Autosave badge */}
      {autosaveBadge && (
        <div style={{ position: 'fixed', bottom: 70, right: 24, background: '#0f2744', border: '1px solid #1e3a5f', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', color: '#34D399', zIndex: 9998, animation: 'fadeIn .2s ease' }}>
          {t('autosave_badge')}
        </div>
      )}

      {/* Restore banner */}
      {restoreBanner && <RestoreBanner onRestore={restoreDraft} onDismiss={dismissRestore} t={t} />}

      <StepsNav currentStep={currentStep} onStepChange={handleStepChange} />

      {currentStep === 1 && (
        <>
          {/* Info boxes for Step 1 */}
          {(() => {
            try {
              const societes = JSON.parse(localStorage.getItem('edi_societes') || '[]');
              if (societes.length > 0) {
                return (
                  <div style={{ background: 'rgba(0,212,160,0.08)', border: '1px solid rgba(0,212,160,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: '24px', flexShrink: 0 }}>💡</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {t('gen_step1_companies_info').replace('{{count}}', societes.length)}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div style={{ background: 'rgba(0,212,160,0.08)', border: '1px solid rgba(0,212,160,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: '24px', flexShrink: 0 }}>💡</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {t('gen_step1_no_companies') + ' '}
                        <button onClick={() => navigate('/societes')} style={{ background: 'transparent', border: 'none', color: '#00d4a0', cursor: 'pointer', fontWeight: 600, padding: 0, textDecoration: 'underline' }}>
                          {t('gen_step1_add_companies_link')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            } catch {
              return null;
            }
          })()}
          <IdentificationForm data={identification} onChange={updateIdentification} onNext={() => handleStepChange(2)} />
        </>
      )}

      {currentStep === 2 && (
        <>
          <FactureList
            factures={factures} onChange={updateFactures}
            onAddFacture={addFacture} onRemoveFacture={removeFacture}
            onDuplicateFacture={duplicateFacture}
            onPrev={() => handleStepChange(1)} onNext={() => handleStepChange(3)}
          />
          <TotalsBar factures={factures} t={t} />
          <ImportExportPanel factures={factures} identification={identification} onLoadModule={handleLoadModule} />
        </>
      )}

      {currentStep === 3 && (
        /* Desktop 2-col layout */
        <div className="gen-layout">
          {/* Left: form summary */}
          <div className="gen-left">
            <div className="panel active">
              <div className="panel-title">{t('xml_gen_title')}</div>
              <p className="panel-subtitle">
                {t('xml_gen_subtitle')}
              </p>
              <SummaryGrid factures={factures} identification={identification} regimes={REGIMES} />
              <TotalsBar factures={factures} t={t} />
              <ValidationErrors errors={xmlErrors} isVisible={xmlErrors.length > 0} />
              <Card title={t('gen_instructions_title')}>
                <ol style={{ paddingLeft: 18, lineHeight: 2.1, color: '#94a3b8', fontSize: '14px' }}>
                  <li>{t('gen_instruction_1')} <strong style={{ color: '#00d4a0' }}>{t('btn_download_zip')}</strong></li>
                  <li>{t('gen_instruction_2')} <strong style={{ color: '#00d4a0' }}>SIMPL-TVA</strong> {t('gen_instruction_2').split('www.tax.gov.ma')[1] ? 'www.tax.gov.ma' : ''}
                    <a href="https://www.tax.gov.ma" target="_blank" rel="noreferrer" style={{ color: '#00d4a0' }}>www.tax.gov.ma</a>
                  </li>
                  <li>{t('gen_instruction_3')}: <strong style={{ color: '#ffffff' }}>Rédacteur</strong></li>
                  <li>{t('gen_instruction_4')} <code style={{ color: '#00d4a0', fontFamily: 'var(--mono)', fontSize: '12px' }}>.zip</code></li>
                  <li>{t('gen_instruction_5')}</li>
                </ol>
              </Card>
              <Button variant="secondary" onClick={() => handleStepChange(2)} style={{ marginTop: 8 }}>{t('btn_back')}</Button>
            </div>
          </div>

          {/* Right: sticky XML preview + actions */}
          <div className="gen-right" ref={xmlPanelRef}>
            <div className="gen-sticky">
              <Card title={t('xml_preview_title')}>
                <div className="xml-output" dangerouslySetInnerHTML={{ __html: xmlContent }} />
              </Card>
              <div className="output-actions" style={{ marginTop: 12 }}>
                <Button variant="primary" onClick={handleDownloadZIP} title={`${t('shortcut_hint')}`}>
                  {t('btn_download_zip')}
                </Button>
                <Button variant="blue" onClick={handleGenerateXML}>{t('btn_preview')}</Button>
                {generatedXML && (
                  <>
                    <Button variant="secondary" onClick={handleDownloadXML}>{t('btn_download_xml')}</Button>
                    <Button variant="accent3" onClick={handleCopyXML}>{t('btn_copy_xml')}</Button>
                  </>
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: 8 }}>
                {t('shortcut_hint')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          {t('history_title')}
          {history.length > 0 && (
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
              {history.length}
            </span>
          )}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="hist-header">
            <span>{t('history_col_ref')}</span><span>{t('history_col_date')}</span><span className="hist-hide">{t('history_col_invoices')}</span><span>{t('history_col_amount')}</span><span>{t('history_col_status')}</span>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.81rem' }}>
              {t('history_empty')}
            </div>
          ) : (
            history.map((row) => (
              <div key={row.id} className="hist-row"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue-tint)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '0.76rem', color: 'var(--text)', fontFamily: 'var(--mono)' }}>{row.num}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-2)' }}>{row.date}</span>
                <span className="hist-hide" style={{ fontSize: '0.76rem', color: 'var(--text-2)' }}>{row.nbFactures}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text)', fontWeight: 600 }}>{row.amount}</span>
                <span style={{ fontSize: '0.67rem', padding: '3px 9px', borderRadius: 6, background: 'var(--green-tint)', color: 'var(--green)', border: '1px solid var(--green-border)', fontWeight: 600 }}>
                  {t('history_status_generated')}
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
