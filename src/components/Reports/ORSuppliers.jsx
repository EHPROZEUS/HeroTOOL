/**
 * COMPOSANT: Liste des fournisseurs et nombre de pièces
 * Affiche un récapitulatif des pièces groupées par fournisseur
 */
import React from 'react';

const ORSuppliers = ({ 
  activeMecaniqueItems = [], 
  forfaitData = {}, 
  pieceLines = {} 
}) => {
  // Compter les pièces par fournisseur
  const fournisseurCount = {};
  
  // 1. Compter depuis les forfaits principaux
  activeMecaniqueItems.forEach(item => {
    const forfait = forfaitData?.[item.id];
    if (forfait?.pieceFournisseur && forfait.pieceFournisseur.trim()) {
      if (!fournisseurCount[forfait.pieceFournisseur]) {
        fournisseurCount[forfait.pieceFournisseur] = 0;
      }
      fournisseurCount[forfait.pieceFournisseur]++;
    }
  });
  
  // 2. Compter depuis les lignes de pièces supplémentaires
  Object.values(pieceLines || {}).forEach(lines => {
    lines.forEach(line => {
      if (line.fournisseur && line.fournisseur.trim()) {
        if (!fournisseurCount[line.fournisseur]) {
          fournisseurCount[line.fournisseur] = 0;
        }
        fournisseurCount[line.fournisseur]++;
      }
    });
  });

  // Trier par ordre alphabétique
  const sortedSuppliers = Object.keys(fournisseurCount).sort();

  if (sortedSuppliers.length === 0) {
    return null; // Ne rien afficher si aucun fournisseur
  }

  return (
    <div className="bg-blue-50 rounded-lg shadow-sm p-3 mb-3 border border-blue-200">
      <h3 className="text-sm font-bold text-gray-800 mb-2 text-blue-700">
        📦 Fournisseurs
      </h3>
      
      <div className="space-y-1">
        {sortedSuppliers.map(fournisseur => (
          <div 
            key={fournisseur} 
            className="flex justify-between items-center text-xs bg-white px-2 py-1 rounded"
          >
            <span className="font-semibold text-blue-700">{fournisseur}</span>
            <span className="text-gray-600">
              {fournisseurCount[fournisseur]} pièce{fournisseurCount[fournisseur] > 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ORSuppliers;