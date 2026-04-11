# SIMPL-TVA EDI Generator - React SPA

A modern, production-ready React Single Page Application for Moroccan tax declaration and invoice generation. Features React Router for seamless multi-page navigation, reusable components, and comprehensive form handling.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Runs at `http://localhost:3000`

### Production Build
```bash
npm run build
```

## 📋 Features

✅ **Multi-Page Navigation** - React Router v6 for seamless page transitions  
✅ **Home Page** - Beautiful landing page with feature highlights  
✅ **Functional Components** - Built entirely with React hooks  
✅ **Reusable UI Components** - Custom Button, Card, FormGroup, Toast  
✅ **3-Step Invoice Generator** - Identification → Factures → XML Generation  
✅ **Real-Time Validation** - Instant error detection and reporting  
✅ **XML Generation** - Syntax-highlighted with download/copy options  
✅ **Auto-Calculations** - Totals computed automatically (HT, TVA, TTC)  
✅ **Responsive Design** - Optimized for desktop, tablet, and mobile  
✅ **Dark Theme** - Modern dark UI with CSS variables  
✅ **Accessibility** - Clean semantic HTML  

## 📁 Project Structure

```
src/
├── pages/
│   ├── App.jsx                 # Main router configuration
│   ├── HomePage.jsx            # Home page (/)
│   └── InvoiceGenerator.jsx    # Generator page (/generateur)
├── components/
│   ├── Navigation.jsx          # Global header with branding
│   ├── Header.jsx              # Generator section header
│   ├── StepsNav.jsx            # 3-step progress indicator
│   ├── IdentificationForm.jsx  # Step 1: User identification
│   ├── FactureList.jsx         # Step 2: Invoice list
│   ├── FactureItem.jsx         # Individual invoice editor
│   ├── SummaryGrid.jsx         # Summary cards display
│   ├── ValidationErrors.jsx    # Error messages
│   ├── XMLOutput.jsx           # XML preview (optional)
│   └── ui/
│       ├── Button.jsx          # Customizable button
│       ├── Card.jsx            # Card container
│       ├── FormGroup.jsx       # Form input wrapper
│       └── Toast.jsx           # Notification messages
├── hooks/
│   └── useFormState.js         # Form state management
├── utils/
│   ├── xmlHelper.js            # XML generation & validation
│   └── constants.js            # App constants
├── styles/
│   └── App.css                 # Global styles + CSS variables
├── index.js                    # React entry point
└── public/
    └── index.html              # HTML template
```

## 🛣️ Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | HomePage | Landing page with introduction and CTA |
| `/generateur` | InvoiceGenerator | Tax declaration & invoice generator |

See [ROUTING.md](./ROUTING.md) for detailed routing documentation.

## 🎛️ UI Components

### Button
```jsx
<Button 
  variant="primary|secondary|blue|accent3"
  onClick={handler}
  disabled={false}
>
  Click Me
</Button>
```

### Card
```jsx
<Card title="Card Title">
  Card content here
</Card>
```

### FormGroup
```jsx
<FormGroup 
  label="Field Label"
  required={true}
  help="Help text"
>
  <input type="text" />
</FormGroup>
```

### Toast
```jsx
<Toast 
  message="Success!" 
  isVisible={true}
/>
```

## 🎛️ Custom Hook: useFormState

Centralized form state management:

```jsx
const {
  currentStep,          // Current form step (1-3)
  setCurrentStep,       // Switch steps
  identification,       // User data
  updateIdentification, // Update identification
  factures,             // Invoice list
  addFacture,           // Add invoice
  removeFacture,        // Remove invoice
  updateFactures        // Update all invoices
} = useFormState();
```

## 📊 State Structure

### Identification Object
```javascript
{
  identifiantFiscal: string,  // Fiscal ID
  annee: string,              // Year
  regime: string,             // Tax regime
  periode: string             // Period
}
```

### Facture Object
```javascript
{
  id: number,
  ord: string,                // Order number
  num: string,                // Invoice number
  des: string,                // Description
  mht: string,                // Pretax amount
  tva: string,                // Tax amount
  ttc: string,                // Total (calculated)
  if: string,                 // Supplier fiscal ID
  nom: string,                // Supplier name
  ice: string,                // Supplier ICE
  tx: string,                 // Tax rate
  prorata: string,            // Deduction ratio
  mp: string,                 // Payment mode
  dpai: string,               // Payment date
  dfac: string                // Invoice date
}
```

## 🔧 Utilities

### XML Helper
```jsx
import { generateXML, highlightXML, validateFormData, escapeXML } from '../utils/xmlHelper';

// Generate XML from form data
const xml = generateXML(if, year, period, regime, factures);

// Syntax highlight for display
const highlighted = highlightXML(xml);

// Validate data before generation
const errors = validateFormData(identification, factures);

// Escape special XML characters
const safe = escapeXML(userInput);
```

### Constants
```jsx
import { REGIMES, TVA_RATES, PAYMENT_MODES, REGIME_INFO } from '../utils/constants';

// Export arrays for dropdowns
REGIMES.map(r => <option value={r.value}>{r.label}</option>)
TVA_RATES.map(r => <option>{r}%</option>)
PAYMENT_MODES.map(m => <option value={m.value}>{m.label}</option>)
```

