import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestrictedAccessMessage = ({ title = "Accès Limité" }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 56,
      background: '#0d1424'
    }}>
      <div style={{
        maxWidth: '500px',
        padding: '40px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0,212,160,0.05) 0%, rgba(0,212,160,0.02) 100%)',
        border: '1px solid rgba(0,212,160,0.2)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🔒
        </div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '16px',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#cbd5e1',
          lineHeight: '1.6',
          marginBottom: '32px',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}>
          Votre compte est en attente d'approbation. Vous ne pouvez pas accéder à cette section pour le moment.
        </p>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          marginBottom: '32px',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}>
          Un administrateur examinera votre demande et vous enverrez une confirmation par email.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 32px',
            borderRadius: '8px',
            background: '#00d4a0',
            color: '#0a0f1a',
            border: 'none',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#00c497';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,212,160,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#00d4a0';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default RestrictedAccessMessage;
