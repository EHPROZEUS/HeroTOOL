/**
 * HOOK: Logique métier de l'Ordre de Réparation
 * Centralise tous les calculs et transformations de données
 */
import { useMemo } from 'react';
import { LUSTRAGE_ITEMS } from '../config/constants';
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
  
  // Séparer LUSTRAGE + PLUMES des items de mécanique pure
  const { activeLustrageItems, activePlumeItems, pureActiveMecaniqueItems } = useMemo(() => {
    const lustrage = Array.isArray(activeMecaniqueItems)
      ? activeMecaniqueItems.filter(item =>
          LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
        )
      : [];

    const plumes = Array.isArray(activeMecaniqueItems)
      ? activeMecaniqueItems.filter(item => item.id.startsWith('PLU'))
      : [];

    const pure = Array.isArray(activeMecaniqueItems)
      ? activeMecaniqueItems.filter(item =>
          !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id) &&
          !item.id.startsWith('PLU')
        )
      : [];

    return { 
      activeLustrageItems: lustrage,
      activePlumeItems: plumes,
      pureActiveMecaniqueItems: pure 
    };
  }, [activeMecaniqueItems]);

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
      ...totals,
      totalHT,
      totalHTSansPrestations
    };
  }, [totals, includeControleTechnique, includeContrevisite]);

  return {
    activeLustrageItems,
    activePlumeItems,
    pureActiveMecaniqueItems,
    ventilation,
    finalTotals
  };
};