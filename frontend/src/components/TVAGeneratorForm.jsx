import React from 'react';
import useTVAFormLogic from '../hooks/useTVAFormLogic';

/**
 * TVAGeneratorForm - Complete SIMPL-TVA EDI V4.0 form using the logic hook
 * This is an example of how to implement the form with the useTVAFormLogic hook
 */

const TVAGeneratorForm = () => {
  const {
    // State
    header,
    invoices,
    errors,
    fieldErrors,

    // Handlers
    handleHeaderChange,
    handleInvoiceChange,
    addRow,
    removeRow,

    // Submission
    handleSubmit,
    calculateTotals,
    validate,
    resetForm,

    // Constants
    TAX_RATES,
    PAYMENT_MODES,
    REGIMES
  } = useTVAFormLogic();

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="tva-generator-form">
      {/* ========== HEADER SECTION ========== */}
      <section className="form-section">
        <h2>📋 Identification du Contribuable</h2>

        {/* Global errors */}
        {errors.identifiantFiscal && (
          <div className="error-message">{errors.identifiantFiscal}</div>
        )}
        {errors.annee && (
          <div className="error-message">{errors.annee}</div>
        )}
        {errors.periode && (
          <div className="error-message">{errors.periode}</div>
        )}

        {/* Header fields */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="identifiantFiscal">
              Identifiant Fiscal *
            </label>
            <input
              id="identifiantFiscal"
              type="text"
              placeholder="8 digits"
              maxLength="8"
              value={header.identifiantFiscal}
              onChange={(e) => handleHeaderChange('identifiantFiscal', e.target.value)}
              className={fieldErrors.identifiantFiscal ? 'input-error' : ''}
            />
            {fieldErrors.identifiantFiscal && (
              <span className="field-error">{fieldErrors.identifiantFiscal}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="annee">Année *</label>
            <input
              id="annee"
              type="number"
              min="2015"
              max="2030"
              value={header.annee}
              onChange={(e) => handleHeaderChange('annee', e.target.value)}
              className={fieldErrors.annee ? 'input-error' : ''}
            />
            {fieldErrors.annee && (
              <span className="field-error">{fieldErrors.annee}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="regime">Régime *</label>
            <select
              id="regime"
              value={header.regime}
              onChange={(e) => handleHeaderChange('regime', e.target.value)}
              className={fieldErrors.regime ? 'input-error' : ''}
            >
              {REGIMES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {fieldErrors.regime && (
              <span className="field-error">{fieldErrors.regime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="periode">Période *</label>
            <input
              id="periode"
              type="number"
              min="1"
              max={header.regime === '1' ? 4 : 12}
              value={header.periode}
              onChange={(e) => handleHeaderChange('periode', e.target.value)}
              className={fieldErrors.periode ? 'input-error' : ''}
            />
            {fieldErrors.periode && (
              <span className="field-error">{fieldErrors.periode}</span>
            )}
          </div>
        </div>
      </section>

      {/* ========== INVOICES SECTION ========== */}
      <section className="form-section">
        <h2>📄 Lignes du Relevé des Déductions</h2>

        {errors.invoices && (
          <div className="error-message">{errors.invoices}</div>
        )}

        {/* Invoices table header */}
        <div className="invoices-header">
          <div className="col-ord">Ord.</div>
          <div className="col-num">N° Facture</div>
          <div className="col-des">Désignation</div>
          <div className="col-mht">MHT (MAD)</div>
          <div className="col-tx">Taux %</div>
          <div className="col-tva">TVA (MAD)</div>
          <div className="col-ttc">TTC (MAD)</div>
          <div className="col-if">IF Fournisseur</div>
          <div className="col-nom">Nom Fournisseur</div>
          <div className="col-mp">Paiement</div>
          <div className="col-dpai">Date Paiement</div>
          <div className="col-actions">Actions</div>
        </div>

        {/* Invoice rows */}
        <div className="invoices-body">
          {invoices.length === 0 ? (
            <p className="no-invoices">Aucune facture ajoutée. Cliquez sur "Ajouter une facture".</p>
          ) : (
            invoices.map((invoice, index) => (
              <div key={index} className="invoice-row">
                {/* Row errors */}
                {fieldErrors[`invoice_${index}`] && (
                  <div className="row-errors">
                    {Object.entries(fieldErrors[`invoice_${index}`]).map(([field, error]) => (
                      <div key={field} className="field-error">
                        {field}: {error}
                      </div>
                    ))}
                  </div>
                )}

                <div className="col-ord">
                  <input
                    type="number"
                    value={invoice.ord}
                    readOnly
                    className="input-readonly"
                  />
                </div>

                <div className="col-num">
                  <input
                    type="text"
                    placeholder="FAC-001"
                    value={invoice.num}
                    onChange={(e) => handleInvoiceChange(index, 'num', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.num ? 'input-error' : ''}
                  />
                </div>

                <div className="col-des">
                  <input
                    type="text"
                    placeholder="Description"
                    value={invoice.des}
                    onChange={(e) => handleInvoiceChange(index, 'des', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.des ? 'input-error' : ''}
                  />
                </div>

                <div className="col-mht">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={invoice.mht}
                    onChange={(e) => handleInvoiceChange(index, 'mht', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.mht ? 'input-error' : ''}
                  />
                </div>

                <div className="col-tx">
                  <select
                    value={invoice.tx}
                    onChange={(e) => handleInvoiceChange(index, 'tx', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.tx ? 'input-error' : ''}
                  >
                    {TAX_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-tva">
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.tva}
                    readOnly
                    className="input-readonly"
                  />
                </div>

                <div className="col-ttc">
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.ttc}
                    readOnly
                    className="input-readonly"
                  />
                </div>

                <div className="col-if">
                  <input
                    type="text"
                    placeholder="8 digits"
                    maxLength="8"
                    value={invoice.if}
                    onChange={(e) => handleInvoiceChange(index, 'if', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.if ? 'input-error' : ''}
                  />
                </div>

                <div className="col-nom">
                  <input
                    type="text"
                    placeholder="Nom fournisseur"
                    value={invoice.nom}
                    onChange={(e) => handleInvoiceChange(index, 'nom', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.nom ? 'input-error' : ''}
                  />
                </div>

                <div className="col-mp">
                  <select
                    value={invoice.mp}
                    onChange={(e) => handleInvoiceChange(index, 'mp', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.mp ? 'input-error' : ''}
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-dpai">
                  <input
                    type="date"
                    value={invoice.dpai}
                    onChange={(e) => handleInvoiceChange(index, 'dpai', e.target.value)}
                    className={fieldErrors[`invoice_${index}`]?.dpai ? 'input-error' : ''}
                  />
                </div>

                <div className="col-actions">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="btn-add-row"
        >
          + Ajouter une facture
        </button>
      </section>

      {/* ========== TOTALS SECTION ========== */}
      {invoices.length > 0 && (
        <section className="form-section">
          <h2>📊 Résumé des Totaux</h2>
          <div className="totals-grid">
            <div className="total-item">
              <label>Nombre de factures</label>
              <span>{totals.invoiceCount}</span>
            </div>
            <div className="total-item">
              <label>Total MHT</label>
              <span>{totals.mhtTotal.toFixed(2)} MAD</span>
            </div>
            <div className="total-item">
              <label>Total TVA</label>
              <span>{totals.tvaTotal.toFixed(2)} MAD</span>
            </div>
            <div className="total-item">
              <label>Total TTC</label>
              <span>{totals.ttcTotal.toFixed(2)} MAD</span>
            </div>
          </div>
        </section>
      )}

      {/* ========== ACTIONS ========== */}
      <section className="form-actions">
        <button
          type="submit"
          className="btn-submit"
        >
          ✓ Valider et Soumettre
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="btn-reset"
        >
          ↻ Réinitialiser
        </button>
      </section>
    </form>
  );
};

export default TVAGeneratorForm;
