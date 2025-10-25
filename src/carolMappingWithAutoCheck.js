// ============================================================================
// CAROL MAPPING V3 - AVEC AUTO-COCHAGE INTÉGRÉ
// ============================================================================
// Ce fichier gère le mapping entre les données Carol (Google Sheets) et HeroTool
// NOUVEAU: Auto-coche automatiquement les éléments DSP, Lustrage, etc.
// ============================================================================

import { autoCheckMappedItem } from './autoCheckHelper';

// ===== COMPTEURS GLOBAUX =====
const repairCounters = {
  repc: 1,   // Réparation carrosserie
  repm: 1,   // Réparation mécanique
  rempc: 1,  // Remplacement carrosserie
  rempm: 1   // Remplacement mécanique
};

// ===== MAPPING ÉLÉMENTS → FORFAITS DSP =====
export const DSP_MAPPING = {
  'front-right-door': 'dspPorteAvd',
  'front-left-door': 'dspPorteAvg',
  'rear-right-door': 'dspPorteArd',
  'rear-left-door': 'dspPorteArg',
  'front-right-fender': 'dspAileAvd',
  'front-left-fender': 'dspAileAvg',
  'rear-right-fender': 'dspAileArd',
  'rear-left-fender': 'dspAileArg',
  'hood': 'dspCapot',
  'tailgate': 'dspHayon',
  'trunk': 'dspHayon',
  'roof': 'dspPavillon',
  'right-a-pillar': 'dspMontantAD',
  'left-a-pillar': 'dspMontantAG',
  'right-b-pillar': 'dspMontantBD',
  'left-b-pillar': 'dspMontantBG',
  'right-c-pillar': 'dspMontantCD',
  'left-c-pillar': 'dspMontantCG',
  'right-d-pillar': 'dspMontantDD',
  'left-d-pillar': 'dspMontantDG',
  'right-side-skirts': 'dspBdcd',
  'left-side-skirts': 'dspBdcg'
};

// ===== MAPPING ÉLÉMENTS → FORFAITS LUSTRAGE =====
export const LUSTRAGE_MAPPING = {
  'front-right-door': 'LPTEAVD',
  'front-left-door': 'LPTEAVG',
  'rear-right-door': 'LPTEARD',
  'rear-left-door': 'LPTEARG',
  'front-right-fender': 'LAAVD',
  'front-left-fender': 'LAAVG',
  'rear-right-fender': 'LAARD',
  'rear-left-fender': 'LAARG',
  'hood': 'LCP',
  'tailgate': 'LH',
  'trunk': 'LH',
  'roof': 'LPAVILLON',
  'front-bumper': 'LPCAV',
  'rear-bumper': 'LPCAR',
  'right-a-pillar': 'LMAD',
  'left-a-pillar': 'LMAG',
  'right-b-pillar': 'LMBD',
  'left-b-pillar': 'LMBG',
  'right-c-pillar': 'LMCD',
  'left-c-pillar': 'LMCG',
  'right-d-pillar': 'LMDD',
  'left-d-pillar': 'LMDG',
  'right-side-skirts': 'LBDCD',
  'left-side-skirts': 'LBDCG',
  'right-headlight': 'LPD',
  'left-headlight': 'LPG',
  'rear-right-fog-light': 'LFAD',
  'rear-left-fog-light': 'LFAG'
};

// ===== MAPPING ÉLÉMENTS → FORFAITS PLUME =====
export const PLUME_MAPPING = {
  'front-right-door': 'PLUPTEAVD',
  'front-left-door': 'PLUPTEAVG',
  'rear-right-door': 'PLUPTEARD',
  'rear-left-door': 'PLUPTEARG',
  'front-right-fender': 'PLUAAVD',
  'front-left-fender': 'PLUAAVG',
  'rear-right-fender': 'PLUAARD',
  'rear-left-fender': 'PLUAARG',
  'hood': 'PLUCP',
  'tailgate': 'PLUH',
  'trunk': 'PLUH',
  'roof': 'PLUPAVILLON',
  'front-bumper': 'PLUPCAV',
  'rear-bumper': 'PLUPCAR'
};

// ===== MAPPING ÉLÉMENTS → FORFAITS PEINTURE =====
export const PEINTURE_MAPPING = {
  'front-right-door': 'P-PTEAVD',
  'front-left-door': 'P-PTEAVG',
  'rear-right-door': 'P-PTEARD',
  'rear-left-door': 'P-PTEARG',
  'front-right-fender': 'P-AAVD',
  'front-left-fender': 'P-AAVG',
  'rear-right-fender': 'P-AARD',
  'rear-left-fender': 'P-AARG',
  'hood': 'P-CAPOT',
  'tailgate': 'P-HAYON',
  'trunk': 'P-HAYON',
  'roof': 'P-PAVILLON',
  'front-bumper': 'P-PCAV',
  'rear-bumper': 'P-PCAR',
  'right-side-skirts': 'P-BDCD',
  'left-side-skirts': 'P-BDCG'
};

