// Couleurs AutoHero
export const COLORS = {
  primary: '#FF6B35',        // Orange AutoHero
  primaryDark: '#E55A2B',    // Orange foncé
  secondary: '#2C3E50',      // Gris foncé
  accent: '#F7931E',         // Orange accent
  background: '#F5F5F5',     // Gris clair
  white: '#FFFFFF',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB'
};

// Fournisseurs
export const FOURNISSEURS = [
  'NED',
  'AUTODISTRIBUTION',
  'DELDO',
  'WYZ',
  'CORA',
  'COURTOISE AUTO FORD SUZUKI',
  'CULTURE PNEUS',
  'APOGEE MOTORS HONDA',
  'DELESTREZ',
  'DISPROFITZ PEUG CITR DS OPEL CHEVRO',
  'Divers Comptoir',
  'GT PICARDIE TOYOTA',
  'GUEUDET RENAULT DACIA BMW TOYO NISS',
  'KIA',
  'MAZDA FIBEE',
  'ABVV VOLVO LANDROVER JAGUAR',
  'SADELL MAZDA MITSUBISHI SUBARU',
  'SAINT MAX AUTOS SEAT SKODA',
  'TDPR HYUNDAI',
  'ESPACE SAINT MAX VOLKSWAGEN AUDI',
  'XPR FIAT JEEP ALFA',
  'MERCEDES-BENZ TECHSTAR',
  'SAGA 60 VAG',
  'AUTODOC PRO',
  'TEAMFRANCE',
  'OVOKOE',
  'BAY',
  'VSF',
  'VALUSED',
  'AMAZON'
];

// Configuration des huiles
export const HUILES_CONFIG = {
  '5W30': { prixUnitaire: 3, unite: 'litre' },
  '5W40': { prixUnitaire: 3, unite: 'litre' },
  '0W30': { prixUnitaire: 3, unite: 'litre' },
  '0W20 PSA': { prixUnitaire: 3, unite: 'litre' },
  '5W30 RN17': { prixUnitaire: 3, unite: 'litre' },
  '5W30 PSA': { prixUnitaire: 3.67, unite: 'litre' },
  '5W20 FORD': { prixUnitaire: 25, unite: 'bidon5L' },
  '0W20 VW AUDI FIAT': { prixUnitaire: 25, unite: 'bidon5L' },
  '5W30 RN720': { prixUnitaire: 25, unite: 'bidon5L' }
};

// Items de checklist - Gauche
export const LEFT_ITEMS = [
  { id: 'miseANiveau', label: 'Mise à niveau' },
  { id: 'filtreHuile', label: 'Filtre à huile' },
  { id: 'filtrePollen', label: 'Filtre à pollen' },
  { id: 'filtreAir', label: 'Filtre à air' },
  { id: 'filtreCarburant', label: 'Filtre à carburant' },
  { id: 'bougies', label: 'Bougies' }
];

// Items de checklist - Droite
export const RIGHT_ITEMS = [
  { id: 'vidangeBoite', label: 'Vidange de boite' },
  { id: 'liquideFrein', label: 'Liquide de frein' },
  { id: 'liquideRefroidissement', label: 'Liquide de refroidissement' },
  { id: 'courroieDistribution', label: 'Courroie de distribution' },
  { id: 'courroieAccessoire', label: 'Courroie accessoire' }
];

// Items de checklist 2 - Gauche
export const LEFT_ITEMS_2 = [
  { id: 'amortisseursAvant', label: 'Amortisseurs avant' },
  { id: 'amortisseursArriere', label: 'Amortisseurs arrière' },
  { id: 'triangles', label: 'Triangles' },
  { id: 'geometriePara', label: 'Géométrie/Para' }
];

// Items de checklist 2 - Droite
export const RIGHT_ITEMS_2 = [
  { id: 'extraction', label: 'Extraction' },
  { id: 'balaisAv', label: 'Balais AV' },
  { id: 'balaiAr', label: 'Balai AR' }
];

