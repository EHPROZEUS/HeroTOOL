import { 
  DEFAULT_VALUES,
  DSP_ITEMS, 
  LUSTRAGE_ITEMS, 
  PLUME_ITEMS, 
  PEINTURE_FORFAITS, 
  PEINTURE_SEULE_FORFAITS 
} from '../config/constants';

const parseNumber = (v) => {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return v;
  // remplacer espaces insécables et virgules
  const s = String(v).replace(/\u00A0|\u202F/g, '').replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};
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

// -------------------------
// Calcul centralisé : calculateTotals
// - MO calculée UNE SEULE FOIS, basée uniquement sur les items actifs et itemStates
// - Pièces / consommables = uniquement provenant des items actifs (ou forfaits activés via itemStates)
// - Pas de double-comptage
// -------------------------
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

  const MANDATORY_CONSOMMABLES = 7.4; // <-- montant obligatoire à ajouter aux consommables
  const HOURLY = 35.8; // tarif horaire (1.0h = 35.8€)

  const CLEANING_IDS = ['nettoyage-interieur', 'nettoyage-exterieur'];

  const validMecaniqueItems = (activeMecaniqueItems || []).filter(i => i && i.id);
  const validDSPItems = (activeDSPItems || []).filter(i => i && i.id);

  // activeIds : sert à éviter double-comptage des forfaits déjà pris via activeMecaniqueItems
  const activeIds = new Set(validMecaniqueItems.map(i => i.id));

  validMecaniqueItems.forEach(item => {
    const id = item.id;
    const forfait = forfaitData[id] || {};
    const defaults = getDefaultValues(id);

    // MO : priorité forfait -> item -> defaults
    const moQuantity = parseNumber(
      forfait.moQuantity !== undefined
        ? forfait.moQuantity
        : (item && item.moQuantity !== undefined ? item.moQuantity : defaults.moQuantity || 0)
    ) || 0;
    totalMOHeures += moQuantity;

    // Pièce (forfait)
    const piecePrix = parseNumber(forfait.piecePrix !== undefined ? forfait.piecePrix : (defaults.piecePrix || 0));
    totalPieces += piecePrix;

    // Consommable (forfait)
    const consommablePrix = parseNumber(forfait.consommablePrix !== undefined ? forfait.consommablePrix : (defaults.consommablePrix || 0));
    totalConsommables += consommablePrix;

    // Pièces supplémentaires (dispatchées vers pieceLines)
    if (pieceLines[id]) {
      pieceLines[id].forEach(line => {
        totalPieces += parseNumber(line.prix || 0);
      });
    }
  });

  // DSP : priorité forfait -> item -> config
  validDSPItems.forEach(dspItem => {
    const id = dspItem.id;
    const forfait = forfaitData[id] || {};

    const moFromForfaitOrItem = parseNumber(
      forfait.moQuantity !== undefined
        ? forfait.moQuantity
        : (dspItem && dspItem.moQuantity !== undefined ? dspItem.moQuantity : 0)
    ) || 0;

    if (moFromForfaitOrItem > 0) {
      totalMOHeures += moFromForfaitOrItem;
      totalConsommables += parseNumber(forfait.consommablePrix || 0);
      activeIds.add(id);
    } else {
      const dspConfig = DSP_ITEMS.find(d => d.id === id);
      if (dspConfig) {
        totalMOHeures += parseNumber(dspConfig.moQuantity || 0) || 0;
        totalConsommables += parseNumber(dspConfig.consommable || 0);
      }
    }
  });

  // Forfaits peinture
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0 && !activeIds.has(forfait.id)) {
      const data = forfaitData[forfait.id] || {};
      const mo1 = parseNumber(data.mo1Quantity !== undefined ? data.mo1Quantity : forfait.mo1Quantity || 0) || 0;
      const mo2 = parseNumber(data.mo2Quantity !== undefined ? data.mo2Quantity : forfait.mo2Quantity || 0) || 0;
      totalMOHeures += mo1 + mo2;
      totalConsommables += parseNumber(data.consommablePrix !== undefined ? data.consommablePrix : forfait.consommablePrix || 0);
      activeIds.add(forfait.id);
    }
  });

  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0 && !activeIds.has(forfait.id)) {
      const data = forfaitData[forfait.id] || {};
      const mo = parseNumber(data.moQuantity !== undefined ? data.moQuantity : forfait.moQuantity || 0) || 0;
      totalMOHeures += mo;
      totalConsommables += parseNumber(data.consommablePrix !== undefined ? data.consommablePrix : forfait.consommablePrix || 0);
      activeIds.add(forfait.id);
    }
  });

  // Forfaits dynamiques (lustrage/plume)
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (!key) return;
    if (activeIds.has(key)) return;
    if (data.lustrage1Elem === true) {
      totalMOHeures += parseNumber(data.moQuantity || 0) || 0;
      const consQty = parseNumber(data.consommableQuantity || 0);
      const consPU = parseNumber(data.consommablePrixUnitaire || 0);
      totalConsommables += consQty * consPU;
      activeIds.add(key);
    }
    if (data.plume1Elem === true) {
      totalMOHeures += parseNumber(data.moQuantity || 0) || 0;
      activeIds.add(key);
    }
  });

  // --- Ajouter le consommable obligatoire AVANT formatage ---
  totalConsommables += MANDATORY_CONSOMMABLES;

  // Calculs finaux
  // NOTE: totalMO est maintenant calculé uniquement à partir des heures * tarif horaire
  const totalMO = totalMOHeures * HOURLY;
  const prestationsExterieures = (includeControleTechnique ? 42 : 0) + (includeContrevisite ? 10 : 0);
  const totalHTSansPrestations = totalPieces + totalConsommables;
  const totalHT = totalHTSansPrestations + prestationsExterieures;
 
  return {
    // renvoyer des numbers arrondis (pratiques pour l'UI/exports)
    totalMOHeures: Number(totalMOHeures.toFixed(2)),
    totalMO: Number(totalMO.toFixed(2)),
    totalPieces: Number(totalPieces.toFixed(2)),
    totalConsommables: Number(totalConsommables.toFixed(2)), // inclut +7.40
    totalHTSansPrestations: Number(totalHTSansPrestations.toFixed(2)),
    totalHT: Number(totalHT.toFixed(2))
  };
};