/**
 * NOUVELLE FONCTION: Mappe une intervention Carol ET coche automatiquement l'élément
 * 
 * @param {object} carolRow - Ligne de données Carol
 * @param {function} setItemStates - Fonction setState pour cocher les items
 * @param {function} setItemNotes - Fonction setState pour remplir les notes (optionnel)
 * @returns {object} - Résultat du mapping avec auto-cochage appliqué
 */
export function mapCarolToHeroToolWithAutoCheck(carolRow, setItemStates, setItemNotes) {
  // Utiliser la fonction de mapping originale (depuis votre fichier)
  const mappingResult = mapCarolToHeroTool(carolRow);
  
  // Si le mapping a réussi
  if (mappingResult.success && setItemStates) {
    const forfaitId = mappingResult.forfaitId || mappingResult.code;
    const type = mappingResult.type;
    
    // NE PAS auto-cocher les REPC/REPM/REMPC/REMPM
    // À la place, remplir les notes avec les infos
    if (type === 'REPC' || type === 'REPM' || type === 'REMPC' || type === 'REMPM') {
      mappingResult.autoChecked = false;
      mappingResult.shouldFillNote = true;
      mappingResult.noteContent = mappingResult.commentaire;
      
      // Si setItemNotes est fourni, remplir la note automatiquement
      if (setItemNotes && forfaitId) {
        setItemNotes(prev => ({
          ...prev,
          [forfaitId]: mappingResult.commentaire
        }));
      }
    } else {
      // Pour les autres types (DSP, LUSTRAGE, etc.), auto-cocher normalement
      const checked = autoCheckMappedItem(forfaitId, type, setItemStates);
      mappingResult.autoChecked = checked;
    }
  }
  
  return mappingResult;
}

/**
 * NOUVELLE FONCTION: Traite un batch de données Carol avec auto-cochage
 * 
 * @param {Array} rows - Tableau de lignes Carol
 * @param {function} setItemStates - Fonction setState pour cocher
 * @param {function} setItemNotes - Fonction setState pour remplir les notes (optionnel)
 * @returns {object} - Résultats avec stats d'auto-cochage
 */
export function processCarolDataWithAutoCheck(rows, setItemStates, setItemNotes) {
  const results = {
    success: [],
    errors: [],
    needsInput: [],
    ignored: [],
    autoCheckedCount: 0,
    noteFilledCount: 0
  };
  
  rows.forEach((row, index) => {
    const result = mapCarolToHeroToolWithAutoCheck(row, setItemStates, setItemNotes);
    
    if (result.action === 'ignore') {
      results.ignored.push({ row: index + 1, ...result });
    } else if (result.needsUserInput) {
      results.needsInput.push({ row: index + 1, ...result });
    } else if (result.success) {
      results.success.push({ row: index + 1, ...result });
      if (result.autoChecked) {
        results.autoCheckedCount++;
      }
      if (result.shouldFillNote) {
        results.noteFilledCount++;
      }
    } else {
      results.errors.push({ row: index + 1, ...result });
    }
  });
  
  return results;
}

/**
 * Fonction pour réinitialiser les compteurs (à appeler avant chaque import)
 */
export function resetCounters() {
  repairCounters.repc = 1;
  repairCounters.repm = 1;
  repairCounters.rempc = 1;
  repairCounters.rempm = 1;
}

// ===== CATÉGORISATION DES ÉLÉMENTS =====
const CARROSSERIE_ELEMENTS = [
  'front-right-door', 'front-left-door', 'rear-right-door', 'rear-left-door',
  'front-right-fender', 'front-left-fender', 'rear-right-fender', 'rear-left-fender',
  'hood', 'roof', 'tailgate', 'trunk',
  'front-bumper', 'rear-bumper',
  'right-c-pillar', 'left-c-pillar',
  'right-b-pillar', 'left-b-pillar',
  'right-a-pillar', 'left-a-pillar',
  'right-d-pillar', 'left-d-pillar',
  'right-side-skirts', 'left-side-skirts',
  'windscreen', 'rear-windscreen',
  'right-headlight', 'left-headlight',
  'rear-right-fog-light', 'rear-left-fog-light',
  'rear-wiper', 'front-wiper',
  'front-spoiler', 'rear-spoiler',
  'damage-body', 'damage-body-front', 'damage-body-back', 'damage-body-left', 'damage-body-right', 'damage-body-roof'
];

