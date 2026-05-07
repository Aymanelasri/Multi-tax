import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .nav-root {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
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

  .user-dropdown {
    position: relative;
    display: inline-block;
    z-index: 1001;
  }
  .user-button {
    display: flex !important;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 8px;
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.2);
    color: #ffffff;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .user-button:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
  .user-avatar {
    width: 24px; height: 24px; border-radius: 50%;
    background: #00d4a0; color: #0a0f1a;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
  }
  .dropdown-arrow {
    transition: transform 0.2s ease;
  }
  .user-dropdown:hover .dropdown-arrow {
    transform: rotate(180deg);
  }
  .dropdown-menu {
    position: absolute; top: 100%; right: 0;
    margin-top: 8px; min-width: 200px;
    background: #141d2e; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 1002;
    display: block !important;
  }
  .dropdown-header {
    padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .user-info strong {
    display: block; color: #ffffff; font-size: 0.85rem; font-weight: 600;
  }
  .user-info small {
    color: #94a3b8; font-size: 0.75rem;
  }
  .dropdown-divider {
    height: 1px; background: rgba(255,255,255,0.08); margin: 4px 0;
  }
  .dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; color: #e2e8f0; font-size: 0.82rem;
    text-decoration: none; cursor: pointer;
    transition: all 0.2s ease; border: none; background: transparent;
    width: 100%; text-align: left; font-family: 'Inter', sans-serif;
  }
  .dropdown-item:hover {
    background: rgba(255,255,255,0.08); color: #ffffff;
  }
  .logout-item {
    color: #ef4444;
  }
  .logout-item:hover {
    background: rgba(239,68,68,0.1); color: #ef4444;
  }
  .auth-buttons {
    display: flex; align-items: center; gap: 8px;
  }
  .btn {
    padding: 8px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: 500;
    text-decoration: none; cursor: pointer; font-family: 'Inter', sans-serif;
    transition: all 0.2s ease; border: none;
  }
  .btn-secondary {
    background: transparent; color: #94a3b8;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .btn-secondary:hover {
    color: #ffffff; border-color: rgba(255,255,255,0.4);
  }
  .btn-primary {
    background: #00d4a0; color: #0a0f1a; font-weight: 600;
  }
  .btn-primary:hover {
    background: #00c497;
  }

  /* Tablet responsive fix (753px - 1153px) */
  @media (min-width: 753px) and (max-width: 1153px) {
    .nav-inner {
      padding: 0 32px;
      justify-content: space-between;
    }
    .nav-center {
      gap: 8px;
    }
    .nav-link {
      padding: 6px 12px;
      font-size: 0.75rem;
    }
    .conn-btn {
      padding: 7px 14px;
      font-size: 0.76rem;
    }
    .lang-btn {
      padding: 5px 10px;
      font-size: 0.72rem;
    }
  }

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

  /* CRITICAL: Force hamburger visibility on mobile */
  @media(max-width: 768px) {
    .nav-inner { padding: 0 16px; }
    .nav-center,
    .nav-right .conn-btn,
    .nav-right .lang-wrap,
    .nav-right .nav-divider,
    .nav-right .back-btn { display: none !important; }
    .hbg { display: flex !important; }
    
    /* Mobile dropdown fixes */
    .user-dropdown {
      position: relative;
      z-index: 1001;
    }
    .dropdown-menu {
      position: fixed;
      max-width: 200px;
      bottom: auto;
      right: 16px;
      top: 56px;
      z-index: 9999 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    }
    .dropdown-item {
      padding: 12px 16px;
      font-size: 0.85rem;
      min-height: 44px;
      display: flex;
      align-items: center;
    }
  }

  /* EXTRA SMALL SCREENS: 300px - 400px */
  @media(max-width: 400px) {
    .nav-inner {
      padding: 0 12px !important;
    }
    
    .nav-logo {
      gap: 6px !important;
    }
    
    .nav-logo-box {
      width: 26px !important;
      height: 26px !important;
      font-size: 0.65rem !important;
    }
    
    .nav-brand {
      font-size: 0.85rem !important;
    }
    
    .hbg {
      display: flex !important;
      width: 32px !important;
      height: 32px !important;
      gap: 3px !important;
    }
    
    .hbg-bar {
      width: 13px !important;
      height: 1.5px !important;
    }
    
    .user-button {
      padding: 5px 10px !important;
      font-size: 0.75rem !important;
    }
    
    .user-avatar {
      width: 22px !important;
      height: 22px !important;
      font-size: 0.65rem !important;
    }
    
    .dropdown-menu {
      right: 12px !important;
      max-width: 180px !important;
    }
  }

  /* ULTRA SMALL: 300px - 320px */
  @media(max-width: 320px) {
    .nav-inner {
      padding: 0 10px !important;
    }
    
    .nav-logo {
      gap: 5px !important;
    }
    
    .nav-logo-box {
      width: 24px !important;
      height: 24px !important;
      font-size: 0.6rem !important;
    }
    
    .nav-brand {
      font-size: 0.8rem !important;
    }
    
    .hbg {
      display: flex !important;
      width: 30px !important;
      height: 30px !important;
      gap: 3px !important;
    }
    
    .hbg-bar {
      width: 12px !important;
      height: 1.5px !important;
    }
    
    .user-button {
      padding: 4px 8px !important;
      font-size: 0.7rem !important;
      gap: 6px !important;
    }
    
    .user-avatar {
      width: 20px !important;
      height: 20px !important;
      font-size: 0.6rem !important;
    }
    
    .user-name {
      display: none !important;
    }
    
    .dropdown-arrow {
      width: 10px !important;
      height: 10px !important;
    }
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
  .sidebar-disconnect {
    width: 100%; padding: 12px 16px; border-radius: 8px;
    background: rgba(239,68,68,0.1); color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.2);
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'Inter', sans-serif; transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 12px; text-align: center;
  }
  .sidebar-disconnect:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }
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

  /* Sidebar responsive */
  @media(max-width: 400px) {
    .sidebar {
      width: 260px !important;
    }
    
    .sidebar-logo-box {
      width: 24px !important;
      height: 24px !important;
      font-size: 0.55rem !important;
    }
    
    .sidebar-brand {
      font-size: 0.8rem !important;
    }
    
    .sidebar-link {
      padding: 10px 12px !important;
      font-size: 0.82rem !important;
    }
    
    .sidebar-conn,
    .sidebar-disconnect {
      padding: 10px 14px !important;
      font-size: 0.8rem !important;
    }
  }

  @media(max-width: 320px) {
    .sidebar {
      width: 240px !important;
    }
    
    .sidebar-header {
      padding: 0 16px !important;
    }
    
    .sidebar-body {
      padding: 20px 14px !important;
    }
    
    .sidebar-link {
      padding: 9px 10px !important;
      font-size: 0.78rem !important;
      gap: 10px !important;
    }
    
    .sidebar-footer {
      padding: 14px !important;
    }
  }

  /* Generator tooltip */
  .gen-tooltip-wrap {
    position: relative;
    display: inline-block;
  }
  .gen-tooltip {
    position: absolute; top: 100%; left: 50%; transform: translateX(-50%); 
    margin-top: 8px; min-width: 200px;
    background: #141d2e; border: 1px solid rgba(0,212,160,0.3);
    border-radius: 8px; padding: 12px 14px;
    font-size: 0.78rem; color: #e2e8f0; white-space: nowrap;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 1000; pointer-events: none;
  }
  .gen-tooltip-link {
    color: #00d4a0; text-decoration: none; cursor: pointer;
    font-weight: 600; display: block; margin-top: 6px;
    background: transparent; border: none; font-size: 0.78rem;
    padding: 0; font-family: inherit;
  }
  .gen-tooltip-link:hover { text-decoration: underline; }

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

