// ============================================================================
// CAROL MAPPING V2 - SYSTÈME INTELLIGENT DE MAPPING
// ============================================================================
// Ce fichier gère le mapping entre les données Carol (Google Sheets) et HeroTool
// Logique: Élément (J) + Dommage (L) + Technique (F) → Réparation forfaitisée ou générique
// ============================================================================

// ===== COMPTEURS GLOBAUX =====
const repairCounters = {
  repc: 1,   // Réparation carrosserie
  repm: 1,   // Réparation mécanique
  rempc: 1,  // Remplacement carrosserie
  rempm: 1   // Remplacement mécanique
};

// ===== CATÉGORISATION DES ÉLÉMENTS =====

// Éléments de CARROSSERIE
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

// Éléments MÉCANIQUES
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

// Éléments INTÉRIEUR (traités comme carrosserie pour le compteur)
const INTERIEUR_ELEMENTS = [
  'damage-interior', 'damage-interior-interior', 'damage-interior-trunk',
  'damage-interior-interior-upholstery-steeringWheel',
  'damage-interior-interior-upholstery-driverSeat',
  'damage-interior-interior-upholstery-passengerSeat',
  'damage-interior-interior-upholstery-centerConsole',
  'damage-interior-interior-upholstery-floorCovering',
  'damage-interior-interior-upholstery-hatrack',
  'damage-interior-trunk-upholstery-trunkFloorCovering',
  'damage-type-upholstery-worn', 'damage-type-upholstery-damaged', 'damage-type-upholstery-missingPart'
];

// ===== MAPPING ÉLÉMENTS → FORFAITS DSP =====
const DSP_MAPPING = {
  // Portes
  'front-right-door': 'dspPorteAvd',
  'front-left-door': 'dspPorteAvg',
  'rear-right-door': 'dspPorteArd',
  'rear-left-door': 'dspPorteArg',
  
  // Ailes
  'front-right-fender': 'dspAileAvd',
  'front-left-fender': 'dspAileAvg',
  'rear-right-fender': 'dspAileArd',
  'rear-left-fender': 'dspAileArg',
  
  // Éléments horizontaux
  'hood': 'dspCapot',
  'tailgate': 'dspHayon',
  'trunk': 'dspHayon',
  'roof': 'dspPavillon',
  
  // Montants
  'right-a-pillar': 'dspMontantAD',
  'left-a-pillar': 'dspMontantAG',
  'right-b-pillar': 'dspMontantBD',
  'left-b-pillar': 'dspMontantBG',
  'right-c-pillar': 'dspMontantCD',
  'left-c-pillar': 'dspMontantCG',
  'right-d-pillar': 'dspMontantDD',
  'left-d-pillar': 'dspMontantDG',
  
  // Bas de caisse
  'right-side-skirts': 'dspBdcd',
  'left-side-skirts': 'dspBdcg'
};

// ===== MAPPING ÉLÉMENTS → FORFAITS LUSTRAGE =====
const LUSTRAGE_MAPPING = {
  // Portes
  'front-right-door': 'LPTEAVD',
  'front-left-door': 'LPTEAVG',
  'rear-right-door': 'LPTEARD',
  'rear-left-door': 'LPTEARG',
  
  // Ailes
  'front-right-fender': 'LAAVD',
  'front-left-fender': 'LAAVG',
  'rear-right-fender': 'LAARD',
  'rear-left-fender': 'LAARG',
  
  // Éléments horizontaux
  'hood': 'LCP',
  'tailgate': 'LH',
  'trunk': 'LH',
  'roof': 'LPAVILLON',
  
  // Pare-chocs
  'front-bumper': 'LPCAV',
  'rear-bumper': 'LPCAR',
  
  // Montants
  'right-a-pillar': 'LMAD',
  'left-a-pillar': 'LMAG',
  'right-b-pillar': 'LMBD',
  'left-b-pillar': 'LMBG',
  'right-c-pillar': 'LMCD',
  'left-c-pillar': 'LMCG',
  'right-d-pillar': 'LMDD',
  'left-d-pillar': 'LMDG',
  
  // Bas de caisse
  'right-side-skirts': 'LBDCD',
  'left-side-skirts': 'LBDCG',
  
  // Phares
  'right-headlight': 'LPD',
  'left-headlight': 'LPG',
  'rear-right-fog-light': 'LFAD',
  'rear-left-fog-light': 'LFAG'
};

