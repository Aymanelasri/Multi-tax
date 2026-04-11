# SIMPL-TVA EDI V4.0 React Generator - Documentation

## Overview

This is a complete React implementation for handling SIMPL-TVA EDI (Electronic Data Interchange) V4.0 form data according to Moroccan DGI specifications.

The implementation consists of:
1. **`useTVAFormLogic.js`** - Custom React hook with all business logic
2. **`TVAGeneratorForm.jsx`** - Example component showing how to use the hook

## Architecture

### Custom Hook: `useTVAFormLogic`

Located at: `/src/hooks/useTVAFormLogic.js`

This hook handles:
- State management for header and invoices
- Auto-calculation of TVA and TTC
- Comprehensive validation
- Form submission
- Data import/export

#### Hook Return Object

```javascript
{
  // State
  header: { identifiantFiscal, annee, periode, regime },
  invoices: Array<InvoiceObject>,
  errors: Object,
  fieldErrors: Object,

  // Handlers
  handleHeaderChange(field, value),
  handleInvoiceChange(index, field, value),
  addRow(),
  removeRow(index),

  // Methods
  validate(),
  handleSubmit(e?),
  calculateTotals(),
  resetForm(),
  exportData(),
  importData(jsonData),
  formatForSubmission(),

  // Constants
  TAX_RATES,
  PAYMENT_MODES,
  REGIMES
}
```

## Data Structure

### Header Object
```javascript
{
  identifiantFiscal: string,  // 8 digits
  annee: string,              // YYYY format
  periode: string,            // 1-12 or 1-4 depending on regime
  regime: string              // "1" or "2"
}
```

### Invoice Object (rd)
```javascript
{
  ord: number,                // Sequential number (auto-assigned)
  num: string,                // Invoice number
  des: string,                // Description
  mht: string,                // Montant Hors Taxe (decimal)
  tva: string,                // TVA amount (auto-calculated)
  ttc: string,                // Montant TTC (auto-calculated)
  if: string,                 // Provider IF (8 digits)
  nom: string,                // Provider name
  ice: string,                // Provider ICE (15 digits, optional)
  tx: string,                 // Tax rate (7.00, 10.00, 14.00, 20.00)
  prorata: string,            // Default 100
  mp: string,                 // Payment mode ID (1-5)
  dpai: string,               // Payment date (YYYY-MM-DD)
  dfac: string                // Invoice date (YYYY-MM-DD)
}
```

### Submission Format (API-ready)
```javascript
{
  header: {
    identifiantFiscal: string,
    annee: number,
    periode: number,
    regime: number
  },
  invoices: [
    {
      ord: number,
      num: string,
      des: string,
      mht: number,
      tva: number,
      ttc: number,
      refF: {
        if: string,
        nom: string,
        ice: string | null
      },
      tx: number,
      prorata: number,
      mp: {
        id: number
      },
      dpai: string,
      dfac: string
    }
  ],
  totals: {
    mhtTotal: number,
    tvaTotal: number,
    ttcTotal: number,
    invoiceCount: number
  },
  timestamp: string,          // ISO 8601
  version: string             // "EDI_V4.0"
}
```

## Validation Rules

### Header Validation
- **identifiantFiscal**: Must be exactly 8 digits
- **annee**: Must be between 2015 and 2030
- **periode**: 
  - Regime 1 (forfaitaire): 1-4
  - Regime 2 (réel): 1-12
- **regime**: Must be "1" or "2"

### Invoice Validation
- **num**: Required (not empty)
- **des**: Required (not empty)
- **mht**: Required, must be positive number
- **tva**: Required, will be auto-calculated
- **if** (provider): Must be exactly 8 digits
- **nom** (provider): Required (not empty)
- **ice**: Optional, but if provided must be 15 digits
- **tx**: Must be one of: 7.00, 10.00, 14.00, 20.00
- **prorata**: Must be between 0 and 100
- **mp**: Must be 1-5
- **dpai**: Must be YYYY-MM-DD format, cannot be before dfac
- **dfac**: Must be YYYY-MM-DD format

### Auto-Calculation
When `mht` or `tx` changes:
```
tva = mht * (tx / 100)
ttc = mht + tva
```
All values rounded to 2 decimal places.

## Usage Examples

### Basic Setup

```javascript
import useTVAFormLogic from '../hooks/useTVAFormLogic';

function MyForm() {
  const {
    header,
    invoices,
    handleHeaderChange,
    handleInvoiceChange,
    addRow,
    removeRow,
    handleSubmit
  } = useTVAFormLogic();

  return (
    // Your form JSX
  );
}
```

### Add a Row
```javascript
<button onClick={addRow}>
  Add Invoice
</button>
```

### Remove a Row
```javascript
<button onClick={() => removeRow(0)}>
  Remove
</button>
```