// Items de checklist 3 - Gauche (avec notes)
export const LEFT_ITEMS_3 = [
  { id: 'pneusAvant', label: 'Pneus avant', hasNote: true },
  { id: 'pneusArriere', label: 'Pneus arrière', hasNote: true },
  { id: 'pneus4', label: 'Pneus avant et arrière', hasNote: true }
];

// Items de checklist 3 - Droite (avec notes)
export const RIGHT_ITEMS_3 = [
  { id: 'disquesPlaquettesAv', label: 'Disques et plaquettes AV', hasNote: true },
  { id: 'disquesPlaquettesAr', label: 'Disques et plaquettes AR', hasNote: true }
];

// Items texte 1
export const TEXT_ITEMS_1 = [
  { id: 'repc1', label: 'REPC1', hasNote: true },
  { id: 'repc2', label: 'REPC2', hasNote: true },
  { id: 'repc3', label: 'REPC3', hasNote: true },
  { id: 'repc4', label: 'REPC4', hasNote: true }
];

// Items texte 2
export const TEXT_ITEMS_2 = [
  { id: 'rempc1', label: 'REMPC1', hasNote: true },
  { id: 'rempc2', label: 'REMPC2', hasNote: true },
  { id: 'rempc3', label: 'REMPC3', hasNote: true },
  { id: 'rempc4', label: 'REMPC4', hasNote: true }
];

// Items texte 3
export const TEXT_ITEMS_3 = [
  { id: 'repm1', label: 'REPM1', hasNote: true },
  { id: 'repm2', label: 'REPM2', hasNote: true },
  { id: 'repm3', label: 'REPM3', hasNote: true },
  { id: 'repm4', label: 'REPM4', hasNote: true }
];

// Items texte 4
export const TEXT_ITEMS_4 = [
  { id: 'rempm1', label: 'REMPM1', hasNote: true },
  { id: 'rempm2', label: 'REMPM2', hasNote: true },
  { id: 'rempm3', label: 'REMPM3', hasNote: true },
  { id: 'rempm4', label: 'REMPM4', hasNote: true }
];

// Tous les items combinés
export const ALL_ITEMS = [
  ...LEFT_ITEMS,
  ...RIGHT_ITEMS,
  ...LEFT_ITEMS_2,
  ...RIGHT_ITEMS_2,
  ...LEFT_ITEMS_3,
  ...RIGHT_ITEMS_3,
  ...TEXT_ITEMS_1,
  ...TEXT_ITEMS_2,
  ...TEXT_ITEMS_3,
  ...TEXT_ITEMS_4
];

// Items qui ne peuvent pas avoir plusieurs pièces
export const EXCLUDED_MULTI_PIECES = [
  'miseANiveau',
  'liquideFrein',
  'liquideRefroidissement',
  'geometriePara',
  'pneusAvant',
  'pneusArriere',
  'pneus4',
  'repc1', 'repc2', 'repc3', 'repc4',
  'rempc1', 'rempc2', 'rempc3', 'rempc4',
  'repm1', 'repm2', 'repm3', 'repm4',
  'rempm1', 'rempm2', 'rempm3', 'rempm4'
];

// Valeurs par défaut pour les forfaits
export const DEFAULT_VALUES = {
  miseANiveau: {
    moQuantity: '0.2',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: ''
  },
  filtreHuile: {
    moQuantity: '0.5',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: ''
  },
  liquideFrein: {
    moQuantity: '0.8',
    moPrix: '35.8',
    pieceReference: 'ILF4500',
    pieceQuantity: '1',
    piecePrix: '1',
    pieceFournisseur: 'Divers Comptoir'
  },
  liquideRefroidissement: {
    moQuantity: '0.6',
    moPrix: '35.8',
    pieceReference: 'LRJ',
    pieceQuantity: '1',
    piecePrix: '5',
    pieceFournisseur: 'Divers Comptoir'
  },
  default: {
    moQuantity: '0.1',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: ''
  }
};