// ===== MAPPING ÉLÉMENTS → FORFAITS PLUME =====
const PLUME_MAPPING = {
  // Portes
  'front-right-door': 'PLUPTEAVD',
  'front-left-door': 'PLUPTEAVG',
  'rear-right-door': 'PLUPTEARD',
  'rear-left-door': 'PLUPTEARG',
  
  // Ailes
  'front-right-fender': 'PLUAAVD',
  'front-left-fender': 'PLUAAVG',
  'rear-right-fender': 'PLUAARD',
  'rear-left-fender': 'PLUAARG',
  
  // Éléments horizontaux
  'hood': 'PLUCP',
  'tailgate': 'PLUH',
  'trunk': 'PLUH',
  'roof': 'PLUPAVILLON',
  
  // Pare-chocs
  'front-bumper': 'PLUPCAV',
  'rear-bumper': 'PLUPCAR'
};

// ===== MAPPING ÉLÉMENTS → FORFAITS PEINTURE =====
const PEINTURE_MAPPING = {
  // Portes
  'front-right-door': 'P-PTEAVD',
  'front-left-door': 'P-PTEAVG',
  'rear-right-door': 'P-PTEARD',
  'rear-left-door': 'P-PTEARG',
  
  // Ailes
  'front-right-fender': 'P-AAVD',
  'front-left-fender': 'P-AAVG',
  'rear-right-fender': 'P-AARD',
  'rear-left-fender': 'P-AARG',
  
  // Éléments horizontaux
  'hood': 'P-CAPOT',
  'tailgate': 'P-HAYON',
  'trunk': 'P-HAYON',
  'roof': 'P-PAVILLON',
  
  // Pare-chocs
  'front-bumper': 'P-PCAV',
  'rear-bumper': 'P-PCAR',
  
  // Bas de caisse
  'right-side-skirts': 'P-BDCD',
  'left-side-skirts': 'P-BDCG'
};

// ===== FONCTIONS UTILITAIRES =====

/**
 * Détermine si un élément est de type carrosserie, mécanique ou intérieur
 */
function getElementCategory(element) {
  if (!element) return 'unknown';
  
  const elementLower = element.toLowerCase();
  
  if (CARROSSERIE_ELEMENTS.some(e => elementLower.includes(e.toLowerCase()))) {
    return 'carrosserie';
  }
  
  if (MECANIQUE_ELEMENTS.some(e => elementLower.includes(e.toLowerCase()))) {
    return 'mecanique';
  }
  
  if (INTERIEUR_ELEMENTS.some(e => elementLower.includes(e.toLowerCase()))) {
    return 'interieur';
  }
  
  return 'unknown';
}

/**
 * Normalise le nom d'élément pour le mapping
 */
function normalizeElementName(sousZone) {
  if (!sousZone) return '';
  
  const lower = sousZone.toLowerCase();
  
  // ✅ TRADUCTION DES ÉLÉMENTS CAROL
  const TRANSLATION = {
    'damage-body-front': 'front-bumper',
    'damage-body-back': 'rear-bumper', 
    'damage-body-right': 'right-side-skirts',
    'damage-body-left': 'left-side-skirts',
    'damage-interior-interior': 'damage-interior',
    'right-headlight': 'right-headlight',
    'left-headlight': 'left-headlight'
  };
  
  if (TRANSLATION[lower]) {
    return TRANSLATION[lower];
  }
  
  // Si déjà bon format (front-right-door, etc.), retourner tel quel
  if (lower.includes('door') || lower.includes('fender') || lower.includes('pillar')) {
    return lower;
  }
  
  
  // Extraire le dernier segment qui contient souvent l'info utile
  const parts = sousZone.split('-');
  
  // Cas spéciaux
  if (sousZone.includes('front') && sousZone.includes('right') && sousZone.includes('door')) {
    return 'front-right-door';
  }
  if (sousZone.includes('front') && sousZone.includes('left') && sousZone.includes('door')) {
    return 'front-left-door';
  }
  if (sousZone.includes('rear') && sousZone.includes('right') && sousZone.includes('door')) {
    return 'rear-right-door';
  }
  if (sousZone.includes('rear') && sousZone.includes('left') && sousZone.includes('door')) {
    return 'rear-left-door';
  }
  
  // Ailes
  if (sousZone.includes('front') && sousZone.includes('right') && sousZone.includes('fender')) {
    return 'front-right-fender';
  }
  if (sousZone.includes('front') && sousZone.includes('left') && sousZone.includes('fender')) {
    return 'front-left-fender';
  }
  if (sousZone.includes('rear') && sousZone.includes('right') && sousZone.includes('fender')) {
    return 'rear-right-fender';
  }
  if (sousZone.includes('rear') && sousZone.includes('left') && sousZone.includes('fender')) {
    return 'rear-left-fender';
  }
  
  // Montants (pillar)
  if (sousZone.includes('right') && sousZone.includes('c-pillar')) {
    return 'right-c-pillar';
  }
  if (sousZone.includes('left') && sousZone.includes('c-pillar')) {
    return 'left-c-pillar';
  }
  if (sousZone.includes('right') && sousZone.includes('b-pillar')) {
    return 'right-b-pillar';
  }
  if (sousZone.includes('left') && sousZone.includes('b-pillar')) {
    return 'left-b-pillar';
  }
  
  // Pare-chocs
  if (sousZone.includes('front') && sousZone.includes('bumper')) {
    return 'front-bumper';
  }
  if (sousZone.includes('rear') && sousZone.includes('bumper')) {
    return 'rear-bumper';
  }
  
  // Capot / Toit / Hayon
  if (sousZone.includes('hood')) {
    return 'hood';
  }
  if (sousZone.includes('roof')) {
    return 'roof';
  }
  if (sousZone.includes('tailgate') || sousZone.includes('hayon')) {
    return 'tailgate';
  }
  if (sousZone.includes('trunk')) {
    return 'trunk';
  }
  
  return sousZone;
}

