import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import AdminDashboard from './pages/AdminDashboard'
import AdminSocietes from './pages/AdminSocietes'
import './App.css'

function App() {
  useEffect(() => {
    // Handle token/user passed from frontend login redirect
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const user = params.get('user')
    
    if (token && user) {
      try {
        localStorage.setItem('token', token)
        // Parse user JSON if it's a string
        const userData = typeof user === 'string' ? JSON.parse(decodeURIComponent(user)) : user
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('✅ Token and user stored from redirect')
      } catch (error) {
        console.error('❌ Error parsing user data from redirect:', error)
      }
      // Clean up URL
      window.history.replaceState({}, '', '/admin')
    }

    // Log API URL for debugging
    console.log('📡 API URL:', process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api')
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
