/**
 * SERVICE DE CALCUL DE VENTILATION COMPTABLE
 * Répartit les montants par catégorie comptable
 */
import { safeNum } from './dataValidator';
import { TARIF_HORAIRE, calculateObligatoryMO, OBLIGATORY_CLEANING } from './moCalculator';
import { PEINTURE_FORFAITS, LUSTRAGE_ITEMS } from '../config/constants';

// Catégories de ventilation comptable
export const VENTILATION_CATEGORIES = [
  { key: 'moMecanique', label: 'MO MECANIQUE' },
  { key: 'moPeinture', label: 'MO PEINTURE' },
  { key: 'moTolerie', label: 'MO TOLERIE' },
  { key: 'moSmart', label: 'MO SMART' },
  { key: 'moControlling', label: 'MO CONTROLLING' },
  { key: 'moForfaitaire', label: 'MO FORFAITAIRE' },
  { key: 'ingredientPeinture', label: 'INGREDIENT PEINTURE' },
  { key: 'fluides', label: 'FLUIDES' },
  { key: 'piecesMecanique', label: 'PIECES MECANIQUE' },
  { key: 'piecesRemploi', label: 'PIECES REMPLOI' },
  { key: 'piecesTolerie', label: 'PIECES TOLERIE' },
  { key: 'pneumatiques', label: 'PNEUMATIQUES' },
  { key: 'presSousTraitees', label: 'PRES. SOUS-TRAITEES' },
  { key: 'recyclageDechets', label: 'RECYCLAGE DECHETS' },
];

/**
 * Calcule la ventilation comptable complète
 */
export const computeVentilation = ({
  activeMecaniqueItems = [],
  activeDSPItems = [],
  forfaitData = {},
  pieceLines = {},
  moByCategory = {},
  totals = {},
  includeControleTechnique = false,
}) => {
  // Initialisation des résultats
  const result = {};
  VENTILATION_CATEGORIES.forEach(cat => {
    result[cat.key] = { qty: 0, ht: 0 };
  });

  // === MO OBLIGATOIRES ===
  const obligatoryMO = calculateObligatoryMO();
  result.moMecanique.qty += obligatoryMO.mecanique;
  result.moControlling.qty += obligatoryMO.controlling;

  // Nettoyage obligatoire (consommables sur pièces mécanique)
  OBLIGATORY_CLEANING.forEach(item => {
    result.piecesMecanique.ht += safeNum(item.consommable.totalPrice);
    result.piecesMecanique.qty += safeNum(item.consommable.quantity);
  });

  // === MO DYNAMIQUES (depuis moByCategory) ===
  result.moMecanique.qty += safeNum(moByCategory.mecanique);
  result.moSmart.qty += safeNum(moByCategory.dsp) + safeNum(moByCategory.lustrage) + safeNum(moByCategory.plume);
  result.moControlling.qty += safeNum(moByCategory.controlling);
  result.moForfaitaire.qty += safeNum(moByCategory.forfaitaire);
  result.moPeinture.qty += safeNum(moByCategory.peinture);
  result.moTolerie.qty += safeNum(moByCategory.tolerie);

  // === PIECES MECANIQUE (depuis totals) ===
  result.piecesMecanique.ht += safeNum(totals.totalPieces);

  // === CONSOMMABLES LUSTRAGE ===
  activeMecaniqueItems.forEach(item => {
    const isLustrage = LUSTRAGE_ITEMS.some(l => l.id === item.id);
    if (isLustrage) {
      const forfait = forfaitData?.[item.id];
      if (forfait) {
        const consommableQty = safeNum(forfait.consommableQuantity);
        const consommablePrix = safeNum(forfait.consommablePrix);
        result.piecesMecanique.qty += consommableQty;
        result.piecesMecanique.ht += consommablePrix;
      }
    }
  });

  // === FORFAITS REPARATION + PEINTURE ===
  if (forfaitData.reparationPeinture?.forfaits) {
    forfaitData.reparationPeinture.forfaits.forEach(forfait => {
      const config = PEINTURE_FORFAITS.find(f => f.id === forfait.id);
      if (config) {
        const consommableQty = safeNum(config.consommableQuantity);
        const consommablePrix = safeNum(config.consommablePrix);
        result.ingredientPeinture.qty += consommableQty;
        result.ingredientPeinture.ht += consommablePrix;
      }
    });
  }

  // === PRESTATIONS SOUS-TRAITEES (Contrôle Technique) ===
  if (includeControleTechnique) {
    result.presSousTraitees.qty += 1;
    result.presSousTraitees.ht += 42;
  }

  // === CALCUL DES MONTANTS HT POUR LES MO ===
  result.moMecanique.ht = Number((result.moMecanique.qty * TARIF_HORAIRE).toFixed(2));
  result.moSmart.ht = Number((result.moSmart.qty * TARIF_HORAIRE).toFixed(2));
  result.moControlling.ht = Number((result.moControlling.qty * TARIF_HORAIRE).toFixed(2));
  result.moForfaitaire.ht = Number((result.moForfaitaire.qty * TARIF_HORAIRE).toFixed(2));
  result.moPeinture.ht = Number((result.moPeinture.qty * TARIF_HORAIRE).toFixed(2));
  result.moTolerie.ht = Number((result.moTolerie.qty * TARIF_HORAIRE).toFixed(2));

  return result;
};

export const getTotalVentilationHT = (ventilation) => {
  return VENTILATION_CATEGORIES.reduce((sum, cat) => {
    return sum + safeNum(ventilation[cat.key]?.ht);
  }, 0);
};

export const getNonZeroCategories = (ventilation) => {
  return VENTILATION_CATEGORIES
    .filter(cat => {
      const qty = safeNum(ventilation[cat.key]?.qty);
      const ht = safeNum(ventilation[cat.key]?.ht);
      return qty > 0 || ht > 0;
    })
    .map(cat => ({
      key: cat.key,
      label: cat.label,
      qty: safeNum(ventilation[cat.key]?.qty),
      ht: safeNum(ventilation[cat.key]?.ht)
    }));
};

export const exportVentilation = (ventilation) => {
  const categories = getNonZeroCategories(ventilation);
  const total = getTotalVentilationHT(ventilation);

  return {
    categories,
    total,
    date: new Date().toISOString(),
  };
};