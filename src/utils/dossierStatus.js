/**
 * UTILITAIRE: Gestion du statut visuel du dossier
 * Détermine la couleur de bordure selon les règles métier
 */

/**
 * Calcule le statut du dossier selon les règles :
 * - VERT : 0 pièce (peu importe la MO)
 * - JAUNE : Pièces présentes + MO < 3h
 * - TRANSPARENT : Pièces présentes + 3h ≤ MO < 5h
 * - ROUGE : Pièces présentes + MO ≥ 5h
 */
export const getDossierStatus = (totalMOMecanique = 0, totalPieces = 0) => {
  const moValue = parseFloat(totalMOMecanique) || 0;
  const piecesValue = parseFloat(totalPieces) || 0;
  
  // 🟢 VERT : Aucune pièce à commander
  if (piecesValue === 0) {
    return {
      label: 'VERT',
      color: '#28a745',
      bg: '#d4edda',
      borderColor: '#28a745'
    };
  }
  
  // 🟡 JAUNE : Pièces présentes + MO < 3h
  if (moValue < 3) {
    return {
      label: 'JAUNE',
      color: '#FFC107',
      bg: '#FFF9E6',
      borderColor: '#FFC107'
    };
  }
  
  // ⚪ TRANSPARENT (BLANC) : Pièces présentes + 3h ≤ MO < 5h
  if (moValue < 5) {
    return {
      label: 'TRANSPARENT',
      color: '#6c757d',
      bg: '#ffffff',
      borderColor: '#E5E7EB'
    };
  }
  
  // 🔴 ROUGE : Pièces présentes + MO ≥ 5h
  return {
    label: 'ROUGE',
    color: '#dc3545',
    bg: '#f8d7da',
    borderColor: '#dc3545'
  };
};

/**
 * Calcule le total de MO Mécanique (obligatoire + dynamique)
 */
export const calculateTotalMOMecanique = (moByCategory = {}, obligatoryMO = 0) => {
  const mecaniqueCategory = parseFloat(moByCategory?.mecanique || moByCategory?.Mécanique || 0);
  return mecaniqueCategory + obligatoryMO;
};