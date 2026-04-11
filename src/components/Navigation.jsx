import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .nav-root {
    position: sticky; top: 0; z-index: 100;
    width: 100%; height: 56px;
    display: flex; align-items: center;
    font-family: 'Inter', system-ui, sans-serif;
    transition: background 0.25s, border-color 0.25s;
  }
  .nav-root.scrolled {
    background: rgba(11,15,25,0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid #1F2937;
  }
  .nav-root.top {
    background: transparent;
    border-bottom: 1px solid transparent;
  }
  .nav-inner {
    width: 100%; padding: 0 48px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 9px;
    cursor: pointer; flex-shrink: 0;
  }
  .nav-logo-box {
    width: 28px; height: 28px;
    background: #2563EB; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 800; color: #fff;
  }
  .nav-brand {
    font-size: 0.9rem; font-weight: 700;
    color: #F9FAFB; letter-spacing: -0.3px;
  }
  .nav-brand span { color: #60A5FA; }

  .nav-center {
    display: flex; align-items: center; gap: 2px;
    position: absolute; left: 50%; transform: translateX(-50%);
  }
  .nav-link {
    padding: 5px 13px; border-radius: 6px;
    font-size: 0.81rem; font-weight: 500; color: #64748B;
    background: transparent; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.15s; white-space: nowrap;
    text-decoration: none; display: inline-flex; align-items: center;
  }
  .nav-link:hover { color: #F1F5F9; }

  .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .lang-wrap { display: flex; align-items: center; }
  .lang-btn {
    padding: 3px 8px; font-size: 0.68rem; font-weight: 600;
    cursor: pointer; border: none; background: transparent;
    color: #475569; font-family: 'Inter', sans-serif;
    letter-spacing: 0.04em; transition: color 0.15s; border-radius: 4px;
  }
  .lang-btn.active { color: #60A5FA; }
  .lang-btn:hover:not(.active) { color: #94A3B8; }
  .lang-sep { color: #1E2D4A; font-size: 0.55rem; }

  .nav-divider { width: 1px; height: 14px; background: #1F2937; }

  .conn-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 6px;
    font-size: 0.78rem; font-weight: 600;
    cursor: pointer; font-family: 'Inter', sans-serif;
    background: #2563EB; color: #fff; border: none;
    transition: background 0.15s; white-space: nowrap;
  }
  .conn-btn:hover { background: #3B82F6; }

  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 6px;
    font-size: 0.76rem; font-weight: 500; cursor: pointer;
    font-family: 'Inter', sans-serif;
    border: 1px solid #1F2937; background: transparent;
    color: #64748B; transition: color 0.15s, border-color 0.15s;
  }
  .back-btn:hover { color: #F1F5F9; border-color: #374151; }

  /* ── Hamburger button ── */
  .hbg {
    display: none;
    flex-direction: column; justify-content: center; align-items: center;
    gap: 4px; width: 34px; height: 34px;
    background: transparent; border: 1px solid #1F2937;
    border-radius: 7px; cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    padding: 0; flex-shrink: 0;
  }
  .hbg:hover { border-color: #374151; background: rgba(255,255,255,0.04); }
  .hbg-bar {
    width: 14px; height: 1.5px;
    background: #9CA3AF; border-radius: 2px;
    transition: all 0.2s ease;
    display: block;
  }
  .hbg.open .hbg-bar:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
  .hbg.open .hbg-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hbg.open .hbg-bar:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

  /* ── Drawer ── */
  .drawer {
    position: fixed; inset: 0; z-index: 200;
    display: flex; flex-direction: column;
    background: #0B0F19;
    transform: translateY(-100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
  }
  .drawer.open { transform: translateY(0); }

  .drawer-header {
    height: 56px; display: flex; align-items: center;
    justify-content: space-between; padding: 0 20px;
    border-bottom: 1px solid #1F2937; flex-shrink: 0;
  }
  .drawer-logo {
    display: flex; align-items: center; gap: 9px;
  }
  .drawer-logo-box {
    width: 26px; height: 26px; background: #2563EB;
    border-radius: 5px; display: flex; align-items: center;
    justify-content: center; font-size: 0.6rem; font-weight: 800; color: #fff;
  }
  .drawer-brand { font-size: 0.85rem; font-weight: 700; color: #F9FAFB; }
  .drawer-brand span { color: #60A5FA; }

  .drawer-body {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 4px; padding: 32px 24px;
  }
  .drawer-nav-link {
    width: 100%; max-width: 320px;
    padding: 14px 20px; border-radius: 10px;
    font-size: 1rem; font-weight: 600; color: #94A3B8;
    background: transparent; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.15s, background 0.15s;
    text-align: left; text-decoration: none;
    display: flex; align-items: center; gap: 10px;
  }
  .drawer-nav-link:hover { color: #F1F5F9; background: rgba(255,255,255,0.04); }

  .drawer-divider {
    width: 100%; max-width: 320px;
    height: 1px; background: #1F2937; margin: 12px 0;
  }

  .drawer-conn {
    width: 100%; max-width: 320px;
    padding: 13px 20px; border-radius: 10px;
    background: #2563EB; color: #fff; border: none;
    font-size: 0.95rem; font-weight: 700; cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .drawer-conn:hover { background: #3B82F6; }

  .drawer-footer {
    padding: 20px 24px; border-top: 1px solid #1F2937;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    flex-shrink: 0;
  }
  .drawer-lang-btn {
    padding: 6px 18px; border-radius: 6px;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    border: 1px solid #1F2937; background: transparent;
    color: #475569; font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }
  .drawer-lang-btn.active { background: #2563EB; color: #fff; border-color: #2563EB; }
  .drawer-lang-btn:hover:not(.active) { border-color: #374151; color: #94A3B8; }

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

  const go = (path) => { setOpen(false); if (path) navigate(path); };

  return (
    <>
      <style>{css}</style>

      {/* ── Drawer ── */}
      <div className={`drawer${open ? ' open' : ''}`}>
        {/* Drawer header — mirrors navbar */}
        <div className="drawer-header">
          <div className="drawer-logo" onClick={() => go('/')}>
            <div className="drawer-logo-box">ST</div>
            <span className="drawer-brand">SIMPL-<span>TVA</span></span>
          </div>
          {/* Close = animated hamburger */}
          <button className={`hbg${open ? ' open' : ''}`} onClick={() => setOpen(false)} aria-label="Fermer">
            <span className="hbg-bar" />
            <span className="hbg-bar" />
            <span className="hbg-bar" />
          </button>
        </div>

        {/* Drawer body */}
        <div className="drawer-body">
          {isHome ? (
            <>
              <a href="#features" className="drawer-nav-link" onClick={() => setOpen(false)}>
                <span>🛠</span> Outils
              </a>
              <a href="#how" className="drawer-nav-link" onClick={() => setOpen(false)}>
                <span>📖</span> Guide
              </a>
            </>
          ) : (
            <button className="drawer-nav-link" onClick={() => go('/')}>
              <span>←</span> Accueil
            </button>
          )}

          <div className="drawer-divider" />

          <button className="drawer-conn" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Connexion
          </button>
        </div>

        {/* Drawer footer — lang switcher */}
        <div className="drawer-footer">
          <button className={`drawer-lang-btn${activeLang === 'fr' ? ' active' : ''}`} onClick={() => setLang('fr')}>FR</button>
          <button className={`drawer-lang-btn${activeLang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
      </div>

      {/* ── Navbar ── */}
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
            <button className={`hbg${open ? ' open' : ''}`} onClick={() => setOpen(true)} aria-label="Menu">
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
