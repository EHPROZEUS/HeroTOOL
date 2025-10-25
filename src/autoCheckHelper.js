/**
 * autoCheckHelper.js
 * Fonction d'auto-cochage automatique des interventions mappées depuis CAROL
 * Coche automatiquement les éléments DSP, Lustrage, Plume, Peinture et autres
 */

import { DSP_ITEMS, LUSTRAGE_ITEMS } from './config/constants';

/**
 * Auto-coche un élément lorsqu'il est mappé depuis CAROL
 * 
 * @param {string} forfaitId - L'ID du forfait mappé (ex: 'dspAileAvd', 'LPTEAVD', etc.)
 * @param {string} type - Le type d'intervention ('DSP', 'LUSTRAGE', 'PLUME', 'PEINTURE', etc.)
 * @param {function} setItemStates - Fonction setState pour mettre à jour les états des items
 * @returns {boolean} - true si l'élément a été coché, false sinon
 */
export function autoCheckMappedItem(forfaitId, type, setItemStates) {
  if (!forfaitId || !setItemStates) {
    console.warn('⚠️ autoCheckMappedItem: paramètres manquants', { forfaitId, type });
    return false;
  }

  // Déterminer l'ID de l'item à cocher selon le type
  let itemIdToCheck = null;

  switch (type) {
    case 'DSP':
    case 'DSP_GRELE':
      // Pour DSP, le forfaitId est directement l'ID de l'item (ex: 'dspAileAvd')
      itemIdToCheck = forfaitId;
      break;

    case 'LUSTRAGE':
      // Pour Lustrage, le forfaitId est directement l'ID de l'item (ex: 'LPTEAVD')
      itemIdToCheck = forfaitId;
      break;

    case 'PLUME':
      // Pour Plume, le forfaitId est directement l'ID de l'item (ex: 'PLUPTEAVD')
      itemIdToCheck = forfaitId;
      break;

    case 'PEINTURE':
      // Pour Peinture, le forfaitId est directement l'ID de l'item (ex: 'P-PTEAVD')
      itemIdToCheck = forfaitId;
      break;

    case 'REPARATION_PB':
      // Réparation pare-brise
      itemIdToCheck = 'REP PB';
      break;

    case 'REPC':
    case 'REPM':
    case 'REMPC':
    case 'REMPM':
      // Pour les réparations/remplacements génériques, on utilise le code fourni
      itemIdToCheck = forfaitId; // Le code est déjà dans forfaitId (ex: 'repc1', 'repm2')
      break;

    case 'RP':
      // Réparation + Peinture
      itemIdToCheck = forfaitId; // Ex: 'R-P1', 'R-PAARD'
      break;

    default:
      console.warn(`⚠️ Type d'intervention non géré pour auto-cochage: ${type}`);
      return false;
  }

  if (!itemIdToCheck) {
    console.warn('⚠️ Impossible de déterminer l\'ID de l\'item à cocher', { forfaitId, type });
    return false;
  }

  // Cocher l'élément (état = 1 pour "orange/en cours")
  setItemStates(prevStates => ({
    ...prevStates,
    [itemIdToCheck]: 1
  }));

  console.log(`✅ Auto-coché: ${itemIdToCheck} (type: ${type})`);
  return true;
}

/**
 * Auto-coche plusieurs éléments à la fois (pour import batch)
 * 
 * @param {Array} mappedItems - Tableau d'objets avec { forfaitId, type }
 * @param {function} setItemStates - Fonction setState
 * @returns {number} - Nombre d'éléments cochés
 */
export function autoCheckMultipleItems(mappedItems, setItemStates) {
  if (!Array.isArray(mappedItems) || !setItemStates) {
    console.warn('⚠️ autoCheckMultipleItems: paramètres invalides');
    return 0;
  }

  let checkedCount = 0;
  const updates = {};

  mappedItems.forEach(({ forfaitId, type }) => {
    let itemIdToCheck = null;

    switch (type) {
      case 'DSP':
      case 'DSP_GRELE':
      case 'LUSTRAGE':
      case 'PLUME':
      case 'PEINTURE':
      case 'REPARATION_PB':
      case 'REPC':
      case 'REPM':
      case 'REMPC':
      case 'REMPM':
      case 'RP':
        itemIdToCheck = forfaitId;
        break;
      default:
        console.warn(`⚠️ Type non géré: ${type}`);
    }

    if (itemIdToCheck) {
      updates[itemIdToCheck] = 1; // État "en cours"
      checkedCount++;
    }
  });

  // Appliquer toutes les mises à jour en une seule fois
  if (Object.keys(updates).length > 0) {
    setItemStates(prevStates => ({
      ...prevStates,
      ...updates
    }));
    console.log(`✅ ${checkedCount} élément(s) auto-coché(s)`);
  }

  return checkedCount;
}

/**
 * Vérifie si un item existe dans les constantes (DSP ou LUSTRAGE)
 * 
 * @param {string} itemId - L'ID de l'item à vérifier
 * @returns {boolean}
 */
export function isValidItem(itemId) {
  if (!itemId) return false;

  // Vérifier dans DSP_ITEMS
  const isDSP = DSP_ITEMS.some(item => item.id === itemId);
  if (isDSP) return true;

  // Vérifier dans LUSTRAGE_ITEMS
  const isLustrage = LUSTRAGE_ITEMS.some(item => item.id === itemId);
  if (isLustrage) return true;

  // Les items de type REPC, REPM, etc. sont dynamiques
  const isRepair = /^(repc|repm|rempc|rempm)\d+$/i.test(itemId);
  if (isRepair) return true;

  return false;
}

/**
 * Obtient la couleur de fond selon l'état de l'item
 * 
 * @param {number} state - État de l'item (0 = gris, 1 = orange, 2 = vert)
 * @returns {object} - { bg, border, text }
 */
export function getItemStateClasses(state) {
  switch (state) {
    case 0:
      return {
        bg: 'bg-gray-200',
        border: 'border-gray-400',
        text: 'text-gray-600'
      };
    case 1:
      return {
        bg: 'bg-orange-100',
        border: 'border-orange-400',
        text: 'text-orange-900'
      };
    case 2:
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        text: 'text-green-800 line-through'
      };
    default:
      return {
        bg: 'bg-gray-200',
        border: 'border-gray-400',
        text: 'text-gray-600'
      };
  }
}

/**
 * Hook React personnalisé pour gérer l'auto-cochage
 * À utiliser dans App.js
 */
export function useAutoCheck(setItemStates) {
  const handleCarolMapping = (mappingResult) => {
    if (!mappingResult || !mappingResult.success) {
      return false;
    }

    const { forfaitId, code, type } = mappingResult;
    const idToUse = forfaitId || code;

    return autoCheckMappedItem(idToUse, type, setItemStates);
  };

  const handleBatchCarolMapping = (results) => {
    if (!results || !Array.isArray(results.success)) {
      return 0;
    }

    const items = results.success.map(result => ({
      forfaitId: result.forfaitId || result.code,
      type: result.type
    }));

    return autoCheckMultipleItems(items, setItemStates);
  };

  return {
    handleCarolMapping,
    handleBatchCarolMapping
  };
}