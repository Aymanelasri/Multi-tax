import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function Toast({ message, type = 'success', onClose }) {
  const { t } = useLanguage()

  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠'
  }

  return (
    <div className={`admin-toast admin-toast-${type}`}>
      <span className="admin-toast-icon">{icons[type]}</span>
      <span className="admin-toast-message">{message}</span>
      <button className="admin-toast-close" onClick={onClose}>×</button>
    </div>
  )
}
