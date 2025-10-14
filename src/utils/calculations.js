import { 
  DEFAULT_VALUES,
  DSP_ITEMS, 
  LUSTRAGE_ITEMS, 
  PLUME_ITEMS, 
  PEINTURE_FORFAITS, 
  PEINTURE_SEULE_FORFAITS 
} from '../config/constants';

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
  itemStates = {}
) => {
  let totalMOHeures = 0;
  let totalPieces = 0;
  let totalConsommables = 0;

  const validMecaniqueItems = (activeMecaniqueItems || []).filter(item => item && item.id);

  // Sépare lustrage/méca pour éviter les doublons
  const activeLustrageItems = validMecaniqueItems.filter(item => 
    LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );
  const pureMecaniqueItems = validMecaniqueItems.filter(item => 
    !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
  );

  // 1. MO des items méca actifs (hors lustrage)
  pureMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const defaults = getDefaultValues(item.id);
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : (defaults.moQuantity || 0)) || 0;
    totalMOHeures += moQuantity;

    // Pièces + consommables
    const piecePrix = parseFloat(forfait.piecePrix !== undefined ? forfait.piecePrix : (defaults.piecePrix || 0)) || 0;
    totalPieces += piecePrix;
    const consommablePrix = parseFloat(forfait.consommablePrix || 0) || 0;
    totalConsommables += consommablePrix;

    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        totalPieces += parseFloat(line.prix || 0) || 0;
      });
    }
  });

  // 2. MO des items lustrage actifs
  activeLustrageItems.forEach(lustrageItem => {
    const lustrageConfig = LUSTRAGE_ITEMS.find(item => item.id === lustrageItem.id);
    if (lustrageConfig) {
      const forfait = forfaitData[lustrageItem.id] || {};
      const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : (lustrageConfig.moQuantity || 0)) || 0;
      totalMOHeures += moQuantity;

      // Consommables lustrage
      const consommableQuantity = parseFloat(forfait.consommableQuantity !== undefined ? forfait.consommableQuantity : (lustrageConfig.consommable || 0)) || 0;
      const consommablePrixUnitaire = parseFloat(forfait.consommablePrixUnitaire || 1.00);
      const consommablePrix = consommableQuantity * consommablePrixUnitaire;
      totalConsommables += consommablePrix;
    }
  });

  // 3. MO des items DSP actifs
  const validDSPItems = (activeDSPItems || []).filter(dspItem => dspItem && dspItem.id);
  validDSPItems.forEach(dspItem => {
    const dspConfig = DSP_ITEMS.find(item => item && item.id === dspItem.id);
    if (dspConfig) {
      totalMOHeures += parseFloat(dspConfig.moQuantity || 0) || 0;
      totalConsommables += parseFloat(dspConfig.consommable || 0) || 0;
    }
  });

  // 4. MO des forfaits PEINTURE_FORFAITS et PEINTURE_SEULE_FORFAITS uniquement si activés (itemStates)
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      // Si overridé dans forfaitData, prendre la valeur personnalisée, sinon défaut
      const data = forfaitData[forfait.id] || {};
      const mo1 = parseFloat(data.mo1Quantity !== undefined ? data.mo1Quantity : forfait.mo1Quantity || 0) || 0;
      const mo2 = parseFloat(data.mo2Quantity !== undefined ? data.mo2Quantity : forfait.mo2Quantity || 0) || 0;
      totalMOHeures += mo1 + mo2;
      totalConsommables += parseFloat(data.consommablePrix !== undefined ? data.consommablePrix : forfait.consommablePrix || 0) || 0;
    }
  });

  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      const data = forfaitData[forfait.id] || {};
      const mo = parseFloat(data.moQuantity !== undefined ? data.moQuantity : forfait.moQuantity || 0) || 0;
      totalMOHeures += mo;
      totalConsommables += parseFloat(data.consommablePrix !== undefined ? data.consommablePrix : forfait.consommablePrix || 0) || 0;
    }
  });

  // 5. (OPTIONNEL) Si tu veux ajouter la gestion plume1Elem/lustrage1Elem, tu peux (idem, UNIQUEMENT si activé)
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

  // FIN — aucun autre ajout de MO, uniquement ce qui est activé sur le devis en cours

  const MoTableau = 74.106; // (si encore utile dans ton calcul)
  const totalMO = MoTableau + totalMOHeures * 35.8;
  const prestationsExterieures = (includeControleTechnique ? 42 : 0) + (includeContrevisite ? 10 : 0);
  const totalHTSansPrestations = totalPieces + totalConsommables;
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
  activePlumeItems = [],
  itemStates = {}
) => {
  const categories = {
    mecanique: 0,
    carrosserie: 0,
    peinture: 0,
    tolerie: 0,
    dsp: 0,
    lustrage: 0,
    controlling: 0,
    nettoyage: 0,
    forfaitaire: 0
  };

  // Utilitaire pour détecter la catégorie métier d'un item
  const detectCategory = (item, forfait = {}) => {
    // Priorité aux champs explicites
    let cat = (forfait.moCategory || item.moCategory || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cat) return cat;
    // Sinon heuristique sur le groupe
    if (LUSTRAGE_ITEMS.some(l => l.id === item.id)) return "lustrage";
    if (PLUME_ITEMS.some(p => p.id === item.id)) return "plume";
    if (DSP_ITEMS.some(d => d.id === item.id)) return "dsp";
    return "mecanique";
  };

  // 1. Ventilation des items mécaniques (hors DSP/Plume)
  activeMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const moQty = parseFloat(forfait.moQuantity) || 0;
    const cat = detectCategory(item, forfait);
    if (cat in categories) {
      categories[cat] += moQty;
    } else {
      categories.mecanique += moQty; // fallback
    }
  });

  // 2. Ventilation des DSP
  if (Array.isArray(activeDSPItems)) {
    activeDSPItems.forEach(item => {
      const dspConfig = DSP_ITEMS.find(d => d.id === item.id);
      if (dspConfig) {
        categories.dsp += parseFloat(dspConfig.moQuantity) || 0;
      }
    });
  }

  // 3. Ventilation des Plumes (catégorie dédiée ou à ajouter si besoin)
  if (Array.isArray(activePlumeItems)) {
    activePlumeItems.forEach(item => {
      const plumeConfig = PLUME_ITEMS.find(p => p.id === item.id);
      if (plumeConfig) {
        // Ajoute ici si tu veux une catégorie "plume"
        // categories.plume = (categories.plume || 0) + parseFloat(plumeConfig.moQuantity) || 0;
      }
    });
  }

  // 4. Forfaits Lustrage 1 élément
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (data.lustrage1Elem === true) {
      categories.lustrage += parseFloat(data.moQuantity) || 0;
    }
  });

  // 5. Forfaits Réparation Peinture
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      categories.tolerie += parseFloat(forfait.mo1Quantity) || 0;
      categories.peinture += parseFloat(forfait.mo2Quantity) || 0;
    }
  });

  // 6. Forfaits Peinture seule
  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      categories.peinture += parseFloat(forfait.moQuantity) || 0;
    }
  });



  // Parcourir les items de mécanique - SEULE LA CATÉGORIE "Mécanique" compte
