/**
 * HOOK: Logique métier de l'Ordre de Réparation
 * Centralise tous les calculs et transformations de données
 */
import { useMemo } from 'react';
import { LUSTRAGE_ITEMS, TEXT_ITEMS_1, TEXT_ITEMS_2 } from '../config/constants';
import { computeVentilation } from '../utils/ventilationCalculator';
import { safeNum } from '../utils/dataValidator';

export const useOrdreReparation = ({
  activeMecaniqueItems = [],
  activeDSPItems = [],
  forfaitData = {},
  pieceLines = {},
  moByCategory = {},
  totals = {},
  includeControleTechnique = false,
  includeContrevisite = false
}) => {
  
  // IDs des items REPC et REMPC (Carrosserie)
  const carrosserieIds = [
    ... TEXT_ITEMS_1.map(i => i.id),  // repc1, repc2, repc3, repc4
    ...TEXT_ITEMS_2.map(i => i.id)   // rempc1, rempc2, rempc3, rempc4
  ];

  // Séparer LUSTRAGE + PLUMES + CARROSSERIE des items de mécanique pure
  const { activeLustrageItems, activePlumeItems, activeCarrosserieItems, pureActiveMecaniqueItems } = useMemo(() => {
    const lustrage = Array.isArray(activeMecaniqueItems)
      ? activeMecaniqueItems. filter(item =>
          LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
        )
      : [];

    const plumes = Array.isArray(activeMecaniqueItems)
      ?  activeMecaniqueItems.filter(item => item.id. startsWith('PLU'))
      : [];

    // ✅ NOUVEAU : Items Carrosserie (REPC/REMPC)
    const carrosserie = Array.isArray(activeMecaniqueItems)
      ? activeMecaniqueItems. filter(item => carrosserieIds.includes(item.id))
      : [];

    const pure = Array.isArray(activeMecaniqueItems)
      ?  activeMecaniqueItems.filter(item =>
          ! LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id) &&
          !item.id.startsWith('PLU') &&
          !carrosserieIds.includes(item.id)
        )
      : [];

    return { 
      activeLustrageItems: lustrage,
      activePlumeItems: plumes,
      activeCarrosserieItems: carrosserie,  // ✅ NOUVEAU
      pureActiveMecaniqueItems: pure 
    };
  }, [activeMecaniqueItems, carrosserieIds]);

  // Calcul de la ventilation comptable
  const ventilation = useMemo(() => {
    return computeVentilation({
      activeMecaniqueItems,
      activeDSPItems,
      forfaitData,
      pieceLines,
      moByCategory,
      totals,
      includeControleTechnique
    });
  }, [
    activeMecaniqueItems,
    activeDSPItems,
    forfaitData,
    pieceLines,
    moByCategory,
    totals,
    includeControleTechnique
  ]);

  // Calcul des totaux finaux avec prestations externes
  const finalTotals = useMemo(() => {
    const totalHTSansPrestations = safeNum(totals.totalHTSansPrestations, 0);
    let totalHT = totalHTSansPrestations;
    
    if (includeControleTechnique) totalHT += 42;
    if (includeContrevisite) totalHT += 10;

    return {
      ... totals,
      totalHT,
      totalHTSansPrestations
    };
  }, [totals, includeControleTechnique, includeContrevisite]);

  return {
    activeLustrageItems,
    activePlumeItems,
    activeCarrosserieItems,  // ✅ NOUVEAU
    pureActiveMecaniqueItems,
    ventilation,
    finalTotals
  };
};
