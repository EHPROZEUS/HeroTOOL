import React, { useState } from 'react';
import { calculateVehicleAge, formatDateFr } from '../../utils/formatters';
import { getDefaultValues } from '../../utils/calculations';
import { 
  DSP_ITEMS, 
  LUSTRAGE_ITEMS, 
  PEINTURE_FORFAITS, 
  PEINTURE_SEULE_FORFAITS, 
  PLUME_ITEMS, 
  TEXT_ITEMS_1, 
  TEXT_ITEMS_2 
} from '../../config/constants';

/**
 * Vérifie si un item est une vraie opération de carrosserie
 * (exclut les forfaits de reconditionnement)
 */
const isRealCarrosserieOperation = (itemId, forfaitData) => {
  // Liste des IDs de reconditionnement à EXCLURE
  const RECONDITIONNEMENT_IDS = [
    'Rempc1', 'Rempc2', 'Rempc3', 'Rempc4',
    'Repc1', 'Repc2', 'Repc3', 'Repc4',
    'rempm', 'repm'
  ];
  
  // Si c'est un forfait de reconditionnement, retourner false
  if (RECONDITIONNEMENT_IDS.includes(itemId)) {
    return false;
  }
  
  // Vérifier la catégorie MO
  const forfait = forfaitData[itemId];
  if (forfait) {
    const category = forfait.moCategory || '';
    // Les vraies opérations de carrosserie
    return category === 'Carrosserie' || 
           category === 'Peinture' || 
           category === 'Tôlerie' ||
           forfait.peintureForfait; // Forfaits réparation peinture
  }
  
  return false;
};

const tarifHoraire = 35.8;

const getDossierColor = (totalMOMecanique, totalPieces = 0) => {
  const total = parseFloat(totalMOMecanique) || 0;
  const totalPiecesValue = parseFloat(totalPieces) || 0;
  
  // 🟢 VERT : Aucune pièce à commander (peu importe la MO)
  if (totalPiecesValue === 0) {
    return { color: '#28a745', label: 'VERT', bg: '#d4edda' };
  }
  
  // 🟡 JAUNE : Pièces présentes + MO < 3h
  if (total < 3) {
    return { color: '#FFC107', label: 'JAUNE', bg: '#FFF9E6' };
  }
  
  // ⚪ BLANC : Pièces présentes + 3h ≤ MO < 5h
  if (total < 5) {
  return { color: '#6c757d', label: 'TRANSPARENT', bg: '#ffffff' };
  }
  
  // 🔴 ROUGE : Pièces présentes + MO ≥ 5h
  return { color: '#dc3545', label: 'ROUGE', bg: '#f8d7da' };
};

// ✅ NOUVELLE FONCTION - Ajouter ici après les imports
/**
 * Filtre les pièces pour l'ordre de réparation
 * Pour les filtres (huile, pollen, air, carburant) : garde seulement la pièce la plus chère
 * Pour les autres forfaits : garde toutes les pièces
 */
const filterPiecesForOR = (itemId, forfaitData, pieceLines) => {
  const filterItems = ['filtreHuile', 'filtrePollen', 'filtreAir', 'filtreCarburant'];
  
  // Si ce n'est pas un filtre, retourner toutes les pièces
  if (!filterItems.includes(itemId)) {
    return pieceLines?.[itemId] || [];
  }
  
  // Collecter toutes les pièces (principale + supplémentaires)
  const allPieces = [];
  
  // Ajouter la pièce principale si elle existe
  const forfait = forfaitData[itemId] || {};
  if (forfait.pieceReference && forfait.piecePrixUnitaire) {
    allPieces.push({
      reference: forfait.pieceReference,
      designation: forfait.pieceDesignation || '',
      prixUnitaire: parseFloat(forfait.piecePrixUnitaire) || 0,
      quantity: parseFloat(forfait.pieceQuantity) || 1,
      isPrincipal: true
    });
  }
  
  // Ajouter les pièces supplémentaires
  const suppPieces = (pieceLines?.[itemId] || []).map(line => ({
    reference: line.reference,
    designation: line.designation || '',
    prixUnitaire: parseFloat(line.prixUnitaire) || 0,
    quantity: parseFloat(line.quantity) || 1,
    isPrincipal: false,
    originalLine: line
  }));
  
  allPieces.push(...suppPieces);
  
  // S'il n'y a qu'une seule pièce ou aucune, retourner toutes les pièces supplémentaires
  if (allPieces.length <= 1) {
    return pieceLines?.[itemId] || [];
  }
  
  // Trouver la pièce la plus chère (basé sur prix unitaire)
  const mostExpensive = allPieces.reduce((max, piece) => 
    piece.prixUnitaire > max.prixUnitaire ? piece : max
  , allPieces[0]);
  
  // Retourner seulement la pièce la plus chère si elle est supplémentaire
  if (!mostExpensive.isPrincipal) {
    return [mostExpensive.originalLine];
  }
  
  // Si la plus chère est la principale, ne retourner aucune pièce supplémentaire
  return [];
};

// Lignes obligatoires à afficher en haut du tableau des prestations
const OBLIGATORY_PRESTATIONS = [
  {
    id: 'plaque-imt',
    type: "MO MECANIQUE PLAQUE IMT",
    reference: "-",
    designation: "POSE DE PLAQUE ET FOURNITURE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'essai',
    type: "MO MECANIQUE ESSAI",
    reference: "-",
    designation: "ESSAI+ 70 POINTS DE CONTROLE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'pec',
    type: "MO MECANIQUE PEC",
    reference: "-",
    designation: "PRISE EN CHARGE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'lg',
    type: "MO MECANIQUE LG",
    reference: "-",
    designation: "MISE A NIVEAU LAVE GLACE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'photos',
    type: "MO CONTROLLING PHOTOS",
    reference: "-",
    designation: "PHOTOS",
    moCategory: "Controlling",
    moQuantity: 0.50,
  },
];

// Lignes obligatoires de nettoyage (avec consommables + MO)
const OBLIGATORY_CLEANING = [
  {
    id: 'nettoyage-interieur',
    type: "NETTOYAGE INTERIEUR",
    consommable: {
      reference: "CONSO",
      designation: "Consommables",
      quantity: 1.00,
      unitPrice: 3.70,
      totalPrice: 3.70,
    },
    mo: {
      type: "MO CONTROLLING PHOTOS",
      designation: "Main d'oeuvre",
      moCategory: "Nettoyage",
      moQuantity: 0.75,
    },
  },
  {
    id: 'nettoyage-exterieur',
    type: "NETTOYAGE EXTERIEUR",
    consommable: {
      reference: "CONSO",
      designation: "Consommables",
      quantity: 2.00,
      unitPrice: 1.85,
      totalPrice: 3.70,
    },
    mo: {
      type: "MO CONTROLLING PHOTOS",
      designation: "Main d'oeuvre",
      moCategory: "Nettoyage",
      moQuantity: 0.42,
    },
  },
];

// Catégories pour la ventilation comptable (dans l'ordre et style de l'image)
const VENTILATION_CATEGORIES = [
  { key: 'moMecanique', label: 'MO MECANIQUE' },
  { key: 'moNettoyage', label: 'MO NETTOYAGE' },
  { key: 'moPeinture', label: 'MO PEINTURE' },
  { key: 'moTolerie', label: 'MO TOLERIE' },
  { key: 'moLustrage', label: 'MO LUSTRAGE' },
  { key: 'moDSP', label: 'MO DSP' },
  { key: 'moControlling', label: 'MO CONTROLLING' },
  { key: 'ingredientPeinture', label: 'INGREDIENT PEINTURE' },
  { key: 'fluides', label: 'FLUIDES' },
  { key: 'pneumatiques', label: 'PNEUMATIQUES' },
  { key: 'piecesMecanique', label: 'PIECES MECANIQUE' },
  { key: 'piecesTolerie', label: 'PIECES TOLERIE' },
  { key: 'presSousTraitees', label: 'PRES. SOUS-TRAITEES' }
];

