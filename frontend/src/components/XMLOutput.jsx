import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

const XMLOutput = ({ xml, onDownload, onCopy, onGenerate, onPrev }) => {
  return (
    <div className="panel active" id="panel3">
      <div className="panel-title">
        <span className="icon">⚡</span> Génération du Fichier XML EDI
      </div>
      <p className="panel-subtitle">
        Vérifiez le résumé et générez votre fichier XML prêt à être compressé en{' '}
        <strong>.zip</strong> et envoyé sur SIMPL-TVA via <em>"Envoi EDI"</em>.
      </p>

      <Card title="Aperçu XML">
        <div
          className="xml-output"
          id="xmlOutput"
          dangerouslySetInnerHTML={{
            __html: xml || 'Cliquez sur "Générer XML" pour prévisualiser le fichier...',
          }}
        />
      </Card>

      <div className="output-actions">
        <Button variant="primary" onClick={onGenerate}>
          ⚙ Générer XML
        </Button>
        {xml && (
          <>
            <Button variant="blue" onClick={onDownload}>
              ⬇ Télécharger .xml
            </Button>
            <Button variant="accent3" onClick={onCopy}>
              📋 Copier
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={onPrev}>
          ← Retour
        </Button>
      </div>

      <Card title="Instructions d'envoi SIMPL-TVA">
        <ol style={{ paddingLeft: '20px', lineHeight: '2', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          <li>
            Téléchargez le fichier <code style={{ color: 'var(--accent)' }}>.xml</code> généré
          </li>
          <li>
            Compressez-le en format <code style={{ color: 'var(--accent)' }}>.zip</code> (taille max 1Mo compressé / 150Mo
            décompressé)
          </li>
          <li>
            Connectez-vous à <strong style={{ color: 'var(--accent2)' }}>SIMPL-TVA</strong> sur{' '}
            <a href="https://www.tax.gov.ma" target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)' }}>
              www.tax.gov.ma
            </a>
          </li>
          <li>
            Assurez-vous d'avoir le profil <strong style={{ color: 'var(--accent)' }}>Rédacteur</strong>
          </li>
          <li>
            Allez dans <em>"Envoi EDI"</em> et uploadez votre fichier .zip
          </li>
          <li>
            Suivez l'état du traitement dans le <strong>Tableau de Bord EDI</strong>
          </li>
        </ol>
      </Card>
    </div>
  );
};

export default XMLOutput;