const CLEANING_IDS = ['nettoyage-interieur', 'nettoyage-exterieur'];

activeMecaniqueItems.forEach(item => {
  const forfait = forfaitData[item.id] || {};
  const moQty = parseFloat(forfait.moQuantity) || 0;

  // Si c'est un item de nettoyage, on force la catégorie à "controlling"
  if (CLEANING_IDS.includes(item.id)) {
    categories.controlling += moQty;
    return;
  }

  // Sinon, ventilation classique selon la catégorie
  const cat = detectCategory(item, forfait);
  if (cat in categories) {
    categories[cat] += moQty;
  } else {
    categories.mecanique += moQty;
  }
});

  // Items DSP - NE PAS COMPTER dans mecanique
  if (Array.isArray(activeDSPItems)) {
    activeDSPItems.forEach(item => {
      const dspConfig = DSP_ITEMS.find(d => d.id === item.id);
      if (dspConfig) {
        categories.dsp += parseFloat(dspConfig.moQuantity) || 0;
      }
    });
  }

  // Items Plume - NE PAS COMPTER dans mecanique (ils ont leur propre catégorie)
  if (Array.isArray(activePlumeItems)) {
    activePlumeItems.forEach(item => {
      const plumeConfig = PLUME_ITEMS.find(p => p.id === item.id);
      if (plumeConfig) {
        const moQty = parseFloat(plumeConfig.moQuantity) || 0;
        // Les plumes ne sont PAS de la MO mécanique
        // Elles sont dans leur propre catégorie
      }
    });
  }

  // Forfaits Lustrage 1 élément - NE PAS COMPTER dans mecanique
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (data.lustrage1Elem === true) {
      categories.lustrage += parseFloat(data.moQuantity) || 0;
    }
  });

  // Forfaits Plume 1 élément - NE PAS COMPTER dans mecanique
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (data.plume1Elem === true) {
      // Ne pas ajouter aux catégories, c'est un forfait spécial
    }
  });

  // Forfaits Réparation + Peinture
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      categories.tolerie += parseFloat(forfait.mo1Quantity) || 0;
      categories.peinture += parseFloat(forfait.mo2Quantity) || 0;
    }
  });

  // Forfaits Peinture Seule
  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      categories.peinture += parseFloat(forfait.moQuantity) || 0;
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