// safeNum : normalise les entrées (nombre, string avec virgule/espaces)
const safeNum = v => {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/\u00A0|\u202F/g, '').replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

// computeMoByCategory : reconstruit moByCategory depuis toutes les sources (fallback)
const computeMoByCategory = ({
  activeMecaniqueItems = [],
  activeDSPItems = [],
  forfaitData = {},
  itemStates = {}
}) => {
  const res = {
    mecanique: 0,
    lustrage: 0,
    dsp: 0,
    controlling: 0,
    peinture: 0,
    tolerie: 0,
    nettoyage: 0
  };

  // 1) Prestations obligatoires
  OBLIGATORY_PRESTATIONS.forEach(ob => {
    const q = safeNum(ob.moQuantity);
    const cat = (ob.moCategory || '').toString().toLowerCase();
    if (cat.includes('mécanique') || cat.includes('mecanique')) res.mecanique += q;
    else if (cat.includes('controlling')) res.controlling += q;
    else if (cat.includes('nettoyage')) res.nettoyage += q;
    else res.mecanique += q;
  });

  // 2) Nettoyages obligatoires
  OBLIGATORY_CLEANING.forEach(ob => {
    const q = safeNum(ob.mo?.moQuantity);
    res.nettoyage += q;
  });

  // 3) Items mécaniques actifs (forfaitData -> item -> defaults)
  (activeMecaniqueItems || []).forEach(item => {
    if (!item || !item.id) return;
    const id = item.id;
    const forfait = (forfaitData && forfaitData[id]) || {};
    const defaults = typeof getDefaultValues === 'function' ? getDefaultValues(id) : {};

    const moQty = safeNum(
      forfait.moQuantity !== undefined ? forfait.moQuantity
        : (item && item.moQuantity !== undefined ? item.moQuantity
          : defaults.moQuantity)
    );

    const catRaw = (forfait.moCategory || defaults.moCategory || item.moCategory || '').toString().toLowerCase();
    const cat = catRaw.normalize ? catRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : catRaw;

    if (cat.includes('lustrage')) res.lustrage += moQty;
    else if (cat.includes('dsp')) res.dsp += moQty;
    else if (cat.includes('controlling')) res.controlling += moQty;
    else if (cat.includes('peinture')) res.peinture += moQty;
    else if (cat.includes('tolerie') || cat.includes('tôlerie')) res.tolerie += moQty;
    else if (cat.includes('nettoyage')) res.nettoyage += moQty;
    else res.mecanique += moQty;
  });

  // 4) DSP actifs (forfaitData -> item -> config)
  (activeDSPItems || []).forEach(dspItem => {
    if (!dspItem || !dspItem.id) return;
    const id = dspItem.id;
    const forfait = (forfaitData && forfaitData[id]) || {};
    const moFromForfaitOrItem = safeNum(
      forfait.moQuantity !== undefined ? forfait.moQuantity
        : (dspItem && dspItem.moQuantity !== undefined ? dspItem.moQuantity : 0)
    );
    if (moFromForfaitOrItem > 0) {
      res.dsp += moFromForfaitOrItem;
    } else {
      const dspConfig = DSP_ITEMS.find(d => d.id === id);
      if (dspConfig) res.dsp += safeNum(dspConfig.moQuantity);
    }
  });

  // 5) Forfaits peinture activés via itemStates
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      const data = forfaitData[forfait.id] || {};
      res.tolerie += safeNum(data.mo1Quantity !== undefined ? data.mo1Quantity : forfait.mo1Quantity);
      res.peinture += safeNum(data.mo2Quantity !== undefined ? data.mo2Quantity : forfait.mo2Quantity);
    }
  });
  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      const data = forfaitData[forfait.id] || {};
      res.peinture += safeNum(data.moQuantity !== undefined ? data.moQuantity : forfait.moQuantity);
    }
  });

  // 6) Forfaits dynamiques (lustrage1Elem / plume1Elem)
  Object.entries(forfaitData || {}).forEach(([key, data]) => {
    if (!key) return;
    if (data.lustrage1Elem === true) {
      res.lustrage += safeNum(data.moQuantity || 0);
    }
    if (data.plume1Elem === true) {
      res.mecanique += safeNum(data.moQuantity || 0);
    }
  });

  return res;
};

