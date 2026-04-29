import React from 'react';

const T = {
  fr: {
    title: 'Générateur EDI',
    sub: "Relevé des Déductions TVA — DGI Maroc. Saisissez vos données, prévisualisez et téléchargez votre archive ZIP prête à envoyer.",
  },
  en: {
    title: 'EDI Generator',
    sub: "VAT Deduction Statement — DGI Morocco. Enter your data, preview and download your ZIP archive ready to submit.",
  },
};

const Header = ({ lang = 'fr' }) => {
  const t = T[lang] || T.fr;
  return (
    <div style={{ padding: '28px 0 24px', marginBottom: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.2), transparent)' }} />
      <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 12, background: 'linear-gradient(135deg, #f0f4f8 40%, #64748b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {t.title}{' '}
        <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.3))' }}>
          SIMPL-TVA
        </span>
      </h1>
      <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, maxWidth: 540, letterSpacing: '-0.01em' }}>
        {t.sub}
      </p>
    </div>
  );
};

export default Header;
