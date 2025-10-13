import { DEFAULT_VALUES, DSP_ITEMS, LUSTRAGE_ITEMS, PEINTURE_FORFAITS, PEINTURE_SEULE_FORFAITS, PLUME_ITEMS, PEINTURE_FORFAITS,PEINTURE_SEULE_FORFAITS } from '../config/constants';

// Obtenir les valeurs par défaut d'un item
export const getDefaultValues = (itemId) => {
  return DEFAULT_VALUES[itemId] || DEFAULT_VALUES.default;
};

// Calculer les totaux
export const calculateTotals = (
  activeMecaniqueItems, 
  forfaitData, 
  pieceLines, 
  includeControleTechnique, 
  includeContrevisite, 
  activeDSPItems = [],
  itemStates = {} // NOUVEAU paramètre pour les forfaits peinture
) => {
  const TARIF_HORAIRE = 71.6; // ✅ Correction du tarif
  
  let totalMOHeures = 0;
  let totalPieces = 0;
  let totalConsommables = 0;

  // ========================================
  // 1. MO OBLIGATOIRES (Prestations fixes)
  // ========================================
  const OBLIGATORY_PRESTATIONS = [
    { moQuantity: 0.10 }, // PLAQUE IMT
    { moQuantity: 0.10 }, // ESSAI
    { moQuantity: 0.10 }, // PEC
    { moQuantity: 0.10 }, // LG
    { moQuantity: 0.50 }, // PHOTOS (Controlling)
  ];
  
  OBLIGATORY_PRESTATIONS.forEach(item => {
    totalMOHeures += item.moQuantity;
  });

  // ========================================
  // 2. NETTOYAGE OBLIGATOIRE
  // ========================================
  const OBLIGATORY_CLEANING = [
    { moQuantity: 0.75, consommablePrix: 3.70 }, // Nettoyage intérieur
    { moQuantity: 0.42, consommablePrix: 3.70 }, // Nettoyage extérieur
  ];
  
  OBLIGATORY_CLEANING.forEach(item => {
    totalMOHeures += item.moQuantity;
    totalConsommables += item.consommablePrix;
  });

  // ========================================
  // 3. ITEMS DE LUSTRAGE
  // ========================================
  const activeLustrageItems = activeMecaniqueItems.filter(item => 
    LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );
  
  activeLustrageItems.forEach(lustrageItem => {
    const lustrageConfig = LUSTRAGE_ITEMS.find(item => item.id === lustrageItem.id);
    if (lustrageConfig) {
      const forfait = forfaitData[lustrageItem.id] || {};
      
      // Main d'œuvre
      const moQuantity = parseFloat(
        forfait.moQuantity !== undefined 
          ? forfait.moQuantity 
          : lustrageConfig.moQuantity
      ) || 0;
      totalMOHeures += moQuantity;
      
      // Consommables
      const consommableQuantity = parseFloat(
        forfait.consommableQuantity !== undefined 
          ? forfait.consommableQuantity 
          : lustrageConfig.consommable
      ) || 0;
      const consommablePrixUnitaire = parseFloat(forfait.consommablePrixUnitaire || 1.00);
      totalConsommables += consommableQuantity * consommablePrixUnitaire;
    }
  });

  // ========================================
  // 4. ITEMS DE MÉCANIQUE (hors lustrage)
  // ========================================
  const pureMecaniqueItems = activeMecaniqueItems.filter(item => 
    !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );
  
  pureMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    
    const moQuantity = parseFloat(
      forfait.moQuantity !== undefined 
        ? forfait.moQuantity 
        : defaults.moQuantity
    ) || 0;
    const piecePrix = parseFloat(
      forfait.piecePrix !== undefined 
        ? forfait.piecePrix 
        : defaults.piecePrix
    ) || 0;
    const consommablePrix = parseFloat(forfait.consommablePrix || 0);
    
    totalMOHeures += moQuantity;
    totalPieces += piecePrix;
    totalConsommables += consommablePrix;
    
    // Pièces supplémentaires
    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        totalPieces += parseFloat(line.prix || 0) || 0;
      });
    }
  });

  // ========================================
  // 5. ITEMS DSP
  // ========================================
  activeDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item.id === dspItem.id);
    if (dspConfig) {
      totalMOHeures += dspConfig.moQuantity;
      totalConsommables += dspConfig.consommable;
    }
  });

  // ========================================
  // 6. FORFAITS PEINTURE (PEINTURE_FORFAITS)
  // ========================================
  const PEINTURE_FORFAITS = [
    // Importez depuis constants.js ou définissez localement
    // Pour l'instant, je vais les chercher dans forfaitData avec une logique générique
  ];
  
  Object.entries(forfaitData).forEach(([key, data]) => {
    // Détection des forfaits peinture par leurs propriétés
    if (data.mo1Quantity || data.mo2Quantity) {
      const state = itemStates[key] ?? 0;
      if (state > 0) { // Actif
        totalMOHeures += parseFloat(data.mo1Quantity || 0); // Tolerie
        totalMOHeures += parseFloat(data.mo2Quantity || 0); // Peinture
        totalConsommables += parseFloat(data.consommablePrix || 0);
      }
    }
  });

  // ========================================
  // 7. FORFAITS LUSTRAGE/PLUME 1 ÉLÉMENT
  // ========================================
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (data.lustrage1Elem === true) {
      totalMOHeures += parseFloat(data.moQuantity || 0);
      const consQty = parseFloat(data.consommableQuantity || 0);
      const consPU = parseFloat(data.consommablePrixUnitaire || 0);
      totalConsommables += consQty * consPU;
    }
    
    if (data.plume1Elem === true) {
      totalMOHeures += parseFloat(data.moQuantity || 0);
    }
  });

  // ========================================
  // 8. CALCUL FINAL
  // ========================================
  const totalMO = totalMOHeures * TARIF_HORAIRE;
  const prestationsExterieures = 
    (includeControleTechnique ? 42 : 0) + 
    (includeContrevisite ? 10 : 0);
  
  const totalHTSansPrestations = totalMO + totalPieces + totalConsommables;
  const totalHT = totalHTSansPrestations + prestationsExterieures;

  return {
    totalMOHeures: totalMOHeures.toFixed(2),
    totalMO: totalMO.toFixed(2),
    totalPieces: totalPieces.toFixed(2),
    totalConsommables: totalConsommables.toFixed(2),
    totalHTSansPrestations: totalHTSansPrestations.toFixed(2),
    totalHT: totalHT.toFixed(2)
  };
};