// Fonction pour ventiler les quantités et montants HT par catégorie
function computeVentilation({
  activeMecaniqueItems = [],
  activeDSPItems = [],
  forfaitData = {},
  pieceLines = {},
  moByCategory = {},
  totals = {},
  includeControleTechnique = false,
  itemStates = {}
}) {
  // Initialisation des résultats
  const result = {};
  VENTILATION_CATEGORIES.forEach(cat => {
    result[cat.key] = { qty: 0, ht: 0 };
  });

  // Utilise moByCategory fourni si il contient des données valides (>0), sinon reconstruit
  const fallback = computeMoByCategory({ activeMecaniqueItems, activeDSPItems, forfaitData, itemStates });
  const finalMo = {
    mecanique: (typeof moByCategory?.mecanique === 'number' && moByCategory.mecanique > 0) ? moByCategory.mecanique : fallback.mecanique,
    lustrage: (typeof moByCategory?.lustrage === 'number' && moByCategory.lustrage > 0) ? moByCategory.lustrage : fallback.lustrage,
    dsp: (typeof moByCategory?.dsp === 'number' && moByCategory.dsp > 0) ? moByCategory.dsp : fallback.dsp,
    controlling: (typeof moByCategory?.controlling === 'number' && moByCategory.controlling > 0) ? moByCategory.controlling : fallback.controlling,
    peinture: (typeof moByCategory?.peinture === 'number' && moByCategory.peinture > 0) ? moByCategory.peinture : fallback.peinture,
    tolerie: (typeof moByCategory?.tolerie === 'number' && moByCategory.tolerie > 0) ? moByCategory.tolerie : fallback.tolerie,
    nettoyage: (typeof moByCategory?.nettoyage === 'number' && moByCategory.nettoyage > 0) ? moByCategory.nettoyage : fallback.nettoyage
  };

  // ===== 1. MO OBLIGATOIRES =====
  OBLIGATORY_PRESTATIONS.forEach(ob => {
    if (ob.moCategory === 'Mécanique') {
      result.moMecanique.qty += ob.moQuantity;
    } else if (ob.moCategory === 'Controlling') {
      result.moControlling.qty += ob.moQuantity;
    }
  });

  // ===== 2. MO NETTOYAGE =====
  OBLIGATORY_CLEANING.forEach(ob => {
    result.moNettoyage.qty += ob.mo.moQuantity;
    // Consommables de nettoyage → FLUIDES
    result.fluides.ht += ob.consommable.totalPrice || 0;
  });

  // ===== 3. MO DYNAMIQUES (depuis finalMo) =====
  result.moMecanique.qty += finalMo.mecanique || 0;
  result.moLustrage.qty += finalMo.lustrage || 0;
  result.moDSP.qty += finalMo.dsp || 0;
  result.moControlling.qty += finalMo.controlling || 0;
  result.moPeinture.qty += finalMo.peinture || 0;
  result.moTolerie.qty += finalMo.tolerie || 0;
  result.moNettoyage.qty += finalMo.nettoyage || 0;

  // ===== 4. PIECES ET CONSOMMABLES MECANIQUE =====
  // Séparer les pneus des autres pièces
  (activeMecaniqueItems || []).forEach(item => {
    if (!item || !item.id) return;
    const forfait = forfaitData[item.id] || {};
    const piecePrix = safeNum(forfait.piecePrix) || 0;

    // Pneus → PNEUMATIQUES
    if (item.id === 'pneusAvant' || item.id === 'pneusArriere' || item.id === 'pneus4') {
      result.pneumatiques.ht += piecePrix;
    } else {
      // Autres pièces → PIECES MECANIQUE
      result.piecesMecanique.ht += piecePrix;
    }

    // Consommables (huile, liquides) → FLUIDES
    const consommablePrix = safeNum(forfait.consommablePrix) || 0;
    if (consommablePrix > 0) {
      result.fluides.ht += consommablePrix;
    }

    // Pièces supplémentaires
    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        const linePrix = safeNum(line.prix) || 0;
        result.piecesMecanique.ht += linePrix;
      });
    }
  });

  // ===== 5. FORFAITS PEINTURE (INGREDIENT PEINTURE) =====
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      result.ingredientPeinture.ht += safeNum(forfait.consommablePrix || 0);
    }
  });

  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      result.ingredientPeinture.ht += safeNum(forfait.consommablePrix || 0);
    }
  });

  // ===== 6. FORFAITS CARROSSERIE (PIECES TOLERIE) =====
  (activeMecaniqueItems || [])
    .filter(item => {
      const isREPC = TEXT_ITEMS_1.some(textItem => textItem.id === item.id);
      const isREMPC = TEXT_ITEMS_2.some(textItem => textItem.id === item.id);
      return isREPC || isREMPC;
    })
    .forEach(item => {
      const forfait = forfaitData[item.id] || {};
      const piecePrix = safeNum(forfait.piecePrix) || 0;
      result.piecesTolerie.ht += piecePrix;

      // Pièces supplémentaires
      if (pieceLines[item.id]) {
        pieceLines[item.id].forEach(line => {
          result.piecesTolerie.ht += safeNum(line.prix) || 0;
        });
      }
    });

  // ===== 7. PRESTATIONS SOUS-TRAITEES =====
  if (includeControleTechnique) {
    result.presSousTraitees.qty += 1;
    result.presSousTraitees.ht += 42;
  }

  // ===== 8. CALCUL DES MONTANTS HT POUR TOUTES LES MO =====
  result.moMecanique.ht = Number((safeNum(result.moMecanique.qty) * tarifHoraire).toFixed(2));
  result.moNettoyage.ht = Number((safeNum(result.moNettoyage.qty) * tarifHoraire).toFixed(2));
  result.moLustrage.ht = Number((safeNum(result.moLustrage.qty) * tarifHoraire).toFixed(2));
  result.moDSP.ht = Number((safeNum(result.moDSP.qty) * tarifHoraire).toFixed(2));
  result.moControlling.ht = Number((safeNum(result.moControlling.qty) * tarifHoraire).toFixed(2));
  result.moPeinture.ht = Number((safeNum(result.moPeinture.qty) * tarifHoraire).toFixed(2));
  result.moTolerie.ht = Number((safeNum(result.moTolerie.qty) * tarifHoraire).toFixed(2));

  return result;
}



const OrdreReparation = ({
  showOrdreReparation,
  setShowOrdreReparation,
  includeControleTechnique = false,
  setIncludeControleTechnique,
  includeContrevisite = false,
  setIncludeContrevisite,
  headerInfo = {},
  activeMecaniqueItems = [],
  activeDSPItems = [],
  activePlumeItems = [], 
  forfaitData = {},
  pieceLines = {},
  totals = {},
  moByCategory = {},
  itemNotes = {},
  printOrdreReparation,
  updateForfaitField, 
  itemStates = {}
}) => {

    // Fonction pour obtenir la désignation (utilise la note pour Remp/Rep)
  const getDesignation = (itemId, forfait) => {
    // Liste des IDs Remp et Rep
    const REMP_REP_IDS = [
      'repc1', 'repc2', 'repc3', 'repc4',
      'rempc1', 'rempc2', 'rempc3', 'rempc4',
      'repm1', 'repm2', 'repm3', 'repm4',
      'rempm1', 'rempm2', 'rempm3', 'rempm4'
    ];

        const isRempRep = REMP_REP_IDS.some(id => id.toLowerCase() === itemId.toLowerCase());

    
    // Si c'est un item Remp/Rep et qu'il y a une note, utiliser la note
    if (isRempRep && itemNotes[itemId]) {
      return itemNotes[itemId];
    }
    
    // Sinon, utiliser moDesignation ou le texte par défaut
    return forfait.moDesignation || "Temps de travail";
  };

    const [editMode, setEditMode] = useState(false);
  // Identifie les items de lustrage actifs
  const activeLustrageItems = Array.isArray(activeMecaniqueItems)
    ? activeMecaniqueItems.filter(item =>
        LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
      )
    : [];
  
  const activePeintureForfaits = PEINTURE_FORFAITS.filter(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    return state > 0;
  });

  // Items de peinture seule actifs
  const activePeintureSeuleForfaits = PEINTURE_SEULE_FORFAITS.filter(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    return state > 0;
  });

  // Filtre les items de mécanique pour exclure les items de lustrage
  const pureActiveMecaniqueItems = Array.isArray(activeMecaniqueItems)
    ? activeMecaniqueItems.filter(item =>
        !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
      )
    : [];

      // Filtrer les vraies opérations de carrosserie
  const realCarrosserieItems = Array.isArray(pureActiveMecaniqueItems)
    ? pureActiveMecaniqueItems.filter(item => 
        isRealCarrosserieOperation(item.id, forfaitData)
      )
    : [];
  
  // Vérifier s'il y a au moins une vraie opération de carrosserie
  const hasRealCarrosserieOperations = realCarrosserieItems.length > 0;

  // Calcul ventilation comptable (computeVentilation prend en charge fallback moByCategory)
  const ventilation = computeVentilation({
    activeMecaniqueItems,
    activeDSPItems,
    forfaitData,
    pieceLines,
    moByCategory,
    totals,
    includeControleTechnique,
    itemStates
  });

  // Reconstruire finalMoByCategory ici pour affichage / statut dossier
  // (computeMoByCategory retourne la reconstruction complète)
  const fallbackMo = computeMoByCategory({ activeMecaniqueItems, activeDSPItems, forfaitData, itemStates });
  const finalMoByCategory = {
    mecanique: (typeof moByCategory?.mecanique === 'number' && moByCategory.mecanique > 0) ? moByCategory.mecanique : fallbackMo.mecanique,
    lustrage: (typeof moByCategory?.lustrage === 'number' && moByCategory.lustrage > 0) ? moByCategory.lustrage : fallbackMo.lustrage,
    dsp: (typeof moByCategory?.dsp === 'number' && moByCategory.dsp > 0) ? moByCategory.dsp : fallbackMo.dsp,
    controlling: (typeof moByCategory?.controlling === 'number' && moByCategory.controlling > 0) ? moByCategory.controlling : fallbackMo.controlling,
    peinture: (typeof moByCategory?.peinture === 'number' && moByCategory.peinture > 0) ? moByCategory.peinture : fallbackMo.peinture,
    tolerie: (typeof moByCategory?.tolerie === 'number' && moByCategory.tolerie > 0) ? moByCategory.tolerie : fallbackMo.tolerie,
    nettoyage: (typeof moByCategory?.nettoyage === 'number' && moByCategory.nettoyage > 0) ? moByCategory.nettoyage : fallbackMo.nettoyage
  };

  // ✅ CALCUL DU TOTAL MO MÉCANIQUE (utilise finalMoByCategory)
  const totalMOMecanique = finalMoByCategory.mecanique || 0;
  const dossierStatus = getDossierColor(totalMOMecanique, totals.totalPieces);

  // Styles pour éviter les coupures dans le PDF