/**
 * Récupère le prochain code disponible (repc, repm, rempc, rempm)
 */
function getNextRepairCode(type, category) {
  let prefix = '';
  
  if (type === 'repair') {
    prefix = (category === 'mecanique') ? 'repm' : 'repc';
  } else if (type === 'replace') {
    prefix = (category === 'mecanique') ? 'rempm' : 'rempc';
  }
  
  const currentNumber = repairCounters[prefix];
  
  if (currentNumber > 4) {
    return {
      code: null,
      error: `⚠️ Limite atteinte pour ${prefix} (maximum 4)`
    };
  }
  
  const code = `${prefix}${currentNumber}`;
  repairCounters[prefix]++;
  
  return { code, error: null };
}

/**
 * Réinitialise les compteurs (utile pour traiter un nouveau véhicule)
 */
function resetCounters() {
  repairCounters.repc = 1;
  repairCounters.repm = 1;
  repairCounters.rempc = 1;
  repairCounters.rempm = 1;
}

// ===== FONCTION PRINCIPALE DE MAPPING =====

/**
 * Mappe une ligne Carol vers un forfait HeroTool
 * 
 * @param {Object} row - Ligne du Google Sheets
 * @param {string} row.stock_number - Colonne A
 * @param {string} row.name - Colonne F (technique de réparation)
 * @param {string} row.budget - Colonne H
 * @param {string} row.zone - Colonne I (position)
 * @param {string} row.sous_zone - Colonne J (élément endommagé)
 * @param {string} row.typo - Colonne L (type de dommage)
 * @param {string} row.o_commentaire - Colonne Q (commentaire du contrôleur)
 * 
 * @returns {Object} Résultat du mapping
 */
