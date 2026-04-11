import { useState, useCallback } from 'react';

const EMPTY_FACTURE = (ord) => ({
  id: ord,
  ord: String(ord),
  num: '',
  des: '',
  mht: '',
  tva: '',
  ttc: '',
  if: '',
  nom: '',
  ice: '',
  tx: '20.00',
  prorata: '100',
  mp: '1',
  dpai: '',
  dfac: '',
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
  const [factureCount, setFactureCount] = useState(0);
  const [history, setHistory] = useState([]);

  const addFacture = useCallback(() => {
    setFactureCount((prev) => {
      const newOrd = prev + 1;
      setFactures((f) => [...f, EMPTY_FACTURE(newOrd)]);
      return newOrd;
    });
  }, []);

  const removeFacture = useCallback((id) => {
    setFactures((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      // Re-assign ord sequentially after removal
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
    factures, addFacture, removeFacture, updateFactures,
    history, addToHistory,
  };
};

export default useFormState;
