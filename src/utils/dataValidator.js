/**
 * SERVICE DE VALIDATION ET NORMALISATION DES DONNÉES
 * Résout les problèmes de types (string vs number) dans toute l'application
 */

/**
 * Normalise un nombre depuis n'importe quel format
 * @param {*} value - Valeur à normaliser (number, string, undefined, null)
 * @param {number} defaultValue - Valeur par défaut si invalide
 * @returns {number} - Nombre normalisé
 */
export const formatNum = (val) => (typeof val === 'number' ? val : parseFloat(val) || 0).toFixed(2);

export const safeNum = (value, defaultValue = 0) => {
  // Si déjà un nombre valide, le retourner
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  // Si undefined, null ou chaîne vide, retourner la valeur par défaut
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  // Convertir en string et nettoyer
  const cleaned = String(value)
    .replace(/\u00A0|\u202F/g, '') // Espaces insécables
    .replace(/\s/g, '')             // Espaces normaux
    .replace(',', '.')              // Virgules en points
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Valide et normalise les données d'un forfait
 * @param {Object} forfaitData - Données brutes du forfait
 * @param {Object} defaults - Valeurs par défaut
 * @returns {Object} - Forfait normalisé
 */
export const normalizeForfait = (forfaitData = {}, defaults = {}) => {
  return {
    // Main d'œuvre
    moQuantity: safeNum(forfaitData.moQuantity ?? defaults.moQuantity, 0),
    moDesignation: forfaitData.moDesignation || defaults.moDesignation || "Temps de travail",
    moCategory: forfaitData.moCategory || defaults.moCategory || "Mécanique",
    
    // Pièce principale
    pieceReference: forfaitData.pieceReference ?? defaults.pieceReference ?? "",
    pieceDesignation: forfaitData.pieceDesignation ?? defaults.pieceDesignation ?? "",
    pieceQuantity: safeNum(forfaitData.pieceQuantity ?? defaults.pieceQuantity, 0),
    piecePrixUnitaire: safeNum(forfaitData.piecePrixUnitaire ?? defaults.piecePrixUnitaire, 0),
    piecePrix: safeNum(forfaitData.piecePrix ?? defaults.piecePrix, 0),
    pieceFournisseur: forfaitData.pieceFournisseur ?? defaults.pieceFournisseur ?? "",
    
    // Consommables
    consommableReference: forfaitData.consommableReference ?? defaults.consommableReference ?? "",
    consommableDesignation: forfaitData.consommableDesignation ?? defaults.consommableDesignation ?? "",
    consommableQuantity: safeNum(forfaitData.consommableQuantity ?? defaults.consommableQuantity, 0),
    consommablePrixUnitaire: safeNum(forfaitData.consommablePrixUnitaire ?? defaults.consommablePrixUnitaire, 0),
    consommablePrix: safeNum(forfaitData.consommablePrix ?? defaults.consommablePrix, 0),
    
    // Champs spécifiques peinture
    mo1Quantity: safeNum(forfaitData.mo1Quantity, 0),
    mo2Quantity: safeNum(forfaitData.mo2Quantity, 0),
    
    // Flags spéciaux
    lustrage1Elem: forfaitData.lustrage1Elem || false,
    plume1Elem: forfaitData.plume1Elem || false,
    peintureForfait: forfaitData.peintureForfait || false
  };
};

/**
 * Normalise une ligne de pièce supplémentaire
 * @param {Object} line - Ligne brute
 * @returns {Object} - Ligne normalisée
 */
export const normalizePieceLine = (line = {}) => {
  const quantity = safeNum(line.quantity, 1);
  const prixUnitaire = safeNum(line.prixUnitaire, 0);
  
  return {
    reference: line.reference || "",
    designation: line.designation || "",
    fournisseur: line.fournisseur || "",
    quantity: quantity,
    prixUnitaire: prixUnitaire,
    prix: (quantity * prixUnitaire).toFixed(2)
  };
};

/**
 * Calcule automatiquement piecePrix si manquant
 * @param {Object} forfait - Forfait normalisé
 * @returns {Object} - Forfait avec piecePrix calculé
 */
export const calculatePiecePrix = (forfait) => {
  if (forfait.piecePrix && forfait.piecePrix > 0) {
    return forfait;
  }
  
  const calculated = forfait.pieceQuantity * forfait.piecePrixUnitaire;
  return {
    ...forfait,
    piecePrix: calculated.toFixed(2)
  };
};

/**
 * Calcule automatiquement consommablePrix si manquant
 * @param {Object} forfait - Forfait normalisé
 * @returns {Object} - Forfait avec consommablePrix calculé
 */
export const calculateConsommablePrix = (forfait) => {
  if (forfait.consommablePrix && forfait.consommablePrix > 0) {
    return forfait;
  }
  
  const calculated = forfait.consommableQuantity * forfait.consommablePrixUnitaire;
  return {
    ...forfait,
    consommablePrix: calculated.toFixed(2)
  };
};

/**
 * Normalise toutes les données d'un forfait avec calculs automatiques
 * @param {Object} forfaitData - Données brutes
 * @param {Object} defaults - Valeurs par défaut
 * @returns {Object} - Forfait complètement normalisé et calculé
 */
export const normalizeForfaitComplete = (forfaitData = {}, defaults = {}) => {
  let normalized = normalizeForfait(forfaitData, defaults);
  normalized = calculatePiecePrix(normalized);
  normalized = calculateConsommablePrix(normalized);
  return normalized;
};

/**
 * Valide que les données essentielles sont présentes
 * @param {Object} forfait - Forfait à valider
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateForfait = (forfait) => {
  const errors = [];
  
  if (forfait.moQuantity < 0) {
    errors.push("La quantité de MO ne peut pas être négative");
  }
  
  if (forfait.pieceQuantity < 0) {
    errors.push("La quantité de pièce ne peut pas être négative");
  }
  
  if (forfait.piecePrixUnitaire < 0) {
    errors.push("Le prix unitaire ne peut pas être négatif");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Normalise un tableau de forfaits
 * @param {Object} forfaitData - Objet avec tous les forfaits
 * @param {Function} getDefaultValues - Fonction pour obtenir les valeurs par défaut
 * @returns {Object} - Forfaits normalisés
 */
export const normalizeAllForfaits = (forfaitData = {}, getDefaultValues = () => ({})) => {
  const normalized = {};
  
  Object.entries(forfaitData).forEach(([id, data]) => {
    const defaults = getDefaultValues(id);
    normalized[id] = normalizeForfaitComplete(data, defaults);
  });
  
  return normalized;
};

/**
 * Normalise toutes les lignes de pièces
 * @param {Object} pieceLines - { itemId: [lines] }
 * @returns {Object} - Lignes normalisées
 */
export const normalizeAllPieceLines = (pieceLines = {}) => {
  const normalized = {};
  
  Object.entries(pieceLines).forEach(([itemId, lines]) => {
    normalized[itemId] = (lines || []).map(line => normalizePieceLine(line));
  });
  
  return normalized;
};