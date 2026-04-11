import React, { useState, useEffect } from 'react';

const NewsTicker = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check if ticker was dismissed in this session
    const dismissed = sessionStorage.getItem('newsTicker_dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('newsTicker_dismissed', 'true');
  };

  const newsItems = [
    'Nouveau : Télédéclaration TVA disponible sur SIMPL-TVA pour la période Janvier 2026',
    'DGI Maroc : Date limite de dépôt du Relevé des Déductions — régime mensuel : 20 de chaque mois',
    'Mise à jour : Le cahier des charges EDI SIMPL-TVA v2.1 est disponible sur le portail DGI',
    'Rappel : Le taux de TVA normal au Maroc est de 20% — taux réduits : 14%, 10%, 7%',
    'SIMPL-TVA : Vérifiez que votre fichier XML respecte l\'encodage UTF-8 avant soumission',
    'Nouveau portail DGI : simpl.tax.gov.ma — Accès direct à vos déclarations en ligne'
  ];

  if (!isVisible) return null;

  const tickerText = newsItems.join(' · ');

  return (
    <div
      className="news-ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
    >
      <div className="ticker-badge">
        🔔 ACTUALITÉS DGI
      </div>
      <div className="ticker-content">
        <span className="ticker-text">{tickerText}</span>
        <span className="ticker-text">{tickerText}</span>
      </div>
      <button
        className="ticker-close"
        onClick={handleClose}
        aria-label="Fermer le ticker"
      >
        ✕
      </button>
    </div>
  );
};

export default NewsTicker;
