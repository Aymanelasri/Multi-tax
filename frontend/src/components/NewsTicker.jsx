import React, { useState, useEffect } from 'react';

const NewsTicker = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ticker_dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('ticker_dismissed', 'true');
  };

  const newsItems = [
    { dotColor: '#00d4a0', text: 'Nouvelle version SIMPL-TVA 2.1 disponible sur le portail DGI Maroc' },
    { dotColor: '#fbbf24', text: 'Rappel : Date limite dépôt TVA mensuel — le 20 de chaque mois' },
    { dotColor: '#00d4a0', text: 'Taux TVA Maroc : 20% normal · 14% · 10% · 7% réduits' },
    { dotColor: '#ef4444', text: 'Important : Encodage UTF-8 obligatoire pour tous les fichiers EDI XML' },
    { dotColor: '#00d4a0', text: 'SIMPL-TVA EDI : Générez votre relevé des déductions en moins de 2 minutes' },
    { dotColor: '#fbbf24', text: 'DGI Maroc : Vérification ICE fournisseur recommandée avant déclaration' },
    { dotColor: '#00d4a0', text: 'Nouveau : Import/Export modules JSON pour réutiliser vos données fournisseurs' },
    { dotColor: '#94a3b8', text: 'Portail DGI : simpl.tax.gov.ma — Accès direct à vos télédéclarations' }
  ];

  if (!isVisible) return null;

  const renderItems = () => {
    return newsItems.map((item, index) => (
      <React.Fragment key={index}>
        <span className="ticker-item">
          <span className="ticker-dot" style={{ backgroundColor: item.dotColor }} />
          <span className="ticker-text">{item.text}</span>
        </span>
        {index < newsItems.length - 1 && (
          <span className="ticker-separator">·</span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="marquee-ticker">
      <style>{`
        .marquee-ticker {
          position: relative;
          width: 100%;
          height: 72px;
          background: #0d1728;
          border-top: 1px solid rgba(0,212,160,0.15);
          border-bottom: 1px solid rgba(0,212,160,0.15);
          display: flex;
          align-items: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .ticker-badge {
          min-width: 160px;
          height: 100%;
          background: #00d4a0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          flex-shrink: 0;
          border-right: 1px solid rgba(0,212,160,0.3);
          z-index: 10;
        }

        .ticker-badge-line1 {
          font-size: 13px;
          font-weight: 900;
          color: #0a0f1a;
          letter-spacing: 0.12em;
        }

        .ticker-badge-line2 {
          font-size: 9px;
          font-weight: 700;
          color: rgba(10,15,26,0.65);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          display: block;
        }

        .ticker-badge-line2-mobile {
          display: none;
        }

        .ticker-fade-left {
          position: absolute;
          left: 160px;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to right, #0d1728, transparent);
          z-index: 2;
          pointer-events: none;
        }

        .ticker-fade-right {
          position: absolute;
          right: 56px;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to left, #0d1728, transparent);
          z-index: 2;
          pointer-events: none;
        }

        .ticker-track-wrapper {
          flex: 1;
          overflow: hidden;
          position: relative;
          height: 100%;
        }

        .ticker-track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          animation: marquee 50s linear infinite;
          will-change: transform;
          height: 100%;
        }

        .marquee-ticker:hover .ticker-track {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 40px;
          height: 72px;
        }

        .ticker-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ticker-text {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.01em;
        }

        .ticker-separator {
          font-size: 18px;
          color: rgba(255,255,255,0.15);
          padding: 0 12px;
        }

        .ticker-close {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          z-index: 10;
          width: 56px;
          background: linear-gradient(to right, transparent, #0d1728 40%);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 16px;
          cursor: pointer;
          border: none;
        }

        .ticker-close-icon {
          font-size: 20px;
          color: rgba(255,255,255,0.25);
          transition: color 0.2s;
        }

        .ticker-close:hover .ticker-close-icon {
          color: rgba(255,255,255,0.9);
        }

        @media (max-width: 768px) {
          .marquee-ticker {
            height: 52px;
          }

          .ticker-badge {
            min-width: 56px;
          }

          .ticker-badge-line1 {
            font-size: 14px;
          }

          .ticker-badge-line1-text {
            display: none;
          }

          .ticker-badge-line1-mobile {
            display: block !important;
          }

          .ticker-badge-line2 {
            display: none;
          }

          .ticker-fade-left {
            left: 56px;
            width: 48px;
          }

          .ticker-fade-right {
            right: 48px;
            width: 48px;
          }

          .ticker-track {
            animation-duration: 28s;
          }

          .ticker-item {
            padding: 0 24px;
          }

          .ticker-text {
            font-size: 12px;
          }

          .ticker-close {
            padding-right: 10px;
          }
        }

        .ticker-badge-line1-mobile {
          display: none;
        }
      `}</style>

      <div className="ticker-badge">
        <span className="ticker-badge-line1">
          <span className="ticker-badge-line1-text">SIMPL·TVA</span>
          <span className="ticker-badge-line1-mobile">ST</span>
        </span>
        <span className="ticker-badge-line2">ACTUALITÉS</span>
      </div>

      <div className="ticker-fade-left" />

      <div className="ticker-track-wrapper">
        <div className="ticker-track">
          {renderItems()}
          {renderItems()}
        </div>
      </div>

      <div className="ticker-fade-right" />

      <button className="ticker-close" onClick={handleClose} aria-label="Fermer le ticker">
        <span className="ticker-close-icon">×</span>
      </button>
    </div>
  );
};

export default NewsTicker;