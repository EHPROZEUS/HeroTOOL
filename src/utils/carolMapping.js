// Mapping entre les parties Carol et les items HeroTool
export const CAROL_TO_HEROTOOL_MAPPING = {
  // === PORTES ===
  'front-right-door': 'dspPorteAvd',
  'front-left-door': 'dspPorteAvg',
  'rear-right-door': 'dspPorteArd',
  'rear-left-door': 'dspPorteArg',
  
  // === AILES ===
  'front-right-fender': 'dspAileAvd',
  'front-left-fender': 'dspAileAvg',
  'rear-right-fender': 'dspAileArd',
  'rear-left-fender': 'dspAileArg',
  
  // === ÉLÉMENTS DE CARROSSERIE ===
  'hood': 'dspCapot',
  'tailgate': 'dspHayon',
  'trunk': 'dspHayon',
  'roof': 'dspPavillon',
  
  // === MONTANTS ===
  'front-right-pillar': 'dspMontantAD',
  'front-left-pillar': 'dspMontantAG',
  'center-right-pillar': 'dspMontantBD',
  'center-left-pillar': 'dspMontantBG',
  'rear-right-pillar': 'dspMontantCD',
  'rear-left-pillar': 'dspMontantCG',
  
  // === BAS DE CAISSE ===
  'right-sill': 'dspBdcd',
  'left-sill': 'dspBdcg',
  
  // === PARE-CHOCS ===
  'front-bumper': 'repc3',
  'rear-bumper': 'repc4',
  
  // === PHARES & FEUX ===
  'right-headlight': 'repc1',
  'left-headlight': 'repc2',
  
  // === RÉTROVISEURS ===
  'right-mirror-housing': 'repc1',
  'left-mirror-housing': 'repc2'
};

// Déterminer le type d'intervention selon le name Carol
export const getInterventionType = (carolName) => {
  if (carolName === 'paintless-dent-repair') return 'DSP';
  if (carolName === 'replace') return 'REPLACE';
  if (carolName === 'polish') return 'LUSTRAGE';
  if (carolName === 'spot-repair-dabbing') return 'REPARATION';
  if (carolName === 'full-panel-repaint') return 'PEINTURE';
  return 'OTHER';
};

// Parser une ligne Carol
export const parseCarolDamage = (row) => {
  return {
    stockNumber: row.stock_number,
    partie: row.partie,
    zone: row.zone,
    sousZone: row.sous_zone,
    name: row.name,
    typo: row.typo,
    quantite: row.quantite || 1,
    nomAttribut: row.nom_attribut,
    valeurAttribut: row.valeur_attribut,
    nomAttribut2: row.nom_attribut2,
    valeurAttribut2: row.valeur_attribut2,
    commentaire: row.o_commentaire || '',
    interventionType: getInterventionType(row.name)
  };
};

// Mapper un dommage Carol vers un item HeroTool
export const mapCarolToHeroTool = (carolDamage) => {
  const partieKey = carolDamage.partie || '';
  const itemId = CAROL_TO_HEROTOOL_MAPPING[partieKey];
  
  // Construire la note
  let note = '';
  if (carolDamage.commentaire) {
    note = carolDamage.commentaire;
  } else {
    const details = [];
    if (carolDamage.typo) details.push(carolDamage.typo);
    if (carolDamage.valeurAttribut) details.push(carolDamage.valeurAttribut);
    if (carolDamage.valeurAttribut2) details.push(carolDamage.valeurAttribut2);
    note = details.join(' - ');
  }
  
  if (!itemId) {
    return {
      itemId: null,
      note: `${carolDamage.name} - ${carolDamage.partie} - ${note}`,
      interventionType: carolDamage.interventionType,
      success: false
    };
  }
  
  return {
    itemId,
    note: note || carolDamage.name,
    interventionType: carolDamage.interventionType,
    success: true
  };
};