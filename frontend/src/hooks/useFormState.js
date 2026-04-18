import { useState, useCallback, useEffect, useRef } from 'react';

const LS_KEY = 'edi_autosave';

const EMPTY_FACTURE = (ord) => ({
  id: ord, ord: String(ord),
  num: '', des: '', mht: '', tva: '', ttc: '',
  if: '', nom: '', ice: '',
  tx: '20.00', prorata: '100', mp: '1', dpai: '', dfac: '',
});

const useFormState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [identification, setIdentification] = useState({
    identifiantFiscal: '',
    annee: new Date().getFullYear().toString(),
    regime: '1',
    periode: '',
  });
  const [factures, setFactures] = useState([]);
  const [history, setHistory] = useState([]);
  const [autosaveBadge, setAutosaveBadge] = useState(false);
  const [restoreBanner, setRestoreBanner] = useState(false);
  const savedDraft = useRef(null);

  // Check for existing autosave on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.identification || draft?.factures?.length) {
          savedDraft.current = draft;
          setRestoreBanner(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    const id = setInterval(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ identification, factures }));
        setAutosaveBadge(true);
        setTimeout(() => setAutosaveBadge(false), 2000);
      } catch { /* ignore */ }
    }, 30000);
    return () => clearInterval(id);
  }, [identification, factures]);

  const restoreDraft = useCallback(() => {
    if (!savedDraft.current) return;
    if (savedDraft.current.identification) setIdentification(savedDraft.current.identification);
    if (savedDraft.current.factures?.length) setFactures(savedDraft.current.factures);
    setRestoreBanner(false);
  }, []);

  const dismissRestore = useCallback(() => {
    setRestoreBanner(false);
    localStorage.removeItem(LS_KEY);
  }, []);

  const clearAutosave = useCallback(() => {
    localStorage.removeItem(LS_KEY);
  }, []);

  const addFacture = useCallback(() => {
    setFactures((prev) => [...prev, EMPTY_FACTURE(prev.length + 1)]);
  }, []);

  const duplicateFacture = useCallback((id) => {
    setFactures((prev) => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx] };
      const newOrd = prev.length + 1;
      const newFacture = { ...copy, id: newOrd, ord: String(newOrd) };
      const next = [...prev.slice(0, idx + 1), newFacture, ...prev.slice(idx + 1)];
      return next.map((f, i) => ({ ...f, ord: String(i + 1) }));
    });
  }, []);

  const duplicateLastFacture = useCallback(() => {
    setFactures((prev) => {
      if (!prev.length) return [...prev, EMPTY_FACTURE(1)];
      const last = { ...prev[prev.length - 1] };
      const newOrd = prev.length + 1;
      return [...prev, { ...last, id: newOrd, ord: String(newOrd) }];
    });
  }, []);

  const removeFacture = useCallback((id) => {
    setFactures((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      return filtered.map((f, i) => ({ ...f, ord: String(i + 1) }));
    });
  }, []);

  const updateFactures = useCallback((newFactures) => setFactures(newFactures), []);
  const updateIdentification = useCallback((newData) => setIdentification(newData), []);

  const addToHistory = useCallback((ident, facts) => {
    const totalTTC = facts.reduce((sum, f) => sum + (parseFloat(f.ttc) || 0), 0);
    setHistory((prev) => [{
      id: Date.now(),
      num: `EDI-${ident.annee}-P${ident.periode}-${String(Date.now()).slice(-4)}`,
      date: new Date().toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: totalTTC.toLocaleString('fr-MA', { minimumFractionDigits: 2 }) + ' MAD',
      nbFactures: facts.length,
      status: 'Générée',
    }, ...prev]);
  }, []);

  return {
    currentStep, setCurrentStep,
    identification, updateIdentification,
    factures, addFacture, duplicateFacture, duplicateLastFacture, removeFacture, updateFactures,
    history, addToHistory, clearAutosave,
    autosaveBadge, restoreBanner, restoreDraft, dismissRestore,
  };
};

export default useFormState;
