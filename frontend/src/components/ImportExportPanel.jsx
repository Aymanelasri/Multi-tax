import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx-js-style';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Upload, Download, Copy as LucideCopy, FolderOpen } from 'lucide-react';
import api from '../lib/api';

const getModulesKey = (userId) => userId ? `simpl_tva_modules_user_${userId}` : 'simpl_tva_modules';
const loadModules = (userId) => { try { return JSON.parse(localStorage.getItem(getModulesKey(userId)) || '[]'); } catch { return []; } };
const saveModules = (m, userId) => localStorage.setItem(getModulesKey(userId), JSON.stringify(m));

const rowToFacture = (row, idx) => ({
  id: idx + 1, ord: String(idx + 1),
  num:     String(row.num     || ''),
  des:     String(row.des     || ''),
  mht:     String(row.mht     || ''),
  tva:     String(row.tva     || ''),
  ttc:     String((parseFloat(row.mht || 0) + parseFloat(row.tva || 0)).toFixed(2)),
  if:      String(row.fIf     || ''),
  nom:     String(row.fNom    || ''),
  ice:     String(row.fIce    || ''),
  tx:      String(row.tx      || '20.00'),
  prorata: String(row.prorata || '100'),
  mp:      String(row.mpId    || '1'),
  dpai:    String(row.dpai    || ''),
  dfac:    String(row.dfac    || ''),
});

const Tab = ({ label, icon: Icon, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '12px 16px', border: 'none', cursor: 'pointer',
    background: active ? 'rgba(0, 212, 160, 0.05)' : 'transparent',
    color: active ? '#00d4a0' : '#94a3b8',
    borderBottom: active ? '3px solid #2dd4bf' : '3px solid transparent',
    fontSize: '0.9rem', fontWeight: active ? 700 : 500,
    fontFamily: 'inherit', transition: 'all .15s ease', whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1,
  }}
  onMouseEnter={(e) => {
    if (!active) {
      e.currentTarget.style.color = '#cbd5e1';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
    }
  }}
  onMouseLeave={(e) => {
    if (!active) {
      e.currentTarget.style.color = '#94a3b8';
      e.currentTarget.style.background = 'transparent';
    }
  }}
  >
    {Icon && <Icon size={16} strokeWidth={2.5} style={{ flexShrink: 0, display: 'block' }} />}
    <span style={{ display: 'block' }}>{label}</span>
  </button>
);

