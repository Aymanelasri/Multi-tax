import React from 'react';

const STEPS = {
  fr: [{ label: 'Identification' }, { label: 'Factures' }, { label: 'Générer XML' }],
  en: [{ label: 'Identification' }, { label: 'Invoices' }, { label: 'Generate XML' }],
};

const StepsNav = ({ currentStep, onStepChange, lang = 'fr' }) => {
  const steps = STEPS[lang] || STEPS.fr;
  return (
    <div className="steps-nav">
      {steps.map((s, i) => {
        const num = i + 1;
        const isDone = num < currentStep;
        const isActive = num === currentStep;
        return (
          <button
            key={num}
            className={`step-btn${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
            onClick={() => onStepChange(num)}
          >
            <span className="step-num">{isDone ? null : num}</span>
            <span className="step-label">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StepsNav;