const pdfStyles = `
  @media print {
    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    table {
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    thead {
      display: table-header-group;
    }
    
    /* Masquer les inputs éditables et afficher la valeur en texte */
    .editable-mo-input {
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
    }
  }
`;

  return (
<div className="mt-8 border-t-2 border-gray-300 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ordre de réparation</h2>
        <div className="flex items-center gap-4">
          {/* ✅ BOUTON MODE ÉDITION */}
          {showOrdreReparation && (
<button
  onClick={() => setEditMode(!editMode)}
  className="px-4 py-2 rounded-lg font-semibold transition-all"
  style={{
    backgroundColor: editMode ? '#FF6B35' : '#E5E7EB',
    color: editMode ? 'white' : '#374151'
  }}
>
  {editMode ? '✏️ Mode Édition' : '🔒 Lecture seule'}
</button>
          )}
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!includeControleTechnique}
              onChange={e => setIncludeControleTechnique && setIncludeControleTechnique(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contrôle Technique (42€)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!includeContrevisite}
              onChange={e => setIncludeContrevisite && setIncludeContrevisite(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contre-visite (+10€)</span>
          </label>
          <button
            onClick={() => setShowOrdreReparation && setShowOrdreReparation(!showOrdreReparation)}
            className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {showOrdreReparation ? 'Masquer' : 'Générer'} l'ordre
          </button>
        </div>
      </div>

{showOrdreReparation && (
  <div
    id="ordre-reparation-content"
    className="bg-white border-4 rounded-xl p-8 shadow-2xl"
    style={{ borderColor: '#FF6B35' }}
  >
    <style>{pdfStyles}</style>
    
    {/* ✅ HEADER : STATUT + TITRE ALIGNÉS */}
    <div className="mb-6 pb-4 border-b-2 border-gray-300">
      <div className="flex items-center justify-between">
        {/* Statut du dossier à gauche */}
        <div 
          className="p-4 rounded-lg border-2 shadow-md"
          style={{ 
            backgroundColor: dossierStatus.bg,
            borderColor: dossierStatus.color
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full shadow-lg"
              style={{ backgroundColor: dossierStatus.color }}
            ></div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Statut du dossier</p>
              <p 
                className="text-2xl font-bold"
                style={{ color: dossierStatus.color }}
              >
                {dossierStatus.label}
              </p>
              <p className="text-sm font-medium text-gray-700">
                MO Méca : <span className="font-bold">{totalMOMecanique.toFixed(2)}h</span>
              </p>
            </div>
          </div>
        </div>

        {/* Titre au centre */}
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
            ORDRE DE RÉPARATION
          </h1>
          <p className="text-sm text-gray-600">
            Document généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Espace vide à droite pour équilibrer */}
        <div style={{ width: '220px' }}></div>
      </div>
    </div>

    {/* ALERTE CONTRE-VISITE */}
    {includeContrevisite && (
      <div
        className="mb-6 p-3 border-2 rounded-lg"
        style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B35' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-lg font-bold" style={{ color: '#FF6B35' }}>
              CONTRE-VISITE REQUISE
            </p>
            <p className="text-sm text-gray-800">
              Le véhicule nécessite une contre-visite du contrôle technique
            </p>
          </div>
        </div>
      </div>
    )}

{/* =============== INFOS VEHICULE + VENTILATION COMPTABLE =============== */}
<div className="mb-6 no-break"> 
  <div className="flex flex-col md:flex-row gap-4">
    {/* Informations véhicule condensées */}
    <div className="flex-1 min-w-[200px] max-w-[280px]">
      <h2
        className="text-base font-bold text-gray-800 mb-2 p-1.5 rounded-lg"
        style={{ backgroundColor: '#FFF0E6' }}
      >
        Informations Véhicule
      </h2>
      <div className="grid grid-cols-1 gap-0.5 text-xs">
        {headerInfo?.lead && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Lead: </span>
            <span>{headerInfo.lead}</span>
          </div>
        )}
        {headerInfo?.immatriculation && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Immatriculation: </span>
            <span>{headerInfo.immatriculation}</span>
          </div>
        )}
        {headerInfo?.vin && (
          <div className="flex gap-1">
            <span className="font-bold w-28">VIN: </span>
            <span className="text-xs">{headerInfo.vin}</span>
          </div>
        )}
        {headerInfo?.marque && (
  <div className="flex">
    <span className="font-bold w-28">Marque:</span>
    <span>{headerInfo.marque}</span>
  </div>
)}
{headerInfo?.modele && (
  <div className="flex">
    <span className="font-bold w-28">Modèle:</span>
    <span>{headerInfo.modele}</span>
  </div>
)}
        {headerInfo?.kilometres && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Kilomètres: </span>
            <span>{headerInfo.kilometres} km</span>
          </div>
        )}
        {headerInfo?.dateVehicule && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Âge véhicule: </span>
            <span>{calculateVehicleAge(headerInfo.dateVehicule)}</span>
          </div>
        )}
        {headerInfo?.dateVehicule && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Mise en circ.: </span>
            <span>{formatDateFr(headerInfo.dateVehicule)}</span>
          </div>
        )}
        {headerInfo?.moteur && (
          <div className="flex gap-1">
            <span className="font-bold w-28 mr-2">Moteur: </span>
            <span className="capitalize">{headerInfo.moteur}</span>
          </div>
        )}
        {headerInfo?.boite && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Boîte: </span>
            <span className="capitalize">
              {headerInfo.boite === 'auto/cvt'
                ? 'Auto/CVT'
                : headerInfo.boite === 'dct'
                ? 'DCT'
                : headerInfo.boite}
            </span>
          </div>
        )}
      </div>
{/* Liste des fournisseurs avec nombre de pièces */}
<div className="mt-3 pt-2 border-t border-gray-300">
  <h3 className="text-xs font-bold text-gray-700 mb-1.5">Fournisseurs</h3>
  <div className="text-xs space-y-0.5">
    {(() => {
      // Regrouper toutes les pièces par fournisseur
      const fournisseurCount = {};
      
      // Pièces principales des forfaits mécanique
      (activeMecaniqueItems || []).forEach(item => {
        const forfait = forfaitData?.[item.id];
        if (forfait?.pieceFournisseur && forfait.pieceFournisseur.trim()) {
          fournisseurCount[forfait.pieceFournisseur] = 
            (fournisseurCount[forfait.pieceFournisseur] || 0) + 
            (safeNum(forfait.pieceQuantity) || 0);
        }
      });
      
      // Pièces supplémentaires
      Object.values(pieceLines || {}).forEach(lines => {
        lines.forEach(line => {
          if (line && line.fournisseur && line.fournisseur.trim()) {
            fournisseurCount[line.fournisseur] = 
              (fournisseurCount[line.fournisseur] || 0) + 
              (safeNum(line.quantity) || 0);
          }
        });
      });
      
      // Afficher les fournisseurs triés
      const fournisseurs = Object.entries(fournisseurCount)
        .sort(([a], [b]) => a.localeCompare(b));
      
      if (fournisseurs.length === 0) {
        return <p className="text-gray-500 italic">Aucun fournisseur</p>;
      }
      
      return fournisseurs.map(([fournisseur, count]) => (
        <div key={fournisseur} className="flex gap-2">
          <span className="font-medium">{fournisseur}:</span>
          <span className="text-gray-600">{Math.round(count)} pièce{count > 1 ? 's' : ''}</span>
        </div>
      ));
    })()}
  </div>
