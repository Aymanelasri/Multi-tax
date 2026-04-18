import { useLang } from '../context/LanguageContext'

export default function LoadingScreen() {
  const { t } = useLang()

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-square">ST</div>
          <span className="logo-text">SIMPL-TVA</span>
        </div>
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        <p className="loading-text">{t('auth_loading_page')}</p>
      </div>
      
      <style jsx>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0a0f1a;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .loading-content {
          text-align: center;
        }
        
        .loading-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        
        .logo-square {
          width: 40px;
          height: 40px;
          background: #00d4a0;
          color: #0a0f1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          border-radius: 8px;
        }
        
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
        }
        
        .loading-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 16px;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          background: #00d4a0;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        .dot:nth-child(3) { animation-delay: 0s; }
        
        .loading-text {
          color: #94a3b8;
          font-size: 13px;
          margin: 0;
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}