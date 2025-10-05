import { DEFAULT_VALUES } from '../config/constants';

// Obtenir les valeurs par défaut d'un item
export const getDefaultValues = (itemId) => {
  return DEFAULT_VALUES[itemId] || DEFAULT_VALUES.default;
};

// Calculer les totaux
export const calculateTotals = (activeMecaniqueItems, forfaitData, pieceLines, includeControleTechnique, includeContrevisite) => {
  let totalMOHeures = 0;
  let totalPieces = 0;
  let totalConsommables = 0;

  activeMecaniqueItems.forEach(item => {
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
export const calculateMOByCategory = (activeMecaniqueItems, forfaitData) => {
  const categories = {
    'Mécanique': 0,
    'Carrosserie': 0,
    'Peinture': 0,
    'DSP': 0,
    'Lustrage': 0
  };

  activeMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity) || 0;
    const category = forfait.moCategory || 'Mécanique';
    
    if (categories[category] !== undefined) {
      categories[category] += moQuantity;
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
      const unitPrice = forfait.piecePrixUnitaire || '';
      
      if (!piecesBySupplier[supplier]) {
        piecesBySupplier[supplier] = [];
      }
      
      piecesBySupplier[supplier].push({
        reference: pieceReference,
        designation: forfait.pieceDesignation || '',
        quantity: quantity,
        unitPrice: unitPrice
      });
    }
    
    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        if (line.reference) {
          const supplier = line.fournisseur || 'Non défini';
          
          if (!piecesBySupplier[supplier]) {
            piecesBySupplier[supplier] = [];
          }
          
          piecesBySupplier[supplier].push({
            reference: line.reference,
            designation: line.designation || '',
            quantity: line.quantity,
            unitPrice: line.prixUnitaire || ''
          });
        }
      });
    }
  });

  return piecesBySupplier;
};