</div>
    </div>
    
    {/* Tableau ventilation comptable ultra-compact */}
    <div className="flex-1" style={{ maxWidth: '280px', minWidth: '200px' }}>
      <h2
        className="text-sm font-bold text-gray-800 mb-1 p-1 rounded"
        style={{ backgroundColor: '#FFF0E6' }}
      >
        Ventilation comptable
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 bg-white" style={{ fontSize: '10px' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-0.5 text-left">Ventilation</th>
              <th className="border border-gray-200 p-0.5 text-right">MO/H<br/>ou Qté</th>
              <th className="border border-gray-200 p-0.5 text-right">HT</th>
            </tr>
          </thead>
          <tbody>
            {VENTILATION_CATEGORIES.map(cat => (
              <tr key={cat.key}>
                <td className="border border-gray-200 p-0.5">{cat.label}</td>
                <td className="border border-gray-200 p-0.5 text-right">
                  {ventilation?.[cat.key]?.qty !== undefined
                    ? Number(ventilation[cat.key].qty).toFixed(2)
                    : '0.00'}
                </td>
                <td className="border border-gray-200 p-0.5 text-right">
                  {ventilation?.[cat.key]?.ht !== undefined
                    ? Number(ventilation[cat.key].ht).toFixed(2)
                    : "0.00"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
          {/* =============== FIN INFOS + VENTILATION =============== */}

          <div className="mb-6 no-break">
            <h2
              className="text-lg font-bold text-gray-800 mb-3 p-2 rounded-lg"
              style={{ backgroundColor: '#FFF0E6' }}
            >
              Détail des Opérations
            </h2>

            <table className="w-full border-collapse border-2 border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Type</th>
                  <th className="border border-gray-300 p-2 text-left">Référence</th>
                  <th className="border border-gray-300 p-2 text-left">Désignation</th>
                  <th className="border border-gray-300 p-2 text-left">Catégorie MO</th>
                  <th className="border border-gray-300 p-2 text-right">Quantité</th>
                  <th className="border border-gray-300 p-2 text-right">Prix Unit. HT</th>
                  <th className="border border-gray-300 p-2 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {includeControleTechnique && (
                  <>
                    <tr style={{ backgroundColor: "#FFE4D6" }}>
                      <td colSpan="7" className="border border-gray-300 p-2 font-bold">
                        Contrôle Technique
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Prestation extérieure</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2">
                        Contrôle technique obligatoire
                      </td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2 text-right">1</td>
                      <td className="border border-gray-300 p-2 text-right">42.00 €</td>
                      <td className="border border-gray-300 p-2 text-right">42.00 €</td>
                    </tr>
                  </>
                )}
                
                {includeContrevisite && (
                  <tr>
                    <td className="border border-gray-300 p-2">Prestation extérieure</td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2 bg-orange-50 font-semibold">
                      Contre-visite
                    </td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2 text-right">1</td>
                    <td className="border border-gray-300 p-2 text-right">10.00 €</td>
                    <td className="border border-gray-300 p-2 text-right">10.00 €</td>
                  </tr>
                )}
                <tr style={{ backgroundColor: "#FFE4D6" }}>
                      <td colSpan="7" className="border border-gray-300 p-2 font-bold">
                        PRESTATIONS OBLIGATOIRES
                      </td>
                    </tr>
                {/* === PRESTATIONS OBLIGATOIRES === */}
                {OBLIGATORY_PRESTATIONS.map(item => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2">{item.type}</td>
                    <td className="border border-gray-300 p-2">{item.reference}</td>
                    <td className="border border-gray-300 p-2">{item.designation}</td>
                    <td className="border border-gray-300 p-2">{item.moCategory}</td>
                    <td className="border border-gray-300 p-2 text-right">{item.moQuantity} h</td>
                    <td className="border border-gray-300 p-2 text-right">-</td>
                    <td className="border border-gray-300 p-2 text-right">-</td>
                  </tr>
                ))}

                {/* === NETTOYAGE INTERIEUR/EXTERIEUR : Consommable + MO === */}
                {OBLIGATORY_CLEANING.map(item => (
                  <React.Fragment key={item.id}>
                    {/* Consommable */}
                    <tr>
                      <td className="border border-gray-300 p-2">{item.type}</td>
                      <td className="border border-gray-300 p-2">{item.consommable.reference}</td>
                      <td className="border border-gray-300 p-2">{item.consommable.designation}</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2 text-right">{item.consommable.quantity}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.consommable.unitPrice.toFixed(2)} €</td>
                      <td className="border border-gray-300 p-2 text-right">{item.consommable.totalPrice.toFixed(2)} €</td>
                    </tr>
                    {/* Main d'oeuvre */}
                    <tr>
                      <td className="border border-gray-300 p-2">{item.type}</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2">{item.mo.designation}</td>
                      <td className="border border-gray-300 p-2">{item.mo.moCategory}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.mo.moQuantity} h</td>
                      <td className="border border-gray-300 p-2 text-right">-</td>
                      <td className="border border-gray-300 p-2 text-right">-</td>
                    </tr>
                  </React.Fragment>
                ))}
{/* === LE RESTE DU TABLEAU (MÉCANIQUE, CARROSSERIE, DSP, LUSTRAGE, PLUME...) === */}
{/* Section MECANIQUE - FORFAITS ET PRESTATIONS */}
{(Array.isArray(pureActiveMecaniqueItems) && pureActiveMecaniqueItems.length > 0) && (
  <tr className="bg-amber-100">
    <td colSpan={7} className="border border-gray-300 p-2 font-bold">
      MECANIQUE - FORFAITS ET PRESTATIONS
    </td>
  </tr>
)}
{Array.isArray(pureActiveMecaniqueItems) &&
  pureActiveMecaniqueItems
    .filter(item => {
      // Exclure REPC et REMPC de la section Mécanique
      const isREPC = TEXT_ITEMS_1.some(textItem => textItem.id === item.id);
      const isREMPC = TEXT_ITEMS_2.some(textItem => textItem.id === item.id);
      return !isREPC && !isREMPC;
    })
    .map(item => {
      const forfait = forfaitData?.[item.id] || {};
      const defaults = typeof getDefaultValues === "function" ? getDefaultValues(item.id) : {};
      const moQuantity =
        forfait.moQuantity !== undefined
          ? forfait.moQuantity
          : defaults.moQuantity || 0;
      const pieceReference =
        forfait.pieceReference !== undefined
          ? forfait.pieceReference
          : defaults.pieceReference || "-";
      const pieceQuantity =
        forfait.pieceQuantity !== undefined
          ? forfait.pieceQuantity
          : defaults.pieceQuantity || 0;
const piecePrix = (() => {
  // Si piecePrix existe dans forfait, l'utiliser
  if (forfait.piecePrix !== undefined && forfait.piecePrix !== '' && forfait.piecePrix !== '0' && forfait.piecePrix !== 0) {
    return forfait.piecePrix;
  }
  // Sinon calculer : quantité × prix unitaire
  const qty = parseFloat(pieceQuantity) || 0;
  const pu = parseFloat(forfait.piecePrixUnitaire) || 0;
  if (qty > 0 && pu > 0) {
    return (qty * pu).toFixed(2);
  }
  // En dernier recours, utiliser la valeur par défaut
  return defaults.piecePrix || 0;
})();
      const moCategory = forfait.moCategory || "Mécanique";

      return (
        <React.Fragment key={item.id}>
          <tr style={{ backgroundColor: "#EEE6D8" }}>
            <td colSpan="7" className="border border-gray-300 p-2 font-bold">
              {item.label}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 p-2">Main d'œuvre</td>
            <td className="border border-gray-300 p-2">-</td>
            <td className="border border-gray-300 p-2">
              {getDesignation(item.id, forfait)}
            </td>
            <td className="border border-gray-300 p-2">{moCategory}</td>
            <td className="border border-gray-300 p-2 text-right">{moQuantity} h</td>
            <td className="border border-gray-300 p-2 text-right">-</td>
            <td className="border border-gray-300 p-2 text-right">-</td>
          </tr>
          {item.id !== "miseANiveau" && pieceReference && (
            <tr>
              <td className="border border-gray-300 p-2">Pièce</td>
              <td className="border border-gray-300 p-2">{pieceReference}</td>
              <td className="border border-gray-300 p-2">
                {forfait.pieceDesignation || "-"}
              </td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">
                {pieceQuantity}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.piecePrixUnitaire !== undefined
                  ? `${forfait.piecePrixUnitaire} €`
                  : "-"}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {piecePrix} €
              </td>
            </tr>
          )}
          {filterPiecesForOR(item.id, forfaitData, pieceLines).map((line, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 p-2">Pièce suppl.</td>
              <td className="border border-gray-300 p-2">{line.reference}</td>
              <td className="border border-gray-300 p-2">
                {line.designation || "-"}
              </td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">
                {line.quantity}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {line.prixUnitaire !== undefined ? `${line.prixUnitaire} €` : "-"}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {line.prix} €
              </td>
            </tr>
          ))}
          {forfait.consommableReference && safeNum(forfait.consommableQuantity) > 0 && (
            <tr>
              <td className="border border-gray-300 p-2">Consommable</td>
              <td className="border border-gray-300 p-2">
                {forfait.consommableReference}
              </td>
              <td className="border border-gray-300 p-2">
                {forfait.consommableDesignation || "-"}
              </td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommableQuantity}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommablePrixUnitaire !== undefined
                  ? `${forfait.consommablePrixUnitaire} €`
                  : "-"}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommablePrix !== undefined
                  ? `${forfait.consommablePrix} €`
                  : "-"}
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })}

