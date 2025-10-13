import { DEFAULT_VALUES, DSP_ITEMS, LUSTRAGE_ITEMS } from '../config/constants';

// Obtenir les valeurs par défaut d'un item
export const getDefaultValues = (itemId) => {
  const defaults = DEFAULT_VALUES[itemId] || DEFAULT_VALUES.default || {};
  return {
    moQuantity: 0,
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
    consommablePrix: 0,
    ...defaults
  };
};

// Calculer les totaux
export const calculateTotals = (
  activeMecaniqueItems = [], 
  forfaitData = {}, 
  pieceLines = {}, 
  includeControleTechnique = false, 
  includeContrevisite = false, 
  activeDSPItems = [],
  itemStates = {} // ✅ Ajout du paramètre
) => {
  let totalMOHeures = 0;
  let totalPieces = 0;
  let totalConsommables = 0;

  const validMecaniqueItems = (activeMecaniqueItems || []).filter(item => item && item.id);

  const activeLustrageItems = validMecaniqueItems.filter(item => 
    LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );
  
  const pureMecaniqueItems = validMecaniqueItems.filter(item => 
    !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );

  pureMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : (defaults.moQuantity || 0)) || 0;
    const piecePrix = parseFloat(forfait.piecePrix !== undefined ? forfait.piecePrix : (defaults.piecePrix || 0)) || 0;
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

  activeLustrageItems.forEach(lustrageItem => {
    const lustrageConfig = LUSTRAGE_ITEMS.find(item => item.id === lustrageItem.id);
    if (lustrageConfig) {
      const forfait = forfaitData[lustrageItem.id] || {};
      
      const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : (lustrageConfig.moQuantity || 0)) || 0;
      totalMOHeures += moQuantity;
      
      const consommableQuantity = parseFloat(forfait.consommableQuantity !== undefined ? forfait.consommableQuantity : (lustrageConfig.consommable || 0)) || 0;
      const consommablePrixUnitaire = parseFloat(forfait.consommablePrixUnitaire || 1.00);
      const consommablePrix = consommableQuantity * consommablePrixUnitaire;
      
      totalConsommables += consommablePrix;
    }
  });

  const validDSPItems = (activeDSPItems || []).filter(dspItem => dspItem && dspItem.id);
  
  validDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item && item.id === dspItem.id);
    if (dspConfig) {
      totalMOHeures += parseFloat(dspConfig.moQuantity || 0) || 0;
      totalConsommables += parseFloat(dspConfig.consommable || 0) || 0;
    }
  });

  Object.entries(forfaitData).forEach(([key, data]) => {
    if (!data) return;
    
    if (data.peintureForfait) {
      totalMOHeures += parseFloat(data.mo1Quantity || 0);
      totalMOHeures += parseFloat(data.mo2Quantity || 0);
      totalConsommables += parseFloat(data.consommablePrix || 0);
    }
    
    if (data.peintureSeuleForfait) {
      totalMOHeures += parseFloat(data.moQuantity || 0);
      totalConsommables += parseFloat(data.consommablePrix || 0);
    }
    
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

  const MoTableau = 2.07;
  const totalMO = MoTableau + totalMOHeures * 35.8;
  const prestationsExterieures = (includeControleTechnique ? 42 : 0) + (includeContrevisite ? 10 : 0);
  const totalHTSansPrestations = 7.4 + totalPieces + totalConsommables;
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
export const calculateMOByCategory = (
  activeMecaniqueItems = [], 
  forfaitData = {}, 
  activeDSPItems = [],
  activePlumeItems = [], // ✅ Ajout du paramètre
  itemStates = {} // ✅ Ajout du paramètre
) => {
  const categories = {
    'Mécanique': 0,
    'Carrosserie': 0,
    'Peinture': 0,
    'DSP': 0,
    'Lustrage': 0
  };

  const validMecaniqueItems = (activeMecaniqueItems || []).filter(item => item && item.id);

  validMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : (defaults.moQuantity || 0)) || 0;
    const category = forfait.moCategory || 'Mécanique';
    
    if (categories[category] !== undefined) {
      categories[category] += moQuantity;
    }
  });

  const validDSPItems = (activeDSPItems || []).filter(dspItem => dspItem && dspItem.id);

  validDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item && item.id === dspItem.id);
    if (dspConfig) {
      categories['DSP'] += parseFloat(dspConfig.moQuantity || 0) || 0;
    }
  });

  return categories;
};

// Obtenir la liste des pièces par fournisseur
export const getPiecesListBySupplier = (activeMecaniqueItems = [], forfaitData = {}, pieceLines = {}) => {
  const piecesBySupplier = {};

  const validMecaniqueItems = (activeMecaniqueItems || []).filter(item => item && item.id);

  validMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    
    const pieceReference = forfait.pieceReference !== undefined ? forfait.pieceReference : (defaults.pieceReference || '');
    if (pieceReference && item.id !== 'miseANiveau') {
      const supplier = forfait.pieceFournisseur !== undefined ? forfait.pieceFournisseur : (defaults.pieceFournisseur || 'Non défini');
      const quantity = forfait.pieceQuantity !== undefined ? forfait.pieceQuantity : (defaults.pieceQuantity || 1);
      
      if (!piecesBySupplier[supplier]) {
        piecesBySupplier[supplier] = [];
      }
      
      piecesBySupplier[supplier].push({
        itemId: item.id,
        itemLabel: item.label,
        reference: pieceReference,
        designation: forfait.pieceDesignation || defaults.pieceDesignation || '',
        quantity: quantity,
        prixUnitaire: forfait.piecePrixUnitaire || defaults.piecePrixUnitaire || 0,
        prixTotal: forfait.piecePrix || defaults.piecePrix || 0
      });
    }

    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        if (!line) return;
        
        const supplier = line.fournisseur || 'Non défini';
        if (!piecesBySupplier[supplier]) {
          piecesBySupplier[supplier] = [];
        }
        piecesBySupplier[supplier].push({
          itemId: item.id,
          itemLabel: item.label,
          reference: line.reference,
          designation: line.designation || '',
          quantity: line.quantity,
          prixUnitaire: line.prixUnitaire || 0,
          prixTotal: line.prix || 0
        });
      });
    }
  });

  return piecesBySupplier;
};
