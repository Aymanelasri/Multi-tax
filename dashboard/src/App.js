import React from 'react'
import { LanguageProvider } from './context/LanguageContext'
import AdminPanel from './AdminPanel'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <AdminPanel />
    </LanguageProvider>
  )
}

export default App

