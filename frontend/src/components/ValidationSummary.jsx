import React from 'react';
import { validateAllInvoices } from '../utils/dgiValidation';
import GroupedValidationMessages from './GroupedValidationMessages';

const ValidationSummary = ({ identification, factures }) => {
  const validation = validateAllInvoices(identification, factures);

  if (validation.errors.length === 0 && validation.warnings.length === 0 && validation.infos.length === 0) {
    return null;
  }

  return (
    <GroupedValidationMessages 
      errors={validation.errors}
      warnings={validation.warnings}
      infos={validation.infos}
    />
  );
};

export default ValidationSummary;
