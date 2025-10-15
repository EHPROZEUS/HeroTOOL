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

  // IDs de nettoyage (à ventiler en controlling selon ta demande)
  const CLEANING_IDS = ['nettoyage-interieur', 'nettoyage-exterieur'];

  // Récupérer listes valides
  const validMecaniqueItems = (activeMecaniqueItems || []).filter(i => i && i.id);
  const validDSPItems = (activeDSPItems || []).filter(i => i && i.id);

  // Set d'ids actifs pour éviter de re-calculer des forfaits déjà comptés
  const activeIds = new Set([
    ...validMecaniqueItems.map(i => i.id),
    ...validDSPItems.map(i => i.id),
    ... (Array.isArray(PLUME_ITEMS) ? [] : []) // placeholder
  ]);

  // 1) Traiter les items mécaniques (inclut lustrage si présent dans la liste active)
  validMecaniqueItems.forEach(item => {
    const id = item.id;
    const forfait = forfaitData[id] || {};
    const defaults = getDefaultValues(id);

    // MO
    const moQuantity = parseFloat(forfait.moQuantity !== undefined ? forfait.moQuantity : (defaults.moQuantity || 0)) || 0;
    totalMOHeures += moQuantity;

    // Pièce (forfait) - prix déjà calculé si fourni dans forfaitData
    const piecePrix = parseNumber(forfait.piecePrix !== undefined ? forfait.piecePrix : (defaults.piecePrix || 0));
    totalPieces += piecePrix;

    // Consommable (forfait)
    const consommablePrix = parseNumber(forfait.consommablePrix !== undefined ? forfait.consommablePrix : (defaults.consommablePrix || 0));
    totalConsommables += consommablePrix;

    // Pièces supplémentaires (dispatchées vers pieceLines)
    if (pieceLines[id]) {
      pieceLines[id].forEach(line => {
        totalPieces += parseFloat(line.prix || 0) || 0;
      });
    }
  });

  // 2) Traiter les items DSP actifs (si non déjà fournis dans validMecaniqueItems)
  validDSPItems.forEach(dspItem => {
    const id = dspItem.id;
    // Si dsp fourni via forfaitData (rare), on le comptera via validMecaniqueItems; sinon prendre config DSP_ITEMS
    const forfait = forfaitData[id] || {};
    if (forfait && forfait.moQuantity !== undefined) {
      // déjà compté si présent dans validMecaniqueItems, mais on garde la sécurité
      if (!activeIds.has(id)) {
        totalMOHeures += parseFloat(forfait.moQuantity || 0) || 0;
        totalConsommables += parseFloat(forfait.consommablePrix || 0) || 0;
        activeIds.add(id);
      }
    } else {
      const dspConfig = DSP_ITEMS.find(d => d.id === id);
      if (dspConfig) {
        totalMOHeures += parseFloat(dspConfig.moQuantity || 0) || 0;
        totalConsommables += parseFloat(dspConfig.consommable || 0) || 0;
      }
    }
  });

  // 3) Forfaits PEINTURE_FORFAITS et PEINTURE_SEULE_FORFAITS : s'ils sont activés via itemStates, on les ajoute (uniquement s'ils ne sont pas déjà actifs)
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0 && !activeIds.has(forfait.id)) {
      const data = forfaitData[forfait.id] || {};
      const mo1 = parseFloat(data.mo1Quantity !== undefined ? data.mo1Quantity : forfait.mo1Quantity || 0) || 0;
      const mo2 = parseFloat(data.mo2Quantity !== undefined ? data.mo2Quantity : forfait.mo2Quantity || 0) || 0;
      totalMOHeures += mo1 + mo2;
      totalConsommables += parseFloat(data.consommablePrix !== undefined ? data.consommablePrix : forfait.consommablePrix || 0) || 0;
      activeIds.add(forfait.id);
    }
  });

  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0 && !activeIds.has(forfait.id)) {
      const data = forfaitData[forfait.id] || {};
      const mo = parseFloat(data.moQuantity !== undefined ? data.moQuantity : forfait.moQuantity || 0) || 0;
      totalMOHeures += mo;
      totalConsommables += parseFloat(data.consommablePrix !== undefined ? data.consommablePrix : forfait.consommablePrix || 0) || 0;
      activeIds.add(forfait.id);
    }
  });

  // 4) Inclure les petits forfaits crées dynamiquement (lustrage1Elem, plume1Elem...) uniquement si présents dans forfaitData ET non encore comptés
  Object.entries(forfaitData).forEach(([key, data]) => {
    if (!key) return;
    if (activeIds.has(key)) return; // déjà compté via validMecaniqueItems
    if (data.lustrage1Elem === true) {
      totalMOHeures += parseFloat(data.moQuantity || 0) || 0;
      const consQty = parseFloat(data.consommableQuantity || 0) || 0;
      const consPU = parseFloat(data.consommablePrixUnitaire || 0) || 0;
      totalConsommables += consQty * consPU;
      activeIds.add(key);
    }
    if (data.plume1Elem === true) {
      totalMOHeures += parseFloat(data.moQuantity || 0) || 0;
      activeIds.add(key);
    }
  });

  // --- Totaux calculés (MO uniquement une fois, via les items/états du devis) ---

  const MoTableau = 74.106; // si tu utilises encore ce montant fixe
  const HOURLY = 35.8; // taux horaire (garder identique à ton app ou importer depuis config)
  const totalMO = MoTableau + totalMOHeures * HOURLY;
  const prestationsExterieures = (includeControleTechnique ? 42 : 0) + (includeContrevisite ? 10 : 0);
  const totalHTSansPrestations = totalPieces + totalConsommables;
  const totalHT = totalHTSansPrestations + prestationsExterieures;

  return {
    totalMOHeures: totalMOHeures.toFixed(2),
    totalMO: totalMO.toFixed(2),
    totalPieces: totalPieces.toFixed(2),
    totalConsommables: 7.4 + totalConsommables.toFixed(2),
    totalHTSansPrestations: totalHTSansPrestations.toFixed(2),
    totalHT: totalHT.toFixed(2)
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
    const moQty = parseFloat(forfait.moQuantity) || 0;

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
    const dspConfig = DSP_ITEMS.find(d => d.id === item.id);
    if (dspConfig) categories.dsp += parseFloat(dspConfig.moQuantity || 0) || 0;
  });

  // Plume items
  (activePlumeItems || []).forEach(item => {
    const plumeConfig = PLUME_ITEMS.find(p => p.id === item.id);
    if (plumeConfig) {
      // si tu veux les compter dans une catégorie dédiée, ajouter categories.plume
      // aujourd'hui on ignore leur contribution ici (elles sont comptées dans calculateTotals)
    }
  });

  // Forfaits peinture (si activés via itemStates)
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      categories.tolerie += parseFloat(forfait.mo1Quantity || 0) || 0;
      categories.peinture += parseFloat(forfait.mo2Quantity || 0) || 0;
    }
  });

  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      categories.peinture += parseFloat(forfait.moQuantity || 0) || 0;
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