### Handle Header Change
```javascript
<input
  value={header.identifiantFiscal}
  onChange={(e) => handleHeaderChange('identifiantFiscal', e.target.value)}
/>
```

### Handle Invoice Field Change
```javascript
<input
  value={invoice.mht}
  onChange={(e) => handleInvoiceChange(0, 'mht', e.target.value)}
  // This will auto-calculate tva and ttc
/>
```

### Submit Form
```javascript
<form onSubmit={handleSubmit}>
  {/* Form fields */}
</form>

// OR in code:
const apiPayload = handleSubmit();
if (apiPayload) {
  // Send to Laravel API
  fetch('/api/tva/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiPayload)
  });
}
```

### Export & Import Data

```javascript
// Export form data as JSON
const jsonData = exportData();
console.log(jsonData);

// Import previously saved data
import Data from './saved-data.json';
importData(Data);
```

### Get Calculations
```javascript
const totals = calculateTotals();
console.log(totals);
// {
//   mhtTotal: 10000.00,
//   tvaTotal: 1430.00,  // Example with mixed rates
//   ttcTotal: 11430.00,
//   invoiceCount: 5
// }
```

## Error Handling

Validation errors are stored in two places:

### `errors` Object
Global form errors (header-level and general)
```javascript
{
  identifiantFiscal: "IF must be exactly 8 digits",
  annee: "Year must be between 2015 and 2030",
  invoices: "At least one invoice is required"
}
```

### `fieldErrors` Object
Detailed field-level errors with index reference
```javascript
{
  identifiantFiscal: "IF must be exactly 8 digits",
  "invoice_0_num": "Invoice number is required",
  "invoice_0_if": "IF must be exactly 8 digits",
  "invoice_1_dpai": "Payment date cannot be before invoice date"
}
```

## Console Output

When submission succeeds, the hook logs:

```javascript
✅ Form validation successful
📦 Data ready for API submission: {...}
🚀 API Payload: {...}
```

If validation fails:
```javascript
❌ Form validation failed: {...}
```

## Integration Steps

1. **Import the hook** in your component:
```javascript
import useTVAFormLogic from '../hooks/useTVAFormLogic';
```

2. **Initialize the hook**:
```javascript
const {
  // destructure what you need
} = useTVAFormLogic();
```

3. **Build your form UI** using the hook's state and handlers

4. **Wire up the submit** handler:
```javascript
<form onSubmit={handleSubmit}>
  {/* form JSX */}
</form>
```

5. **Send to API**:
```javascript
const handleFormSubmit = (e) => {
  const payload = handleSubmit(e);
  if (payload) {
    // Send to your Laravel backend
  }
};
```

## Constants Available

### TAX_RATES
```javascript
['7.00', '10.00', '14.00', '20.00']
```

### PAYMENT_MODES
```javascript
[
  { id: 1, label: 'Espèces' },
  { id: 2, label: 'Chèque' },
  { id: 3, label: 'Virement' },
  { id: 4, label: 'Prélèvement' },
  { id: 5, label: 'Effet' }
]
```

### REGIMES
```javascript
[
  { value: 1, label: 'Régime forfaitaire' },
  { value: 2, label: 'Régime réel' }
]
```

## API Response Format

Your Laravel backend should expect:

```json
{
  "header": {
    "identifiantFiscal": "12345678",
    "annee": 2024,
    "periode": 10,
    "regime": 2
  },
  "invoices": [
    {
      "ord": 1,
      "num": "FAC-2024-001",
      "des": "Facture d'eau",
      "mht": 1000,
      "tva": 200,
      "ttc": 1200,
      "refF": {
        "if": "87654321",
        "nom": "ONEP",
        "ice": null
      },
      "tx": 20,
      "prorata": 100,
      "mp": {
        "id": 3
      },
      "dpai": "2024-10-15",
      "dfac": "2024-10-10"
    }
  ],
  "totals": {
    "mhtTotal": 1000,
    "tvaTotal": 200,
    "ttcTotal": 1200,
    "invoiceCount": 1
  },
  "timestamp": "2024-10-15T10:30:00.000Z",
  "version": "EDI_V4.0"
}
```

## Notes

- All numeric calculations are rounded to 2 decimal places
- Dates must be in YYYY-MM-DD format
- The `ord` field is automatically assigned sequentially and re-ordered when rows are removed
- The hook handles all validation according to DGI specifications
- The component is fully functional without any CSS (you can style as needed)

## Next Steps

1. Use `TVAGeneratorForm.jsx` as a reference for implementing your own form UI
2. Integrate with your existing styling system (CSS, Tailwind, etc.)
3. Connect to your Laravel API endpoint
4. Add authentication/authorization checks before submission
