import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import NewsTicker from '../components/NewsTicker';

const C = {
  bg: '#0a0e27', nav: '#0f1426', card: '#111a2e', card2: '#0d1220',
  border: '#1a2540', accent: '#10b981', accentBright: '#34d399',
  text: '#f0f4f8', muted: '#94a3b8', dark: '#1e293b',
};

// ── translations ──────────────────────────────────────────────────────────────
const T = {
  fr: {
    heroTitle: ['Générez vos fichiers', 'EDI SIMPL-TVA', 'en quelques clics'],
    heroSub: 'Solution professionnelle pour la génération du Relevé des Déductions TVA conforme à la DGI Maroc. 100% local, aucune donnée envoyée.',
    heroCta1: '⚡ Commencer maintenant',
    heroCta2: 'Accéder à SIMPL →',
    statLabels: ['Utilisateurs actifs', 'Fichiers XML générés', 'Conforme DGI'],
    featLabel: 'PLATEFORME',
    featTitle: 'Tout ce dont vous avez besoin',
    featSub: 'Une suite complète d\'outils pour simplifier vos déclarations TVA.',
    features: [
      { icon: '⚡', title: 'Génération XML instantanée', desc: 'Produisez un fichier XML conforme DGI en moins de 2 secondes, prêt à compresser et envoyer.' },
      { icon: '🔒', title: '100% Local & Sécurisé', desc: 'Aucune donnée ne quitte votre navigateur. Zéro serveur, zéro risque de fuite.' },
      { icon: '👁️', title: 'Prévisualisation en temps réel', desc: 'Voyez le XML se construire ligne par ligne pendant que vous saisissez vos données.' },
      { icon: '📦', title: 'Import / Export JSON', desc: 'Sauvegardez vos fournisseurs et factures en modules réutilisables pour gagner du temps.' },
      { icon: '🏦', title: 'Multi-régimes TVA', desc: 'Mensuel, trimestriel, cessation — tous les régimes DGI Maroc sont pris en charge.' },
      { icon: '🧭', title: 'Interface guidée 3 étapes', desc: 'Identification → Factures → Génération. Simple, rapide, sans erreur.' },
    ],
    howLabel: 'PROCESSUS',
    howTitle: 'De la saisie au téléchargement',
    howSub: 'Trois étapes suffisent pour produire un fichier EDI prêt à envoyer sur SIMPL-TVA.',
    steps: [
      { num: '01', title: 'Identification fiscale', desc: 'Renseignez votre Identifiant Fiscal, l\'année, le régime et la période de déclaration.' },
      { num: '02', title: 'Saisie des factures', desc: 'Ajoutez vos lignes de factures fournisseurs avec les montants HT, TVA et les références.' },
      { num: '03', title: 'Export ZIP', desc: 'Validez, prévisualisez le XML et téléchargez votre archive ZIP prête pour SIMPL-TVA.' },
    ],
    howCta: 'Essayer maintenant →',
    testimonialsLabel: 'TÉMOIGNAGES',
    testimonialsTitle: 'Ce qu\'ils en pensent',
    testimonials: [
      { name: 'Karim B.', role: 'Expert-comptable, Casablanca', text: '"Enfin un outil simple et fiable pour générer les fichiers EDI. Je gagne un temps fou chaque trimestre."' },
      { name: 'Salma R.', role: 'Directrice financière, Rabat', text: '"100% local, aucune donnée envoyée — c\'est exactement ce dont on avait besoin pour rester conformes."' },
      { name: 'Youssef M.', role: 'Gérant PME, Marrakech', text: '"Interface claire, génération en 2 clics. Je recommande à tous mes collègues comptables."' },
    ],
    footerTagline: 'Solution EDI pour la déclaration TVA conforme à la DGI Maroc. 100% local et sécurisé.',
    footerNav: 'Navigation',
    footerLinks: ['Accueil', 'Générateur', 'Contact'],
    footerCopy: 'Conforme DGI Maroc — 2024-2026',
    footerPrivacy: 'Confidentialité',
  },
  en: {
    heroTitle: ['Generate your', 'EDI SIMPL-TVA', 'files in clicks'],
    heroSub: 'Professional solution for generating the VAT Deduction Statement compliant with DGI Morocco. 100% local, no data sent.',
    heroCta1: '⚡ Get started now',
    heroCta2: 'Access SIMPL →',
    statLabels: ['Active users', 'XML files generated', 'DGI compliant'],
    featLabel: 'PLATFORM',
    featTitle: 'Everything you need',
    featSub: 'A complete suite of tools to simplify your VAT declarations.',
    features: [
      { icon: '⚡', title: 'Instant XML generation', desc: 'Produce a DGI-compliant XML file in under 2 seconds, ready to compress and submit.' },
      { icon: '🔒', title: '100% Local & Secure', desc: 'No data leaves your browser. Zero server, zero risk of data leak.' },
      { icon: '👁️', title: 'Real-time preview', desc: 'Watch the XML build line by line as you enter your data.' },
      { icon: '📦', title: 'JSON Import / Export', desc: 'Save your suppliers and invoices as reusable modules to save time.' },
      { icon: '🏦', title: 'Multi-VAT regimes', desc: 'Monthly, quarterly, cessation — all DGI Morocco regimes supported.' },
      { icon: '🧭', title: '3-step guided interface', desc: 'Identification → Invoices → Generation. Simple, fast, error-free.' },
    ],
    howLabel: 'PROCESS',
    howTitle: 'From input to download',
    howSub: 'Three steps are enough to produce an EDI file ready to submit on SIMPL-TVA.',
    steps: [
      { num: '01', title: 'Tax identification', desc: 'Enter your Fiscal ID, year, regime and declaration period.' },
      { num: '02', title: 'Invoice entry', desc: 'Add your supplier invoice lines with HT, VAT amounts and references.' },
      { num: '03', title: 'ZIP export', desc: 'Validate, preview the XML and download your ZIP archive ready for SIMPL-TVA.' },
    ],
    howCta: 'Try it now →',
    testimonialsLabel: 'TESTIMONIALS',
    testimonialsTitle: 'What they think',
    testimonials: [
      { name: 'Karim B.', role: 'Accountant, Casablanca', text: '"Finally a simple and reliable tool to generate EDI files. I save so much time every quarter."' },
      { name: 'Salma R.', role: 'CFO, Rabat', text: '"100% local, no data sent — exactly what we needed to stay compliant."' },
      { name: 'Youssef M.', role: 'SME Manager, Marrakech', text: '"Clear interface, generation in 2 clicks. I recommend it to all my accounting colleagues."' },
    ],
    footerTagline: 'EDI solution for VAT declaration compliant with DGI Morocco. 100% local and secure.',
    footerNav: 'Navigation',
    footerLinks: ['Home', 'Generator', 'Contact'],
    footerCopy: 'DGI Morocco compliant — 2024-2026',
    footerPrivacy: 'Privacy',
  },
};

