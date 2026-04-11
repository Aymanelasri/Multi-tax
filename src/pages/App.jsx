import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../styles/App.css';
import HomePage from './HomePage';
import InvoiceGenerator from './InvoiceGenerator';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generateur" element={<InvoiceGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
