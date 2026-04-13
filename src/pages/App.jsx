import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../styles/App.css';
import HomePage from './HomePage';
import InvoiceGenerator from './InvoiceGenerator';
import ContactPage from './ContactPage';
import SocietesPage from './SocietesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generateur" element={<InvoiceGenerator />} />
        <Route path="/societes" element={<SocietesPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
