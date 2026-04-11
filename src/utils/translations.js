// Flat, simple translation system
export const translations = {
  // Panel titles
  title: { fr: 'Modules Import / Export', en: 'Import / Export Modules' },
  
  // Tabs
  import: { fr: 'Importer', en: 'Import' },
  export: { fr: 'Exporter', en: 'Export' },
  saved: { fr: 'Sauvegardes', en: 'Saved' },
  
  // Upload/Import
  upload: { fr: 'Glisser ou cliquer', en: 'Drag or click' },
  jsonRequired: { fr: 'Fichier JSON requis', en: 'JSON file required' },
  invalidFormat: { fr: 'Format de module invalide', en: 'Invalid module format' },
  loaded: { fr: 'Module "{{name}}" chargé', en: 'Module "{{name}}" loaded' },
  
  // Export
  module: { fr: 'Nom du module', en: 'Module name' },
  placeholder: { fr: 'ex: fournisseurs-2024', en: 'e.g. suppliers-2024' },
  exported: { fr: 'Module "{{name}}" exporté', en: 'Module "{{name}}" exported' },
  
  // Labels
  factures: { fr: 'Factures', en: 'Invoices' },
  identification: { fr: 'Identification', en: 'Identification' },
  empty: { fr: 'Aucun module sauvegardé', en: 'No saved modules' },
  entry: { fr: 'entrée', en: 'entry' },
  entries: { fr: 'entrées', en: 'entries' },
  
  // Actions
  load: { fr: 'Charger', en: 'Load' },
  delete: { fr: 'Supprimer', en: 'Delete' },
};

export const t = (key, lang = 'en', vars = {}) => {
  const text = translations[key]?.[lang] || key;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{{${k}}}`, v), text);
};
