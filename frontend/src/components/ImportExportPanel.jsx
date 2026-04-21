import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Upload, Download, Copy as LucideCopy, FolderOpen } from 'lucide-react';

const getModulesKey = (userId) => userId ? `simpl_tva_modules_user_${userId}` : 'simpl_tva_modules';
const loadModules = (userId) => { try { return JSON.parse(localStorage.getItem(getModulesKey(userId)) || '[]'); } catch { return []; } };
const saveModules = (m, userId) => localStorage.setItem(getModulesKey(userId), JSON.stringify(m));

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
      const headers = lines[0].split(',').map(h => h.trim().replace(/^\"|\"$/g, ''));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^\"|\"$/g, ''));
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
    setModules(updated); saveModules(updated, user?.id);
    showToast(isFR ? `"${name}.xlsx" exporté` : `"${name}.xlsx" exported`);
    setModuleName('');
  };

  const handleDelete = (idx) => {
    const updated = modules.filter((_, i) => i !== idx);
    setModules(updated); saveModules(updated, user?.id);
  };

  const handleLoad = (mod) => {
    onLoadModule(mod);
    showToast(isFR ? `Module "${mod.name}" chargé` : `Module "${mod.name}" loaded`);
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f4f8', marginBottom: 20 }}>📊 {isFR ? 'Import / Export' : 'Import / Export'}</div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 18, gap: 0 }}>
        <Tab label={isFR ? 'Importer' : 'Import'} icon={Upload} active={tab === 'import'} onClick={() => setTab('import')} />
        <Tab label={isFR ? 'Exporter CSV' : 'Export CSV'} icon={Download} active={tab === 'export'} onClick={() => setTab('export')} />
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