export function mapCarolToHeroTool(row) {
  // Validation
  if (!row) {
    return {
      success: false,
      error: '❌ Ligne vide ou invalide',
      needsUserInput: false
    };
  }
  
  const TECHNIQUE_TRANSLATION = {
  'dsp': 'paintless-dent-repair',
  'débosselage': 'paintless-dent-repair',
  'paintless-dent-repair': 'paintless-dent-repair',
  
  'lustrage': 'polish',
  'polish': 'polish',
  'polissage': 'polish',
  
  'plume': 'spot-repair-dabbing',
  'spot-repair-dabbing': 'spot-repair-dabbing',
  'retouche': 'spot-repair-dabbing',
  
  'peinture': 'full-panel-repaint',
  'full-panel-repaint': 'full-panel-repaint',
  'repeint': 'full-panel-repaint',
  
  'pare-brise': 'smart-repair-windscreen',
  'smart-repair-windscreen': 'smart-repair-windscreen',
  'windscreen': 'smart-repair-windscreen',
  
  'remplacement': 'replace',
  'replace': 'replace',
  'remplacer': 'replace',
  
  'réparation': 'repair',
  'repair': 'repair',
  'reparer': 'repair',
  
  'no-repair': 'no-repair-imperfection',
  'no-repair-imperfection': 'no-repair-imperfection',
  'rien': 'no-repair-imperfection',
  
  'autre': 'other',
  'other': 'other',
  'custom': 'other'
};

// Appliquer la traduction
let techniqueReparation = row.name?.toLowerCase() || '';
techniqueReparation = TECHNIQUE_TRANSLATION[techniqueReparation] || techniqueReparation;

console.log('🔍 AVANT traduction:', row.name, '→ APRÈS:', techniqueReparation); // ← AJOUTE ÇA

  const element = normalizeElementName(row.sous_zone || '');
  const dommage = row.typo?.toLowerCase() || '';
  const position = row.zone || '';
  const commentaire = row.o_commentaire || '';
  
  // ===== CAS 1: NO-REPAIR-IMPERFECTION =====
  if (techniqueReparation === 'no-repair-imperfection') {
    return {
      success: true,
      action: 'ignore',
      message: '✓ Dommage répertorié sans action requise',
      forfaitId: null,
      code: null,
      position: position,
      commentaire: commentaire
    };
  }
  
  // ===== CAS 2: OTHER (demande validation utilisateur) =====
  if (techniqueReparation === 'other') {
    return {
      success: false,
      needsUserInput: true,
      message: `⚠️ Réparation non-standard détectée`,
      element: element,
      dommage: dommage,
      commentaire: commentaire,
      position: position,
      options: ['repc', 'repm', 'rempc', 'rempm', 'ignore']
    };
  }
  
  // Déterminer la catégorie de l'élément
  const category = getElementCategory(element || row.sous_zone || '');
  
  // ===== CAS 3: PAINTLESS-DENT-REPAIR (DSP) =====
  if (techniqueReparation === 'paintless-dent-repair') {
    // Vérifier si grêle
    if (commentaire.toLowerCase().includes('grêle') || commentaire.toLowerCase().includes('grele')) {
      if (element === 'roof') {
        return {
          success: true,
          forfaitId: 'dspGrelePavillon',
          code: 'dspGrelePavillon',
          position: position,
          commentaire: commentaire,
          type: 'DSP_GRELE'
        };
      }
      if (element === 'hood') {
        return {
          success: true,
          forfaitId: 'dspGreleCapot',
          code: 'dspGreleCapot',
          position: position,
          commentaire: commentaire,
          type: 'DSP_GRELE'
        };
      }
    }
    
    // DSP standard
    const dspForfait = DSP_MAPPING[element];
    if (dspForfait) {
      return {
        success: true,
        forfaitId: dspForfait,
        code: dspForfait,
        position: position,
        commentaire: commentaire,
        type: 'DSP'
      };
    }
    
    // Pas de forfait DSP, utiliser repc
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return {
      success: !error,
      code: code,
      position: position,
      commentaire: `DSP ${element} - ${commentaire}`,
      type: 'REPC',
      error: error
    };
  }
  
  // ===== CAS 4: POLISH (LUSTRAGE) =====
  if (techniqueReparation === 'polish') {
    const lustrageForfait = LUSTRAGE_MAPPING[element];
    if (lustrageForfait) {
      return {
        success: true,
        forfaitId: lustrageForfait,
        code: lustrageForfait,
        position: position,
        commentaire: commentaire,
        type: 'LUSTRAGE'
      };
    }
    
    // Pas de forfait lustrage, utiliser repc
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return {
      success: !error,
      code: code,
      position: position,
      commentaire: `Lustrage ${element} - ${commentaire}`,
      type: 'REPC',
      error: error
    };
  }
  
  // ===== CAS 5: SPOT-REPAIR-DABBING (PLUME) =====
  if (techniqueReparation === 'spot-repair-dabbing') {
    const plumeForfait = PLUME_MAPPING[element];
    if (plumeForfait) {
      return {
        success: true,
        forfaitId: plumeForfait,
        code: plumeForfait,
        position: position,
        commentaire: commentaire,
        type: 'PLUME'
      };
    }
    
    // Pas de forfait plume, utiliser repc
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return {
      success: !error,
      code: code,
      position: position,
      commentaire: `Plume ${element} - ${commentaire}`,
      type: 'REPC',
      error: error
    };
  }
  
  // ===== CAS 6: FULL-PANEL-REPAINT (PEINTURE) =====
  if (techniqueReparation === 'full-panel-repaint') {
    const peintureForfait = PEINTURE_MAPPING[element];
    if (peintureForfait) {
      return {
        success: true,
        forfaitId: peintureForfait,
        code: peintureForfait,
        position: position,
        commentaire: commentaire,
        type: 'PEINTURE'
      };
    }
    
    // Pas de forfait peinture, utiliser repc
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return {
      success: !error,
      code: code,
      position: position,
      commentaire: `Peinture ${element} - ${commentaire}`,
      type: 'REPC',
      error: error
    };
  }
  
  // ===== CAS 7: SMART-REPAIR-WINDSCREEN (RÉPARATION PARE-BRISE) =====
  if (techniqueReparation === 'smart-repair-windscreen' && element === 'windscreen') {
    return {
      success: true,
      forfaitId: 'REP PB',
      code: 'REP PB',
      position: position,
      commentaire: commentaire,
      type: 'REPARATION_PB'
    };
  }
  
  // ===== CAS 8: REPLACE (REMPLACEMENT) =====
  if (techniqueReparation === 'replace') {
    const { code, error } = getNextRepairCode('replace', category);
    return {
      success: !error,
      code: code,
      position: position,
      commentaire: commentaire || `Remplacement ${element}`,
      type: category === 'mecanique' ? 'REMPM' : 'REMPC',
      error: error
    };
  }
  
  // ===== CAS 9: REPAIR (RÉPARATION GÉNÉRIQUE) =====
  if (techniqueReparation === 'repair') {
    const { code, error } = getNextRepairCode('repair', category);
    return {
      success: !error,
      code: code,
      position: position,
      commentaire: commentaire || `Réparation ${element}`,
      type: category === 'mecanique' ? 'REPM' : 'REPC',
      error: error
    };
  }
  
  // ===== CAS 10: SPOT-REPAIR-PARTIAL-REPAINT =====
  if (techniqueReparation === 'spot-repair-partial-repaint') {
    const { code, error } = getNextRepairCode('repair', 'carrosserie');
    return {
      success: !error,
      code: code,
      position: position,
      commentaire: `Réparation peinture partielle ${element} - ${commentaire}`,
      type: 'REPC',
      error: error
    };
  }
  
  // ===== CAS PAR DÉFAUT: NON RECONNU =====
  return {
    success: false,
    error: `❌ Technique non reconnue: ${techniqueReparation}`,
    element: element,
    dommage: dommage,
    position: position,
    commentaire: commentaire,
    needsUserInput: true
  };
}