// -------------------------
// Ventilation MO par catégorie (calculateMOByCategory)
// - Utilise uniquement les items actifs et itemStates
// - Force les nettoyages vers la catégorie 'controlling' (CLEANING_IDS)
// -------------------------
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
    nettoyage: 0, // restera vide si on force cleaning -> controlling
    forfaitaire: 0
  };

  const CLEANING_IDS = ['nettoyage-interieur', 'nettoyage-exterieur'];

  // utilitaire pour détecter la catégorie (priorise forfait.moCategory puis heuristique)
  const detectCategory = (item, forfait = {}) => {
    let cat = (forfait.moCategory || item.moCategory || '').toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (cat) return cat;
    if (LUSTRAGE_ITEMS.some(l => l.id === item.id)) return "lustrage";
    if (PLUME_ITEMS.some(p => p.id === item.id)) return "plume";
    if (DSP_ITEMS.some(d => d.id === item.id)) return "dsp";
    return "mecanique";
  };

  // Parcourir les items actifs
  (activeMecaniqueItems || []).forEach(item => {
    const forfait = forfaitData[item.id] || {};
    // priorité : forfait.moQuantity -> item.moQuantity -> 0
    const moQty = parseNumber(
      forfait.moQuantity !== undefined ? forfait.moQuantity : (item.moQuantity !== undefined ? item.moQuantity : 0)
    ) || 0;

    // Si item de nettoyage, on le ventile directement en controlling
    if (CLEANING_IDS.includes(item.id)) {
      categories.controlling += moQty;
      return;
    }

    const cat = detectCategory(item, forfait);
    if (cat === 'mecanique') categories.mecanique += moQty;
    else if (cat === 'carrosserie') categories.carrosserie += moQty;
    else if (cat === 'peinture') categories.peinture += moQty;
    else if (cat === 'tolerie' || cat === 'tôlerie' || cat === 'tolerie') categories.tolerie += moQty;
    else if (cat === 'lustrage') categories.lustrage += moQty;
    else if (cat === 'controlling') categories.controlling += moQty;
    else if (cat === 'nettoyage') categories.nettoyage += moQty;
    else categories.mecanique += moQty;
  });

  // DSP items
  (activeDSPItems || []).forEach(item => {
    // priorité : item.moQuantity -> DSP_ITEMS config
    const moFromItem = parseNumber(item.moQuantity || 0) || 0;
    const dspConfig = DSP_ITEMS.find(d => d.id === item.id);
    if (dspConfig) {
      categories.dsp += parseNumber(dspConfig.moQuantity || 0) + moFromItem;
    } else {
      categories.dsp += moFromItem;
    }
  });

  // Plume items
  (activePlumeItems || []).forEach(item => {
    const plumeConfig = PLUME_ITEMS.find(p => p.id === item.id);
    if (plumeConfig) {
      // si tu veux les compter dans une catégorie dédiée, ajouter categories.plume
      // ici on ajoute leur moQuantity si présent sur l'item
      categories.mecanique += parseNumber(item.moQuantity || plumeConfig.moQuantity || 0) || 0;
    }
  });

// Forfaits peinture (si activés via itemStates)
PEINTURE_FORFAITS.forEach(forfait => {
  const state = itemStates[forfait.id] ?? 0;
  if (state > 0) {
    const data = forfaitData[forfait.id] || {};
    // ✅ UTILISER forfaitData pour prendre les valeurs modifiées par l'utilisateur
    categories.tolerie += parseNumber(data.mo1Quantity !== undefined ? data.mo1Quantity : forfait.mo1Quantity || 0) || 0;
    categories.peinture += parseNumber(data.mo2Quantity !== undefined ? data.mo2Quantity : forfait.mo2Quantity || 0) || 0;
  }
});

PEINTURE_SEULE_FORFAITS.forEach(forfait => {
  const state = itemStates[forfait.id] ?? 0;
  if (state > 0) {
    const data = forfaitData[forfait.id] || {};
    // ✅ UTILISER forfaitData pour prendre les valeurs modifiées par l'utilisateur
    categories.peinture += parseNumber(data.moQuantity !== undefined ? data.moQuantity : forfait.moQuantity || 0) || 0;
  }
});

  return categories;
};

// -------------------------
// Obtenir la liste des pièces par fournisseur
// (inchangé mais conservé pour cohérence)
// -------------------------
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