{/* CARROSSERIE - REPC/REMPC */}
{(
  (Array.isArray(activePeintureForfaits) && activePeintureForfaits.length > 0) ||
  (Array.isArray(activePeintureSeuleForfaits) && activePeintureSeuleForfaits.length > 0) ||
  (Array.isArray(realCarrosserieItems) && realCarrosserieItems.length > 0)
) && (
  <tr className="bg-green-200">
    <td colSpan={7} className="border border-gray-300 p-2 font-bold">
      CARROSSERIE - FORFAITS ET PRESTATIONS
    </td>
  </tr>
)}
{/* FORFAITS REPC/REMPC (Carrosserie) */}
{Array.isArray(pureActiveMecaniqueItems) &&
  pureActiveMecaniqueItems
    .filter(item => {
      const isREPC = TEXT_ITEMS_1.some(textItem => textItem.id === item.id);
      const isREMPC = TEXT_ITEMS_2.some(textItem => textItem.id === item.id);
      return isREPC || isREMPC;
    })
    .map(item => {
      const forfait = forfaitData?.[item.id] || {};
      const moQuantity = forfait.moQuantity || 0;
      const pieceReference = forfait.pieceReference || "-";
      const pieceQuantity = forfait.pieceQuantity || 0;
      const piecePrix = forfait.piecePrix || 0;

      return (
        <React.Fragment key={item.id}>
          <tr style={{ backgroundColor: "#BED3C3" }}>
            <td colSpan="7" className="border border-gray-300 p-2 font-bold">
              {item.label}
            </td>
          </tr>
          {/* Main d'œuvre */}
          <tr>
            <td className="border border-gray-300 p-2">Main d'Œuvre</td>
            <td className="border border-gray-300 p-2">-</td>
            <td className="border border-gray-300 p-2">
              {getDesignation(item.id, forfait)}
            </td>
            <td className="border border-gray-300 p-2">Carrosserie</td>
            <td className="border border-gray-300 p-2 text-right">{moQuantity} h</td>
            <td className="border border-gray-300 p-2 text-right">-</td>
            <td className="border border-gray-300 p-2 text-right">-</td>
          </tr>
          {/* Pièce */}
          {pieceReference && pieceReference !== "-" && (
            <tr>
              <td className="border border-gray-300 p-2">Pièce</td>
              <td className="border border-gray-300 p-2">{pieceReference}</td>
              <td className="border border-gray-300 p-2">
                {forfait.pieceDesignation || "-"}
              </td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">{pieceQuantity}</td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.piecePrixUnitaire ? `${forfait.piecePrixUnitaire} €` : "-"}
              </td>
              <td className="border border-gray-300 p-2 text-right">{piecePrix} €</td>
            </tr>
          )}
          {/* Pièces supplémentaires */}
          {pieceLines?.[item.id]?.map((line, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 p-2">Pièce suppl.</td>
              <td className="border border-gray-300 p-2">{line.reference}</td>
              <td className="border border-gray-300 p-2">{line.designation || "-"}</td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">{line.quantity}</td>
              <td className="border border-gray-300 p-2 text-right">
                {line.prixUnitaire ? `${line.prixUnitaire} €` : "-"}
              </td>
              <td className="border border-gray-300 p-2 text-right">{line.prix} €</td>
            </tr>
          ))}
        </React.Fragment>
      );
    })}