/**
 * Traite un tableau complet de lignes Carol
 */
export function processCarolData(rows) {
  resetCounters();
  
  const results = {
    success: [],
    errors: [],
    needsInput: [],
    ignored: []
  };
  
  rows.forEach((row, index) => {
    const result = mapCarolToHeroTool(row);
    
    if (result.action === 'ignore') {
      results.ignored.push({ row: index + 1, ...result });
    } else if (result.needsUserInput) {
      results.needsInput.push({ row: index + 1, ...result });
    } else if (result.success) {
      results.success.push({ row: index + 1, ...result });
    } else {
      results.errors.push({ row: index + 1, ...result });
    }
  });
  
  return results;
}

/**
 * Génère un rapport formaté
 */
export function generateReport(results) {
  let report = '====== RAPPORT DE MAPPING CAROL → HEROTOOL ======\n\n';
  
  report += `✅ Réussites: ${results.success.length}\n`;
  report += `❌ Erreurs: ${results.errors.length}\n`;
  report += `⚠️  Nécessite validation: ${results.needsInput.length}\n`;
  report += `➖ Ignorés: ${results.ignored.length}\n\n`;
  
  if (results.success.length > 0) {
    report += '===== RÉPARATIONS MAPPÉES =====\n';
    results.success.forEach(item => {
      report += `Ligne ${item.row}: ${item.code} | ${item.position} | ${item.commentaire}\n`;
    });
    report += '\n';
  }
  
  if (results.needsInput.length > 0) {
    report += '===== NÉCESSITE VALIDATION UTILISATEUR =====\n';
    results.needsInput.forEach(item => {
      report += `Ligne ${item.row}: ${item.element} | ${item.dommage} | ${item.commentaire}\n`;
    });
    report += '\n';
  }
  
  if (results.errors.length > 0) {
    report += '===== ERREURS =====\n';
    results.errors.forEach(item => {
      report += `Ligne ${item.row}: ${item.error}\n`;
    });
  }
  
  return report;
}

// ===== EXPORTS =====
export {
  resetCounters,
  getElementCategory,
  normalizeElementName,
  DSP_MAPPING,
  LUSTRAGE_MAPPING,
  PLUME_MAPPING,
  PEINTURE_MAPPING
};