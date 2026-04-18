import React from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function AdminSettings({ showToast }) {
  const { t } = useLanguage()

  return (
    <div className="admin-page">
      <h1>{t('admin_settings_title')}</h1>
      <div className="admin-empty-state">
        <p>⚙️</p>
        <p>{t('admin_settings_coming')}</p>
      </div>
    </div>
  )
}
