import { DEFAULT_VALUES, DSP_ITEMS, LUSTRAGE_ITEMS } from '../config/constants';

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
  activeDSPItems = []
) => {
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
export const calculateMOByCategory = (activeMecaniqueItems, forfaitData, activeDSPItems = []) => {
  const categories = {
    'Mécanique': 0,
    'Carrosserie': 0,
    'Peinture': 0,
    'DSP': 0,
    'Lustrage': 0
  };

  // Calcul pour les items de mécanique
  activeMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity) || 0;
    const category = forfait.moCategory || 'Mécanique';
    
    if (categories[category] !== undefined) {
      categories[category] += moQuantity;
    }
  });

  // Calcul pour les items DSP
  activeDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item.id === dspItem.id);
    if (dspConfig) {
      categories['DSP'] += dspConfig.moQuantity;
    }
  });

  return categories;
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

    // Ajouter les pièces supplémentaires
    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
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
