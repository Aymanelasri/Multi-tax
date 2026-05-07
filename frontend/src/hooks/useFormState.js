import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const EMPTY_FACTURE = (ord) => ({
  id: ord, ord: String(ord),
  num: '', des: '', mht: '', tva: '', ttc: '',
  if: '', nom: '', ice: '',
  tx: '', prorata: '100', mp: '', dpai: '', dfac: '',
});

// Debounce utility
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

const useFormState = () => {
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [identification, setIdentification] = useState({
    identifiantFiscal: '',
    annee: new Date().getFullYear().toString(),
    regime: '1',
    periode: '',
    declarationType: 'Normal',
  });
  const [factures, setFactures] = useState([]);
  const [history, setHistory] = useState([]);
  const [autosaveBadge, setAutosaveBadge] = useState(false);
  const [restoreBanner, setRestoreBanner] = useState(false);
  const savedDraft = useRef(null);
  const isLoadingDraft = useRef(false);

  // Load draft from API on mount
  useEffect(() => {
    if (!user?.id || isLoadingDraft.current) return;

    const loadDraft = async () => {
      try {
        isLoadingDraft.current = true;
        const response = await api.loadDraft();
        
        if (response.success && response.data) {
          const draft = response.data;
          // Ensure declarationType exists
          if (draft.data.identification && !draft.data.identification.declarationType) {
            draft.data.identification.declarationType = 'Normal';
          }
          savedDraft.current = draft;
          setRestoreBanner(true);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      } finally {
        isLoadingDraft.current = false;
      }
    };

    loadDraft();
  }, [user?.id]);

  // Auto-save to API (debounced 2 seconds)
  const saveDraftToAPI = useCallback(async (step, ident, facts) => {
    if (!user?.id) return;

    try {
      await api.saveDraft(step, {
        identification: ident,
        factures: facts,
      });
      
      // Show badge
      setAutosaveBadge(true);
      setTimeout(() => setAutosaveBadge(false), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [user?.id]);

  const debouncedSave = useDebounce(saveDraftToAPI, 2000);

  // Trigger auto-save on data change
  useEffect(() => {
    if (!user?.id) return;
    
    // Don't save if form is empty
    if (!identification.identifiantFiscal && factures.length === 0) return;
    
    debouncedSave(currentStep, identification, factures);
  }, [identification, factures, currentStep, user?.id, debouncedSave]);

  const restoreDraft = useCallback(() => {
    if (!savedDraft.current) return;
    const draft = savedDraft.current;
    
    if (draft.data.identification) {
      setIdentification(draft.data.identification);
    }
    if (draft.data.factures?.length) {
      setFactures(draft.data.factures);
    }
    if (draft.step) {
      setCurrentStep(draft.step);
    }
    
    setRestoreBanner(false);
  }, []);

  const dismissRestore = useCallback(async () => {
    setRestoreBanner(false);
    if (user?.id) {
      try {
        await api.clearDraft();
      } catch (error) {
        console.error('Failed to clear draft:', error);
      }
    }
  }, [user?.id]);

  const clearAutosave = useCallback(async () => {
    if (user?.id) {
      try {
        await api.clearDraft();
      } catch (error) {
        console.error('Failed to clear draft:', error);
      }
    }
  }, [user?.id]);

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
