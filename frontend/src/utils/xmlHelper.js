import { validateAllInvoices } from './dgiValidation';

export const escapeXML = (str) =>
  (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Generate XML — EDI SIMPL-TVA V4.0
 * Structure: DeclarationReleveDeduction > identifiantFiscal, annee, periode, regime, releveDeductions > rd[]
 * Each rd: ord, num, des, mht, tva, ttc, refF(if, nom, ice?), tx, prorata?, mp(id), dpai, dfac
 */
export const generateXML = (identifiantFiscal, annee, periode, regime, factures) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<DeclarationReleveDeduction>\n`;
  xml += `\t<identifiantFiscal>${escapeXML(identifiantFiscal)}</identifiantFiscal>\n`;
  xml += `\t<annee>${annee}</annee>\n`;
  xml += `\t<periode>${periode}</periode>\n`;
  xml += `\t<regime>${regime}</regime>\n`;
  xml += `\t<releveDeductions>\n`;

  factures.forEach((f) => {
    const mht = parseFloat(f.mht) || 0;
    const tvaRaw = parseFloat(f.tva) || 0;
    const prorata = parseFloat(f.prorata) || 100;
    const tvaRecuperable = (tvaRaw * prorata / 100);
    // TTC = MHT + TVA récupérable (avec prorata appliqué)
    const ttc = mht + tvaRecuperable;
    const prorataStr = f.prorata && f.prorata !== '100' ? f.prorata : null;

    xml += `\t\t<rd>\n`;
    xml += `\t\t\t<ord>${escapeXML(f.ord)}</ord>\n`;
    xml += `\t\t\t<num>${escapeXML(f.num)}</num>\n`;
    xml += `\t\t\t<des>${escapeXML(f.des)}</des>\n`;
    xml += `\t\t\t<mht>${mht.toFixed(2)}</mht>\n`;
    xml += `\t\t\t<tva>${tvaRecuperable.toFixed(2)}</tva>\n`;
    xml += `\t\t\t<ttc>${ttc.toFixed(2)}</ttc>\n`;
    xml += `\t\t\t<refF>\n`;
    xml += `\t\t\t\t<if>${escapeXML(f.if)}</if>\n`;
    xml += `\t\t\t\t<nom>${escapeXML(f.nom)}</nom>\n`;
    if (f.ice?.trim()) xml += `\t\t\t\t<ice>${escapeXML(f.ice)}</ice>\n`;
    xml += `\t\t\t</refF>\n`;
    xml += `\t\t\t<tx>${parseFloat(f.tx || '20').toFixed(2)}</tx>\n`;
    if (prorataStr) xml += `\t\t\t<prorata>${prorataStr}</prorata>\n`;
    xml += `\t\t\t<mp>\n\t\t\t\t<id>${escapeXML(f.mp || '1')}</id>\n\t\t\t</mp>\n`;
    xml += `\t\t\t<dpai>${escapeXML(f.dpai)}</dpai>\n`;
    xml += `\t\t\t<dfac>${escapeXML(f.dfac)}</dfac>\n`;
    xml += `\t\t</rd>\n`;
  });

  xml += `\t</releveDeductions>\n`;
  xml += `</DeclarationReleveDeduction>`;
  return xml;
};

export const highlightXML = (xml) => {
  return escapeXML(xml)
    .replace(/(&lt;\?xml.*?&gt;)/g, `<span class="xml-comment">$1</span>`)
    .replace(/(&lt;\/?[\w]+&gt;)/g, `<span class="xml-tag">$1</span>`)
    .replace(/(&lt;[\w]+&gt;)([^&\n<]*)(&lt;\/[\w]+&gt;)/g,
      (_, open, val, close) => `${open}<span class="xml-value">${val}</span>${close}`);
};

export const validateFormData = (identification, factures) => {
  const validation = validateAllInvoices(identification, factures);
  
  // Add duplicate check
  const invoiceNumbers = {};
  factures.forEach((inv, i) => {
    if (inv.num && inv.num.trim()) {
      const numKey = inv.num.trim().toLowerCase();
      if (invoiceNumbers[numKey]) {
        validation.errors.push(`Facture ${i + 1}: Numéro dupliqué "${inv.num}"`);
      }
      invoiceNumbers[numKey] = true;
    }
  });
  
  return validation.errors;
};
