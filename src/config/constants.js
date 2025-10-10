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

// Ajout d'un élément de peinture (exemple)
export const PEINTURE_FORFAITS = [
  {
    id: 'peinture_bouclier_avant',
    label: 'Peinture Bouclier Avant',
    moQuantity: 1.2,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: '',
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: '',
    consommablePrixUnitaire: '',
    consommablePrix: ''
  }
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
  { id: 'disquesPlaquettesAr', label: 'Disques et plaquettes AR', hasNote: true },
  { id: 'plaquettesAv', label: 'plaquettes avant', hasNote: true },
  { id: 'plaquettesAr', label: 'plaquettes arrière', hasNote: true }
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

// ===== FORFAITS DSP =====
export const DSP_ITEMS = [
  // Ailes
  { id: 'dspAileAvd', label: 'DSP Aile avant droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspAileArd', label: 'DSP Aile arrière droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspAileAvg', label: 'DSP Aile avant gauche', moQuantity: 0.5, consommable: 0 },
  { id: 'dspAileArg', label: 'DSP Aile arrière gauche', moQuantity: 0.5, consommable: 0 },
  
  // Portes
  { id: 'dspPorteAvd', label: 'DSP Porte avant droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPorteArd', label: 'DSP Porte arrière droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPorteAvg', label: 'DSP Porte avant gauche', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPorteArg', label: 'DSP Porte arrière gauche', moQuantity: 0.5, consommable: 0 },
  
  // Éléments de carrosserie
  { id: 'dspCapot', label: 'DSP Capot', moQuantity: 0.5, consommable: 0 },
  { id: 'dspHayon', label: 'DSP Hayon', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPavillon', label: 'DSP Pavillon', moQuantity: 0.5, consommable: 0 },
  
  // Montants côté droit
  { id: 'dspMontantAD', label: 'DSP Montant AD', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantBD', label: 'DSP Montant BD', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantCD', label: 'DSP Montant CD', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantDD', label: 'DSP Montant DD', moQuantity: 0.5, consommable: 0 },
  
  // Montants côté gauche
  { id: 'dspMontantAG', label: 'DSP Montant AG', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantBG', label: 'DSP Montant BG', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantCG', label: 'DSP Montant CG', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantDG', label: 'DSP Montant DG', moQuantity: 0.5, consommable: 0 },
  
  // Bas de caisse
  { id: 'dspBdcd', label: 'DSP Bas caisse d', moQuantity: 0.5, consommable: 0 },
  { id: 'dspBdcg', label: 'DSP Bas caisse g', moQuantity: 0.5, consommable: 0 },
  
  // Forfaits spéciaux grêle
  { id: 'dspGrelePavillon', label: 'DSP Grêle Pavillon', moQuantity: 4, consommable: 0 },
  { id: 'dspGreleCapot', label: 'DSP Grêle Capot', moQuantity: 2, consommable: 0 }
];

// ===== FORFAITS LUSTRAGE =====
export const LUSTRAGE_ITEMS = [
  { id: 'L1', label: 'Lustrage 1 élément', moQuantity: 0.25, consommable: 1.00 },
  { id: "L2", label: "Lustrage 2 éléments", moQuantity: 0.25, consommable: 2.00 },
  { id: "L3", label: "Lustrage capot ou pavillon", moQuantity: 0.25, consommable: 1.00 },
  { id: "L4", label: "Lustrage latéral", moQuantity: 0.25, consommable: 2.00 },
  { id: "L6", label: "Lustrage 2 coques rétroviseurs", moQuantity: 0.25, consommable: 1.00 },
  { id: "L7", label: "Lustrage moulure", moQuantity: 0.25, consommable: 0.50 },
  { id: "L9", label: "Lustrage bouclier avant et arrière", moQuantity: 0.25, consommable: 2.00 },
  { id: "LAARD", label: "Lustrage aile arrière droite", moQuantity: 0.25, consommable: 1.00 },
  { id: "LAARG", label: "Lustrage aile arrière gauche", moQuantity: 0.25, consommable: 1.00 },
  { id: "LAAVD", label: "Lustrage aile avant droite", moQuantity: 0.25, consommable: 1.00 },
  { id: "LAAVG", label: "Lustrage aile avant gauche", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPAVILLON", label: "Lustrage pavillon", moQuantity: 0.25, consommable: 1.00 },
  { id: "LCP", label: "Lustrage capot", moQuantity: 0.25, consommable: 1.00 },
  { id: "LCRD", label: "Lustrage coque rétro droite", moQuantity: 0.25, consommable: 0.50 },
  { id: "LCRG", label: "Lustrage coque rétro gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LH", label: "Lustrage hayon", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPCAR", label: "Lustrage pare-choc arrière", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPCAV", label: "Lustrage pare-choc avant", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPTEARD", label: "Lustrage porte arrière droite", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPTEARG", label: "Lustrage porte arrière gauche", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPTEAVD", label: "Lustrage porte avant droite", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPTEAVG", label: "Lustrage porte avant gauche", moQuantity: 0.25, consommable: 1.00 },
  { id: "LFAD", label: "Lustrage feu arrière droit", moQuantity: 0.25, consommable: 0.50 },
  { id: "LPD", label: "Lustrage phare droit", moQuantity: 0.25, consommable: 0.50 },
  { id: "LFAG", label: "Lustrage feu arrière gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LPG", label: "Lustrage phare gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "REP PB", label: "Réfection pare-brise", moQuantity: 0.50, consommable: 0.00 },
  { id: "LMAD", label: "Lustrage montant A droit", moQuantity: 0.25, consommable: 0.50 },
  { id: "LMBD", label: "Lustrage montant B droit", moQuantity: 0.25, consommable: 0.50 },
  { id: "LMCD", label: "Lustrage montant C droit", moQuantity: 0.25, consommable: 0.50 },
  { id: "LMDD", label: "Lustrage montant D droit", moQuantity: 0.25, consommable: 0.50 },
  { id: "LMAG", label: "Lustrage montant A gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LMBG", label: "Lustrage montant B gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LMCG", label: "Lustrage montant C gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LMDG", label: "Lustrage montant D gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LBH", label: "Lustrage becquet de hayon", moQuantity: 0.25, consommable: 0.50 },
  { id: "LAAR", label: "Lustrage aileron arrière", moQuantity: 0.25, consommable: 1.00 },
  { id: "LPDPAVD", label: "Lustrage poignée de porte avant droite", moQuantity: 0.25, consommable: 0.50 },
  { id: "LPDPAVG", label: "Lustrage poignée de porte avant gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LPDPARD", label: "Lustrage poignée de porte arrière droite", moQuantity: 0.25, consommable: 0.50 },
  { id: "LPDPARG", label: "Lustrage poignée de porte arrière gauche", moQuantity: 0.25, consommable: 0.50 },
  { id: "LBDCD", label: "Lustrage bas de caisse droit", moQuantity: 0.25, consommable: 1.00 },
  { id: "LBDCG", label: "Lustrage bas de caisse gauche", moQuantity: 0.25, consommable: 1.00 },
  { id: "DE-COVERING", label: "Retrait covering", moQuantity: 0.25, consommable: 0.00 }
];

// Organiser les items DSP en deux colonnes pour l'affichage
export const DSP_LEFT_ITEMS = [
  { id: 'dspAileAvd', label: 'DSP Aile avant droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspAileArd', label: 'DSP Aile arrière droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspAileAvg', label: 'DSP Aile avant gauche', moQuantity: 0.5, consommable: 0 },
  { id: 'dspAileArg', label: 'DSP Aile arrière gauche', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPorteAvd', label: 'DSP Porte avant droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPorteArd', label: 'DSP Porte arrière droite', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPorteAvg', label: 'DSP Porte avant gauche', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPorteArg', label: 'DSP Porte arrière gauche', moQuantity: 0.5, consommable: 0 },
  { id: 'dspCapot', label: 'DSP Capot', moQuantity: 0.5, consommable: 0 },
  { id: 'dspHayon', label: 'DSP Hayon', moQuantity: 0.5, consommable: 0 },
  { id: 'dspPavillon', label: 'DSP Pavillon', moQuantity: 0.5, consommable: 0 },
  { id: 'dspBdcd', label: 'DSP Bas caisse d', moQuantity: 0.5, consommable: 0 }
];

export const DSP_RIGHT_ITEMS = [
  { id: 'dspMontantAD', label: 'DSP Montant AD', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantBD', label: 'DSP Montant BD', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantCD', label: 'DSP Montant CD', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantDD', label: 'DSP Montant DD', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantAG', label: 'DSP Montant AG', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantBG', label: 'DSP Montant BG', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantCG', label: 'DSP Montant CG', moQuantity: 0.5, consommable: 0 },
  { id: 'dspMontantDG', label: 'DSP Montant DG', moQuantity: 0.5, consommable: 0 },
  { id: 'dspBdcg', label: 'DSP Bas caisse g', moQuantity: 0.5, consommable: 0 },
  { id: 'dspGrelePavillon', label: 'DSP Grêle Pavillon', moQuantity: 4, consommable: 0 },
  { id: 'dspGreleCapot', label: 'DSP Grêle Capot', moQuantity: 2, consommable: 0 }
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
  ...TEXT_ITEMS_4,
  ...DSP_ITEMS,
  ...LUSTRAGE_ITEMS
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
  pieceReference: '',
  pieceQuantity: '',
  piecePrix: '',
  pieceFournisseur: '',
  consommableReference: 'ILF4500',
  consommableDesignation: 'Liquide de frein',
  consommableQuantity: '1',
  consommablePrixUnitaire: '1',
  consommablePrix: '1'
},
liquideRefroidissement: {
  moQuantity: '0.6',
  moPrix: '35.8',
  pieceReference: '',
  pieceQuantity: '',
  piecePrix: '',
  pieceFournisseur: '',
  consommableReference: 'LRJ',
  consommableDesignation: 'Liquide de refroidissement',
  consommableQuantity: '1',
  consommablePrixUnitaire: '5',
  consommablePrix: '5'
},
  pneusAvant: {
    moQuantity: '0.5',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '2',
    piecePrix: '',
    pieceFournisseur: ''
  },
  pneusArriere: {
    moQuantity: '0.5',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '2',
    piecePrix: '',
    pieceFournisseur: ''
  },
  pneus4: {
    moQuantity: '1.0',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '4',
    piecePrix: '',
    pieceFournisseur: ''
  },
  disquesPlaquettesAv: {
    moQuantity: '0.5',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: '',
    pieceFournisseur: ''
  },
  disquesPlaquettesAr: {
    moQuantity: '1.3',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: '',
    pieceFournisseur: ''
  },
  plaquettesAv: {
    moQuantity: '0.5',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: '',
    pieceFournisseur: ''
  },
  plaquettesAr: {
    moQuantity: '0.8',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: '',
    pieceFournisseur: ''
  },
  default: {
    moQuantity: '0.1',
    moPrix: '35.8',
    pieceReference: '',
    pieceQuantity: '1',
    piecePrix: ''
  }
};
