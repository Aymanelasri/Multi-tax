import { createContext, useContext, useState } from 'react';
import { translations } from '../translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => 
    localStorage.getItem('edi_lang') || 'FR'
  )
  
  const t = (key) => translations[lang][key] || key
  
  const toggleLang = () => {
    const next = lang === 'FR' ? 'EN' : 'FR'
    setLang(next)
    localStorage.setItem('edi_lang', next)
  }
  
  const setLangDirect = (newLang) => {
    setLang(newLang)
    localStorage.setItem('edi_lang', newLang)
  }
  
  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, setLangDirect }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLang must be used within LanguageProvider')
  }
  return context
}