{/* FORFAITS RÉPARATION PEINTURE - ÉDITABLE */}
{activePeintureForfaits.length > 0 && (
  <>
    <tr style={{ backgroundColor: "#BED3C3" }}>
      <td
        colSpan="7"
        className="border border-gray-300 p-2 font-bold text-orange-600"
      >
        RÉPARATION + PEINTURE
      </td>
    </tr>
    {activePeintureForfaits.map((forfait, idx) => {
      const state = itemStates[forfait.id] ?? 0;
      const data = forfaitData[forfait.id] || {};
      
      // Quantités actuelles (depuis forfaitData ou valeurs par défaut)
      const currentMo1 = data.mo1Quantity !== undefined ? data.mo1Quantity : forfait.mo1Quantity;
      const currentMo2 = data.mo2Quantity !== undefined ? data.mo2Quantity : forfait.mo2Quantity;
      
      return (
        <React.Fragment key={`peinture-${forfait.id}-${idx}`}>
          {/* Ligne titre */}
          <tr style={{ backgroundColor: "#FFE4D6" }}>
            <td
              colSpan="7"
              className="border border-gray-300 p-2 font-bold text-gray-800"
            >
              {forfait.label}
            </td>
          </tr>
          
{/* MO RÉPARATION (Tolerie) - ÉDITABLE */}
          {forfait.mo1Quantity > 0 && (
            <tr className={state === 2 ? 'bg-green-50' : ''}>
              <td className="border border-gray-300 p-2">
                <span className={state === 2 ? 'line-through text-gray-500' : ''}>
                  MO TOLERIE {forfait.label.toUpperCase()}
                </span>
              </td>
              <td className="border border-gray-300 p-2 text-center">-</td>
              <td className="border border-gray-300 p-2">{forfait.mo1Designation}</td>
              <td className="border border-gray-300 p-2">Tolerie</td>
              <td className="border border-gray-300 p-2 text-right">
                {editMode ? (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={currentMo1}
                    onChange={(e) => updateForfaitField(forfait.id, 'mo1Quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-orange-400 rounded text-right focus:ring-2 focus:ring-orange-500"
                    style={{ backgroundColor: '#FFF5F0' }}
                  />
                ) : (
                  <span>{currentMo1.toFixed(2)} h</span>
                )}
              </td>
              <td className="border border-gray-300 p-2 text-right">-</td>
              <td className="border border-gray-300 p-2 text-right">-</td>
            </tr>
          )}
          
          {/* MO PEINTURE - ÉDITABLE */}
          {forfait.mo2Quantity > 0 && (
            <tr className={state === 2 ? 'bg-green-50' : ''}>
              <td className="border border-gray-300 p-2">
                <span className={state === 2 ? 'line-through text-gray-500' : ''}>
                  MO PEINTURE {forfait.label.toUpperCase()}
                </span>
              </td>
              <td className="border border-gray-300 p-2 text-center">-</td>
              <td className="border border-gray-300 p-2">{forfait.mo2Designation}</td>
              <td className="border border-gray-300 p-2">Peinture</td>
              <td className="border border-gray-300 p-2 text-right">
                {editMode ? (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={currentMo2}
                    onChange={(e) => updateForfaitField(forfait.id, 'mo2Quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-orange-400 rounded text-right focus:ring-2 focus:ring-orange-500"
                    style={{ backgroundColor: '#FFF5F0' }}
                  />
                ) : (
                  <span>{currentMo2.toFixed(2)} h</span>
                )}
              </td>
              <td className="border border-gray-300 p-2 text-right">-</td>
              <td className="border border-gray-300 p-2 text-right">-</td>
            </tr>
          )}
          
          {/* CONSOMMABLE */}
          {forfait.consommableQuantity > 0 && (
            <tr className={state === 2 ? 'bg-green-50' : ''}>
              <td className="border border-gray-300 p-2">
                <span className={state === 2 ? 'line-through text-gray-500' : ''}>
                  CONSOMMABLE {forfait.label.toUpperCase()}
                </span>
              </td>
              <td className="border border-gray-300 p-2 text-center">CONSO</td>
              <td className="border border-gray-300 p-2">{forfait.consommableDesignation}</td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommableQuantity.toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommablePrixUnitaire.toFixed(2)} €
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommablePrix.toFixed(2)} €
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })}
  </>
)}

{/* FORFAITS PEINTURE SEULE - ÉDITABLE */}
{activePeintureSeuleForfaits.length > 0 && (
  <>
    <tr style={{ backgroundColor: "#BED3C3" }}>
      <td
        colSpan="7"
        className="border border-gray-300 p-2 font-bold text-green-600"
      >
        PEINTURE
      </td>
    </tr>
    {activePeintureSeuleForfaits.map((forfait, idx) => {
      const state = itemStates[forfait.id] ?? 0;
      const data = forfaitData[forfait.id] || {};
      
      // Quantité actuelle (depuis forfaitData ou valeur par défaut)
      const currentMoQuantity = data.moQuantity !== undefined ? data.moQuantity : forfait.moQuantity;
      
      return (
        <React.Fragment key={`peinture-seule-${forfait.id}-${idx}`}>
          {/* Ligne titre */}
          <tr style={{ backgroundColor: "#E0F2E9" }}>
            <td
              colSpan="7"
              className="border border-gray-300 p-2 font-bold text-gray-800"
            >
              {forfait.label}
            </td>
          </tr>
          
          {/* MO PEINTURE - ÉDITABLE */}
          {forfait.moQuantity > 0 && (
            <tr className={state === 2 ? 'bg-green-50' : ''}>
              <td className="border border-gray-300 p-2">
                <span className={state === 2 ? 'line-through text-gray-500' : ''}>
                  MO PEINTURE {forfait.label.toUpperCase()}
                </span>
              </td>
              <td className="border border-gray-300 p-2 text-center">-</td>
              <td className="border border-gray-300 p-2">{forfait.moDesignation}</td>
              <td className="border border-gray-300 p-2">Peinture</td>
<td className="border border-gray-300 p-2 text-right">
  {editMode ? (
    <input
      type="number"
      step="0.1"
      min="0"
      value={currentMoQuantity}
      onChange={(e) => updateForfaitField(forfait.id, 'moQuantity', parseFloat(e.target.value) || 0)}
      className="w-20 px-2 py-1 border border-green-400 rounded text-right focus:ring-2 focus:ring-green-500"
      style={{ backgroundColor: '#F0FFF4' }}
    />
  ) : (
    <span>{currentMoQuantity.toFixed(2)} h</span>
  )}
</td>
              <td className="border border-gray-300 p-2 text-right">-</td>
              <td className="border border-gray-300 p-2 text-right">-</td>
            </tr>
          )}
          
          {/* CONSOMMABLE */}
          {forfait.consommableQuantity > 0 && (
            <tr className={state === 2 ? 'bg-green-50' : ''}>
              <td className="border border-gray-300 p-2">
                <span className={state === 2 ? 'line-through text-gray-500' : ''}>
                  CONSOMMABLE {forfait.label.toUpperCase()}
                </span>
              </td>
              <td className="border border-gray-300 p-2 text-center">CONSO</td>
              <td className="border border-gray-300 p-2">{forfait.consommableDesignation}</td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommableQuantity.toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommablePrixUnitaire.toFixed(2)} €
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {forfait.consommablePrix.toFixed(2)} €
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })}
  </>
)}
{(
  (Array.isArray(activeDSPItems) && activeDSPItems.length > 0) ||
  (Array.isArray(activePlumeItems) && activePlumeItems.length > 0) ||
  (Array.isArray(activeLustrageItems) && activeLustrageItems.length > 0)
) && (
  <tr className="bg-blue-100">
    <td colSpan={7} className="border border-gray-300 p-0 font-bold text-gray-600">
      SMART - FORFAITS LUSTRAGE, DSP, PLUME
    </td>
  </tr>
)}
                {/* Section DSP */}
                {Array.isArray(activeDSPItems) && activeDSPItems.length > 0 && (
                  <>
                    <tr style={{ backgroundColor: "#DBEAFE" }}>
                      <td
                        colSpan="7"
                        className="border border-gray-300 p-2 font-bold text-blue-600"
                      >
                        SMART - DSP
                      </td>
                    </tr>
                    {activeDSPItems.map(dspItem => {
                      const dspConfig = DSP_ITEMS.find(item => item.id === dspItem.id);
                      if (!dspConfig) return null;

                      return (
                        <tr key={dspItem.id}>
                          <td className="border border-gray-300 p-2">Main d'œuvre DSP</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">
                            {dspConfig.label}
                          </td>
                          <td className="border border-gray-300 p-2">DSP</td>
                          <td className="border border-gray-300 p-2 text-right">
                            {dspConfig.moQuantity} h
                          </td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                        </tr>
                      );
                    })}
                  </>
                )}

                {/* Section PLUME */}
                {Array.isArray(activePlumeItems) && activePlumeItems.length > 0 && (
                  <>
                    <tr style={{ backgroundColor: "#DBEAFE" }}>
                      <td
                        colSpan="7"
                        className="border border-gray-300 p-2 font-bold text-blue-600"
                      >
                        SMART - PLUME
                      </td>
                    </tr>
                    {activePlumeItems.map(plumeItem => {
                      const plumeConfig = PLUME_ITEMS.find(item => item.id === plumeItem.id);
                      if (!plumeConfig) return null;

                      return (
                        <tr key={plumeItem.id}>
                          <td className="border border-gray-300 p-2">Main d'œuvre Plume</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">
                            {plumeConfig.label}
                          </td>
                          <td className="border border-gray-300 p-2">Lustrage</td>
                          <td className="border border-gray-300 p-2 text-right">
                            {plumeConfig.moQuantity} h
                          </td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                        </tr>
                      );
                    })}
                  </>
                )}

                {/* Section LUSTRAGE */}
                {Array.isArray(activeLustrageItems) && activeLustrageItems.length > 0 && (
                  <>
                    <tr style={{ backgroundColor: "#DBEAFE" }}>
                      <td
                        colSpan="7"
                        className="border border-gray-300 p-2 font-bold text-blue-600"
                      >
                        SMART - LUSTRAGE
                      </td>
                    </tr>
                    {activeLustrageItems.map(lustrageItem => {
                      const lustrageConfig = LUSTRAGE_ITEMS.find(
                        item => item.id === lustrageItem.id
                      );
                      if (!lustrageConfig) return null;

                      const forfait = forfaitData?.[lustrageItem.id] || {};
                      const moQuantity =
                        forfait.moQuantity !== undefined
                          ? forfait.moQuantity
                          : lustrageConfig.moQuantity || 0;
                      const consommableQuantity =
                        forfait.consommableQuantity !== undefined
                          ? forfait.consommableQuantity
                          : lustrageConfig.consommable || 0;
                      const consommablePrixUnitaire =
                        forfait.consommablePrixUnitaire !== undefined
                          ? forfait.consommablePrixUnitaire
                          : 1.0;
                      const consommablePrix = consommableQuantity * consommablePrixUnitaire;

                      return (
                        <React.Fragment key={lustrageItem.id}>
                          <tr>
                            <td className="border border-gray-300 p-2">
                              Main d'œuvre Lustrage
                            </td>
                            <td className="border border-gray-300 p-2">-</td>
                            <td className="border border-gray-300 p-2">
                              {lustrageConfig.label}
                            </td>
                            <td className="border border-gray-300 p-2">Lustrage</td>
                            <td className="border border-gray-300 p-2 text-right">
                              {moQuantity} h
                            </td>
                            <td className="border border-gray-300 p-2 text-right">-</td>
                            <td className="border border-gray-300 p-2 text-right">-</td>
                          </tr>
                          {consommableQuantity > 0 && (
                            <tr>
                              <td className="border border-gray-300 p-2">Consommable</td>
                              <td className="border border-gray-300 p-2">
                                {forfait.consommableReference || "-"}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {forfait.consommableDesignation ||
                                  "Consommable lustrage"}
                              </td>
                              <td className="border border-gray-300 p-2">-</td>
                              <td className="border border-gray-300 p-2 text-right">
                                {consommableQuantity}
                              </td>
                              <td className="border border-gray-300 p-2 text-right">
                                {consommablePrixUnitaire.toFixed(2)} €
                              </td>
                              <td className="border border-gray-300 p-2 text-right">
                                {consommablePrix.toFixed(2)} €
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </>
                )}

              {/* === LUSTRAGE 1 ÉLÉMENT (STACKABLES) === */}
                {Object.entries(forfaitData || {})
                  .filter(([key, data]) => data.lustrage1Elem === true)
                  .map(([key, data]) => {
                    const moQty = safeNum(data.moQuantity || 0);
                    const consQty = safeNum(data.consommableQuantity || 0);
                    const consPU = safeNum(data.consommablePrixUnitaire || 0);
                    
                    return (
                      <React.Fragment key={key}>
                        {/* MO Lustrage */}
                        <tr>
                          <td className="border border-gray-300 p-2">LUSTRAGE</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">{data.moDesignation || 'Lustrage 1 élément'}</td>
                          <td className="border border-gray-300 p-2">Lustrage</td>
                          <td className="border border-gray-300 p-2 text-right">{moQty} h</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                        </tr>
                        {/* Consommable Lustrage */}
                        {consQty > 0 && (
                          <tr>
                            <td className="border border-gray-300 p-2">LUSTRAGE</td>
                            <td className="border border-gray-300 p-2">CONSO</td>
                            <td className="border border-gray-300 p-2">Consommable lustrage</td>
                            <td className="border border-gray-300 p-2">-</td>
                            <td className="border border-gray-300 p-2 text-right">{consQty}</td>
                            <td className="border border-gray-300 p-2 text-right">{consPU.toFixed(2)} €</td>
                            <td className="border border-gray-300 p-2 text-right">{(consQty * consPU).toFixed(2)} €</td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                }

                {/* === PLUME 1 ÉLÉMENT (STACKABLES) === */}
                {Object.entries(forfaitData || {})
                  .filter(([key, data]) => data.plume1Elem === true)
                  .map(([key, data]) => {
                    const moQty = safeNum(data.moQuantity || 0);
                    
                    return (
                      <tr key={key}>
                        <td className="border border-gray-300 p-2">PLUME</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2">{data.moDesignation || 'Plume 1 élément'}</td>
                        <td className="border border-gray-300 p-2">Mécanique</td>
                        <td className="border border-gray-300 p-2 text-right">{moQty} h</td>
                        <td className="border border-gray-300 p-2 text-right">-</td>
                        <td className="border border-gray-300 p-2 text-right">-</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>

          <div className="mb-6 no-break">
            <h2
              className="text-lg font-bold text-gray-800 mb-3 p-2 rounded-lg"
              style={{ backgroundColor: '#FFF0E6' }}
            >
              Récapitulatif Financier
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Main d'oeuvre:</span>
                  <span>{totals?.totalMO !== undefined ? totals.totalMO : "0.00"} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Pièces:</span>
                  <span>{totals?.totalPieces !== undefined ? totals.totalPieces : "0.00"} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Consommables:</span>
                  <span>
                    {totals?.totalConsommables !== undefined
                      ? totals.totalConsommables
                      : "0.00"}{" "}
                    €
                  </span>
                </div>
                <div className="border-t border-gray-400 pt-1 mt-1"></div>
                <div
                  className="flex justify-between text-lg font-bold"
                  style={{ color: '#FF6B35' }}
                >
                  <span>TOTAL PIECES HT (sans prestations ext.):</span>
                  <span>
                    {totals?.totalHTSansPrestations !== undefined
                      ? totals.totalHTSansPrestations
                      : "0.00"}{" "}
                    €
                  </span>
                </div>
                {includeControleTechnique && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Contrôle Technique:</span>
                    <span>42.00 €</span>
                  </div>
                )}
                {includeContrevisite && (
                  <div className="flex justify-between bg-orange-50 px-2 py-1 rounded">
                    <span className="font-semibold">Contre-visite:</span>
                    <span>10.00 €</span>
                  </div>
                )}
                <div
                  className="border-t pt-1 mt-1"
                  style={{ borderColor: '#FF6B35' }}
                ></div>
                <div
                  className="flex justify-between text-xl font-bold"
                  style={{ color: '#FF6B35' }}
                >
                  <span>TOTAL HT:</span>
                  <span>
                    {totals?.totalHT !== undefined ? totals.totalHT : "0.00"} €
                  </span>
                </div>
              </div>
            </div>
          </div>

        
        </div>
      )}
    </div>
  );
};

export default OrdreReparation;
