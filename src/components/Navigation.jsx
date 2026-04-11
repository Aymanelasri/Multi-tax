import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .nav-root {
    position: sticky; top: 0; z-index: 100;
    width: 100%; height: 56px;
    display: flex; align-items: center;
    font-family: 'Inter', system-ui, sans-serif;
    background: #0d1424;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .nav-inner {
    width: 100%; padding: 0 48px;
    display: flex; align-items: center; justify-content: space-between;
    height: 100%;
  }
  
  .nav-logo {
    display: flex; align-items: center; gap: 8px; cursor: pointer;
    flex-shrink: 0;
  }
  .nav-logo-box {
    width: 28px; height: 28px; background: #00d4a0; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 800; color: #0a0f1a;
  }
  .nav-brand { font-size: 0.95rem; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; }
  .nav-brand span { color: #00d4a0; }

  .nav-center {
    display: flex; align-items: center; gap: 12px;
    position: absolute; left: 50%; transform: translateX(-50%);
  }
  .nav-link {
    padding: 7px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: 500;
    color: #94a3b8; background: transparent; border: 1px solid rgba(255,255,255,0.15); 
    cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s ease;
    white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center;
  }
  .nav-link:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }
  .nav-link.active { color: #ffffff; background: rgba(0,212,160,0.15); border-color: rgba(0,212,160,0.3); }
  button.nav-link { background: transparent; }
  button.nav-link:hover { background: rgba(255,255,255,0.05); }
  button.nav-link.active { background: rgba(0,212,160,0.15); }

  .nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .nav-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }

  .lang-wrap { display: flex; align-items: center; gap: 0; }
  .lang-btn {
    padding: 6px 12px; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; border: none; background: transparent;
    color: #94a3b8; font-family: 'Inter', sans-serif;
    letter-spacing: 0.04em; transition: all 0.2s ease;
  }
  .lang-btn.active { color: #00d4a0; }
  .lang-btn:hover:not(.active) { color: #e2e8f0; }
  .lang-sep { color: #475569; font-weight: 400; margin: 0 2px; }

  .conn-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 8px; font-size: 0.82rem; font-weight: 500;
    cursor: pointer; font-family: 'Inter', sans-serif;
    background: transparent; color: #ffffff;
    border: 1.5px solid rgba(255,255,255,0.3);
    transition: all 0.2s ease; white-space: nowrap;
  }
  .conn-btn:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }

  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 6px; font-size: 0.76rem; font-weight: 500;
    cursor: pointer; font-family: 'Inter', sans-serif;
    border: 1px solid #1F2937; background: transparent;
    color: #64748B; transition: color 0.15s, border-color 0.15s;
  }
  .back-btn:hover { color: #F1F5F9; border-color: #374151; }

  /* ── Hamburger ── */
  .hbg {
    display: none;
    flex-direction: column; justify-content: center; align-items: center;
    gap: 4px; width: 34px; height: 34px;
    background: transparent; border: 1px solid rgba(255,255,255,0.15);
    border-radius: 7px; cursor: pointer;
    transition: all 0.2s ease;
    padding: 0; flex-shrink: 0;
  }
  .hbg:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }
  .hbg-bar {
    width: 14px; height: 1.5px;
    background: #94a3b8; border-radius: 2px;
    transition: all 0.22s ease; display: block;
  }

  /* ── Backdrop ── */
  .sidebar-backdrop {
    display: none;
    position: fixed; inset: 0; z-index: 199;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .sidebar-backdrop.open {
    display: block;
    opacity: 1;
  }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; top: 0; left: 0; z-index: 200;
    width: 280px; height: 100vh;
    background: #0d1424;
    border-right: 1px solid rgba(255,255,255,0.08);
    display: flex; flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  .sidebar.open { transform: translateX(0); }

  .sidebar-header {
    height: 56px; display: flex; align-items: center;
    justify-content: space-between; padding: 0 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
  }
  .sidebar-logo {
    display: flex; align-items: center; gap: 9px; cursor: pointer;
  }
  .sidebar-logo-box {
    width: 26px; height: 26px; background: #00d4a0;
    border-radius: 5px; display: flex; align-items: center;
    justify-content: center; font-size: 0.6rem; font-weight: 800; color: #0a0f1a;
  }
  .sidebar-brand { font-size: 0.85rem; font-weight: 700; color: #ffffff; }
  .sidebar-brand span { color: #00d4a0; }

  .sidebar-close {
    width: 30px; height: 30px; border-radius: 6px;
    background: transparent; border: 1px solid rgba(255,255,255,0.15);
    color: #94a3b8; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s ease; line-height: 1;
  }
  .sidebar-close:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; border-color: rgba(255,255,255,0.25); }

  .sidebar-body {
    flex: 1; padding: 24px 16px; display: flex; flex-direction: column; gap: 4px;
    overflow-y: auto;
  }

  .sidebar-link {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 8px;
    font-size: 0.88rem; font-weight: 500; color: #94a3b8;
    background: transparent; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
    text-decoration: none; text-align: left; width: 100%;
  }
  .sidebar-link:hover { color: #e2e8f0; background: rgba(255,255,255,0.08); }
  .sidebar-link.active { color: #00d4a0; background: rgba(0,212,160,0.1); }
  .sidebar-link-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }

  .sidebar-sep {
    height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0;
  }

  .sidebar-footer {
    padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
  }
  .sidebar-conn {
    width: 100%; padding: 11px 16px; border-radius: 8px;
    background: rgba(0,212,160,0.1); color: #00d4a0;
    border: 1px solid rgba(0,212,160,0.25);
    font-size: 0.85rem; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    margin-bottom: 12px;
  }
  .sidebar-conn:hover { background: rgba(0,212,160,0.15); border-color: rgba(0,212,160,0.35); }
  .sidebar-langs {
    display: flex; gap: 8px;
  }
  .sidebar-lang-btn {
    flex: 1; padding: 7px; border-radius: 6px;
    font-size: 0.75rem; font-weight: 600; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.15); background: transparent;
    color: #94a3b8; font-family: 'Inter', sans-serif;
    transition: all 0.2s ease; text-align: center;
  }
  .sidebar-lang-btn.active { background: rgba(0,212,160,0.15); color: #00d4a0; border-color: rgba(0,212,160,0.3); }
  .sidebar-lang-btn:hover:not(.active) { border-color: rgba(255,255,255,0.25); color: #e2e8f0; }

  @media(max-width: 768px) {
    .nav-inner { padding: 0 16px; }
    .nav-center,
    .nav-right .conn-btn,
    .nav-right .lang-wrap,
    .nav-right .nav-divider,
    .nav-right .back-btn { display: none !important; }
    .hbg { display: flex !important; }
  }
`;

const Navigation = ({ lang = 'fr', onLangChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeLang, setActiveLang] = useState(lang);
  const [open, setOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const setLang = (l) => { setActiveLang(l); if (onLangChange) onLangChange(l); };
  const close = () => setOpen(false);
  const go = (path) => { close(); navigate(path); };

  return (
    <>
      <style>{css}</style>

      {/* Backdrop */}
      <div className={`sidebar-backdrop${open ? ' open' : ''}`} onClick={close} />

      {/* Sidebar */}
      <div className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => go('/')}>
            <div className="sidebar-logo-box">ST</div>
            <span className="sidebar-brand">SIMPL-<span>TVA</span></span>
          </div>
          <button className="sidebar-close" onClick={close}>✕</button>
        </div>

        <div className="sidebar-body">
          {isHome ? (
            <>
              <a href="#features" className="sidebar-link" onClick={close}>
                <span className="sidebar-link-icon">🛠</span> Outils
              </a>
              <a href="#how" className="sidebar-link" onClick={close}>
                <span className="sidebar-link-icon">📖</span> Guide
              </a>
            </>
          ) : (
            <button className="sidebar-link" onClick={() => go('/')}>
              <span className="sidebar-link-icon">←</span> Accueil
            </button>
          )}

          <div className="sidebar-sep" />

          <button className={`sidebar-link${location.pathname === '/generateur' ? ' active' : ''}`} onClick={() => go('/generateur')}>
            <span className="sidebar-link-icon">⚡</span> Générateur EDI
          </button>
          <button className={`sidebar-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={() => go('/contact')}>
            <span className="sidebar-link-icon">📞</span> Contact
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-conn" onClick={close}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Connexion
          </button>
          <div className="sidebar-langs">
            <button className={`sidebar-lang-btn${activeLang === 'fr' ? ' active' : ''}`} onClick={() => setLang('fr')}>FR</button>
            <button className={`sidebar-lang-btn${activeLang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <div className="nav-logo-box">ST</div>
            <span className="nav-brand">SIMPL-<span>TVA</span></span>
          </div>

          {isHome && (
            <div className="nav-center">
              <a href="#features" className="nav-link">Outils</a>
              <a href="#how" className="nav-link">Guide</a>
            </div>
          )}
          
          {!isHome && (
            <div className="nav-center">
              <button className={`nav-link${location.pathname === '/generateur' ? ' active' : ''}`} onClick={() => navigate('/generateur')} style={{ border: 'none' }}>Générateur</button>
              <button className={`nav-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={() => navigate('/contact')} style={{ border: 'none' }}>Contact</button>
            </div>
          )}

          <div className="nav-right">
            {!isHome && (
              <button className="back-btn" onClick={() => navigate('/')}>← Accueil</button>
            )}
            <div className="lang-wrap">
              <button className={`lang-btn${activeLang === 'fr' ? ' active' : ''}`} onClick={() => setLang('fr')}>FR</button>
              <span className="lang-sep">|</span>
              <button className={`lang-btn${activeLang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
            <div className="nav-divider" />
            <button className="conn-btn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Connexion
            </button>
            <button className="hbg" onClick={() => setOpen(true)} aria-label="Menu">
              <span className="hbg-bar" />
              <span className="hbg-bar" />
              <span className="hbg-bar" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
