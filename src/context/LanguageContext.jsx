import { createContext, useContext, useState } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('edi_lang') || 'FR';
    return stored.toUpperCase();
  });

  const t = (key, params = {}) => {
    const langObj = translations[lang] || translations['EN'];
    let text = langObj[key] || key;
    // Replace parameters in the translation string
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), paramValue);
    });
    return text;
  };

  const toggleLang = () => {
    const next = lang === 'FR' ? 'EN' : 'FR';
    setLang(next);
    localStorage.setItem('edi_lang', next);
  };

  const setLangDirect = (newLang) => {
    const normalized = newLang?.toUpperCase() || 'EN';
    setLang(normalized);
    localStorage.setItem('edi_lang', normalized);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, setLangDirect }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLang must be used within LanguageProvider');
  }
  return context;
};
