import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../styles/App.css';
import HomePage from './HomePage';
import InvoiceGenerator from './InvoiceGenerator';
import ContactPage from './ContactPage';
import SocietesPage from './SocietesPage';
import ProfilePage from './ProfilePage';
import DeclarationsPage from './DeclarationsPage';
import LegalPage from './LegalPage';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import VerifyEmailPage from './auth/VerifyEmailPage';
import EmailVerificationLink from './auth/EmailVerificationLink';
import ResetPasswordPage from './auth/ResetPasswordPage';
import PendingPage from './PendingPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/legal/:section" element={<LegalPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        {/* Email verification link from email */}
        <Route path="/email/verify/:id/:hash" element={<EmailVerificationLink />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pending" element={<PendingPage />} />

        {/* Protected Routes */}
        <Route path="/generateur" element={
          <ProtectedRoute requireApproved={true}>
            <InvoiceGenerator />
          </ProtectedRoute>
        } />
        <Route path="/societes" element={
          <ProtectedRoute requireApproved={true}>
            <SocietesPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/declarations" element={
          <ProtectedRoute>
            <DeclarationsPage />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={<ContactPage />} />

        {/* Admin Portal Redirect */}
        <Route path="/admin" element={
          <AdminRoute>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%)',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <h1 style={{ marginBottom: '20px' }}>Redirecting to Admin Dashboard...</h1>
              <p style={{ color: '#888' }}>Please wait while we redirect you.</p>
              {typeof window !== 'undefined' && setTimeout(() => {
                window.location.href = 'http://localhost:3001/admin'
              }, 500)}
            </div>
          </AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
