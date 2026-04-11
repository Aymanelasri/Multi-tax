import React from 'react';

const ValidationErrors = ({ errors, isVisible = false }) => {
  if (!isVisible || errors.length === 0) return null;

  return (
    <div className={`errors-box ${isVisible ? 'show' : ''}`}>
      <strong>⚠ Erreurs de validation :</strong>
      <ul id="errorsList">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationErrors;
