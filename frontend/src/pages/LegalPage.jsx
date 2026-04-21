import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

const C = {
  bg: '#0a0f1a',
  nav: '#0f1426',
  card: '#111a2e',
  card2: '#0d1220',
  border: '#1a2540',
  accent: '#10b981',
  accentBright: '#34d399',
  text: '#f0f4f8',
  muted: '#94a3b8',
  dark: '#1e293b',
};

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState('confidentialite');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['mentions', 'confidentialite', 'conditions'].includes(hash)) {
        setActiveTab(hash);
      }
      window.scrollTo(0, 0);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const tabs = [
    { id: 'mentions', label: 'Mentions Légales' },
    { id: 'confidentialite', label: 'Confidentialité' },
    { id: 'conditions', label: 'Conditions d\'utilisation' }
  ];

  const css = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `;

  return (
    <>
      <style>{css}</style>
      <Navigation />
      <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* Header Section */}
        <div style={{
          background: `linear-gradient(to bottom, ${C.card2}, ${C.bg})`,
          padding: '96px 24px',
          borderBottom: `1px solid ${C.border}`,
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 900,
              color: C.accent,
              marginBottom: 24,
              letterSpacing: '-3px',
              textTransform: 'uppercase'
            }}>
              Légal<span style={{ color: C.text }}>.</span>
            </h1>
            <p style={{
              color: C.muted,
              fontSize: 'clamp(18px, 2vw, 28px)',
              maxWidth: '768px',
              margin: '0 auto 48px',
              lineHeight: 1.6
            }}>
              Cadre contractuel et politique de protection des actifs numériques pour les utilisateurs de SimpleTax.
            </p>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
              background: `rgba(10, 15, 26, 0.9)`,
              padding: 8,
              borderRadius: 24,
              border: `1px solid ${C.border}`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              width: 'fit-content',
              margin: '0 auto'
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.location.hash = tab.id;
                  }}
                  style={{
                    padding: '16px 40px',
                    borderRadius: 12,
                    transition: 'all 0.5s ease',
                    fontWeight: 700,
                    fontSize: 'clamp(12px, 1vw, 16px)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === tab.id ? C.accent : 'transparent',
                    color: activeTab === tab.id ? C.bg : C.muted,
                    boxShadow: activeTab === tab.id ? `0 0 40px ${C.accent}66` : 'none',
                    transform: activeTab === tab.id ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.color = C.text;
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.color = C.muted;
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 32px',
          lineHeight: 1.8,
          color: C.muted
        }}>
          
          {/* MENTIONS LÉGALES */}
          {activeTab === 'mentions' && (
            <article className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 900,
                color: C.text,
                marginBottom: 48,
                borderLeft: `12px solid ${C.accent}`,
                paddingLeft: 32,
                textTransform: 'uppercase',
                letterSpacing: '-2px'
              }}>Gouvernance</h2>
              
              <section style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 40, borderTop: `1px solid ${C.border}` }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 1. INFRASTRUCTURE ET HÉBERGEMENT</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Le site internet www.simpletax.ma repose sur une architecture Cloud souveraine localisée au Maroc. Cette infrastructure est conçue pour garantir un taux de disponibilité supérieur à 99,9% et une étanchéité totale des données par rapport aux réseaux publics. L'hébergement est assuré par des centres de données certifiés Tier III, répondant aux exigences de sécurité les plus strictes en vigueur sur le territoire national.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 2. PROPRIÉTÉ INTELLECTUELLE</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Tous les éléments logiciels, graphiques et textuels présents sur SimpleTax sont protégés par le droit d'auteur. L'utilisation de notre moteur de conversion XML n'entraîne aucune cession de droits de propriété intellectuelle. Toute tentative de rétro-ingénierie (reverse engineering) sur nos algorithmes de parsing fera l'objet de poursuites pénales immédiates devant le Tribunal de Commerce de Casablanca.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 3. GESTION DES SERVICES TIERS</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  SimpleTax interagit techniquement avec les plateformes gouvernementales (Simpl-TVA). Cependant, l'éditeur ne saurait être tenu responsable des changements soudains de spécifications techniques de la part de l'Administration Fiscale. Nous nous engageons à mettre à jour nos protocoles de conversion dans un délai raisonnable suite à toute modification officielle des schémas XML/EDI.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 4. DROIT APPLICABLE</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  L'utilisation de cette plateforme est soumise aux lois marocaines en vigueur. En cas de litige, et après échec de toute tentative de médiation amiable, compétence exclusive est attribuée aux tribunaux compétents au Maroc.
                </p>
              </section>
            </article>
          )}

          {/* CONFIDENTIALITÉ */}
          {activeTab === 'confidentialite' && (
            <article className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 900,
                color: C.text,
                marginBottom: 48,
                borderLeft: `12px solid ${C.accent}`,
                paddingLeft: 32,
                textTransform: 'uppercase',
                letterSpacing: '-2px'
              }}>Protection des Données</h2>
              
              <section style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'justify' }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 1. CONFORMITÉ À LA LOI 09-08</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Nous nous engageons formellement à respecter la protection des personnes physiques à l'égard du traitement des données à caractère personnel. Chaque interaction sur notre plateforme est cryptée et anonymisée autant que possible. Nous ne partageons aucune donnée d'activité avec des régies publicitaires ou des entités commerciales tierces.
                </p>
              </section>

              <section style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: 48,
                borderRadius: 40,
                border: `1px solid ${C.accent}66`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  padding: 16,
                  opacity: 0.1,
                  fontSize: 144,
                  fontWeight: 900,
                  color: C.accent
                }}>SAFE</div>
                <h3 style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: C.text,
                  marginBottom: 24,
                  position: 'relative',
                  zIndex: 10
                }}>Article 2. SÉCURITÉ DES FLUX EDI</h3>
                <p style={{
                  color: C.text,
                  fontSize: 18,
                  lineHeight: 1.8,
                  position: 'relative',
                  zIndex: 10
                }}>
                  SimpleTax utilise une technologie de traitement "Stateless" (sans état permanent).
                  <br /><br />
                  <strong>Principe d'isolation :</strong> Les fichiers comptables injectés pour conversion ne transitent que par la mémoire vive (RAM) pour la durée stricte du calcul. Aucune base de données ne stocke le contenu de vos transactions financières. Le résultat XML est généré à la volée et n'est accessible que par le jeton de session unique de l'utilisateur ayant initié l'action.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 3. CHIFFREMENT DES COMMUNICATIONS</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Toutes les données échangées entre votre navigateur et nos serveurs sont protégées par un protocole TLS (Transport Layer Security) de dernière génération. Nous imposons le HSTS (HTTP Strict Transport Security) pour empêcher toute tentative d'interception de données par des tiers malveillants.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 4. VOS DROITS NUMÉRIQUES</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Conformément au cadre juridique marocain, vous disposez d'un droit d'accès, de rectification et de suppression totale de votre compte utilisateur. Toute demande peut être formulée via l'interface de support dédiée, et nous nous engageons à une réponse et une exécution sous 48 heures ouvrables.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 5. GESTION DES COOKIES TECHNIQUES</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  SimpleTax n'utilise que des cookies techniques indispensables au maintien de votre session sécurisée. Nous n'utilisons aucun cookie de ciblage ou de profilage comportemental. Votre historique de conversion reste votre propriété exclusive.
                </p>
              </section>
            </article>
          )}

          {/* CONDITIONS D'UTILISATION */}
          {activeTab === 'conditions' && (
            <article className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
              <h2 style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 900,
                color: C.text,
                marginBottom: 48,
                borderLeft: `12px solid ${C.accent}`,
                paddingLeft: 32,
                textTransform: 'uppercase',
                letterSpacing: '-2px'
              }}>Conditions Générales</h2>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 1. ACCÈS AU SERVICE SaaS</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  SimpleTax fournit une licence d'utilisation logicielle sous forme de service (SaaS). Cette licence est personnelle, limitée et révocable en cas de non-respect des présentes conditions. L'utilisateur s'interdit toute exploitation commerciale de l'interface SimpleTax en dehors de ses propres besoins déclaratifs.
                </p>
              </section>

              <section style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: `1px solid rgba(239, 68, 68, 0.3)`,
                padding: 40,
                borderRadius: 40,
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#ef4444',
                  marginBottom: 24,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  textDecoration: 'underline #ef4444',
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 2. RESPONSABILITÉ DES DONNÉES SOURCES</h3>
                <p style={{
                  color: C.muted,
                  lineHeight: 1.8,
                  fontWeight: 700,
                  fontStyle: 'italic'
                }}>
                  L'UTILISATEUR EST SEUL ET UNIQUE RESPONSABLE DE LA QUALITÉ ET DE L'EXACTITUDE DES DONNÉES SAISIES DANS SES FICHIERS SOURCES (EXCEL/CSV). SIMPLETAX NE PROCÈDE À AUCUNE VALIDATION COMPTABLE ET NE SAURAIT ÊTRE TENU RESPONSABLE DES ERREURS DÉCLARATIVES DÉCOULANT D'UNE MAUVAISE SAISIE INITIALE PAR L'UTILISATEUR.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 3. MODALITÉS DE PAIEMENT</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Les services sont facturés selon la grille tarifaire en vigueur. L'accès au moteur de conversion est subordonné au paiement effectif des frais de service ou à la possession d'un pack de crédits valide. Aucun remboursement ne sera traité après la génération effective d'un fichier XML/EDI par le système.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 4. MAINTENANCE ET INTERRUPTION</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Des interruptions de service peuvent survenir pour cause de maintenance corrective ou évolutive. L'éditeur s'efforce de minimiser ces impacts. Cependant, aucune indemnité ne pourra être réclamée pour une indisponibilité temporaire liée à une mise à jour critique de sécurité.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 5. FORCE MAJEURE</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  La responsabilité de SimpleTax ne pourra être engagée si l'exécution de ses obligations est retardée ou empêchée en raison d'un cas de force majeure, d'une défaillance des réseaux publics ou d'une indisponibilité majeure des portails fiscaux nationaux.
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.text,
                  fontStyle: 'italic',
                  textDecoration: `underline ${C.accent}`,
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8
                }}>Article 6. ÉLECTION DE DOMICILE</h3>
                <p style={{ color: C.muted, lineHeight: 1.8 }}>
                  Pour l'exécution des présentes et de leurs suites, les parties font élection de domicile auprès des juridictions compétentes au Maroc, nonobstant pluralité de défendeurs ou appel en garantie.
                </p>
              </section>
            </article>
          )}

        </div>
        
        {/* Footer */}
        <footer style={{
          background: C.bg,
          padding: '80px 0',
          textAlign: 'center',
          borderTop: `1px solid ${C.border}`,
          marginTop: 80
        }}>
          <div style={{ marginBottom: 32 }}>
            <span style={{
              fontSize: 36,
              fontWeight: 900,
              color: C.accent,
              letterSpacing: '-2px',
              fontStyle: 'italic'
            }}>SimpleTax</span>
            <p style={{
              color: C.muted,
              fontSize: 12,
              marginTop: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontWeight: 700
            }}>Technologie de Conformité Fiscale</p>
          </div>
          <div style={{
            color: C.muted,
            fontSize: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            lineHeight: 1.8,
            maxWidth: '512px',
            margin: '0 auto',
            padding: '0 24px',
            fontStyle: 'italic'
          }}>
            <p>&copy; {new Date().getFullYear()} SimpleTax Maroc. Tous droits réservés.</p>
            <p>L'excellence opérationnelle et la confidentialité absolue sont au cœur de notre architecture logicielle.</p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LegalPage;
