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
    item && LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );
  
  // Items de mécanique sans les items de lustrage
  const pureMecaniqueItems = activeMecaniqueItems.filter(item => 
    item && !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );

  // Calcul pour les items de mécanique (hors lustrage)
  pureMecaniqueItems.forEach(item => {
    if (!item) return; // Sécurité supplémentaire
    
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
    if (!lustrageItem) return; // Sécurité supplémentaire
    
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

  // 🔧 CORRECTION ICI - Calcul pour les items DSP avec vérifications de sécurité
  activeDSPItems
    .filter(dspItem => dspItem && dspItem.id) // Filtrer les items undefined/null
    .forEach(dspItem => {
      const dspConfig = DSP_ITEMS.find(item => item && item.id === dspItem.id);
      if (dspConfig) {
        totalMOHeures += parseFloat(dspConfig.moQuantity) || 0;
        totalConsommables += parseFloat(dspConfig.consommable) || 0;
      }
    });

  // Calcul pour les forfaits peinture et autres forfaits dynamiques
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (!data) return; // Sécurité supplémentaire
    
    // Forfaits peinture (réparation + peinture)
    if (data.peintureForfait) {
      totalMOHeures += parseFloat(data.mo1Quantity || 0); // Tolerie
      totalMOHeures += parseFloat(data.mo2Quantity || 0); // Peinture
      totalConsommables += parseFloat(data.consommablePrix || 0);
    }
    
    // Forfaits lustrage 1 élément (stackables)
    if (data.lustrage1Elem === true) {
      totalMOHeures += parseFloat(data.moQuantity || 0);
      const consQty = parseFloat(data.consommableQuantity || 0);
      const consPU = parseFloat(data.consommablePrixUnitaire || 0);
      totalConsommables += consQty * consPU;
    }
    
    // Forfaits plume 1 élément (stackables)
    if (data.plume1Elem === true) {
      totalMOHeures += parseFloat(data.moQuantity || 0);
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
  activeMecaniqueItems
    .filter(item => item && item.id) // Filtrer les items undefined/null
    .forEach(item => {
      const forfait = forfaitData[item.id] || {};
      const defaults = getDefaultValues(item.id);
      const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity) || 0;
      const category = forfait.moCategory || 'Mécanique';
      
      if (categories[category] !== undefined) {
        categories[category] += moQuantity;
      }
    });

  // 🔧 CORRECTION ICI - Calcul pour les items DSP avec vérifications
  activeDSPItems
    .filter(dspItem => dspItem && dspItem.id) // Filtrer les items undefined/null
    .forEach(dspItem => {
      const dspConfig = DSP_ITEMS.find(item => item && item.id === dspItem.id);
      if (dspConfig) {
        categories['DSP'] += parseFloat(dspConfig.moQuantity) || 0;
      }
    });

  return categories;
};

// Obtenir la liste des pièces par fournisseur
export const getPiecesListBySupplier = (activeMecaniqueItems, forfaitData, pieceLines) => {
  const piecesBySupplier = {};

  activeMecaniqueItems
    .filter(item => item && item.id) // Filtrer les items undefined/null
    .forEach(item => {
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
          if (!line) return; // Sécurité
          
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
