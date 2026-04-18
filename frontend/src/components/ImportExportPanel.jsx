import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useLang } from '../context/LanguageContext';

const LS_KEY = 'simpl_tva_modules';
const loadModules = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const saveModules = (m) => localStorage.setItem(LS_KEY, JSON.stringify(m));

const COLS = ['num','des','mht','tva','fIf','fNom','fIce','tx','prorata','mpId','dpai','dfac'];

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

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '9px 18px', border: 'none', cursor: 'pointer',
    background: active ? 'var(--surface2)' : 'transparent',
    color: active ? 'var(--blue-h)' : 'var(--text-3)',
    borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
    fontSize: '0.82rem', fontWeight: active ? 600 : 400,
    fontFamily: 'var(--sans)', transition: 'all .15s', whiteSpace: 'nowrap',
  }}>
    {label}
  </button>
);

const ImportExportPanel = ({ factures, identification, onLoadModule }) => {
  const { lang } = useLang();
  const isFR = lang === 'FR';
  const [tab, setTab] = useState('import');
  const [modules, setModules] = useState(loadModules);
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
    const confirmMsg = isFR ? 'Remplacer les factures existantes ?' : 'Replace existing invoices?';
    const replace = factures.length === 0 || window.confirm(confirmMsg);
    if (replace) {
      onLoadModule({ type: 'factures', entries: newFactures });
    } else {
      const merged = [...factures, ...newFactures].map((f, i) => ({ ...f, id: i + 1, ord: String(i + 1) }));
      onLoadModule({ type: 'factures', entries: merged });
    }
    showToast(isFR ? `${rows.length} factures importées depuis le fichier` : `${rows.length} invoices imported from file`);
  }, [factures, onLoadModule, isFR]);

  const processCSV = useCallback((text) => {
    try {
      const lines = text.trim().split('\n').filter(l => l.trim());
      if (lines.length < 2) throw new Error();
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      }).filter(r => r.num || r.des);
      handleImportRows(rows);
    } catch {
      showToast(isFR ? 'Format invalide. Vérifiez les colonnes.' : 'Invalid format. Please check the columns.');
    }
  }, [handleImportRows, isFR]);

  const processExcel = useCallback((buffer) => {
    try {
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rows.length) throw new Error();
      handleImportRows(rows);
    } catch {
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
    const example = ['FAC-2024-001', 'Achat matériel informatique', 10000, 2000, '12345678', 'Fournisseur SARL', '001234567890123', 20, 100, 2, '2024-03-15', '2024-03-10'];
    const ws = XLSX.utils.aoa_to_sheet([COLS, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factures');
    XLSX.writeFile(wb, 'modele_factures_SIMPLTVA.xlsx');
  };

  const exportToExcel = (type) => {
    const name = moduleName.trim() || `export_${Date.now()}`;
    const entries = type === 'factures' ? factures : [identification];

    let rows, headers;
    if (type === 'factures') {
      headers = COLS;
      rows = entries.map(f => [f.num, f.des, f.mht, f.tva, f.if, f.nom, f.ice, f.tx, f.prorata, f.mp, f.dpai, f.dfac]);
    } else {
      headers = ['identifiantFiscal', 'annee', 'regime', 'periode'];
      rows = entries.map(e => [e.identifiantFiscal, e.annee, e.regime, e.periode]);
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'factures' ? 'Factures' : 'Identification');
    XLSX.writeFile(wb, `${name}.xlsx`);

    const updated = [{ name, type, entries, savedAt: new Date().toISOString(), count: entries.length }, ...modules];
    setModules(updated); saveModules(updated);
    showToast(isFR ? `"${name}.xlsx" exporté` : `"${name}.xlsx" exported`);
    setModuleName('');
  };

  const handleDelete = (idx) => {
    const updated = modules.filter((_, i) => i !== idx);
    setModules(updated); saveModules(updated);
  };

  const handleLoad = (mod) => {
    onLoadModule(mod);
    showToast(isFR ? `Module "${mod.name}" chargé` : `Module "${mod.name}" loaded`);
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title">📊 {isFR ? 'Import / Export' : 'Import / Export'}</div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        <Tab label={`📥 ${isFR ? 'Importer' : 'Import'}`} active={tab === 'import'} onClick={() => setTab('import')} />
        <Tab label={`📤 ${isFR ? 'Exporter' : 'Export'}`} active={tab === 'export'} onClick={() => setTab('export')} />
        <Tab label={`📚 ${isFR ? 'Sauvegardés' : 'Saved'} (${modules.length})`} active={tab === 'saved'} onClick={() => setTab('saved')} />
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
              border: `1.5px dashed ${dragOver ? 'var(--blue)' : 'rgba(74,222,128,0.2)'}`,
              borderRadius: 12, padding: '32px 20px', textAlign: 'center',
              cursor: 'pointer', transition: 'border-color .2s, background .2s',
              background: dragOver ? 'var(--blue-tint)' : 'transparent',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00d4a0', marginBottom: 8, letterSpacing: '0.06em' }}>
              .xlsx · .xls · .csv
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
              {isFR ? 'Glisser-déposer ou cliquer pour sélectionner' : 'Drag & drop or click to select'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={(e) => { processFile(e.target.files[0]); e.target.value = ''; }} />

          <button
            onClick={downloadTemplate}
            style={{
              marginTop: 12, padding: '6px 14px', fontSize: '0.75rem',
              background: 'transparent', border: '1px solid rgba(0,212,160,0.3)',
              color: '#00d4a0', borderRadius: 7, cursor: 'pointer',
              fontFamily: 'var(--sans)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,160,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ⬇ {isFR ? 'Télécharger le modèle Excel' : 'Download Excel template'}
          </button>
        </div>
      )}

      {/* ── Export ── */}
      {tab === 'export' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
              {isFR ? 'Nom du fichier' : 'File name'}
            </label>
            <input value={moduleName} onChange={(e) => setModuleName(e.target.value)} placeholder={isFR ? 'ex: fournisseurs-2024' : 'e.g. suppliers-2024'} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => exportToExcel('factures')} disabled={factures.length === 0} style={{ opacity: factures.length === 0 ? 0.4 : 1 }}>
              📄 {isFR ? `Exporter factures (${factures.length})` : `Export invoices (${factures.length})`}
            </button>
            <button className="btn btn-blue" onClick={() => exportToExcel('identification')}>
              🏢 {isFR ? "Exporter l'identification" : 'Export identification'}
            </button>
          </div>
        </div>
      )}

      {/* ── Saved ── */}
      {tab === 'saved' && (
        <div>
          {modules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-3)', fontSize: '0.81rem' }}>
              {isFR ? 'Aucun export sauvegardé' : 'No saved exports'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modules.map((mod, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{mod.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                      {mod.type === 'factures' ? (isFR ? 'Factures' : 'Invoices') : (isFR ? 'Identification' : 'Identification')} · {mod.count} {isFR ? (mod.count > 1 ? 'entrées' : 'entrée') : (mod.count > 1 ? 'entries' : 'entry')} · {new Date(mod.savedAt).toLocaleDateString('fr-MA')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <button className="btn btn-blue" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => handleLoad(mod)}>
                      {isFR ? 'Charger' : 'Load'}
                    </button>
                    <button className="btn-remove" onClick={() => handleDelete(i)}>
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
        <div style={{ marginTop: 14, padding: '9px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 7, fontSize: '0.79rem', color: 'var(--blue-h)' }}>
          {toast}
        </div>
      )}
    </div>
  );
};

export default ImportExportPanel;
