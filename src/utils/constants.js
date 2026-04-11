export const REGIMES = [
  { value: '1', label: 'Mensuel', maxPeriode: 12 },
  { value: '2', label: 'Trimestriel', maxPeriode: 4 },
  { value: '3', label: 'Cessation temporaire d\'activité', maxPeriode: 1 },
  { value: '4', label: 'Cession ou cessation TVA', maxPeriode: 1 },
];

export const REGIME_INFO = {
  '1': '<strong>Régime Mensuel :</strong> La période correspond au numéro du mois (1 = Janvier … 12 = Décembre).',
  '2': '<strong>Régime Trimestriel :</strong> Période = numéro du trimestre (1=T1 … 4=T4).',
  '3': '<strong>Cessation temporaire d\'activité :</strong> Mettre 1 comme période.',
  '4': '<strong>Cession/Cessation TVA :</strong> Mettre 1 comme période.',
};

export const TVA_RATES = ['7.00', '10.00', '14.00', '20.00'];

export const PAYMENT_MODES = [
  { value: '1', label: 'Espèces' },
  { value: '2', label: 'Chèque' },
  { value: '3', label: 'Prélèvement' },
  { value: '4', label: 'Virement' },
  { value: '5', label: 'Effet' },
  { value: '6', label: 'Compensation' },
  { value: '7', label: 'Autres' },
];