const MECANIQUE_ELEMENTS = [
  'damage-engine', 'damage-engine-aggregate-engine', 'damage-engine-aggregate-transmission',
  'damage-motor-motor', 'damage-motor-transmission',
  'damage-underbody', 'damage-underbody-unterboden-steering-steeringAndTrackRods',
  'damage-underbody-unterboden-shockAbsorber-rearShock', 'damage-underbody-unterboden-shockAbsorber-frontShock',
  'damage-tyresAndBrakes', 'damage-tyresAndBrakes-tyresAndBrakes-tire-tyresRearRight',
  'damage-tyresAndBrakes-tyresAndBrakes-tire-tyresRearLeft',
  'damage-tyresAndBrakes-tyresAndBrakes-tire-tyresFrontRight',
  'damage-tyresAndBrakes-tyresAndBrakes-tire-tyresFrontLeft',
  'damage-type-aggregate-oilLoss', 'damage-type-aggregate-tooLoud',
  'damage-type-steering-onTheBeat', 'damage-type-shockAbsorber-wearLimit',
  'damage-type-attachments-stoneChip'
];

function getElementCategory(element) {
  if (!element) return 'unknown';
  const elementLower = element.toLowerCase();
  if (CARROSSERIE_ELEMENTS.some(e => elementLower.includes(e.toLowerCase()))) return 'carrosserie';
  if (MECANIQUE_ELEMENTS.some(e => elementLower.includes(e.toLowerCase()))) return 'mecanique';
  return 'carrosserie'; // Par défaut
}

function normalizeElementName(sousZone) {
  if (!sousZone) return '';
  const lower = sousZone.toLowerCase();
  
  const TRANSLATION = {
    'damage-body-front': 'front-bumper',
    'damage-body-back': 'rear-bumper', 
    'damage-body-right': 'right-side-skirts',
    'damage-body-left': 'left-side-skirts',
  };
  
  if (TRANSLATION[lower]) return TRANSLATION[lower];
  if (lower.includes('door') || lower.includes('fender') || lower.includes('pillar')) return lower;
  
  return sousZone;
}

function translateElementToFrench(element) {
  const translations = {
    'front-right-door': 'Porte avant droite',
    'front-left-door': 'Porte avant gauche',
    'rear-right-door': 'Porte arrière droite',
    'rear-left-door': 'Porte arrière gauche',
    'front-right-fender': 'Aile avant droite',
    'front-left-fender': 'Aile avant gauche',
    'rear-right-fender': 'Aile arrière droite',
    'rear-left-fender': 'Aile arrière gauche',
    'hood': 'Capot',
    'tailgate': 'Hayon',
    'trunk': 'Coffre',
    'roof': 'Pavillon',
    'front-bumper': 'Pare-chocs avant',
    'rear-bumper': 'Pare-chocs arrière',
    'right-a-pillar': 'Montant A droit',
    'left-a-pillar': 'Montant A gauche',
    'right-b-pillar': 'Montant B droit',
    'left-b-pillar': 'Montant B gauche',
    'right-c-pillar': 'Montant C droit',
    'left-c-pillar': 'Montant C gauche',
    'right-d-pillar': 'Montant D droit',
    'left-d-pillar': 'Montant D gauche',
    'right-side-skirts': 'Bas de caisse droit',
    'left-side-skirts': 'Bas de caisse gauche',
    'windscreen': 'Pare-brise',
    'rear-windscreen': 'Lunette arrière',
    'right-headlight': 'Phare droit',
    'left-headlight': 'Phare gauche'
  };
  
  return translations[element] || element;
}

function getNextRepairCode(actionType, category) {
  let key;
  if (actionType === 'replace') {
    key = category === 'mecanique' ? 'rempm' : 'rempc';
  } else {
    key = category === 'mecanique' ? 'repm' : 'repc';
  }
  
  const count = repairCounters[key];
  if (count > 4) {
    return { code: null, error: `Limite ${key.toUpperCase()} atteinte (max 4)` };
  }
  
  const code = `${key}${count}`;
  repairCounters[key]++;
  return { code, error: null };
}

/**
 * Fonction principale de mapping CAROL → HeroTool
 */
