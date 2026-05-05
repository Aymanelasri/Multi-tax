/**
 * DGI Morocco TVA Validation Rules
 * Comprehensive validation for SIMPL-TVA declarations
 */

const ALLOWED_TVA_RATES = ['7.00', '10.00', '14.00', '18.00', '20.00'];

export const validateInvoice = (invoice, index, identification) => {
  const errors = [];
  const warnings = [];
  const infos = [];
  const n = index + 1;

  const mht = parseFloat(invoice.mht) || 0;
  const tva = parseFloat(invoice.tva) || 0;
  const ttc = parseFloat(invoice.ttc) || 0;
  const tx = parseFloat(invoice.tx) || 20;
  const prorata = parseFloat(invoice.prorata) || 100;

  // Skip validation if invoice is completely empty
  const isEmpty = !invoice.num && !invoice.if && !invoice.nom && !invoice.mht && !invoice.tva;
  if (isEmpty) return { errors, warnings, infos };

  // 🔴 BLOCKING ERRORS

  // IF Fournisseur
  if (!invoice.if?.trim()) {
    errors.push(`Facture ${n}: IF Fournisseur manquant`);
  } else if (!/^\d{1,8}$/.test(invoice.if.trim())) {
    errors.push(`Facture ${n}: IF Fournisseur invalide (1–8 chiffres)`);
  }

  // Taux TVA autorisé
  if (!ALLOWED_TVA_RATES.includes(tx.toFixed(2))) {
    errors.push(`Facture ${n}: Taux TVA ${tx}% non autorisé (7%, 10%, 14%, 18%, 20% uniquement)`);
  }

  // TTC = HT + TVA récupérable (avec prorata)
  const tvaRecuperable = tva * (prorata / 100);
  const expectedTtc = mht + tvaRecuperable;
  const ttcDiff = Math.abs(ttc - expectedTtc);
  if (ttcDiff > 1) {
    if (prorata < 100) {
      errors.push(`Facture ${n}: TTC incohérent (${ttc.toFixed(2)} ≠ HT + TVA récupérable = ${expectedTtc.toFixed(2)}). Prorata ${prorata}% appliqué`);
    } else {
      errors.push(`Facture ${n}: TTC incohérent (${ttc.toFixed(2)} ≠ HT + TVA = ${expectedTtc.toFixed(2)})`);
    }
  }

  // Date paiement before date facture
  if (invoice.dfac && invoice.dpai) {
    const dfac = new Date(invoice.dfac);
    const dpai = new Date(invoice.dpai);
    if (dpai < dfac) {
      errors.push(`Facture ${n}: Date paiement (${invoice.dpai}) avant date facture (${invoice.dfac})`);
    }

    // Délai > 12 mois
    const diffMonths = (dpai - dfac) / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths > 12) {
      errors.push(`Facture ${n}: Délai TVA dépassé (${Math.round(diffMonths)} mois)`);
    }
  }

  // Prorata hors [1-100]
  if (prorata < 1 || prorata > 100) {
    errors.push(`Facture ${n}: Prorata invalide (${prorata}). Doit être entre 1 et 100`);
  }

  // Montant HT > 0
  if (mht <= 0) {
    errors.push(`Facture ${n}: Montant HT doit être > 0`);
  }

  // TVA négative
  if (tva < 0) {
    errors.push(`Facture ${n}: Montant TVA ne peut pas être négatif`);
  }

  // TVA > HT × taux
  const maxTva = mht * (tx / 100);
  if (tva > maxTva + 0.01) {
    errors.push(`Facture ${n}: TVA (${tva.toFixed(2)}) dépasse HT × taux (${maxTva.toFixed(2)})`);
  }

  // Date dans le futur (only if more than 3 months ahead)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeMonthsAhead = new Date();
  threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);
  threeMonthsAhead.setHours(0, 0, 0, 0);
  
  if (invoice.dfac) {
    const dfac = new Date(invoice.dfac);
    dfac.setHours(0, 0, 0, 0);
    if (dfac > threeMonthsAhead) {
      errors.push(`Facture ${n}: Date facture trop loin dans le futur (> 3 mois)`);
    }
  }
  
  if (invoice.dpai) {
    const dpai = new Date(invoice.dpai);
    dpai.setHours(0, 0, 0, 0);
    if (dpai > threeMonthsAhead) {
      errors.push(`Facture ${n}: Date paiement trop loin dans le futur (> 3 mois)`);
    }
  }

  // 🟡 WARNINGS

  // Espèces > 5000 MAD (only if payment mode is explicitly set)
  if (invoice.mp && String(invoice.mp) === '1' && ttc > 5000) {
    warnings.push(`Facture ${n}: Paiement espèces limité à 5 000 MAD (TTC: ${ttc.toFixed(2)} MAD)`);
  }

  // ICE manquant (only if other supplier fields are filled)
  if ((invoice.if || invoice.nom) && !invoice.ice?.trim()) {
    warnings.push(`Facture ${n}: ICE fournisseur manquant (recommandé)`);
  } else if (invoice.ice?.trim() && !/^\d{15}$/.test(invoice.ice.trim())) {
    errors.push(`Facture ${n}: ICE invalide (15 chiffres requis)`);
  }

  // TVA ≠ HT × taux (tolérance ≤ 1 MAD)
  const expectedTva = mht * (tx / 100);
  const tvaDiff = Math.abs(tva - expectedTva);
  if (tvaDiff > 0.01 && tvaDiff <= 1) {
    warnings.push(`Facture ${n}: TVA (${tva.toFixed(2)}) diffère du calcul (${expectedTva.toFixed(2)}). Écart: ${tvaDiff.toFixed(2)} MAD`);
  }

  // Date facture hors période déclarée (INFO seulement, pas WARNING)
  if (invoice.dfac && identification.annee && identification.periode) {
    const dfac = new Date(invoice.dfac);
    const year = parseInt(identification.annee);
    const periode = parseInt(identification.periode);
    const regime = identification.regime;

    if (dfac.getFullYear() !== year) {
      infos.push(`Facture ${n}: Date facture (${invoice.dfac}) hors année déclarée (${year})`);
    } else if (regime === '1') {
      // Mensuel - allow previous month too
      const invoiceMonth = dfac.getMonth() + 1;
      if (invoiceMonth !== periode && invoiceMonth !== periode - 1) {
        infos.push(`Facture ${n}: Date facture hors période déclarée (mois ${periode})`);
      }
    } else if (regime === '2') {
      // Trimestriel
      const quarter = Math.ceil((dfac.getMonth() + 1) / 3);
      if (quarter !== periode) {
        infos.push(`Facture ${n}: Date facture hors trimestre déclaré (T${periode})`);
      }
    }
  }

  // Période future
  if (identification.annee && identification.periode) {
    const today = new Date();
    const year = parseInt(identification.annee);
    const periode = parseInt(identification.periode);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if (year > currentYear || (year === currentYear && periode > currentMonth)) {
      warnings.push(`Déclaration: Période future détectée (${year}/${periode})`);
    }
  }

  // 🔵 INFO

  // Prorata < 100
  if (prorata < 100) {
    const tvaRecuperable = (tva * prorata / 100).toFixed(2);
    infos.push(`Facture ${n}: TVA partiellement récupérable (${prorata}%) = ${tvaRecuperable} MAD`);
  }

  // Fournisseur étranger
  if (invoice.ice === '000000000000000') {
    infos.push(`Facture ${n}: Fournisseur étranger détecté`);
  }

  return { errors, warnings, infos };
};

