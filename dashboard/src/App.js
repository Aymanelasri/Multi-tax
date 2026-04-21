import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import AdminDashboard from './pages/AdminDashboard'
import AdminSocietes from './pages/AdminSocietes'
import './App.css'

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const user = params.get('user')
    
    if (token && user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', decodeURIComponent(user))
      window.history.replaceState({}, '', '/admin')
    }
  }, [])

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/societes" element={<AdminSocietes showToast={() => {}} />} />
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
