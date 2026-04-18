import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState('confidentialite');

  // Hash routing logic to navigate between sections
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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0a0f1a] text-white font-sans selection:bg-[#00d4a0] selection:text-[#0a0f1a]">
        {/* Header Section */}
        <div className="bg-gradient-to-b from-[#0d1424] to-[#0a0f1a] py-24 px-6 border-b border-gray-800 text-center">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black text-[#00d4a0] mb-6 tracking-tighter uppercase">
              Légal<span className="text-white">.</span>
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
              Cadre contractuel et politique de protection des actifs numériques pour les utilisateurs de SimpleTax.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 bg-[#0a0f1a]/90 p-2 rounded-2xl border border-gray-700 inline-flex backdrop-blur-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.location.hash = tab.id;
                  }}
                  className={`px-10 py-4 rounded-xl transition-all duration-500 font-bold text-sm md:text-base uppercase tracking-widest ${
                    activeTab === tab.id 
                    ? 'bg-[#00d4a0] text-[#0a0f1a] shadow-[0_0_40px_rgba(0,212,160,0.4)] scale-105' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto py-20 px-8 leading-relaxed text-gray-400">
          
          {/* --- SECTION: MENTIONS LÉGALES --- */}
          {activeTab === 'mentions' && (
            <article className="animate-fadeIn space-y-16">
              <h2 className="text-5xl font-black text-white mb-12 border-l-[12px] border-[#00d4a0] pl-8 uppercase tracking-tighter">Gouvernance</h2>
              
              <section className="space-y-6 pt-10 border-t border-gray-800">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 1. INFRASTRUCTURE ET HÉBERGEMENT</h3>
                <p>Le site internet www.simpletax.ma repose sur une architecture Cloud souveraine localisée au Maroc. Cette infrastructure est conçue pour garantir un taux de disponibilité supérieur à 99,9% et une étanchéité totale des données par rapport aux réseaux publics. L'hébergement est assuré par des centres de données certifiés Tier III, répondant aux exigences de sécurité les plus strictes en vigueur sur le territoire national.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 2. PROPRIÉTÉ INTELLECTUELLE</h3>
                <p>Tous les éléments logiciels, graphiques et textuels présents sur SimpleTax sont protégés par le droit d'auteur. L'utilisation de notre moteur de conversion XML n'entraîne aucune cession de droits de propriété intellectuelle. Toute tentative de rétro-ingénierie (reverse engineering) sur nos algorithmes de parsing fera l'objet de poursuites pénales immédiates devant le Tribunal de Commerce de Casablanca.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 3. GESTION DES SERVICES TIERS</h3>
                <p>SimpleTax interagit techniquement avec les plateformes gouvernementales (Simpl-TVA). Cependant, l'éditeur ne saurait être tenu responsable des changements soudains de spécifications techniques de la part de l'Administration Fiscale. Nous nous engageons à mettre à jour nos protocoles de conversion dans un délai raisonnable suite à toute modification officielle des schémas XML/EDI.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 4. DROIT APPLICABLE</h3>
                <p>L'utilisation de cette plateforme est soumise aux lois marocaines en vigueur. En cas de litige, et après échec de toute tentative de médiation amiable, compétence exclusive est attribuée aux tribunaux compétents au Maroc.</p>
              </section>
            </article>
          )}

          {/* --- SECTION: CONFIDENTIALITÉ --- */}
          {activeTab === 'confidentialite' && (
            <article className="animate-fadeIn space-y-12">
              <h2 className="text-5xl font-black text-white mb-12 border-l-[12px] border-[#00d4a0] pl-8 uppercase tracking-tighter">Protection des Données</h2>
              
              <section className="space-y-6 text-justify">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 1. CONFORMITÉ À LA LOI 09-08</h3>
                <p>Nous nous engageons formellement à respecter la protection des personnes physiques à l'égard du traitement des données à caractère personnel. Chaque interaction sur notre plateforme est cryptée et anonymisée autant que possible. Nous ne partageons aucune donnée d'activité avec des régies publicitaires ou des entités commerciales tierces.</p>
              </section>

              <section className="bg-emerald-950/20 p-12 rounded-[40px] border border-[#00d4a0]/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-[#00d4a0]">SAFE</div>
                <h3 className="text-3xl font-black text-white mb-6 relative z-10">Article 2. SÉCURITÉ DES FLUX EDI</h3>
                <p className="text-white/90 text-lg leading-relaxed relative z-10">
                  SimpleTax utilise une technologie de traitement "Stateless" (sans état permanent). 
                  <br /><br />
                  <strong>Principe d'isolation :</strong> Les fichiers comptables injectés pour conversion ne transitent que par la mémoire vive (RAM) pour la durée stricte du calcul. Aucune base de données ne stocke le contenu de vos transactions financières. Le résultat XML est généré à la volée et n'est accessible que par le jeton de session unique de l'utilisateur ayant initié l'action.
                </p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 3. CHIFFREMENT DES COMMUNICATIONS</h3>
                <p>Toutes les données échangées entre votre navigateur et nos serveurs sont protégées par un protocole TLS (Transport Layer Security) de dernière génération. Nous imposons le HSTS (HTTP Strict Transport Security) pour empêcher toute tentative d'interception de données par des tiers malveillants.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 4. VOS DROITS NUMÉRIQUES</h3>
                <p>Conformément au cadre juridique marocain, vous disposez d'un droit d'accès, de rectification et de suppression totale de votre compte utilisateur. Toute demande peut être formulée via l'interface de support dédiée, et nous nous engageons à une réponse et une exécution sous 48 heures ouvrables.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 5. GESTION DES COOKIES TECHNIQUES</h3>
                <p>SimpleTax n'utilise que des cookies techniques indispensables au maintien de votre session sécurisée. Nous n'utilisons aucun cookie de ciblage ou de profilage comportemental. Votre historique de conversion reste votre propriété exclusive.</p>
              </section>
            </article>
          )}

          {/* --- SECTION: CONDITIONS D'UTILISATION --- */}
          {activeTab === 'conditions' && (
            <article className="animate-fadeIn space-y-12">
              <h2 className="text-5xl font-black text-white mb-12 border-l-[12px] border-[#00d4a0] pl-8 uppercase tracking-tighter">Conditions Générales</h2>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 1. ACCÈS AU SERVICE SaaS</h3>
                <p>SimpleTax fournit une licence d'utilisation logicielle sous forme de service (SaaS). Cette licence est personnelle, limitée et révocable en cas de non-respect des présentes conditions. L'utilisateur s'interdit toute exploitation commerciale de l'interface SimpleTax en dehors de ses propres besoins déclaratifs.</p>
              </section>

              <section className="bg-red-950/10 border border-red-900/40 p-10 rounded-[40px] shadow-inner">
                <h3 className="text-2xl font-black text-red-500 mb-6 uppercase tracking-widest underline decoration-red-500 underline-offset-8">Article 2. RESPONSABILITÉ DES DONNÉES SOURCES</h3>
                <p className="text-gray-300 leading-relaxed font-bold italic">
                  L'UTILISATEUR EST SEUL ET UNIQUE RESPONSABLE DE LA QUALITÉ ET DE L'EXACTITUDE DES DONNÉES SAISIES DANS SES FICHIERS SOURCES (EXCEL/CSV). SIMPLETAX NE PROCÈDE À AUCUNE VALIDATION COMPTABLE ET NE SAURAIT ÊTRE TENU RESPONSABLE DES ERREURS DÉCLARATIVES DÉCOULANT D'UNE MAUVAISE SAISIE INITIALE PAR L'UTILISATEUR.
                </p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 3. MODALITÉS DE PAIEMENT</h3>
                <p>Les services sont facturés selon la grille tarifaire en vigueur. L'accès au moteur de conversion est subordonné au paiement effectif des frais de service ou à la possession d'un pack de crédits valide. Aucun remboursement ne sera traité après la génération effective d'un fichier XML/EDI par le système.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 4. MAINTENANCE ET INTERRUPTION</h3>
                <p>Des interruptions de service peuvent survenir pour cause de maintenance corrective ou évolutive. L'éditeur s'efforce de minimiser ces impacts. Cependant, aucune indemnité ne pourra être réclamée pour une indisponibilité temporaire liée à une mise à jour critique de sécurité.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 5. FORCE MAJEURE</h3>
                <p>La responsabilité de SimpleTax ne pourra être engagée si l'exécution de ses obligations est retardée ou empêchée en raison d'un cas de force majeure, d'une défaillance des réseaux publics ou d'une indisponibilité majeure des portails fiscaux nationaux.</p>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-white italic underline decoration-[#00d4a0] underline-offset-8">Article 6. ÉLECTION DE DOMICILE</h3>
                <p>Pour l'exécution des présentes et de leurs suites, les parties font élection de domicile auprès des juridictions compétentes au Maroc, nonobstant pluralité de défendeurs ou appel en garantie.</p>
              </section>
            </article>
          )}

        </div>
        
        {/* Footer */}
        <footer className="bg-[#0a0f1a] py-20 text-center border-t border-gray-900 mt-20">
          <div className="mb-8">
            <span className="text-3xl font-black text-[#00d4a0] tracking-tighter italic">SimpleTax</span>
            <p className="text-gray-500 text-sm mt-3 uppercase tracking-[0.3em] font-bold">Technologie de Conformité Fiscale</p>
          </div>
          <div className="text-gray-600 text-xs space-y-3 leading-relaxed max-w-2xl mx-auto px-6 italic">
            <p>&copy; {new Date().getFullYear()} SimpleTax Maroc. Tous droits réservés.</p>
            <p>L'excellence opérationnelle et la confidentialité absolue sont au cœur de notre architecture logicielle.</p>
          </div>
        </footer>

        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
};

export default LegalPage;