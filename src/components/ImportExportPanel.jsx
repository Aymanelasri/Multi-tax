import React, { useState, useRef, useCallback } from 'react';

const LS_KEY = 'simpl_tva_modules';
const loadModules = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } };
const saveModules = (m) => localStorage.setItem(LS_KEY, JSON.stringify(m));

const Tab = ({ label, shortLabel, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '9px 16px', border: 'none', cursor: 'pointer',
      background: active ? 'var(--surface2)' : 'transparent',
      color: active ? 'var(--blue-h)' : 'var(--text-3)',
      borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
      fontSize: '0.82rem', fontWeight: active ? 600 : 400,
      fontFamily: 'var(--sans)', transition: 'all .15s', whiteSpace: 'nowrap',
    }}
  >
    <span className="tab-full">{label}</span>
    <span className="tab-short" style={{ display: 'none' }}>{shortLabel}</span>
  </button>
);

const ImportExportPanel = ({ factures, identification, onLoadModule }) => {
  const [tab, setTab] = useState('import');
  const [modules, setModules] = useState(loadModules);
  const [moduleName, setModuleName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const processFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.json')) { showToast('Fichier JSON requis'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.type || !data.entries) throw new Error();
        onLoadModule(data);
        showToast(`Module "${data.name || file.name}" charge`);
      } catch { showToast('Format de module invalide'); }
    };
    reader.readAsText(file);
  }, [onLoadModule]);

  const handleExport = (type) => {
    const name = moduleName.trim() || `module_${Date.now()}`;
    const entries = type === 'factures' ? factures : [identification];
    const data = { name, type, entries, savedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.json`; a.click();
    URL.revokeObjectURL(url);
    const updated = [{ name, type, entries, savedAt: data.savedAt, count: entries.length }, ...modules];
    setModules(updated); saveModules(updated);
    showToast(`Module "${name}" exporte`);
    setModuleName('');
  };

  const handleDelete = (idx) => {
    const updated = modules.filter((_, i) => i !== idx);
    setModules(updated); saveModules(updated);
  };

  const handleLoad = (mod) => { onLoadModule(mod); showToast(`Module "${mod.name}" charge`); };

  return (
    <>
      <style>{`
        @media(max-width:480px){
          .tab-full{display:none!important}
          .tab-short{display:inline!important}
          .ie-panel-tabs button{padding:8px 10px!important;font-size:0.75rem!important}
        }
      `}</style>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Modules Import / Export</div>

        {/* Tabs */}
        <div className="ie-panel-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 18, overflowX: 'auto' }}>
          <Tab label="📥 Importer"  shortLabel="📥" active={tab === 'import'} onClick={() => setTab('import')} />
          <Tab label="📤 Exporter"  shortLabel="📤" active={tab === 'export'} onClick={() => setTab('export')} />
          <Tab label={`📚 Sauvegardes (${modules.length})`} shortLabel={`📚 ${modules.length}`} active={tab === 'saved'} onClick={() => setTab('saved')} />
        </div>

        {/* Import */}
        {tab === 'import' && (
          <div>
            <p style={{ fontSize: '0.81rem', color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 }}>
              Importez un fichier <code style={{ color: 'var(--blue-h)', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>.json</code> pour pre-remplir les fournisseurs ou factures.
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current.click()}
              style={{
                border: `1.5px dashed ${dragOver ? 'var(--blue)' : 'var(--border2)'}`,
                borderRadius: 10, padding: '32px 20px', textAlign: 'center',
                cursor: 'pointer', transition: 'border-color .2s, background .2s',
                background: dragOver ? 'var(--blue-tint)' : 'transparent',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📂</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-2)', marginBottom: 4 }}>
                Glissez-deposez votre <strong style={{ color: 'var(--text)' }}>.json</strong> ici
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>ou cliquez pour selectionner</div>
            </div>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => processFile(e.target.files[0])} />
          </div>
        )}

        {/* Export */}
        {tab === 'export' && (
          <div>
            <p style={{ fontSize: '0.81rem', color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
              Exportez les donnees actuelles en fichier <code style={{ color: 'var(--blue-h)', fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>.json</code> reutilisable.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>
                Nom du module
              </label>
              <input value={moduleName} onChange={(e) => setModuleName(e.target.value)} placeholder="ex: fournisseurs-2024" />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => handleExport('factures')} disabled={factures.length === 0} style={{ opacity: factures.length === 0 ? 0.4 : 1 }}>
                Factures ({factures.length})
              </button>
              <button className="btn btn-blue" onClick={() => handleExport('identification')}>
                Identification
              </button>
            </div>
          </div>
        )}

        {/* Saved */}
        {tab === 'saved' && (
          <div>
            {modules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-3)', fontSize: '0.81rem' }}>
                Aucun module sauvegarde.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {modules.map((mod, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '11px 14px', gap: 10, flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{mod.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                        {mod.type === 'factures' ? 'Factures' : 'Identification'} · {mod.count} entree{mod.count > 1 ? 's' : ''} · {new Date(mod.savedAt).toLocaleDateString('fr-MA')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                      <button className="btn btn-blue" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => handleLoad(mod)}>
                        Charger
                      </button>
                      <button className="btn-remove" onClick={() => handleDelete(i)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {toast && (
          <div style={{ marginTop: 14, padding: '9px 14px', background: 'var(--blue-tint)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 7, fontSize: '0.79rem', color: 'var(--blue-h)' }}>
            {toast}
          </div>
        )}
      </div>
    </>
  );
};

export default ImportExportPanel;
