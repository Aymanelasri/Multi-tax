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

        {/* Admin users are automatically redirected to dashboard during login */}
      </Routes>
    </Router>
  );
}

export default App;