`;

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang, t } = useLang();
  const { user, logout, isAuthenticated, isApproved, isPending } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showGeneratorTooltip, setShowGeneratorTooltip] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'how'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(`#${sectionId}`);
            return;
          }
        }
      }
      setActiveSection('');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to check if link is active
  const isActive = (path) => {
    if (path.startsWith('#')) {
      // Check both hash and scroll position
      return location.hash === path || activeSection === path;
    }
    return location.pathname === path;
  };

  // Define fixed navigation links based on auth state
  const getNavLinks = () => {
    if (isAuthenticated && isApproved) {
      // Logged in and approved: [Accueil, Sociétés, Générateur, Historique, Contact]
      return [
        { label: t('nav_home'), path: '/', type: 'route' },
        { label: t('nav_societes'), path: '/societes', type: 'route' },
        { label: t('nav_generator'), path: '/generateur', type: 'route', hasTooltip: true },
        { label: t('nav_historique') || 'Historique', path: '/historique', type: 'route' },
        { label: t('nav_contact'), path: '/contact', type: 'route' }
      ];
    } else {
      // Not logged in or pending: [Accueil, Outils, Guide, Contact]
      return [
        { label: t('nav_home'), path: '/', type: 'route' },
        { label: t('nav_tools'), path: '#features', type: 'hash' },
        { label: t('nav_guide'), path: '#how', type: 'hash' },
        { label: t('nav_contact'), path: '/contact', type: 'route' }
      ];
    }
  };

  const navLinks = getNavLinks();

  // Close dropdown when route changes
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  // Check if no companies exist
  const hasNoCompanies = () => {
    try {
      const societes = JSON.parse(localStorage.getItem('edi_societes') || '[]');
      return societes.length === 0;
    } catch {
      return true;
    }
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

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
          {navLinks.map((link, index) => {
            const icon = index === 0 ? '🏠' : index === 1 ? (isApproved ? '🏢' : '🛠') : index === 2 ? (isApproved ? '⚡' : '📖') : index === 3 ? (isApproved ? '📋' : '📞') : '📞';
            
            if (link.type === 'hash') {
              return (
                <button 
                  key={index}
                  className={`sidebar-link${isActive(link.path) ? ' active' : ''}`}
                  onClick={() => {
                    close();
                    navigate('/');
                    setTimeout(() => {
                      document.querySelector(link.path)?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  <span className="sidebar-link-icon">{icon}</span> {link.label}
                </button>
              );
            } else {
              return (
                <button 
                  key={index}
                  className={`sidebar-link${isActive(link.path) ? ' active' : ''}`}
                  onClick={() => go(link.path)}
                >
                  <span className="sidebar-link-icon">{icon}</span> {link.label}
                </button>
              );
            }
          })}
        </div>

        <div className="sidebar-footer">
          {(isAuthenticated || isPending) ? (
            <>
              <button className="sidebar-disconnect" onClick={async () => {
                await logout();
                close();
                navigate('/');
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z"/>
                  <path d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z"/>
                </svg>
                {t('auth_logout')}
              </button>
            </>
          ) : (
            <button className="sidebar-conn" onClick={() => { navigate('/login'); close(); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {t('nav_login')}
            </button>
          )}
          <div className="sidebar-langs">
            <button className={`sidebar-lang-btn${lang === 'FR' ? ' active' : ''}`} onClick={toggleLang}>FR</button>
            <button className={`sidebar-lang-btn${lang === 'EN' ? ' active' : ''}`} onClick={toggleLang}>EN</button>
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

          <div className="nav-center">
            {navLinks.map((link, index) => {
              if (link.type === 'hash') {
                return (
                  <button 
                    key={index}
                    className={`nav-link${isActive(link.path) ? ' active' : ''}`}
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => {
                          document.querySelector(link.path)?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      } else {
                        document.querySelector(link.path)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {link.label}
                  </button>
                );
              } else if (link.hasTooltip) {
                return (
                  <div key={index} className="gen-tooltip-wrap" style={{ display: 'inline-block', border: 'none' }}>
                    <button 
                      className={`nav-link${isActive(link.path) ? ' active' : ''}`}
                      onClick={() => navigate(link.path)}
                      style={{ border: 'none' }}
                      onMouseEnter={() => hasNoCompanies() && setShowGeneratorTooltip(true)}
                      onMouseLeave={() => setShowGeneratorTooltip(false)}
                    >
                      {link.label}
                    </button>
                    {showGeneratorTooltip && hasNoCompanies() && (
                      <div className="gen-tooltip">
                        💡 {t('nav_generator_tooltip')}
                        <button onClick={() => { navigate('/societes'); setShowGeneratorTooltip(false); }} className="gen-tooltip-link">
                          {t('nav_generator_tooltip_link')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <button 
                    key={index}
                    className={`nav-link${isActive(link.path) ? ' active' : ''}`}
                    onClick={() => navigate(link.path)}
                    style={{ border: 'none' }}
                  >
                    {link.label}
                  </button>
                );
              }
            })}
          </div>

          <div className="nav-right">
            <div className="lang-wrap">
              <button className={`lang-btn${lang === 'FR' ? ' active' : ''}`} onClick={toggleLang}>FR</button>
              <span className="lang-sep">|</span>
              <button className={`lang-btn${lang === 'EN' ? ' active' : ''}`} onClick={toggleLang}>EN</button>
            </div>
            <div className="nav-divider" />
            {(isAuthenticated || isPending) ? (
              <div className="user-dropdown">
                <button 
                  className="user-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  onMouseEnter={(e) => {
                    // Only enable hover on desktop (when not on mobile)
                    if (window.innerWidth > 768) {
                      setShowDropdown(true);
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Only enable hover close on desktop
                    if (window.innerWidth > 768 && showDropdown) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY;
                      // If mouse leaves upward, close dropdown
                      if (y < rect.top) {
                        setShowDropdown(false);
                      }
                    }
                  }}
                >
                  <span className="user-avatar">{(user?.name || user?.firstname || 'U').charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user?.name || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'User'}</span>
                  <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-header">
                      <div className="user-info">
                        <strong>{user?.name || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'User'}</strong>
                        <small>{user?.email}</small>
                        {isPending && (
                          <div style={{ 
                            marginTop: '4px', 
                            padding: '2px 8px', 
                            background: 'rgba(251,191,36,0.15)', 
                            color: '#fcd34d', 
                            fontSize: '10px', 
                            borderRadius: '20px',
                            display: 'inline-block'
                          }}>
                            En attente
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM8 9a5 5 0 00-5 5h10a5 5 0 00-5-5z" fill="currentColor"/>
                      </svg>
                      {t('nav_profile')}
                    </button>
                    <button className="dropdown-item" onClick={() => {
                      setShowDropdown(false);
                      navigate('/historique');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" fill="currentColor"/>
                        <path d="M5 4h6M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      </svg>
                      {t('nav_declarations')}
                    </button>
                    <button className="dropdown-item" onClick={() => {
                      setShowDropdown(false);
                      navigate('/declarations');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M2 3h12a1 1 0 011 1v9a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z" fill="currentColor" opacity="0.3"/>
                        <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <circle cx="12" cy="12" r="3" fill="#00d4a0"/>
                        <path d="M12 10.5v1.5l1 1" stroke="#0a0f1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
                      </svg>
                      {t('nav_historique_societes') || 'Historique des Sociétés'}
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={async () => {
                      setShowDropdown(false);
                      await logout();
                      navigate('/');
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z" fill="currentColor"/>
                        <path d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z" fill="currentColor"/>
                      </svg>
                      {t('auth_logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <a href="/login" className="btn btn-secondary conn-btn">{t('auth_login')}</a>
              </div>
            )}
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