// Calculer les heures de MO par catégorie
export const calculateMOByCategory = (activeMecaniqueItems, forfaitData, activeDSPItems = [], activePlumeItems = [], itemStates = {}) => {
  // Initialisation des compteurs
  let mecanique = 0;
  let carrosserie = 0;
  let peinture = 0;
  let dsp = 0;
  let lustrage = 0;
  let controlling = 0;
  let forfaitaire = 0;
  let tolerie = 0;

  // Calcul pour les items de mécanique
  activeMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity) || 0;
    
    // Déterminer la catégorie
    let category = forfait.moCategory;
    
    // Si pas de catégorie définie, utiliser la catégorie par défaut
    if (!category) {
      const isLustrage = LUSTRAGE_ITEMS.some(l => l.id === item.id);
      category = isLustrage ? 'Lustrage' : 'Mécanique';
    }
    
    // Ajouter aux compteurs selon la catégorie
    switch (category) {
      case 'Mécanique':
        mecanique += moQuantity;
        break;
      case 'Carrosserie':
        carrosserie += moQuantity;
        break;
      case 'Peinture':
        peinture += moQuantity;
        break;
      case 'Lustrage':
        lustrage += moQuantity;
        break;
      case 'Controlling':
        controlling += moQuantity;
        break;
      case 'Forfaitaire':
        forfaitaire += moQuantity;
        break;
      case 'Tolerie':
        tolerie += moQuantity;
        break;
      default:
        mecanique += moQuantity;
        break;
    }
  });

  // Calcul pour les items DSP
  activeDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item.id === dspItem.id);
    if (dspConfig) {
      dsp += dspConfig.moQuantity;
    }
  });

  // Calcul pour les items PLUME
  activePlumeItems.forEach(plumeItem => {
    const plumeConfig = PLUME_ITEMS.find(item => item.id === plumeItem.id);
    if (plumeConfig) {
      lustrage += plumeConfig.moQuantity;
    }
  });

  // Calcul pour les forfaits de réparation peinture
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    
    if (state > 0) {
      const mo1Qty = parseFloat(forfait.mo1Quantity || 0);
      tolerie += mo1Qty;
      
      const mo2Qty = parseFloat(forfait.mo2Quantity || 0);
      peinture += mo2Qty;
    }
  });

  // FORFAITS PEINTURE SEULE
  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    
    if (state > 0) {
      const moQty = parseFloat(forfait.moQuantity || 0);
      peinture += moQty;
    }
  });

  // Calcul pour Lustrage 1 élément (stackables)
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (data.lustrage1Elem === true) {
      const moQty = parseFloat(data.moQuantity || 0);
      lustrage += moQty;
    }
  });

  // Calcul pour Plume 1 élément (stackables)
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (data.plume1Elem === true) {
      const moQty = parseFloat(data.moQuantity || 0);
      mecanique += moQty;
    }
  });

  // Retourner les totaux par catégorie
  return {
    mecanique: mecanique,
    carrosserie: carrosserie,
    peinture: peinture,
    dsp: dsp,
    lustrage: lustrage,
    controlling: controlling,
    forfaitaire: forfaitaire,
    tolerie: tolerie
  };
};

// Obtenir la liste des pièces par fournisseur
export const getPiecesListBySupplier = (activeMecaniqueItems, forfaitData, pieceLines) => {
  const piecesBySupplier = {};

  activeMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    
    const pieceReference = forfait.pieceReference !== undefined ? forfait.pieceReference : defaults.pieceReference;
    if (pieceReference && item.id !== 'miseANiveau') {
      const supplier = forfait.pieceFournisseur !== undefined ? forfait.pieceFournisseur : (defaults.pieceFournisseur || 'Non défini');
      const quantity = forfait.pieceQuantity !== undefined ? forfait.pieceQuantity : defaults.pieceQuantity;
      const designation = forfait.pieceDesignation !== undefined ? forfait.pieceDesignation : defaults.pieceDesignation;
      const prixUnitaire = parseFloat(forfait.piecePrixUnitaire !== undefined ? forfait.piecePrixUnitaire : defaults.piecePrixUnitaire) || 0;

      if (!piecesBySupplier[supplier]) {
        piecesBySupplier[supplier] = [];
      }
      
      piecesBySupplier[supplier].push({
        reference: pieceReference,
        designation: designation,
        quantity: quantity,
        prixUnitaire: prixUnitaire.toFixed(2)
      });
    }
    
    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        const supplier = line.fournisseur || 'Non défini';
        if (!piecesBySupplier[supplier]) {
          piecesBySupplier[supplier] = [];
        }
        if (line.reference) {
          piecesBySupplier[supplier].push({
            reference: line.reference,
            designation: line.designation,
            quantity: line.quantity,
            prixUnitaire: parseFloat(line.prixUnitaire || 0).toFixed(2)
          });
        }
      });
    }
  });

  return piecesBySupplier;
};
