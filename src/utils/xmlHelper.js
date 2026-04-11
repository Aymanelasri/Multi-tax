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
    const tva = parseFloat(f.tva) || 0;
    const ttc = parseFloat(f.ttc) || (mht + tva);
    const prorata = f.prorata && f.prorata !== '100' ? f.prorata : null;

    xml += `\t\t<rd>\n`;
    xml += `\t\t\t<ord>${escapeXML(f.ord)}</ord>\n`;
    xml += `\t\t\t<num>${escapeXML(f.num)}</num>\n`;
    xml += `\t\t\t<des>${escapeXML(f.des)}</des>\n`;
    xml += `\t\t\t<mht>${mht.toFixed(2)}</mht>\n`;
    xml += `\t\t\t<tva>${tva.toFixed(2)}</tva>\n`;
    xml += `\t\t\t<ttc>${ttc.toFixed(2)}</ttc>\n`;
    xml += `\t\t\t<refF>\n`;
    xml += `\t\t\t\t<if>${escapeXML(f.if)}</if>\n`;
    xml += `\t\t\t\t<nom>${escapeXML(f.nom)}</nom>\n`;
    if (f.ice?.trim()) xml += `\t\t\t\t<ice>${escapeXML(f.ice)}</ice>\n`;
    xml += `\t\t\t</refF>\n`;
    xml += `\t\t\t<tx>${parseFloat(f.tx || '20').toFixed(2)}</tx>\n`;
    if (prorata) xml += `\t\t\t<prorata>${prorata}</prorata>\n`;
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
  const errors = [];
  const { identifiantFiscal, annee, periode, regime } = identification;

  if (!identifiantFiscal?.trim()) errors.push('Identifiant Fiscal obligatoire');
  else if (!/^\d{1,8}$/.test(identifiantFiscal.trim())) errors.push('Identifiant Fiscal : 1 à 8 chiffres');

  if (!annee) errors.push('Année obligatoire');
  if (!periode) errors.push('Période obligatoire');
  else {
    const max = regime === '2' ? 4 : 12;
    if (parseInt(periode) < 1 || parseInt(periode) > max)
      errors.push(`Période invalide pour ce régime (1–${max})`);
  }

  if (factures.length === 0) errors.push('Ajoutez au moins une facture');

  factures.forEach((f, i) => {
    const n = i + 1;
    if (!f.num?.trim())  errors.push(`Facture ${n} : N° de facture manquant`);
    if (!f.des?.trim())  errors.push(`Facture ${n} : Désignation manquante`);
    if (!f.mht)          errors.push(`Facture ${n} : Montant HT manquant`);
    if (!f.tva)          errors.push(`Facture ${n} : Montant TVA manquant`);
    if (!f.if?.trim())   errors.push(`Facture ${n} : IF Fournisseur manquant`);
    else if (!/^\d{1,8}$/.test(f.if.trim())) errors.push(`Facture ${n} : IF Fournisseur invalide (1–8 chiffres)`);
    if (!f.nom?.trim())  errors.push(`Facture ${n} : Nom fournisseur manquant`);
    if (f.ice?.trim() && !/^\d{15}$/.test(f.ice.trim())) errors.push(`Facture ${n} : ICE invalide (15 chiffres)`);
    if (!f.dpai)         errors.push(`Facture ${n} : Date de paiement manquante`);
    if (!f.dfac)         errors.push(`Facture ${n} : Date de facture manquante`);
  });

  return errors;
};
