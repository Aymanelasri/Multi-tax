import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import JSZip from 'jszip';
import Navigation from '../components/Navigation';
import StepsNav from '../components/StepsNav';
import IdentificationForm from '../components/IdentificationForm';
import FactureList from '../components/FactureList';
import SummaryGrid from '../components/SummaryGrid';
import ValidationErrors from '../components/ValidationErrors';
import ValidationSummary from '../components/ValidationSummary';
import ImportExportPanel from '../components/ImportExportPanel';
import RecentGenerations from '../components/RecentGenerations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import useFormState from '../hooks/useFormState';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocietes } from '../hooks/useSocietes';
import { REGIMES } from '../utils/constants';
import { generateXML, highlightXML, validateFormData } from '../utils/xmlHelper';
import api from '../lib/api';

const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';

const TotalsBar = ({ factures, t }) => {
  const ht  = factures.reduce((s, f) => s + (parseFloat(f.mht) || 0), 0);
  const tvaBrute = factures.reduce((s, f) => s + (parseFloat(f.tva) || 0), 0);
  const tvaRecuperable = factures.reduce((s, f) => {
    const tva = parseFloat(f.tva) || 0;
    const prorata = parseFloat(f.prorata) || 100;
    return s + (tva * prorata / 100);
  }, 0);
  const ttc = factures.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
  if (!factures.length) return null;
  
  const hasProrata = factures.some(f => parseFloat(f.prorata || 100) < 100);
  
  return (
    <div style={{ background: '#0f2744', borderRadius: 10, padding: '14px 20px', marginBottom: 14, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', border: '1px solid #1e3a5f' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>{t('totals_label')}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{t('label_ht')}</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#60A5FA', fontFamily: 'var(--mono)' }}>{fmt(ht)}</span>
      </div>
      {hasProrata && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>TVA brute</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#94a3b8', fontFamily: 'var(--mono)' }}>{fmt(tvaBrute)}</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{hasProrata ? 'TVA récup' : t('label_tva_short')}</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#00d4a0', fontFamily: 'var(--mono)' }}>{fmt(tvaRecuperable)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{t('label_ttc_short')}</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34D399', fontFamily: 'var(--mono)' }}>{fmt(ttc)}</span>
      </div>
    </div>
  );
};

const RestoreBanner = ({ onRestore, onDismiss, t }) => (
  <div style={{ background: '#0f2744', border: '1px solid #1e3a5f', borderRadius: 10, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
    <span style={{ fontSize: '0.83rem', color: '#e2e8f0' }}><span style={{ color: '#00d4a0' }}>💾</span> {t('draft_saved')} — {t('draft_restore_ask')}</span>
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onRestore} style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--blue)', color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>{t('btn_restore')}</button>
      <button onClick={onDismiss} style={{ padding: '6px 14px', borderRadius: 6, background: 'transparent', color: '#64748b', border: '1px solid #1F2937', fontSize: '0.78rem', cursor: 'pointer' }}>{t('btn_dismiss')}</button>
    </div>
  </div>
);

const SocietesSelectionModal = ({ isOpen, societes, isLoading, onSelect, onSkip, t }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#0d1728',
        border: '1px solid rgba(0, 212, 160, 0.2)',
        borderRadius: 16,
        padding: '32px 28px',
        maxWidth: 500,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#e2e8f0' }}>
          🏢 {t('gen_societes_modal_title') || 'Utiliser une société enregistrée'}
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, lineHeight: 1.5 }}>
          {t('gen_societes_modal_subtitle') || 'Sélectionnez une de vos sociétés enregistrées pour pré-remplir le champ IF automatiquement.'}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
            <div>Chargement...</div>
          </div>
        ) : societes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 20, marginBottom: 12 }}>📭</div>
            <div>{t('gen_societes_empty') || 'Aucune société enregistrée'}</div>
            <div style={{ fontSize: 12, marginTop: 12, color: '#64748b' }}>
              {t('gen_societes_empty_help') || 'Vous pouvez en ajouter dans la page "Mes Sociétés"'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10, marginBottom: 24, maxHeight: '50vh', overflowY: 'auto' }}>
            {societes.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                style={{
                  padding: '14px 16px',
                  background: 'rgba(0, 212, 160, 0.08)',
                  border: '1px solid rgba(0, 212, 160, 0.3)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  color: '#e2e8f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 160, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 160, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 160, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 160, 0.3)';
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14, color: '#00d4a0' }}>
                  {s.nom}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 16 }}>
                  <span>IF: <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{s.if_value || s.if}</span></span>
                  {(s.ice_value || s.ice) && <span>ICE: <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{s.ice_value || s.ice}</span></span>}
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onSkip}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: 'transparent',
            border: '1px solid rgba(94, 167, 255, 0.3)',
            borderRadius: 8,
            color: '#5ea7ff',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(94, 167, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(94, 167, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(94, 167, 255, 0.3)';
          }}
        >
          {t('gen_societes_skip') || 'Continuer sans société'}
        </button>
      </div>
    </div>
  );
};

