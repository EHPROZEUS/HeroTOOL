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
  { id: 'disquesPlaquettesAr', label: 'Disques et plaquettes AR', hasNote: true },
  { id: 'plaquettesAv', label: 'Plaquettes avant', hasNote: true },
  { id: 'plaquettesAr', label: 'Plaquettes arrière', hasNote: true }
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

// Organiser les items DSP en deux colonnes pour l'affichage (généré dynamiquement pour éviter redondance)
export const DSP_LEFT_ITEMS = DSP_ITEMS.filter(item => [
  'dspAileAvd', 'dspAileArd', 'dspAileAvg', 'dspAileArg', 'dspPorteAvd', 'dspPorteArd', 'dspPorteAvg', 'dspPorteArg',
  'dspCapot', 'dspHayon', 'dspPavillon', 'dspBdcd'
].includes(item.id));

export const DSP_RIGHT_ITEMS = DSP_ITEMS.filter(item => [
  'dspMontantAD', 'dspMontantBD', 'dspMontantCD', 'dspMontantDD', 'dspMontantAG', 'dspMontantBG', 'dspMontantCG', 'dspMontantDG',
  'dspBdcg', 'dspGrelePavillon', 'dspGreleCapot'
].includes(item.id));

// ===== FORFAITS LUSTRAGE =====
export const LUSTRAGE_ITEMS = [
  { id: 'L1', label: 'Lustrage 1 élément', moQuantity: 0.25, consommable: 1.00 },
  { id: 'L2', label: 'Lustrage 2 éléments', moQuantity: 0.25, consommable: 2.00 },
  { id: 'L3', label: 'Lustrage capot ou pavillon', moQuantity: 0.25, consommable: 1.00 },
  { id: 'L4', label: 'Lustrage latéral', moQuantity: 0.25, consommable: 2.00 },
  { id: 'L6', label: 'Lustrage 2 coques rétroviseurs', moQuantity: 0.25, consommable: 1.00 },
  { id: 'L7', label: 'Lustrage moulure', moQuantity: 0.25, consommable: 0.50 },
  { id: 'L9', label: 'Lustrage bouclier avant et arrière', moQuantity: 0.25, consommable: 2.00 },
  { id: 'LAARD', label: 'Lustrage aile arrière droite', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LAARG', label: 'Lustrage aile arrière gauche', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LAAVD', label: 'Lustrage aile avant droite', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LAAVG', label: 'Lustrage aile avant gauche', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPAVILLON', label: 'Lustrage pavillon', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LCP', label: 'Lustrage capot', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LCRD', label: 'Lustrage coque rétro droite', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LCRG', label: 'Lustrage coque rétro gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LH', label: 'Lustrage hayon', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPCAR', label: 'Lustrage pare-choc arrière', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPCAV', label: 'Lustrage pare-choc avant', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPTEARD', label: 'Lustrage porte arrière droite', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPTEARG', label: 'Lustrage porte arrière gauche', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPTEAVD', label: 'Lustrage porte avant droite', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPTEAVG', label: 'Lustrage porte avant gauche', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LFAD', label: 'Lustrage feu arrière droit', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LPD', label: 'Lustrage phare droit', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LFAG', label: 'Lustrage feu arrière gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LPG', label: 'Lustrage phare gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'REP PB', label: 'Réfection pare-brise', moQuantity: 0.50, consommable: 0.00 },
  { id: 'LMAD', label: 'Lustrage montant A droit', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LMBD', label: 'Lustrage montant B droit', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LMCD', label: 'Lustrage montant C droit', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LMDD', label: 'Lustrage montant D droit', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LMAG', label: 'Lustrage montant A gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LMBG', label: 'Lustrage montant B gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LMCG', label: 'Lustrage montant C gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LMDG', label: 'Lustrage montant D gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LBH', label: 'Lustrage becquet de hayon', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LAAR', label: 'Lustrage aileron arrière', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LPDPAVD', label: 'Lustrage poignée de porte avant droite', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LPDPAVG', label: 'Lustrage poignée de porte avant gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LPDPARD', label: 'Lustrage poignée de porte arrière droite', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LPDPARG', label: 'Lustrage poignée de porte arrière gauche', moQuantity: 0.25, consommable: 0.50 },
  { id: 'LBDCD', label: 'Lustrage bas de caisse droit', moQuantity: 0.25, consommable: 1.00 },
  { id: 'LBDCG', label: 'Lustrage bas de caisse gauche', moQuantity: 0.25, consommable: 1.00 },
  { id: 'DE-COVERING', label: 'Retrait covering', moQuantity: 0.25, consommable: 0.00 }
];

// ===== FORFAITS PLUME (16 forfaits) =====
export const PLUME_ITEMS = [
  { id: 'plume1Elem', label: 'Plume 1 élément', moQuantity: 0.2, consommable: 0 },
  
  // Ailes
  { id: 'plumeAileARD', label: 'Plume Aile ARD', moQuantity: 0.2, consommable: 0 },
  { id: 'plumeAileARG', label: 'Plume Aile ARG', moQuantity: 0.2, consommable: 0 },
  { id: 'plumeAileAVD', label: 'Plume Aile AVD', moQuantity: 0.2, consommable: 0 },
  { id: 'plumeAileAVG', label: 'Plume Aile AVG', moQuantity: 0.2, consommable: 0 },
  
  // Éléments horizontaux
  { id: 'plumePavillon', label: 'Plume Pavillon', moQuantity: 0.2, consommable: 0 },
  { id: 'plumeCapot', label: 'Plume Capot', moQuantity: 0.2, consommable: 0 },
  { id: 'plumeHayon', label: 'Plume Hayon', moQuantity: 0.2, consommable: 0 },
  
  // Coques rétro
  { id: 'plumeCoqueRetroD', label: 'Plume Coque rétro D', moQuantity: 0.2, consommable: 0 },
  { id: 'plumeCoqueRetroG', label: 'Plume Coque rétro G', moQuantity: 0.2, consommable: 0 },
  
  // Pare-chocs
  { id: 'plumeParechocAR', label: 'Plume Pare-choc AR', moQuantity: 0.2, consommable: 0 },
  { id: 'plumeParechocAV', label: 'Plume Pare-choc AV', moQuantity: 0.2, consommable: 0 },
  
  // Portes
  { id: 'plumePorteARD', label: 'Plume Porte ARD', moQuantity: 0.2, consommable: 0 },
  { id: 'plumePorteARG', label: 'Plume Porte ARG', moQuantity: 0.2, consommable: 0 },
  { id: 'plumePorteAVD', label: 'Plume Porte AVD', moQuantity: 0.2, consommable: 0 },
  { id: 'plumePorteAVG', label: 'Plume Porte AVG', moQuantity: 0.2, consommable: 0 }
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
  ...LUSTRAGE_ITEMS,
  ...PLUME_ITEMS
  // NE PAS AJOUTER PEINTURE_FORFAITS ICI
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

// Valeurs par défaut pour les forfaits (harmonisées avec nombres pour calculs)
export const DEFAULT_VALUES = {
  miseANiveau: {
    moQuantity: 0.2,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  filtreHuile: {
    moQuantity: 0.5,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  liquideFrein: {
    moQuantity: 0.8,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 0,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: 'ILF4500',
    consommableDesignation: 'Liquide de frein',
    consommableQuantity: 1,
    consommablePrixUnitaire: 1,
    consommablePrix: 1
  },
  liquideRefroidissement: {
    moQuantity: 0.6,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 0,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: 'LRJ',
    consommableDesignation: 'Liquide de refroidissement',
    consommableQuantity: 1,
    consommablePrixUnitaire: 5,
    consommablePrix: 5
  },
  pneusAvant: {
    moQuantity: 0.5,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 2,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  pneusArriere: {
    moQuantity: 0.5,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 2,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  pneus4: {
    moQuantity: 1.0,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 4,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  disquesPlaquettesAv: {
    moQuantity: 0.5,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  disquesPlaquettesAr: {
    moQuantity: 1.3,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  plaquettesAv: {
    moQuantity: 0.5,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  plaquettesAr: {
    moQuantity: 0.8,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  },
  default: {
    moQuantity: 0.1,
    moPrix: 35.8,
    pieceReference: '',
    pieceDesignation: '',
    pieceQuantity: 1,
    piecePrixUnitaire: 0,
    piecePrix: 0,
    pieceFournisseur: '',
    consommableReference: '',
    consommableDesignation: '',
    consommableQuantity: 0,
    consommablePrixUnitaire: 0,
    consommablePrix: 0
  }
};

// ===== FORFAITS PEINTURE (fusionnés et harmonisés) =====
export const PEINTURE_FORFAITS = [
  // 1 ÉLÉMENT GÉNÉRIQUE
  {
    id: 'R-P1',
    label: '1 Élément',
    mo1Designation: 'Réparation',
    mo1Quantity: 1.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // AILES
  {
    id: 'R-PAARD',
    label: 'Aile ARD',
    mo1Designation: 'Réparation',
    mo1Quantity: 1.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PAARG',
    label: 'Aile ARG',
    mo1Designation: 'Réparation',
    mo1Quantity: 1.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PAAVD',
    label: 'Aile AVD',
    mo1Designation: 'Réparation',
    mo1Quantity: 1.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PAAVG',
    label: 'Aile AVG',
    mo1Designation: 'Réparation',
    mo1Quantity: 1.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // PORTES
  {
    id: 'R-PPTEAVD',
    label: 'Porte AVD',
    mo1Designation: 'Réparation',
    mo1Quantity: 2,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PPTEAVG',
    label: 'Porte AVG',
    mo1Designation: 'Réparation',
    mo1Quantity: 2,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PPTEARD',
    label: 'Porte ARD',
    mo1Designation: 'Réparation',
    mo1Quantity: 2,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PPTEARG',
    label: 'Porte ARG',
    mo1Designation: 'Réparation',
    mo1Quantity: 2,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // ÉLÉMENTS HORIZONTAUX
  {
    id: 'R-PCP',
    label: 'Capot',
    mo1Designation: 'Réparation',
    mo1Quantity: 3,
    mo2Designation: 'Peinture',
    mo2Quantity: 4,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PAVILLON',
    label: 'Pavillon',
    mo1Designation: 'Réparation',
    mo1Quantity: 3,
    mo2Designation: 'Peinture',
    mo2Quantity: 4,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PH',
    label: 'Hayon',
    mo1Designation: 'Réparation',
    mo1Quantity: 2.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // PARE-CHOCS
  {
    id: 'R-PPCAV',
    label: 'Pare-choc AV',
    mo1Designation: 'Réparation',
    mo1Quantity: 1.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PPCAR',
    label: 'Pare-choc AR',
    mo1Designation: 'Réparation',
    mo1Quantity: 1.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // BAS DE CAISSE
  {
    id: 'R-PBDCD',
    label: 'Bas caisse D',
    mo1Designation: 'Réparation',
    mo1Quantity: 2.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 1.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'R-PBDCG',
    label: 'Bas caisse G',
    mo1Designation: 'Réparation',
    mo1Quantity: 2.5,
    mo2Designation: 'Peinture',
    mo2Quantity: 1.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // COQUES RÉTROS
  {
    id: 'R-PCRD',
    label: 'Coque rétro D',
    mo1Designation: 'Réparation',
    mo1Quantity: 1,
    mo2Designation: 'Peinture',
    mo2Quantity: 0.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  },
  {
    id: 'R-PCRG',
    label: 'Coque rétro G',
    mo1Designation: 'Réparation',
    mo1Quantity: 1,
    mo2Designation: 'Peinture',
    mo2Quantity: 0.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  },
  
  // PARE-BRISE
  {
    id: 'REMPLACEMENT-PB',
    label: 'Rempl. pare-brise',
    mo1Designation: 'Remplacement pare-brise',
    mo1Quantity: 2,
    mo2Designation: '',
    mo2Quantity: 0,
    consommableDesignation: 'Kit colle pare-brise',
    consommableQuantity: 1,
    consommablePrixUnitaire: 18.4,
    consommablePrix: 18.4
  }
];

export const PEINTURE_SEULE_FORFAITS = [
  // 1 ÉLÉMENT GÉNÉRIQUE
  {
    id: 'P-1ELEM',
    label: '1 Élément',
    moDesignation: 'Peinture',
    moQuantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // AILES
  {
    id: 'P-AARD',
    label: 'Aile ARD',
    moDesignation: 'Peinture',
    moQuantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-AARG',
    label: 'Aile ARG',
    moDesignation: 'Peinture',
    moQuantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-AAVD',
    label: 'Aile AVD',
    moDesignation: 'Peinture',
    moQuantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-AAVG',
    label: 'Aile AVG',
    moDesignation: 'Peinture',
    moQuantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // ÉLÉMENTS HORIZONTAUX
  {
    id: 'P-PAVILLON',
    label: 'Pavillon',
    moDesignation: 'Peinture',
    moQuantity: 4,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-CAPOT',
    label: 'Capot',
    moDesignation: 'Peinture',
    moQuantity: 3,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-HAYON',
    label: 'Hayon',
    moDesignation: 'Peinture',
    moQuantity: 3,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // COQUES RÉTROS
  {
    id: 'P-CRD',
    label: 'Coque rétro D',
    moDesignation: 'Peinture',
    moQuantity: 0.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  },
  {
    id: 'P-CRG',
    label: 'Coque rétro G',
    moDesignation: 'Peinture',
    moQuantity: 0.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  },
  
  // PARE-CHOCS
  {
    id: 'P-PCAR',
    label: 'Pare-choc AR',
    moDesignation: 'Peinture',
    moQuantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-PCAV',
    label: 'Pare-choc AV',
    moDesignation: 'Peinture',
    moQuantity: 2,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // PORTES
  {
    id: 'P-PTEARD',
    label: 'Porte ARD',
    moDesignation: 'Peinture',
    moQuantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-PTEARG',
    label: 'Porte ARG',
    moDesignation: 'Peinture',
    moQuantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-PTEAVD',
    label: 'Porte AVD',
    moDesignation: 'Peinture',
    moQuantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-PTEAVG',
    label: 'Porte AVG',
    moDesignation: 'Peinture',
    moQuantity: 2.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // BAS DE CAISSE
  {
    id: 'P-BDCD',
    label: 'Bas caisse D',
    moDesignation: 'Peinture',
    moQuantity: 1.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-BDCG',
    label: 'Bas caisse G',
    moDesignation: 'Peinture',
    moQuantity: 1.5,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // ÉLÉMENTS SPÉCIAUX
  {
    id: 'P-BECQUET',
    label: 'Becquet hayon',
    moDesignation: 'Peinture',
    moQuantity: 1,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  {
    id: 'P-AILERON',
    label: 'Aileron AR',
    moDesignation: 'Peinture',
    moQuantity: 1,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 1,
    consommablePrixUnitaire: 10,
    consommablePrix: 10
  },
  
  // POIGNÉES DE PORTE
  {
    id: 'P-PGTEAVD',
    label: 'Poignée AV D',
    moDesignation: 'Peinture',
    moQuantity: 1,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  },
  {
    id: 'P-PGTEAVG',
    label: 'Poignée AV G',
    moDesignation: 'Peinture',
    moQuantity: 1,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  },
  {
    id: 'P-PGTEARD',
    label: 'Poignée AR D',
    moDesignation: 'Peinture',
    moQuantity: 1,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  },
  {
    id: 'P-PGTEARG',
    label: 'Poignée AR G',
    moDesignation: 'Peinture',
    moQuantity: 1,
    consommableDesignation: 'Ingrédient peinture 500 ml',
    consommableQuantity: 0.5,
    consommablePrixUnitaire: 10,
    consommablePrix: 5
  }

];

// ===== EXPORTS FINAUX =====
// Tous les items combinés
export const ALL_FORFAITS = [
  ...PEINTURE_FORFAITS,
  ...PEINTURE_SEULE_FORFAITS,
  ...PLUME_ITEMS  
];
