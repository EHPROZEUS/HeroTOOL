import { DEFAULT_VALUES, DSP_ITEMS, LUSTRAGE_ITEMS, PEINTURE_FORFAITS, PEINTURE_SEULE_FORFAITS, PLUME_ITEMS } from '../config/constants';



// Obtenir les valeurs par défaut d'un item
export const getDefaultValues = (itemId) => {
  return DEFAULT_VALUES[itemId] || DEFAULT_VALUES.default;
};

// Calculer les totaux
export const calculateTotals = (activeMecaniqueItems, forfaitData, pieceLines, includeControleTechnique, includeContrevisite, activeDSPItems = [], activePlumeItems = []) => {

  let totalMOHeures = 0;
  let totalPieces = 0;
  let totalConsommables = 0;

  // Identifier les items de lustrage parmi les items de mécanique
  const activeLustrageItems = activeMecaniqueItems.filter(item => 
    LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );
  
  // Items de mécanique sans les items de lustrage
  const pureMecaniqueItems = activeMecaniqueItems.filter(item => 
    !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );

  // Calcul pour les items de mécanique (hors lustrage)
  pureMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity) || 0;
    const piecePrix = parseFloat(forfait.piecePrix !== undefined ? forfait.piecePrix : defaults.piecePrix) || 0;
    const consommablePrix = parseFloat(forfait.consommablePrix || 0) || 0;
    
    totalMOHeures += moQuantity;
    totalPieces += piecePrix;
    totalConsommables += consommablePrix;
    
    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        totalPieces += parseFloat(line.prix || 0) || 0;
      });
    }
  });

  // Calcul pour les items de lustrage
  activeLustrageItems.forEach(lustrageItem => {
    const lustrageConfig = LUSTRAGE_ITEMS.find(item => item.id === lustrageItem.id);
    if (lustrageConfig) {
      const forfait = forfaitData[lustrageItem.id] || {};
      
      // Main d'œuvre
      const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : lustrageConfig.moQuantity) || 0;
      totalMOHeures += moQuantity;
      
      // Consommables
      const consommableQuantity = parseFloat(forfait.consommableQuantity !== undefined ? forfait.consommableQuantity : lustrageConfig.consommable) || 0;
      const consommablePrixUnitaire = parseFloat(forfait.consommablePrixUnitaire || 1.00);
      const consommablePrix = consommableQuantity * consommablePrixUnitaire;
      
      totalConsommables += consommablePrix;
    }
  });

  // Calcul pour les items DSP
  activeDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item.id === dspItem.id);
    if (dspConfig) {
      totalMOHeures += dspConfig.moQuantity;
      totalConsommables += dspConfig.consommable;
    }
  });

  // Calcul pour les items DSP
  activeDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item.id === dspItem.id);
    if (dspConfig) {
      totalMOHeures += dspConfig.moQuantity;
      totalConsommables += dspConfig.consommable;
    }
  });

  // Calcul pour les items PLUME
  activePlumeItems.forEach(plumeItem => {
    const plumeConfig = PLUME_ITEMS.find(item => item.id === plumeItem.id);
    if (plumeConfig) {
      totalMOHeures += plumeConfig.moQuantity;
      totalConsommables += plumeConfig.consommable;
    }
  });


  const totalMO = totalMOHeures * 35.8;
  const prestationsExterieures = (includeControleTechnique ? 42 : 0) + (includeContrevisite ? 10 : 0);
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

  // NOUVEAU : Calcul pour les forfaits de réparation peinture
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    
    // Vérifier si le forfait est activé (state > 0)
    if (state > 0) {
      // MO Réparation (Tolerie)
      const mo1Qty = parseFloat(forfait.mo1Quantity || 0);
      tolerie += mo1Qty;
      
      // MO Peinture
      const mo2Qty = parseFloat(forfait.mo2Quantity || 0);
      peinture += mo2Qty;
    }
  });

    // NOUVEAU : Calcul pour les forfaits de réparation peinture
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