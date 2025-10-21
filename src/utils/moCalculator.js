/**
 * SERVICE DE CALCUL DE MAIN D'ŒUVRE
 * Centralise tous les calculs MO pour éviter les incohérences
 */
import { safeNum } from './dataValidator';
import { DSP_ITEMS, LUSTRAGE_ITEMS, PEINTURE_FORFAITS, PEINTURE_SEULE_FORFAITS } from '../config/constants';

// Tarif horaire de la main d'œuvre
export const TARIF_HORAIRE = 35.8;

// Prestations obligatoires à afficher en haut du tableau
export const OBLIGATORY_PRESTATIONS = [
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
export const OBLIGATORY_CLEANING = [
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
      type: "MO",
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
      type: "MO",
      designation: "Main d'oeuvre",
      moCategory: "Nettoyage",
      moQuantity: 0.42,
    },
  },
];

/**
 * Calcule le total des MO obligatoires
 * @returns {Object} - { mecanique, controlling, nettoyage }
 */
export const calculateObligatoryMO = () => {
  let mecanique = 0;
  let controlling = 0;
  let nettoyage = 0;

  // Prestations obligatoires
  OBLIGATORY_PRESTATIONS.forEach(item => {
    if (item.moCategory === 'Mécanique') {
      mecanique += safeNum(item.moQuantity);
    } else if (item.moCategory === 'Controlling') {
      controlling += safeNum(item.moQuantity);
    }
  });

  // Nettoyage obligatoire
  OBLIGATORY_CLEANING.forEach(item => {
    nettoyage += safeNum(item.mo.moQuantity);
  });

  return { mecanique, controlling, nettoyage };
};

/**
 * Calcule la MO par catégorie depuis les items actifs
 * @param {Array} activeMecaniqueItems - Items de mécanique actifs
 * @param {Array} activeDSPItems - Items DSP actifs
 * @param {Object} forfaitData - Données des forfaits
 * @returns {Object} - { mecanique, lustrage, dsp, controlling, forfaitaire, peinture, tolerie }
 */
export const calculateMOByCategory = (
  activeMecaniqueItems = [],
  activeDSPItems = [],
  forfaitData = {}
) => {
  const result = {
    mecanique: 0,
    lustrage: 0,
    dsp: 0,
    controlling: 0,
    forfaitaire: 0,
    peinture: 0,
    tolerie: 0,
  };

  // MO obligatoires
  const obligatory = calculateObligatoryMO();
  result.mecanique += obligatory.mecanique;
  result.controlling += obligatory.controlling;
  // Note: le nettoyage n'est pas compté dans la MO (c'est dans les consommables)

  // Items de mécanique (excluant lustrage)
  activeMecaniqueItems.forEach(item => {
    const isLustrage = LUSTRAGE_ITEMS.some(l => l.id === item.id);
    const forfait = forfaitData?.[item.id];

    if (!forfait) return;

    const moQty = safeNum(forfait.moQuantity);

    if (isLustrage) {
      result.lustrage += moQty;
    } else {
      result.mecanique += moQty;
    }
  });

  // Items DSP
  activeDSPItems.forEach(item => {
    const dspConfig = DSP_ITEMS.find(d => d.id === item.id);
    if (dspConfig) {
      result.dsp += safeNum(dspConfig.moQuantity);
    }
  });

  // Forfaits Réparation + Peinture
  if (forfaitData.reparationPeinture?.forfaits) {
    forfaitData.reparationPeinture.forfaits.forEach(forfait => {
      const config = PEINTURE_FORFAITS.find(f => f.id === forfait.id);
      if (config) {
        result.tolerie += safeNum(config.mo1Quantity); // Réparation
        result.peinture += safeNum(config.mo2Quantity); // Peinture
      }
    });
  }

  // Forfaits Peinture Seule
  if (forfaitData.peintureSeule?.forfaits) {
    forfaitData.peintureSeule.forfaits.forEach(forfait => {
      const config = PEINTURE_SEULE_FORFAITS.find(f => f.id === forfait.id);
      if (config) {
        result.peinture += safeNum(config.moQuantity);
      }
    });
  }

  return result;
};

/**
 * Calcule le coût total de la MO
 * @param {Object} moByCategory - Résultat de calculateMOByCategory
 * @returns {number} - Total MO en euros
 */
export const calculateTotalMO = (moByCategory) => {
  const totalHours = Object.values(moByCategory).reduce((sum, hours) => {
    return sum + safeNum(hours);
  }, 0);

  return Number((totalHours * TARIF_HORAIRE).toFixed(2));
};

/**
 * Retourne le détail des heures MO par catégorie avec montants
 * @param {Object} moByCategory - Résultat de calculateMOByCategory
 * @returns {Array} - [{category, hours, amount}]
 */
export const getMODetails = (moByCategory) => {
  const categories = [
    { key: 'mecanique', label: 'Mécanique' },
    { key: 'peinture', label: 'Peinture' },
    { key: 'tolerie', label: 'Tôlerie' },
    { key: 'lustrage', label: 'Lustrage' },
    { key: 'dsp', label: 'DSP' },
    { key: 'controlling', label: 'Controlling' },
    { key: 'forfaitaire', label: 'Forfaitaire' },
  ];

  return categories
    .map(cat => ({
      category: cat.label,
      hours: safeNum(moByCategory[cat.key]),
      amount: Number((safeNum(moByCategory[cat.key]) * TARIF_HORAIRE).toFixed(2))
    }))
    .filter(item => item.hours > 0); // Seulement les catégories avec des heures
};