function mapCarolToHeroTool(carolRow) {
  // CORRECTION: Utiliser 'partie' et 'name' depuis le Google Sheets
  const sousZone = carolRow.partie || carolRow.sousZone;
  const techniqueReparation = carolRow.name || carolRow.techniqueReparation;
  const dommage = carolRow.dommage;
  const position = carolRow.position;
  const commentaire = carolRow.commentaire || carolRow.controller_comment || '';
  
  if (!sousZone || !techniqueReparation) {
    return {
      success: false,
      error: '❌ Données manquantes (partie ou name)',
      action: 'ignore'
    };
  }
  
  const element = normalizeElementName(sousZone);
  const category = getElementCategory(element);
  
  // CAS 1: RÉPARATION + PEINTURE
  if (techniqueReparation === 'repair-and-repaint') {
    return {
      success: true,
      forfaitId: 'R-P1',
      code: 'R-P1',
      position,
      commentaire,
      type: 'RP'
    };
  }
  
  // CAS 2: COVERING/CAR WRAPPING
  if (techniqueReparation === 'car-wrapping' || techniqueReparation.toLowerCase().includes('covering')) {
    return {
      success: true,
      forfaitId: 'DE-COVERING',
      code: 'DE-COVERING',
      position,
      commentaire,
      type: 'LUSTRAGE'
    };
  }
  
  // CAS 3: DSP
  if (techniqueReparation === 'paintless-dent-repair') {
    if (commentaire.toLowerCase().includes('grêle') || commentaire.toLowerCase().includes('grele')) {
      if (element === 'roof') {
        return { success: true, forfaitId: 'dspGrelePavillon', code: 'dspGrelePavillon', position, commentaire, type: 'DSP_GRELE' };
      }
      if (element === 'hood') {
        return { success: true, forfaitId: 'dspGreleCapot', code: 'dspGreleCapot', position, commentaire, type: 'DSP_GRELE' };
      }
    }
    
    const dspForfait = DSP_MAPPING[element];
    if (dspForfait) {
      return { success: true, forfaitId: dspForfait, code: dspForfait, position, commentaire, type: 'DSP' };
    }
    
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return { success: !error, code, position, commentaire: `DSP ${element} - ${commentaire}`, type: 'REPC', error };
  }
  
  // CAS 4: LUSTRAGE
  if (techniqueReparation === 'polish') {
    const lustrageForfait = LUSTRAGE_MAPPING[element];
    if (lustrageForfait) {
      return { success: true, forfaitId: lustrageForfait, code: lustrageForfait, position, commentaire, type: 'LUSTRAGE' };
    }
    
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return { success: !error, code, position, commentaire: `Lustrage ${element} - ${commentaire}`, type: 'REPC', error };
  }
  
  // CAS 5: PLUME
  if (techniqueReparation === 'spot-repair-dabbing') {
    const plumeForfait = PLUME_MAPPING[element];
    if (plumeForfait) {
      return { success: true, forfaitId: plumeForfait, code: plumeForfait, position, commentaire, type: 'PLUME' };
    }
    
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return { success: !error, code, position, commentaire: `Plume ${element} - ${commentaire}`, type: 'REPC', error };
  }
  
  // CAS 6: PEINTURE
  if (techniqueReparation === 'full-panel-repaint') {
    const peintureForfait = PEINTURE_MAPPING[element];
    if (peintureForfait) {
      return { success: true, forfaitId: peintureForfait, code: peintureForfait, position, commentaire, type: 'PEINTURE' };
    }
    
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return { success: !error, code, position, commentaire: `Peinture ${element} - ${commentaire}`, type: 'REPC', error };
  }
  
  // CAS 7: PARE-BRISE
  if (techniqueReparation === 'smart-repair-windscreen' && element === 'windscreen') {
    return { success: true, forfaitId: 'REP PB', code: 'REP PB', position, commentaire, type: 'REPARATION_PB' };
  }
  
  // CAS 8: REMPLACEMENT
  if (techniqueReparation === 'replace') {
    const { code, error } = getNextRepairCode('replace', category);
    const elementFr = translateElementToFrench(element);
    const fullComment = [
      `Remplacement ${elementFr}`,
      dommage ? `Dommage: ${dommage}` : null,
      commentaire ? `Note: ${commentaire}` : null
    ].filter(Boolean).join(' - ');
    
    return {
      success: !error,
      code,
      position,
      commentaire: fullComment,
      type: category === 'mecanique' ? 'REMPM' : 'REMPC',
      error
    };
  }
  
  // CAS 9: RÉPARATION
  if (techniqueReparation === 'repair') {
    const { code, error } = getNextRepairCode('repair', category);
    const elementFr = translateElementToFrench(element);
    const fullComment = [
      `Réparation ${elementFr}`,
      dommage ? `Dommage: ${dommage}` : null,
      commentaire ? `Note: ${commentaire}` : null
    ].filter(Boolean).join(' - ');
    
    return {
      success: !error,
      code,
      position,
      commentaire: fullComment,
      type: category === 'mecanique' ? 'REPM' : 'REPC',
      error
    };
  }
  
  return {
    success: false,
    error: `❌ Technique non reconnue: ${techniqueReparation}`,
    element,
    dommage,
    position,
    commentaire,
    needsUserInput: true
  };
}