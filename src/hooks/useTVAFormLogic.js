import { useState, useCallback, useEffect } from 'react';

/**
 * useTVAFormLogic - Complete state management for SIMPL-TVA EDI V4.0 form
 * Handles header data, invoices (rd), validation, auto-calculation, and submission
 */

// Constants - Tax rates as per DGI documentation
const TAX_RATES = ['7.00', '10.00', '14.00', '20.00'];

// Payment modes (mp)
const PAYMENT_MODES = [
  { id: 1, label: 'Espèces' },
  { id: 2, label: 'Chèque' },
  { id: 3, label: 'Virement' },
  { id: 4, label: 'Prélèvement' },
  { id: 5, label: 'Effet' }
];

// Regimes
const REGIMES = [
  { value: 1, label: 'Régime forfaitaire' },
  { value: 2, label: 'Régime réel' }
];

// Validation rules
const VALIDATORS = {
  identifiantFiscal: (value) => {
    if (!value) return { valid: false, error: 'IF is required' };
    if (!/^\d{8}$/.test(value)) return { valid: false, error: 'IF must be exactly 8 digits' };
    return { valid: true };
  },
  
  ice: (value) => {
    if (!value) return { valid: true }; // ICE is optional
    if (!/^\d{15}$/.test(value)) return { valid: false, error: 'ICE must be exactly 15 digits' };
    return { valid: true };
  },
  
  date: (value) => {
    if (!value) return { valid: false, error: 'Date is required' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { valid: false, error: 'Date must follow YYYY-MM-DD format' };
    const date = new Date(value);
    if (isNaN(date.getTime())) return { valid: false, error: 'Invalid date' };
    return { valid: true };
  },
  
  decimal: (value, decimals = 2) => {
    if (value === '' || value === null || value === undefined) return { valid: false, error: 'Value is required' };
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, error: 'Must be a number' };
    if (num < 0) return { valid: false, error: 'Must be positive' };
    return { valid: true };
  }
};