const ImportExportPanel = ({ factures, identification, onLoadModule }) => {
  const { lang } = useLang();
  const { user } = useAuth();
  const isFR = lang === 'FR';
  const [tab, setTab] = useState('import');
  const [modules, setModules] = useState(() => loadModules(user?.id));
  const [moduleName, setModuleName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleImportRows = useCallback((rows) => {
    if (!rows.length) {
      showToast(isFR ? 'Fichier vide ou colonnes manquantes.' : 'Empty file or missing columns.');
      return;
    }
    const newFactures = rows.map((r, i) => rowToFacture(r, i));
    // Always add (merge) new invoices to existing ones
    const merged = [...factures, ...newFactures].map((f, i) => ({ ...f, id: i + 1, ord: String(i + 1) }));
    onLoadModule({ type: 'factures', entries: merged });
    showToast(isFR ? `${rows.length} factures importées depuis le fichier` : `${rows.length} invoices imported from file`);
    
    // TRACKING: Log import to historique (fire-and-forget)
    if (user) {
      api.createHistorique({
        action: 'import',
        description: isFR ? `Import de ${rows.length} factures` : `Imported ${rows.length} invoices`,
        data: { count: rows.length, type: 'factures' }
      }).catch(() => {}); 
    }
  }, [factures, onLoadModule, isFR, user]);

  const processCSV = useCallback((text) => {
    try {
      const lines = text.trim().split('\n').filter(l => l.trim());
      if (lines.length < 2) throw new Error();
      const headers = lines[0].split(',').map(h => h.trim().replace(/^\"|\"$/g, ''));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^\"|\"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      }).filter(r => r.num || r.des || r.fNom); // Skip empty rows
      handleImportRows(rows);
    } catch {
      showToast(isFR ? 'Format invalide. Vérifiez les colonnes.' : 'Invalid format. Please check the columns.');
    }
  }, [handleImportRows, isFR]);

  const processExcel = useCallback((buffer) => {
    try {
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rawRows.length) throw new Error();
      
      // Payment mode name to ID mapping
      const paymentModeMap = {
        'Espèces': '1',
        'especes': '1',
        'cash': '1',
        'Chèque': '2',
        'cheque': '2',
        'check': '2',
        'Prélèvement': '3',
        'prelevement': '3',
        'debit': '3',
        'Virement': '4',
        'virement': '4',
        'transfer': '4',
        'Effet': '5',
        'effet': '5',
        'bill': '5',
        'Compensation': '6',
        'compensation': '6',
        'offset': '6',
        'Autres': '7',
        'autres': '7',
        'other': '7',
        'others': '7'
      };
      
      // Map headers - support both French and English headers
      const HEADER_MAP = {
        // French headers (from export)
        'Numéro de Facture': 'num',
        'Désignation / Description': 'des',
        'Montant Hors Taxe (MAD)': 'mht',
        'Montant TVA (MAD)': 'tva',
        'Identifiant Fiscal Fournisseur': 'fIf',
        'Nom / Raison Sociale Fournisseur': 'fNom',
        'ICE Fournisseur': 'fIce',
        'Taux TVA (%)': 'tx',
        'Prorata (%)': 'prorata',
        'Mode de Paiement': 'mpId',
        'Date de Paiement': 'dpai',
        'Date de Facture': 'dfac',
        // English headers (alternative)
        'Invoice Number': 'num',
        'Description': 'des',
        'Amount Excl. Tax (MAD)': 'mht',
        'VAT Amount (MAD)': 'tva',
        'Supplier Tax ID': 'fIf',
        'Supplier Name': 'fNom',
        'Supplier ICE': 'fIce',
        'VAT Rate (%)': 'tx',
        'Prorata (%)': 'prorata',
        'Payment Mode': 'mpId',
        'Payment Date': 'dpai',
        'Invoice Date': 'dfac',
        // Short field names (direct mapping)
        'num': 'num',
        'des': 'des',
        'mht': 'mht',
        'tva': 'tva',
        'fIf': 'fIf',
        'fNom': 'fNom',
        'fIce': 'fIce',
        'tx': 'tx',
        'prorata': 'prorata',
        'mpId': 'mpId',
        'dpai': 'dpai',
        'dfac': 'dfac'
      };
      
      const rows = rawRows
        .map(row => {
          const mapped = {};
          Object.keys(row).forEach(key => {
            const fieldName = HEADER_MAP[key] || key;
            let value = row[key];
            
            // Convert dates from Excel serial numbers to YYYY-MM-DD
            if ((fieldName === 'dpai' || fieldName === 'dfac') && typeof value === 'number') {
              const excelEpoch = new Date(1899, 11, 30);
              const date = new Date(excelEpoch.getTime() + value * 86400000);
              value = date.toISOString().split('T')[0];
            }
            
            // Convert payment mode names to IDs
            if (fieldName === 'mpId' && typeof value === 'string') {
              const lowerValue = value.toLowerCase().trim();
              value = paymentModeMap[lowerValue] || paymentModeMap[value] || value;
            }
            
            // Ensure numeric fields are strings
            if (['mht', 'tva', 'tx', 'prorata', 'mpId'].includes(fieldName)) {
              value = String(value || '');
            }
            
            mapped[fieldName] = value;
          });
          return mapped;
        })
        .filter(row => row.num || row.des || row.fNom); // Skip empty rows
      
      handleImportRows(rows);
    } catch (err) {
      showToast(isFR ? 'Format invalide. Vérifiez les colonnes.' : 'Invalid format. Please check the columns.');
    }
  }, [handleImportRows, isFR]);

  const processFile = useCallback((file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => processCSV(e.target.result);
      reader.readAsText(file);
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => processExcel(new Uint8Array(e.target.result));
      reader.readAsArrayBuffer(file);
    } else {
      showToast(isFR ? 'Format non supporté. Utilisez .xlsx ou .csv' : 'Unsupported format. Use .xlsx or .csv');
    }
  }, [processCSV, processExcel, isFR]);

  const downloadTemplate = () => {
    const headers = [
      'Numéro de Facture',
      'Désignation / Description',
      'Montant Hors Taxe (MAD)',
      'Montant TVA (MAD)',
      'Identifiant Fiscal Fournisseur',
      'Nom / Raison Sociale Fournisseur',
      'ICE Fournisseur',
      'Taux TVA (%)',
      'Prorata (%)',
      'Mode de Paiement',
      'Date de Paiement',
      'Date de Facture'
    ];
    const example = [
      'FAC-2024-001', 
      'Achat matériel informatique', 
      10000, 
      2000, 
      '12345678', 
      'Fournisseur SARL', 
      '012345678910123', 
      20, 
      100, 
      'Chèque',
      '2024-03-15', 
      '2024-03-10'
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    
    // ✅ LARGE COLUMN WIDTHS
    ws['!cols'] = [
      { wch: 25 },  // Numéro de Facture
      { wch: 40 },  // Désignation
      { wch: 28 },  // Montant HT
      { wch: 25 },  // Montant TVA
      { wch: 32 },  // IF Fournisseur
      { wch: 40 },  // Nom Fournisseur
      { wch: 30 },  // ICE
      { wch: 18 },  // Taux TVA
      { wch: 16 },  // Prorata
      { wch: 25 },  // Mode Paiement
      { wch: 22 },  // Date Paiement
      { wch: 22 },  // Date Facture
    ];
    
    // ✅ TALL ROW HEIGHTS
    ws['!rows'] = [
      { hpt: 40 },  // Header row
      { hpt: 28 },  // Example row
    ];
    
    // ✅ HEADER STYLING
    const headerCells = ['A1','B1','C1','D1','E1','F1','G1','H1','I1','J1','K1','L1'];
    headerCells.forEach(cell => {
      if (!ws[cell]) return;
      ws[cell].s = {
        fill: { fgColor: { rgb: '0f2744' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 12 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'medium', color: { rgb: '1e3a5f' } },
          bottom: { style: 'medium', color: { rgb: '1e3a5f' } },
          left: { style: 'medium', color: { rgb: '1e3a5f' } },
          right: { style: 'medium', color: { rgb: '1e3a5f' } }
        }
      };
    });
    
    // ✅ EXAMPLE ROW STYLING
    const exampleCells = ['A2','B2','C2','D2','E2','F2','G2','H2','I2','J2','K2','L2'];
    exampleCells.forEach(cell => {
      if (!ws[cell]) return;
      ws[cell].s = {
        fill: { fgColor: { rgb: 'e0f2fe' } },
        font: { color: { rgb: '1e293b' }, sz: 11 },
        alignment: { 
          vertical: 'center',
          horizontal: cell.startsWith('C') || cell.startsWith('D') || cell.startsWith('H') || cell.startsWith('I') ? 'right' : 'left'
        },
        border: {
          top: { style: 'thin', color: { rgb: 'cbd5e1' } },
          bottom: { style: 'thin', color: { rgb: 'cbd5e1' } },
          left: { style: 'thin', color: { rgb: 'cbd5e1' } },
          right: { style: 'thin', color: { rgb: 'cbd5e1' } }
        }
      };
    });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factures');
    XLSX.writeFile(wb, 'modele_factures_SIMPLTVA.xlsx', { cellStyles: true });
  };

  const exportToExcel = async (type) => {
    const name = moduleName.trim() || `export_${Date.now()}`;
    const entries = type === 'factures' ? factures : [identification];

    let rows, headers;
    if (type === 'factures') {
      headers = [
        'Numéro de Facture',
        'Désignation / Description',
        'Montant Hors Taxe (MAD)',
        'Montant TVA (MAD)',
        'Identifiant Fiscal Fournisseur',
        'Nom / Raison Sociale Fournisseur',
        'ICE Fournisseur',
        'Taux TVA (%)',
        'Prorata (%)',
        'Mode de Paiement',
        'Date de Paiement',
        'Date de Facture'
      ];
      
      // Payment mode mapping
      const paymentModes = {
        '1': 'Espèces',
        '2': 'Chèque',
        '3': 'Prélèvement',
        '4': 'Virement',
        '5': 'Effet',
        '6': 'Compensation',
        '7': 'Autres'
      };
      
      rows = entries.map(f => [
        f.num, 
        f.des, 
        f.mht, 
        f.tva, 
        f.if, 
        f.nom, 
        f.ice, 
        f.tx, 
        f.prorata, 
        paymentModes[f.mp] || f.mp || 'Espèces',  // Convert to name
        f.dpai, 
        f.dfac
      ]);
    } else {
      headers = ['identifiantFiscal', 'annee', 'regime', 'periode'];
      rows = entries.map(e => [e.identifiantFiscal, e.annee, e.regime, e.periode]);
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    // ✅ ADD STYLING
    
    // 1. Column widths
    if (type === 'factures') {
      ws['!cols'] = [
        { wch: 22 },  // Numéro de Facture
        { wch: 32 },  // Désignation
        { wch: 24 },  // Montant HT
        { wch: 22 },  // Montant TVA
        { wch: 28 },  // IF Fournisseur
        { wch: 32 },  // Nom Fournisseur
        { wch: 28 },  // ICE
        { wch: 16 },  // Taux TVA
        { wch: 14 },  // Prorata
        { wch: 34 },  // Mode Paiement
        { wch: 26 },  // Date Paiement
        { wch: 26 },  // Date Facture
      ];
    }
    
    // 2. Row heights
    ws['!rows'] = [
      { hpt: 35 },  // header row — tall
      ...rows.map(() => ({ hpt: 22 }))  // data rows
    ];
    
    // 3. Header row style (row 1)
    const headerCells = [
      'A1','B1','C1','D1','E1','F1',
      'G1','H1','I1','J1','K1','L1'
    ];
    
    headerCells.forEach(cell => {
      if (!ws[cell]) return;
      ws[cell].s = {
        fill: { fgColor: { rgb: '0f2744' } },
        font: { 
          color: { rgb: 'FFFFFF' }, 
          bold: true, 
          sz: 11 
        },
        alignment: { 
          horizontal: 'center', 
          vertical: 'center', 
          wrapText: true 
        },
        border: {
          top:    { style: 'thin', color: { rgb: '1e3a5f' } },
          bottom: { style: 'thin', color: { rgb: '1e3a5f' } },
          left:   { style: 'thin', color: { rgb: '1e3a5f' } },
          right:  { style: 'thin', color: { rgb: '1e3a5f' } }
        }
      };
    });
    
    // 4. Data rows style (alternating colors)
    rows.forEach((_, rowIdx) => {
      const excelRow = rowIdx + 2; // row 1 is header
      const isEven = rowIdx % 2 === 0;
      const bgColor = isEven ? 'f8fafc' : 'f0f7ff';
      
      const dataCells = [
        `A${excelRow}`,`B${excelRow}`,`C${excelRow}`,
        `D${excelRow}`,`E${excelRow}`,`F${excelRow}`,
        `G${excelRow}`,`H${excelRow}`,`I${excelRow}`,
        `J${excelRow}`,`K${excelRow}`,`L${excelRow}`
      ];
      
      dataCells.forEach(cell => {
        if (!ws[cell]) return;
        ws[cell].s = {
          fill: { fgColor: { rgb: bgColor } },
          font: { color: { rgb: '1e293b' }, sz: 10 },
          alignment: { 
            vertical: 'center',
            horizontal: cell.startsWith('C') || 
                        cell.startsWith('D') || 
                        cell.startsWith('H') || 
                        cell.startsWith('I') 
                        ? 'right' : 'left'
          },
          border: {
            top:    { style: 'thin', color: { rgb: 'e2e8f0' } },
            bottom: { style: 'thin', color: { rgb: 'e2e8f0' } },
            left:   { style: 'thin', color: { rgb: 'e2e8f0' } },
            right:  { style: 'thin', color: { rgb: 'e2e8f0' } }
          }
        };
      });
    });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb, ws, 
      type === 'factures' ? 'Factures SIMPL-TVA' : 'Identification'
    );
    
    // Generate file as blob with cellStyles enabled
    const wbout = XLSX.write(wb, { 
      bookType: 'xlsx', 
      type: 'array',
      cellStyles: true
    });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileSize = blob.size;
    
    // Download file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    const updated = [{ name, type, entries, savedAt: new Date().toISOString(), count: entries.length }, ...modules];
    setModules(updated); saveModules(updated, user?.id);
    showToast(isFR ? `"${name}.xlsx" exporté` : `"${name}.xlsx" exported`);
    setModuleName('');
    
    // TRACKING: Save export to backend with file
    if (user) {
      // Create FormData to upload file
      const formData = new FormData();
      formData.append('file', blob, `${name}.xlsx`);
      formData.append('file_type', 'XLSX');
      formData.append('reference', `EXP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);
      formData.append('factures', entries.length);
      formData.append('montant_ttc', 0);
      formData.append('regime', identification?.regime || 'Non défini');
      formData.append('annee', identification?.annee || new Date().getFullYear().toString());
      formData.append('periode', identification?.periode || '1');
      
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
            'Accept': 'application/json'
          },
          body: formData,
          credentials: 'include'
        });
      } catch (err) {
        // Silently ignore export file save errors
      }
      
      // Track in historique (fire-and-forget)
      api.createHistorique({
        action: 'export',
        description: isFR ? `Export de ${entries.length} ${type === 'factures' ? 'factures' : 'identifications'}` : `Exported ${entries.length} ${type === 'factures' ? 'invoices' : 'identifications'}`,
        data: { filename: `${name}.xlsx`, count: entries.length, type, file_size: fileSize }
      }).catch(() => {}); // Silently ignore tracking errors
    }
  };

  const handleDelete = (idx) => {
    const updated = modules.filter((_, i) => i !== idx);
    setModules(updated); saveModules(updated, user?.id);
  };

  const handleLoad = (mod) => {
    onLoadModule(mod);
    showToast(isFR ? `Module "${mod.name}" chargé` : `Module "${mod.name}" loaded`);
    
    // TRACKING: Log module load to historique (fire-and-forget)
    if (user) {
      api.createHistorique({
        action: 'load_module',
        description: isFR ? `Chargement du module "${mod.name}"` : `Loaded module "${mod.name}"`,
        data: { module_name: mod.name, count: mod.count, type: mod.type }
      }).catch(() => {}); // Silently ignore tracking errors
    }
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f4f8', marginBottom: 20 }}>📊 {isFR ? 'Import / Export' : 'Import / Export'}</div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 18, gap: 0 }}>
        <Tab label={isFR ? 'Importer' : 'Import'} icon={Download} active={tab === 'import'} onClick={() => setTab('import')} />
        <Tab label={isFR ? 'Exporter CSV' : 'Export CSV'} icon={Upload} active={tab === 'export'} onClick={() => setTab('export')} />
        <Tab label={`${isFR ? 'Copier' : 'Copy'} (${modules.length})`} icon={LucideCopy} active={tab === 'saved'} onClick={() => setTab('saved')} />
      </div>

      {/* ── Import ── */}
      {tab === 'import' && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? '#2dd4bf' : 'rgba(45,212,191,0.3)'}`,
              borderRadius: 12, padding: '40px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'all .2s ease',
              background: dragOver ? 'rgba(45, 212, 191, 0.08)' : 'rgba(45, 212, 191, 0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <FolderOpen size={40} color="#2dd4bf" strokeWidth={1.5} style={{ display: 'block' }} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2dd4bf', marginBottom: 8, letterSpacing: '0.05em' }}>
              .xlsx · .xls · .csv
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
              {isFR ? 'Glisser-déposer vos fichiers ou cliquer pour sélectionner' : 'Drag and drop your files or click to select'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={(e) => { processFile(e.target.files[0]); e.target.value = ''; }} />

          <button
            onClick={downloadTemplate}
            style={{
              marginTop: 20, padding: '11px 20px', fontSize: '0.85rem',
              background: 'transparent', border: '1.5px solid rgba(45,212,191,0.4)',
              color: '#2dd4bf', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s ease', fontWeight: 600,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(45,212,191,0.1)';
              e.currentTarget.style.borderColor = 'rgba(45,212,191,0.6)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)';
              e.currentTarget.style.color = '#2dd4bf';
            }}
          >
            ⬇ {isFR ? 'Télécharger le modèle Excel' : 'Download Excel template'}
          </button>
        </div>
      )}

      {/* ── Export ── */}
      {tab === 'export' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
              {isFR ? 'Nom du fichier' : 'File name'}
            </label>
            <input 
              value={moduleName} 
              onChange={(e) => setModuleName(e.target.value)} 
              placeholder={isFR ? 'ex: fournisseurs-2024' : 'e.g. suppliers-2024'}
              style={{
                background: '#0d1728', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f0f4f8', borderRadius: 8, height: 44, padding: '0 14px',
                fontSize: '0.87rem', width: '100%', outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#2dd4bf'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button 
              onClick={() => exportToExcel('factures')} 
              disabled={factures.length === 0} 
              style={{
                padding: '11px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                background: factures.length === 0 ? 'rgba(45,212,191,0.1)' : 'linear-gradient(135deg,#10b981,#34d399)',
                border: 'none', color: factures.length === 0 ? '#64748b' : '#000',
                cursor: factures.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s ease', opacity: factures.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (factures.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.3)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📄 {isFR ? `Exporter factures (${factures.length})` : `Export invoices (${factures.length})`}
            </button>
            <button 
              onClick={() => exportToExcel('identification')}
              style={{
                padding: '11px 18px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
                color: '#2dd4bf', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(45,212,191,0.2)';
                e.currentTarget.style.borderColor = 'rgba(45,212,191,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(45,212,191,0.1)';
                e.currentTarget.style.borderColor = 'rgba(45,212,191,0.3)';
              }}
            >
              🏢 {isFR ? "Exporter l'identification" : 'Export identification'}
            </button>
          </div>
        </div>
      )}

      {/* ── Saved (Copier) ── */}
      {tab === 'saved' && (
        <div>
          {modules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: '0.81rem' }}>
              {isFR ? 'Aucun export sauvegardé' : 'No saved exports'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modules.map((mod, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', gap: 10, flexWrap: 'wrap', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#202530';
                    e.currentTarget.style.borderColor = 'rgba(45,212,191,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1a1f2e';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{mod.name}</div>
                    <div style={{ fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      {mod.type === 'factures' ? (isFR ? 'Factures' : 'Invoices') : (isFR ? 'Identification' : 'Identification')} · {mod.count} {isFR ? (mod.count > 1 ? 'entrées' : 'entrée') : (mod.count > 1 ? 'entries' : 'entry')} · {new Date(mod.savedAt).toLocaleDateString('fr-MA')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <button style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)', color: '#2dd4bf', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s ease' }} onClick={() => handleLoad(mod)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(45,212,191,0.25)';
                        e.currentTarget.style.borderColor = 'rgba(45,212,191,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(45,212,191,0.15)';
                        e.currentTarget.style.borderColor = 'rgba(45,212,191,0.3)';
                      }}
                    >
                      {isFR ? 'Charger' : 'Load'}
                    </button>
                    <button style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s ease' }} onClick={() => handleDelete(i)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                      }}
                    >
                      {isFR ? 'Supprimer' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div style={{ marginTop: 14, padding: '11px 14px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 8, fontSize: '0.8rem', color: '#2dd4bf', fontWeight: 500 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default ImportExportPanel;