## 🎨 Styling System

### CSS Variables (src/styles/App.css)
```css
:root {
  --bg: #0a0f1a;              /* Background */
  --surface: #111827;         /* Card backgrounds */
  --surface2: #1a2236;        /* Input backgrounds */
  --border: #1e3a5f;          /* Border color */
  --accent: #00d4aa;          /* Primary accent (cyan) */
  --accent2: #0088ff;         /* Secondary accent (blue) */
  --accent3: #ff6b35;         /* Warning accent (orange) */
  --text: #e2e8f0;            /* Main text */
  --text-muted: #64748b;      /* Muted text */
  --text-dim: #94a3b8;        /* Dim text */
  --danger: #ef4444;          /* Error color */
  --success: #10b981;         /* Success color */
  --mono: 'IBM Plex Mono', monospace;
  --sans: 'IBM Plex Sans Arabic', sans-serif;
}
```

### Key Classes
- `.container` - Max-width wrapper
- `.btn` - Base button styles
- `.card` - Card styling
- `.form-grid` - Form layout (2-column)
- `.panel` - Page panel
- `.xml-output` - XML display

## 🧭 Navigation Examples

```jsx
import { useNavigate, useLocation } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to route
  const handleClick = () => {
    navigate('/generateur');
  };

  // Check current route
  if (location.pathname === '/') {
    // On home page
  }

  return <button onClick={handleClick}>Go</button>;
}
```

## ✨ Key Features

### Multi-Step Form
The app manages 3 distinct steps:
1. **Identification**: Enter fiscal ID, year, regime, period
2. **Factures**: Add and manage invoices
3. **Generation**: Validate and generate XML

### XML Generation
- Real-time validation with detailed error messages
- Syntax-highlighted XML preview
- Download as `.xml` file
- Copy to clipboard functionality

### Auto-Calculations
- TTC (Total) = HT (pretax) + TVA (tax) - Updates in real-time
- Summary totals recalculate when factures change

### Dynamic Form Rules
- Regime selection changes period constraints
- Helper text updates based on selected regime
- Validation rules adapt to form state

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.16.0",
  "react-scripts": "5.0.1"
}
```

## 🔄 Data Flow

### Home Page
```
HomePage
    ↓
Navigation (header)
    ↓
Hero Section (intro + features)
    ↓
CTA Button → navigate to /generateur
```

### Invoice Generator
```
InvoiceGenerator (state + logic)
    ↓
Navigation (header)
    ↓
Current Step (1, 2, or 3)
    ↓
IdentificationForm / FactureList / XMLOutput
    ↓
onChange → State update → Re-render
```

## ✨ Key Features in Detail

### 1. Multi-Step Form
- Step 1: Identification (IF, Year, Regime, Period)
- Step 2: Factures (Add/remove invoices)
- Step 3: Generate (Validate and export XML)

### 2. Real-Time Validation
- Required fields checked before moving steps
- Detailed error messages
- Highlighting for required fields

### 3. Auto-Calculations
- TTC = HT + TVA (updates automatically)
- Summary totals (HT, TVA, TTC)

### 4. XML Export
- Syntax-highlighted preview
- Download as .xml file
- Copy to clipboard
- Compliant with DGI Morocco standards

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag build folder to netlify.com
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
# Update package.json with homepage
# Add deploy scripts
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Unit Test Example
```jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeInTheDocument();
});
```

## 📱 Responsive Design

- **Desktop**: Full 2-3 column layouts
- **Tablet**: Adaptive grid (600px breakpoint)
- **Mobile**: Single column, touch-friendly buttons

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Form labels for all inputs

## 🔒 Security

- XML escaping prevents injection attacks
- User input sanitized before XML generation
- No sensitive data stored in localStorage
- CORS-ready for future API integration

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Routes not loading | Verify React Router installed: `npm install react-router-dom` |
| Styles not applying | Check CSS import in index.js |
| Form not updating | Ensure onChange handlers connected to state |
| XML not generating | Check console for validation errors |
| Navigation broken | Verify Routes defined in App.jsx |

## 📚 Documentation

- [README.md](./README.md) - This file
- [ROUTING.md](./ROUTING.md) - Detailed routing guide
- [SETUP.md](./SETUP.md) - Quick setup reference

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [SIMPL-TVA](https://www.tax.gov.ma)
- [DGI Morocco](https://www.tax.gov.ma)

## 📄 License

File generated for Moroccan tax compliance. Follow DGI regulations.

## 🤝 Contributing

Suggestions for improvements:
1. LocalStorage persistence for form data
2. Multi-language support (English/Français/العربية)
3. Export to Excel format
4. Template system for recurring invoices
5. API integration with SIMPL-TVA
6. Advanced filtering and search
7. Batch invoice operations

## 📞 Support & Issues

1. Check troubleshooting section
2. Review console error messages
3. Consult ROUTING.md for navigation issues
4. Check component prop documentation

---

**Version**: 2.0.0 (React SPA)  
**Framework**: React 18 + React Router v6  
**Build Tool**: Create React App  
**Status**: Production Ready ✅

Last Updated: April 2026