export const useTVAFormLogic = (initialData = null) => {
  // Header state
  const [header, setHeader] = useState(
    initialData?.header || {
      identifiantFiscal: '',
      annee: new Date().getFullYear().toString(),
      periode: '1',
      regime: '1'
    }
  );

  // Invoices state (rd array)
  const [invoices, setInvoices] = useState(initialData?.invoices || []);

  // Errors state
  const [errors, setErrors] = useState({});

  // Validation errors for specific fields
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Handle header field changes
   */
  const handleHeaderChange = useCallback((field, value) => {
    setHeader(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [fieldErrors]);

  /**
   * Handle invoice field changes
   */
  const handleInvoiceChange = useCallback((index, field, value) => {
    setInvoices(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };

      // Auto-calculate TTC when MHT or TX changes
      if (field === 'mht' || field === 'tx') {
        const mht = parseFloat(updated[index].mht) || 0;
        const tx = parseFloat(updated[index].tx) || 0;
        const tva = parseFloat((mht * (tx / 100)).toFixed(2));
        const ttc = parseFloat((mht + tva).toFixed(2));
        
        updated[index].tva = tva.toFixed(2);
        updated[index].ttc = ttc.toFixed(2);
      }

      return updated;
    });

    // Clear field error
    if (fieldErrors[`invoice_${index}_${field}`]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`invoice_${index}_${field}`];
        return newErrors;
      });
    }
  }, [fieldErrors]);

  /**
   * Add a new empty invoice row with defaults
   */
  const addRow = useCallback(() => {
    const newRow = {
      ord: invoices.length + 1,
      num: '',
      des: '',
      mht: '',
      tva: '0.00',
      ttc: '0.00',
      if: '',
      nom: '',
      ice: '',
      tx: '20.00',
      prorata: '100',
      mp: '1',
      dpai: '',
      dfac: ''
    };

    setInvoices(prev => [...prev, newRow]);
  }, [invoices.length]);

  /**
   * Remove an invoice row by index
   */
  const removeRow = useCallback((index) => {
    setInvoices(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Re-assign ord numbers
      return updated.map((row, idx) => ({
        ...row,
        ord: idx + 1
      }));
    });
  }, []);

  /**
   * Validate header data according to DGI specifications
   */
  const validateHeader = useCallback(() => {
    const newErrors = {};

    // Validate IF
    const ifValidation = VALIDATORS.identifiantFiscal(header.identifiantFiscal);
    if (!ifValidation.valid) {
      newErrors.identifiantFiscal = ifValidation.error;
    }

    // Validate year
    const year = parseInt(header.annee);
    if (isNaN(year) || year < 2015 || year > 2030) {
      newErrors.annee = 'Year must be between 2015 and 2030';
    }

    // Validate period
    const period = parseInt(header.periode);
    const maxPeriod = header.regime === '1' ? 4 : 12;
    if (isNaN(period) || period < 1 || period > maxPeriod) {
      newErrors.periode = `Period must be between 1 and ${maxPeriod}`;
    }

    // Validate regime
    if (!['1', '2'].includes(header.regime)) {
      newErrors.regime = 'Invalid regime selection';
    }

    return newErrors;
  }, [header]);

  /**
   * Validate invoice data according to DGI specifications
   */
  const validateInvoices = useCallback(() => {
    const newErrors = {};

    if (invoices.length === 0) {
      newErrors.invoices = 'At least one invoice is required';
      return newErrors;
    }

    invoices.forEach((invoice, index) => {
      const indexErrors = {};

      // Validate invoice number
      if (!invoice.num || invoice.num.trim() === '') {
        indexErrors.num = `Invoice number is required`;
      }

      // Validate description
      if (!invoice.des || invoice.des.trim() === '') {
        indexErrors.des = 'Description is required';
      }

      // Validate MHT
      const mhtValidation = VALIDATORS.decimal(invoice.mht);
      if (!mhtValidation.valid) {
        indexErrors.mht = `MHT: ${mhtValidation.error}`;
      }

      // Validate TVA (should be auto-calculated, but verify format)
      const tvaValidation = VALIDATORS.decimal(invoice.tva);
      if (!tvaValidation.valid) {
        indexErrors.tva = `TVA: ${tvaValidation.error}`;
      }

      // Validate provider IF (8 digits)
      const providerIfValidation = VALIDATORS.identifiantFiscal(invoice.if);
      if (!providerIfValidation.valid) {
        indexErrors.if = providerIfValidation.error;
      }

      // Validate provider name
      if (!invoice.nom || invoice.nom.trim() === '') {
        indexErrors.nom = 'Provider name is required';
      }

      // Validate ICE (optional, but if provided, must be 15 digits)
      const iceValidation = VALIDATORS.ice(invoice.ice);
      if (!iceValidation.valid) {
        indexErrors.ice = iceValidation.error;
      }

      // Validate tax rate
      if (!TAX_RATES.includes(invoice.tx)) {
        indexErrors.tx = 'Invalid tax rate';
      }

      // Validate prorata
      const prorataNum = parseFloat(invoice.prorata);
      if (isNaN(prorataNum) || prorataNum < 0 || prorataNum > 100) {
        indexErrors.prorata = 'Prorata must be between 0 and 100';
      }

      // Validate payment mode
      if (!invoice.mp || !['1', '2', '3', '4', '5'].includes(invoice.mp)) {
        indexErrors.mp = 'Invalid payment mode';
      }

      // Validate payment date
      const dpaiValidation = VALIDATORS.date(invoice.dpai);
      if (!dpaiValidation.valid) {
        indexErrors.dpai = dpaiValidation.error;
      }

      // Validate invoice date
      const dfacValidation = VALIDATORS.date(invoice.dfac);
      if (!dfacValidation.valid) {
        indexErrors.dfac = dfacValidation.error;
      }

      // Payment date should not be before invoice date
      if (invoice.dpai && invoice.dfac) {
        const paymentDate = new Date(invoice.dpai);
        const invoiceDate = new Date(invoice.dfac);
        if (paymentDate < invoiceDate) {
          indexErrors.dpai = 'Payment date cannot be before invoice date';
        }
      }

      // Add index-specific errors
      if (Object.keys(indexErrors).length > 0) {
        newErrors[`invoice_${index}`] = indexErrors;
      }
    });

    return newErrors;
  }, [invoices]);

  /**
   * Calculate totals across all invoices
   */
  const calculateTotals = useCallback(() => {
    const totals = {
      mhtTotal: 0,
      tvaTotal: 0,
      ttcTotal: 0,
      invoiceCount: invoices.length
    };

    invoices.forEach(invoice => {
      totals.mhtTotal += parseFloat(invoice.mht) || 0;
      totals.tvaTotal += parseFloat(invoice.tva) || 0;
      totals.ttcTotal += parseFloat(invoice.ttc) || 0;
    });

    // Round to 2 decimal places
    totals.mhtTotal = parseFloat(totals.mhtTotal.toFixed(2));
    totals.tvaTotal = parseFloat(totals.tvaTotal.toFixed(2));
    totals.ttcTotal = parseFloat(totals.ttcTotal.toFixed(2));

    return totals;
  }, [invoices]);

  /**
   * Main validation function
   */
  const validate = useCallback(() => {
    const headerErrors = validateHeader();
    const invoiceErrors = validateInvoices();

    const allErrors = {
      ...headerErrors,
      ...invoiceErrors
    };

    setErrors(allErrors);
    setFieldErrors(allErrors);

    return Object.keys(allErrors).length === 0;
  }, [validateHeader, validateInvoices]);

  /**
   * Format data for API submission
   */
  const formatForSubmission = useCallback(() => {
    const totals = calculateTotals();

    return {
      header: {
        ...header,
        annee: parseInt(header.annee),
        periode: parseInt(header.periode),
        regime: parseInt(header.regime)
      },
      invoices: invoices.map(inv => ({
        ord: inv.ord,
        num: inv.num,
        des: inv.des,
        mht: parseFloat(inv.mht),
        tva: parseFloat(inv.tva),
        ttc: parseFloat(inv.ttc),
        refF: {
          if: inv.if,
          nom: inv.nom,
          ice: inv.ice || null
        },
        tx: parseFloat(inv.tx),
        prorata: parseFloat(inv.prorata),
        mp: {
          id: parseInt(inv.mp)
        },
        dpai: inv.dpai,
        dfac: inv.dfac
      })),
      totals: totals
    };
  }, [header, invoices, calculateTotals]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();

    // Validate entire form
    if (!validate()) {
      console.error('Form validation failed:', errors);
      return false;
    }

    // Format and prepare submission data
    const formattedData = formatForSubmission();

    // Log for debugging
    console.log('✅ Form validation successful');
    console.log('📦 Data ready for API submission:', formattedData);

    // Prepare for Laravel API
    const apiPayload = {
      ...formattedData,
      timestamp: new Date().toISOString(),
      version: 'EDI_V4.0'
    };

    console.log('🚀 API Payload:', apiPayload);

    return apiPayload;
  }, [validate, formatForSubmission, errors]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setHeader({
      identifiantFiscal: '',
      annee: new Date().getFullYear().toString(),
      periode: '1',
      regime: '1'
    });
    setInvoices([]);
    setErrors({});
    setFieldErrors({});
  }, []);

  /**
   * Export data as JSON
   */
  const exportData = useCallback(() => {
    return JSON.stringify(formatForSubmission(), null, 2);
  }, [formatForSubmission]);

  /**
   * Import data from JSON
   */
  const importData = useCallback((jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (parsed.header) {
        setHeader({
          identifiantFiscal: parsed.header.identifiantFiscal || '',
          annee: parsed.header.annee?.toString() || new Date().getFullYear().toString(),
          periode: parsed.header.periode?.toString() || '1',
          regime: parsed.header.regime?.toString() || '1'
        });
      }

      if (parsed.invoices && Array.isArray(parsed.invoices)) {
        setInvoices(parsed.invoices.map(inv => ({
          ord: inv.ord || 0,
          num: inv.num || '',
          des: inv.des || '',
          mht: (inv.mht || 0).toString(),
          tva: (inv.tva || 0).toFixed(2),
          ttc: (inv.ttc || 0).toFixed(2),
          if: inv.refF?.if || '',
          nom: inv.refF?.nom || '',
          ice: inv.refF?.ice || '',
          tx: (inv.tx || 20).toFixed(2),
          prorata: (inv.prorata || 100).toString(),
          mp: (inv.mp?.id || 1).toString(),
          dpai: inv.dpai || '',
          dfac: inv.dfac || ''
        })));
      }

      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Import failed:', error);
      return false;
    }
  }, []);

  return {
    // State
    header,
    invoices,
    errors,
    fieldErrors,

    // Header handlers
    handleHeaderChange,

    // Invoice handlers
    handleInvoiceChange,
    addRow,
    removeRow,

    // Validation & submission
    validate,
    handleSubmit,
    calculateTotals,

    // Utilities
    resetForm,
    exportData,
    importData,
    formatForSubmission,

    // Constants
    TAX_RATES,
    PAYMENT_MODES,
    REGIMES
  };
};

export default useTVAFormLogic;