// ── css ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:${C.bg};color:${C.text};font-family:'Inter',system-ui,-apple-system,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;letter-spacing:-.01em}
  body::-webkit-scrollbar{width:8px}
  body::-webkit-scrollbar-track{background:transparent}
  body::-webkit-scrollbar-thumb{background:${C.accent};border-radius:10px;transition:background .2s}
  body::-webkit-scrollbar-thumb:hover{background:${C.accentBright}}
  a{text-decoration:none;color:inherit}

  .grid-bg{position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,rgba(16,185,129,0.05) 0%,rgba(16,185,129,0.02) 50%,transparent 100%),linear-gradient(90deg,rgba(16,185,129,0.03) 1px,transparent 1px),linear-gradient(rgba(16,185,129,0.03) 1px,transparent 1px);background-size:100% 100%,80px 80px,80px 80px;pointer-events:none;z-index:0}
  .wrap{position:relative;z-index:1}

  /* ✅ Section isolation styles - prevent layout bleed from context state */
  section{isolation:isolate;position:relative;z-index:1}
  [id="features"]{display:block;isolation:isolate}
  [id="how"]{display:block;isolation:isolate}
  
  .featured-section{background:${C.bg};isolation:isolate;z-index:1;position:relative}


  /* buttons */
  .btn-p{padding:13px 32px;border-radius:10px;background:linear-gradient(135deg,${C.accent},${C.accentBright});color:#000;border:none;font-weight:650;font-size:.93rem;cursor:pointer;transition:all .25s cubic-bezier(0.34,1.56,0.64,1);font-family:'Inter',sans-serif;letter-spacing:-.02em;box-shadow:0 8px 24px rgba(16,185,129,0.2),inset 0 1px 0 rgba(255,255,255,0.2);position:relative;overflow:hidden}
  .btn-p::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left .6s}
  .btn-p:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(16,185,129,0.35),inset 0 1px 0 rgba(255,255,255,0.3)}
  .btn-p:hover::before{left:100%}
  .btn-p:active{transform:translateY(0)}
  
  .btn-o{padding:12px 28px;border-radius:10px;background:transparent;color:${C.text};border:1.5px solid ${C.border};font-weight:550;font-size:.92rem;cursor:pointer;transition:all .25s ease;font-family:'Inter',sans-serif;letter-spacing:-.02em}
  .btn-o:hover{border-color:${C.accent};color:${C.accentBright};background:rgba(16,185,129,0.05);transform:translateY(-2px);box-shadow:0 8px 24px rgba(16,185,129,0.15)}

  /* animations */
  .reveal{opacity:0;transform:translateY(25px);transition:opacity .6s cubic-bezier(0.2,0.6,0.3,1),transform .6s cubic-bezier(0.2,0.6,0.3,1)}
  .reveal.visible{opacity:1;transform:translateY(0)}
  .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}
  .d4{transition-delay:.4s}.d5{transition-delay:.5s}

  /* text effects */
  .neon{background:linear-gradient(135deg,${C.accent},${C.accentBright});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:0 0 30px rgba(16,185,129,0.2);filter:drop-shadow(0 0 20px rgba(16,185,129,0.3))}
  .glass{background:rgba(17,26,46,0.5);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(74,222,128,0.12)}

  /* premium feature cards */
  .bento {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .feat-card {
    border-radius: 16px;
    padding: 28px;
    transition: all 0.2s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
    background: #141d2e;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .feat-card:hover {
    border-color: rgba(0, 212, 160, 0.3);
  }
  
  .feat-card-icon {
    font-size: 32px;
    margin-bottom: 16px;
    display: block;
    transition: transform 0.2s ease;
  }
  
  .feat-card:hover .feat-card-icon {
    transform: scale(1.08);
  }
  
  .feat-card-title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  
  .feat-card-desc {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.7;
    letter-spacing: -0.01em;
  }

  /* timeline */
  .timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:0;position:relative}
  .timeline::before{content:'';position:absolute;top:32px;left:calc(100%/6);right:calc(100%/6);height:2px;background:linear-gradient(90deg,transparent,${C.accent} 0%,${C.accent} 100%,transparent);box-shadow:0 0 20px rgba(16,185,129,0.3)}
  .tl-item{display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 24px;position:relative}
  .tl-dot{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.05));border:2px solid ${C.accent};display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;color:${C.accent};letter-spacing:.08em;margin-bottom:24px;position:relative;z-index:1;flex-shrink:0;box-shadow:0 0 32px rgba(16,185,129,0.3),inset 0 0 20px rgba(16,185,129,0.1)}
  .tl-dot::after{content:'';position:absolute;inset:0;border-radius:50%;animation:pulse 2s ease-in-out infinite;border:1px solid ${C.accent};opacity:0}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:0}50%{transform:scale(1.2);opacity:.5}}
  .tl-item-title{font-size:1.05rem;font-weight:700;color:${C.text};margin-bottom:12px}
  .tl-item-desc{font-size:.9rem;color:${C.muted};line-height:1.7}

  /* hero section */
  .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:100px;align-items:center}
  .hero-h1{font-size:4.2rem;font-weight:900;line-height:1.1;letter-spacing:-3px;background:linear-gradient(135deg,${C.text},${C.muted});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hero-p{font-size:1.05rem;color:${C.muted};line-height:1.8;letter-spacing:-.02em}

  @media(max-width:1200px){
    .hero-grid{gap:60px}
    .hero-h1{font-size:3.6rem}
  }
  @media(max-width:768px){
    .hero-grid{grid-template-columns:1fr!important;gap:32px!important}
    .mockup-col{display:none!important}
    .hero-h1{font-size:2.2rem!important;letter-spacing:-1.5px!important}
    .bento{grid-template-columns:1fr!important}
    .testimonials-grid{grid-template-columns:1fr!important}
    .timeline{grid-template-columns:1fr!important}
    .timeline::before{display:none}
    .tl-dot::after{display:none}
    .stats-row{flex-direction:column!important;gap:28px!important}
    .stats-sep{display:none!important}
    .feat-card{padding:20px!important}
    .btn-p,.btn-o{width:100%!important;justify-content:center!important}
  }
  @media(max-width:480px){
    .hero-h1{font-size:1.8rem!important;letter-spacing:-1px!important}
    .hero-p{font-size:.9rem!important}
  }
`;

// ── useCountUp ────────────────────────────────────────────────────────────────
const useCountUp = (target, duration = 2500) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let t0 = null;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setCount(Math.floor(easeOutCubic(p) * target));
      if (p < 1) requestAnimationFrame(step); else setCount(target);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return { count, ref };
};

const StatItem = ({ target, suffix, label, duration = 2500 }) => {
  const { count, ref } = useCountUp(target, duration);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #4ade80, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-3px', lineHeight: 1, textShadow: '0 0 40px rgba(74,222,128,0.3)', filter: 'drop-shadow(0 0 20px rgba(74,222,128,0.2))' }}>{count}{suffix}</div>
      <div style={{ fontSize: '0.85rem', color: C.muted, marginTop: 14, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
};

// ── reveal hook ───────────────────────────────────────────────────────────────
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((e) => e.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visible'); io.unobserve(x.target); } }), { threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
};

// ── TVA mockup ────────────────────────────────────────────────────────────────
const TVACard = ({ t }) => (
  <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 20, padding: 36, border: '1.5px solid rgba(74,222,128,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(74,222,128,0.15)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 4px 12px rgba(74,222,128,0.15))' }}>📋</span>
        <span style={{ fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #f0f4f8, #c0c7d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t === 'fr' ? 'Déclaration TVA' : 'VAT Declaration'}</span>
      </div>
      <span style={{ padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#000', fontSize: '0.7rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>{t === 'fr' ? '✓ Valide' : '✓ Valid'}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24, paddingBottom: 24, borderBottom: `1.5px solid rgba(74,222,128,0.1)` }}>
      {[['IF', '12345678'], [t === 'fr' ? 'Année' : 'Year', '2024'], [t === 'fr' ? 'Période' : 'Period', '3'], [t === 'fr' ? 'Régime' : 'Regime', t === 'fr' ? 'Mensuel' : 'Monthly']].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: C.muted, fontWeight: 500 }}>{k}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, background: 'linear-gradient(135deg, #f0f4f8, #c0c7d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{v}</span>
        </div>
      ))}
    </div>
    <div style={{ background: 'linear-gradient(135deg, rgba(10,14,27,0.9), rgba(20,28,50,0.8))', border: `1px solid rgba(74,222,128,0.15)`, borderRadius: 12, padding: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', lineHeight: 2, color: C.muted, overflow: 'auto', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)' }}>
      <div style={{ color: '#666' }}>&lt;DeclarationReleveDeduction&gt;</div>
      <div style={{ paddingLeft: 16, color: '#777' }}>
        <div><span style={{ color: '#10b981' }}>&lt;identifiantFiscal&gt;</span><span style={{ color: '#fbbf24' }}>12345678</span><span style={{ color: '#10b981' }}>&lt;/identifiantFiscal&gt;</span></div>
        <div><span style={{ color: '#10b981' }}>&lt;annee&gt;</span><span style={{ color: '#fbbf24' }}>2024</span><span style={{ color: '#10b981' }}>&lt;/annee&gt;</span></div>
        <div><span style={{ color: '#10b981' }}>&lt;periode&gt;</span><span style={{ color: '#fbbf24' }}>3</span><span style={{ color: '#10b981' }}>&lt;/periode&gt;</span></div>
        <div style={{ color: '#555' }}>  ...</div>
      </div>
      <div style={{ color: '#666' }}>&lt;/DeclarationReleveDeduction&gt;</div>
    </div>
    <div style={{ marginTop: 20, padding: '12px 18px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))', border: `1.5px solid rgba(16,185,129,0.3)`, fontSize: '0.85rem', color: C.accent, fontWeight: 700, textAlign: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.15)' }}>
      ✓ {t === 'fr' ? 'Fichier ZIP prêt' : 'ZIP file ready'}
    </div>
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { user, isAuthenticated } = useAuth();
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const tr = T[lang.toLowerCase()];
  useReveal();

  const handleRestrictedAccess = (path) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user && user.status !== 'approved') {
      setShowAccessMessage(true);
      setTimeout(() => setShowAccessMessage(false), 4000);
      return;
    }
    
    navigate(path);
  };

  const AccessMessage = () => {
    if (!showAccessMessage) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(20, 29, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '32px 40px',
        maxWidth: '480px',
        textAlign: 'center',
        zIndex: 1000,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#ef4444', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
          {lang === 'FR' ? 'Accès restreint' : 'Access Restricted'}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          {lang === 'FR' 
            ? 'Votre compte n\'est pas encore approuvé. Vous ne pouvez pas utiliser cette fonctionnalité tant que votre compte n\'est pas approuvé.'
            : 'Your account is not approved yet. You cannot use this feature until approval.'
          }
        </p>
        <button 
          onClick={() => setShowAccessMessage(false)}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {lang === 'FR' ? 'Compris' : 'Understood'}
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="grid-bg" />
      <div className="wrap" style={{ background: C.bg, minHeight: '100vh', color: C.text }}>

        <Navigation />
        
        <AccessMessage />

        {/* ── Hero ── */}
        <div style={{ padding: '104px 64px 0 64px' }}>
          <div className="hero-grid">
            <div>
              <h1 className="reveal hero-h1" style={{ marginBottom: 28 }}>
                {tr.heroTitle[0]}<br />
                <span className="neon">{tr.heroTitle[1]}</span><br />
                {tr.heroTitle[2]}
              </h1>
              <p className="reveal d1 hero-p" style={{ marginBottom: 40, maxWidth: 480 }}>
                {tr.heroSub}
              </p>
              <div className="reveal d2" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button className="btn-p" onClick={() => handleRestrictedAccess('/generateur')}>{tr.heroCta1}</button>
                <a href="https://www.tax.gov.ma" target="_blank" rel="noreferrer" style={{ display: 'flex' }}>
                  <button className="btn-o">{tr.heroCta2}</button>
                </a>
              </div>
              <div className="reveal d3" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '12px', textAlign: 'left' }}>
                💡 {lang === 'FR' ? 'Commencez par enregistrer vos fournisseurs, puis générez vos déclarations en 1 clic.' : 'Start by registering your suppliers, then generate your declarations in 1 click.'}
              </div>
            </div>
            <div className="mockup-col reveal d3">
              <TVACard t={lang.toLowerCase()} />
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ padding: '64px 64px 80px 64px' }}>
          <div className="reveal d3 stats-row" style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
            <StatItem target={10} suffix="K+" label={tr.statLabels[0]} duration={1600} />
            <div className="stats-sep" style={{ width: 1, height: 80, background: 'linear-gradient(180deg, transparent, rgba(74,222,128,0.2), transparent)', margin: '0 56px' }} />
            <StatItem target={30} suffix="K+" label={tr.statLabels[1]} duration={2000} />
            <div className="stats-sep" style={{ width: 1, height: 80, background: 'linear-gradient(180deg, transparent, rgba(74,222,128,0.2), transparent)', margin: '0 56px' }} />
            <StatItem target={100} suffix="%" label={tr.statLabels[2]} duration={1400} />
          </div>
        </div>

        <NewsTicker />

        {/* ── Features ── */}
        <div id="features" style={{ padding: '120px 64px 120px 64px' }}>
          <div className="reveal" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#00d4a0', textTransform: 'uppercase', marginBottom: 12 }}>{tr.featLabel}</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 8, color: '#ffffff' }}>{tr.featTitle}</h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: 700, lineHeight: 1.7, letterSpacing: '-0.02em' }}>{tr.featSub}</p>
          </div>
          <div className="bento">
            <div className={`feat-card featured reveal d0 feat-card-wide`}>
              <div className="feat-card-title">{tr.features[0].title}</div>
              <p className="feat-card-desc">{tr.features[0].desc}</p>
            </div>

            <div className={`feat-card reveal d1`}>
              <div className="feat-card-title">{tr.features[1].title}</div>
              <p className="feat-card-desc">{tr.features[1].desc}</p>
            </div>

            {tr.features.slice(2, 5).map((f, i) => (
              <div key={i + 2} className={`feat-card reveal d${i + 2}`}>
                <div className="feat-card-title">{f.title}</div>
                <p className="feat-card-desc">{f.desc}</p>
              </div>
            ))}

            <div className={`feat-card reveal d5 feat-card-wide`}>
              <div className="feat-card-title">{tr.features[5].title}</div>
              <p className="feat-card-desc">{tr.features[5].desc}</p>
            </div>
          </div>
        </div>

        {/* ── Testimonials ── */}
        <div style={{ padding: '0 64px 120px 64px' }}>
          <div className="reveal" style={{ marginBottom: 48 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#00d4a0', textTransform: 'uppercase', marginBottom: 12 }}>{tr.testimonialsLabel}</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.15, color: '#ffffff' }}>{tr.testimonialsTitle}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="testimonials-grid">
            {tr.testimonials.map((r, i) => (
              <div key={i} className="reveal" style={{ position: 'relative', background: 'linear-gradient(145deg, #0f1a2e, #111d30)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 28px 28px', transition: 'all 0.25s ease', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* quote mark */}
                <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 64, lineHeight: 1, color: 'rgba(16,185,129,0.08)', fontFamily: 'Georgia, serif', fontWeight: 900, userSelect: 'none' }}>&ldquo;</div>

                {/* stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#10b981"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>

                {/* text */}
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.8, marginBottom: 28, position: 'relative', zIndex: 1 }}>{r.text}</p>

                {/* divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(16,185,129,0.3), transparent)', marginBottom: 20 }} />

                {/* author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#000', flexShrink: 0, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>{r.name[0]}</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f4f8', letterSpacing: '-0.2px' }}>{r.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 2, fontWeight: 500 }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works — Timeline ── */}
        <div id="how" style={{ borderTop: `1px solid rgba(74,222,128,0.12)`, borderBottom: `1px solid rgba(74,222,128,0.12)`, background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))' }}>
          <div style={{ padding: '120px 64px 120px 64px' }}>
            <div className="reveal" style={{ marginBottom: 72, maxWidth: 620 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.16em', color: C.accent, textTransform: 'uppercase', marginBottom: 12, background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{tr.howLabel}</p>
              <h2 style={{ fontSize: '3.2rem', fontWeight: 900, letterSpacing: '-2.2px', lineHeight: 1.15, marginBottom: 18, background: 'linear-gradient(135deg, #f0f4f8, #c0c7d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{tr.howTitle}</h2>
              <p style={{ fontSize: '1rem', color: C.muted, lineHeight: 1.75, letterSpacing: '-0.02em' }}>{tr.howSub}</p>
            </div>
            <div className="timeline">
              {tr.steps.map((s, i) => (
                <div key={s.num} className={`tl-item reveal d${i}`}>
                  <div className="tl-dot">{s.num}</div>
                  <div className="tl-item-title">{s.title}</div>
                  <p className="tl-item-desc">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="reveal" style={{ marginTop: 68 }}>
              <button className="btn-p" onClick={() => handleRestrictedAccess('/generateur')}>{tr.howCta}</button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{ 
          background: `linear-gradient(180deg, ${C.nav} 0%, ${C.card} 100%)`,
          borderTop: `1px solid ${C.border}`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Premium background glow effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '200px',
            background: `radial-gradient(ellipse at center, ${C.accent}20 0%, transparent 70%)`,
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ padding: '64px 64px 48px 64px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 60, marginBottom: 48 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ 
                    width: 36, 
                    height: 36, 
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentBright})`,
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.7rem', 
                    fontWeight: 900, 
                    color: '#fff',
                    boxShadow: `0 8px 24px ${C.accent}40`
                  }}>ST</div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '.02em' }}>
                    SIMPL-<span style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentBright})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TVA</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: C.muted, lineHeight: 1.8, maxWidth: 380 }}>{tr.footerTagline}</p>
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentBright})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '.12em', 
                  textTransform: 'uppercase', 
                  marginBottom: 18 
                }}>{tr.footerNav}</div>
                {tr.footerLinks.map((l) => (
                  <div key={l} style={{ 
                    fontSize: '0.84rem', 
                    color: C.muted, 
                    marginBottom: 11, 
                    cursor: 'pointer', 
                    transition: 'all .25s cubic-bezier(.4, 0, .2, 1)',
                    borderLeft: `2px solid transparent`,
                    paddingLeft: 10
                  }}
                    onMouseEnter={(e) => {
                      e.target.style.color = C.accent;
                      e.target.style.borderLeftColor = C.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = C.muted;
                      e.target.style.borderLeftColor = 'transparent';
                    }}>{l}</div>
                ))}
              </div>
            </div>
            <div style={{ 
              borderTop: `1px solid ${C.border}`, 
              paddingTop: 28, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 24 
            }}>
              <span style={{ fontSize: '0.76rem', color: C.muted, fontWeight: 500 }}>{tr.footerCopy}</span>
              <div style={{ display: 'flex', gap: 24, fontSize: '0.76rem', color: C.muted, alignItems: 'center' }}>
                <span style={{ 
                  cursor: 'pointer',
                  transition: 'all .25s cubic-bezier(.4, 0, .2, 1)',
                  paddingBottom: 2,
                  borderBottom: '1px solid transparent'
                }}
                  onMouseEnter={(e) => {
                    e.target.style.color = C.accent;
                    e.target.style.borderBottomColor = C.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = C.muted;
                    e.target.style.borderBottomColor = 'transparent';
                  }}>{tr.footerPrivacy}</span>
                <span style={{ color: C.border, opacity: 0.3 }}>|</span>
                <a href="https://www.tax.gov.ma" target="_blank" rel="noreferrer" style={{ 
                  color: C.muted,
                  textDecoration: 'none',
                  transition: 'all .25s cubic-bezier(.4, 0, .2, 1)',
                  paddingBottom: 2,
                  borderBottom: '1px solid transparent',
                  cursor: 'pointer'
                }}
                  onMouseEnter={(e) => {
                    e.target.style.color = C.accent;
                    e.target.style.borderBottomColor = C.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = C.muted;
                    e.target.style.borderBottomColor = 'transparent';
                  }}>tax.gov.ma</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default HomePage;