const InvoiceGenerator = () => {
  const { t } = useLang();
  const location = useLocation();
  const {
    currentStep, setCurrentStep,
    identification, updateIdentification,
    factures, addFacture, duplicateFacture, duplicateLastFacture, removeFacture, updateFactures,
    history, addToHistory, clearAutosave,
    autosaveBadge, restoreBanner, restoreDraft, dismissRestore,
  } = useFormState();

  const { user } = useAuth();
  const { societes: allSocietes, loading: loadingSocietes } = useSocietes();

  const [generatedXML, setGeneratedXML] = useState('');
  const [liveXML, setLiveXML] = useState('');
  const [xmlErrors, setXmlErrors] = useState([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showSocietesModal, setShowSocietesModal] = useState(false);
  const [societes, setSocietes] = useState([]);
  const [refreshGenerations, setRefreshGenerations] = useState(0);
  const xmlPanelRef = useRef(null);
  const prefillProcessedRef = useRef(false);
  const societesModalShownRef = useRef(false);

  const toast = useCallback((msg) => { setToastMsg(msg); setShowToast(true); }, []);

  // ✅ CRITICAL: Filter societes by current user ID ONLY
  useEffect(() => {
    if (allSocietes.length > 0 && user?.id && !societesModalShownRef.current && !location.state) {
      const userSocietes = allSocietes.filter(s => s.user_id === user.id);
      setSocietes(userSocietes);
      if (userSocietes.length > 0) {
        setShowSocietesModal(true);
        societesModalShownRef.current = true;
      }
    }
  }, [allSocietes, user?.id, location.state]);

  const handleSelectSociete = (societe) => {
    const ifValue = societe.if_value || societe.if || '';
    updateIdentification({
      ...identification,
      identifiantFiscal: ifValue,
    });
    setShowSocietesModal(false);
    setCurrentStep(2);
    toast(`✓ ${societe.nom || 'Société'} sélectionnée`);
  };

  useEffect(() => {
    if (location.state && !prefillProcessedRef.current) {
      prefillProcessedRef.current = true;
      const { identification: prefillIdent, prefillFournisseur, skipToStep2 } = location.state;
      
      if (prefillIdent) {
        updateIdentification(prefillIdent);
      }
      
      if (prefillFournisseur) {
        const newFacture = {
          id: 1, ord: '1',
          num: '', des: '', mht: '', tva: '', ttc: '',
          if: prefillFournisseur.if || '', nom: prefillFournisseur.nom || '', ice: prefillFournisseur.ice || '',
          tx: '20.00', prorata: '100', mp: '1', dpai: '', dfac: '',
        };
        if (factures.length === 0) {
          addFacture();
          setTimeout(() => {
            updateFactures([(f) => ({ ...f, ...newFacture })]);
          }, 100);
        }
      }
      
      if (skipToStep2) {
        setTimeout(() => setCurrentStep(2), 150);
      }
    }
  }, [location.state, updateIdentification, addFacture, updateFactures, factures.length, setCurrentStep]);

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
    if (errors.length > 0) { 
      setXmlErrors(errors); 
      setShowValidationErrors(true);
      toast(t('gen_zip_error')); 
      return; 
    }
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
      
      // Save to database
      try {
        const totalTTC = factures.reduce((sum, f) => sum + (parseFloat(f.ttc) || 0), 0);
        const reference = `GEN-${identification.annee}-${String(Date.now()).slice(-4)}`;
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', blob, `${fname}.zip`);
        formData.append('file_type', 'ZIP');
        formData.append('reference', reference);
        formData.append('factures', factures.length);
        formData.append('montant_ttc', totalTTC);
        formData.append('regime', identification.regime);
        formData.append('annee', identification.annee);
        formData.append('periode', identification.periode);
        
        // Send to backend
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        await fetch(`${process.env.REACT_APP_API_URL}/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData,
          credentials: 'include'
        });
        
        // Refresh recent generations widget
        setRefreshGenerations(prev => prev + 1);
      } catch (saveError) {
        console.error('Failed to save generation:', saveError);
        // Don't block download if save fails
      }
      
      toast(t('gen_zip_success').replace('{filename}', fname));
    } catch (err) {
      toast(`Erreur lors de la génération ZIP : ${err.message || 'Vérifiez votre connexion'}`);
    }
  }, [identification, factures, toast, addToHistory, clearAutosave, t]);

  const handleDownloadXML = useCallback(async () => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { 
      setXmlErrors(errors); 
      setShowValidationErrors(true);
      toast(t('xml_validation_error')); 
      return; 
    }
    
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    const fname = `releveDeduction_IF${identification.identifiantFiscal}_${identification.annee}_P${identification.periode}.xml`;
    const blob = new Blob([plainXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
    
    addToHistory(identification, factures);
    clearAutosave();
    
    // Save to database
    try {
      const totalTTC = factures.reduce((sum, f) => sum + (parseFloat(f.ttc) || 0), 0);
      const reference = `GEN-${identification.annee}-${String(Date.now()).slice(-4)}`;
      
      // Create FormData for file upload
      const xmlBlob = new Blob([plainXml], { type: 'text/xml' });
      const formData = new FormData();
      formData.append('file', xmlBlob, fname);
      formData.append('file_type', 'XML');
      formData.append('reference', reference);
      formData.append('factures', factures.length);
      formData.append('montant_ttc', totalTTC);
      formData.append('regime', identification.regime);
      formData.append('annee', identification.annee);
      formData.append('periode', identification.periode);
      
      // Send to backend
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData,
        credentials: 'include'
      });
      
      // Refresh recent generations widget
      setRefreshGenerations(prev => prev + 1);
    } catch (saveError) {
      console.error('Failed to save generation:', saveError);
      // Don't block download if save fails
    }
    
    toast(t('xml_downloaded').replace('{filename}', fname));
  }, [identification, factures, toast, addToHistory, clearAutosave, t]);

  const handleCopyXML = useCallback(() => {
    const errors = validateFormData(identification, factures);
    if (errors.length > 0) { 
      setXmlErrors(errors); 
      setShowValidationErrors(true);
      toast(t('xml_validation_error')); 
      return; 
    }
    
    const plainXml = generateXML(identification.identifiantFiscal, identification.annee, identification.periode, identification.regime, factures);
    navigator.clipboard.writeText(plainXml).then(() => {
      addToHistory(identification, factures);
      clearAutosave();
      toast(t('xml_copied'));
    });
  }, [identification, factures, toast, addToHistory, clearAutosave, t]);

  const handleLoadModule = useCallback((mod) => {
    if (mod.type === 'factures' && Array.isArray(mod.entries)) updateFactures(mod.entries);
    else if (mod.type === 'identification' && mod.entries?.[0]) updateIdentification(mod.entries[0]);
  }, [updateFactures, updateIdentification]);

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

      <div style={{ paddingTop: '80px', paddingBottom: '28px' }}>
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

      {autosaveBadge && (
        <div style={{ position: 'fixed', bottom: 70, right: 24, background: '#0f2744', border: '1px solid #1e3a5f', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', color: '#34D399', zIndex: 9998, animation: 'fadeIn .2s ease' }}>
          {t('autosave_badge')}
        </div>
      )}

      <SocietesSelectionModal 
        isOpen={showSocietesModal}
        societes={societes}
        isLoading={loadingSocietes}
        onSelect={handleSelectSociete}
        onSkip={() => setShowSocietesModal(false)}
        t={t}
      />

      {restoreBanner && <RestoreBanner onRestore={restoreDraft} onDismiss={dismissRestore} t={t} />}

      <StepsNav currentStep={currentStep} onStepChange={handleStepChange} />

      {currentStep === 1 && (
        <>
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
        <div className="gen-layout">
          <div className="gen-left">
            <div className="panel active">
              <div className="panel-title">{t('xml_gen_title')}</div>
              <p className="panel-subtitle">
                {t('xml_gen_subtitle')}
              </p>
              <SummaryGrid factures={factures} identification={identification} regimes={REGIMES} />
              <TotalsBar factures={factures} t={t} />
              <ValidationSummary identification={identification} factures={factures} />
              <ValidationErrors errors={xmlErrors} isVisible={showValidationErrors && xmlErrors.length > 0} />
              <Button variant="secondary" onClick={() => handleStepChange(2)} style={{ marginTop: 8 }}>{t('btn_back')}</Button>
            </div>
          </div>

          <div className="gen-right" ref={xmlPanelRef}>
            <div className="gen-sticky">
              <Card title={t('xml_preview_title')}>
                <div className="xml-output" dangerouslySetInnerHTML={{ __html: xmlContent }} />
              </Card>
              <div className="output-actions" style={{ marginTop: 12 }}>
                <Button variant="primary" onClick={handleDownloadZIP} title={`${t('shortcut_hint')}`}>
                  {t('btn_download_zip')}
                </Button>
                <Button variant="secondary" onClick={handleDownloadXML}>{t('btn_download_xml')}</Button>
                <Button variant="accent3" onClick={handleCopyXML}>{t('btn_copy_xml')}</Button>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: 8 }}>
                {t('shortcut_hint')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Generations - Only visible in Step 3 */}
      {currentStep === 3 && (
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
          <RecentGenerations onRefresh={refreshGenerations} limit={5} />
        </div>
      )}

      <Toast message={toastMsg} isVisible={showToast} />
    </div>
  );
};

export default InvoiceGenerator;