export const validateIdentification = (identification) => {
  const errors = [];
  const warnings = [];

  // IF
  if (!identification.identifiantFiscal?.trim()) {
    errors.push('Identifiant Fiscal obligatoire');
  } else if (!/^\d{1,8}$/.test(identification.identifiantFiscal.trim())) {
    errors.push('Identifiant Fiscal: 1 à 8 chiffres uniquement');
  }

  // Année
  if (!identification.annee) {
    errors.push('Année obligatoire');
  } else {
    const year = parseInt(identification.annee);
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear) {
      errors.push(`Année invalide (2000–${currentYear})`);
    }
  }

  // Période selon régime
  if (!identification.periode) {
    errors.push('Période obligatoire');
  } else {
    const periode = parseInt(identification.periode);
    const regime = identification.regime;
    
    if (regime === '1') {
      // Mensuel
      if (periode < 1 || periode > 12) {
        errors.push('Période mensuelle: 1 à 12');
      }
    } else if (regime === '2') {
      // Trimestriel
      if (periode < 1 || periode > 4) {
        errors.push('Période trimestrielle: 1 à 4');
      }
    } else if (regime === '3' || regime === '4') {
      // Cessation
      if (periode !== 1) {
        errors.push('Période cessation: 1 uniquement');
      }
    }
  }

  return { errors, warnings };
};

export const validateAllInvoices = (identification, factures) => {
  const allErrors = [];
  const allWarnings = [];
  const allInfos = [];

  // Validate identification
  const idValidation = validateIdentification(identification);
  allErrors.push(...idValidation.errors);
  allWarnings.push(...idValidation.warnings);

  // Validate each invoice
  factures.forEach((invoice, index) => {
    const validation = validateInvoice(invoice, index, identification);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
    allInfos.push(...validation.infos);
  });

  // Global checks
  if (factures.length === 0) {
    allErrors.push('Ajoutez au moins une facture');
  }

  // Check doublons
  const invoiceNumbers = {};
  factures.forEach((inv, i) => {
    const key = `${inv.num}_${inv.if}`;
    if (invoiceNumbers[key]) {
      allWarnings.push(`Facture ${i + 1}: Doublon possible (même N° + même fournisseur)`);
    }
    invoiceNumbers[key] = true;
  });

  // Total TVA = 0
  const totalTva = factures.reduce((sum, inv) => sum + (parseFloat(inv.tva) || 0), 0);
  if (totalTva === 0 && factures.length > 0) {
    allInfos.push('Total TVA = 0 MAD (déclaration valide mais sans déduction)');
  }

  return {
    errors: allErrors,
    warnings: allWarnings,
    infos: allInfos,
    hasBlockingErrors: allErrors.length > 0
  };
};

export const getInvoiceValidationStatus = (invoice, identification) => {
  const validation = validateInvoice(invoice, 0, identification);
  
  if (validation.errors.length > 0) return 'error';
  if (validation.warnings.length > 0) return 'warning';
  
  // Check if all required fields filled
  const required = [
    invoice.num, invoice.nom, invoice.ice,
    invoice.mht, invoice.tva, invoice.dpai, invoice.dfac
  ];
  const filled = required.filter(v => v && String(v).trim() !== '').length;
  
  if (filled === 0) return 'empty';
  if (filled === required.length) return 'complete';
  return 'partial';
};
