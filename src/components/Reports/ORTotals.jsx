/**
 * COMPOSANT: Récapitulatif des totaux
 * Affiche le résumé financier (MO, pièces, consommables, total HT)
 */
import React from 'react';
import { safeNum, formatNum } from '../../utils/dataValidator';

const ORTotals = ({ 
  totals = {}, 
  includeControleTechnique, 
  includeContrevisite 
}) => {
  const totalMO = safeNum(totals.totalMO, 0);
  const totalPieces = safeNum(totals.totalPieces, 0);
  const totalConsommables = safeNum(totals.totalConsommables, 0);
  const totalHTSansPrestations = safeNum(totals.totalHTSansPrestations, 0);
  
  // Calcul du total HT avec prestations externes
  let totalHT = totalHTSansPrestations;
  if (includeControleTechnique) totalHT += 42;
  if (includeContrevisite) totalHT += 10;

  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 p-2 rounded-lg" style={{ backgroundColor: '#FFF0E6' }}>
        Récapitulatif Financier
      </h3>

      <div className="space-y-3">
        {/* Total MO */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total Main d'Œuvre:</span>
          <span className="text-lg font-bold text-gray-900">{formatNum(totalMO)} €</span>
        </div>

        {/* Total Pièces */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total Pièces:</span>
          <span className="text-lg font-bold text-gray-900">{formatNum(totalPieces)} €</span>
        </div>

        {/* Total Consommables */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total Consommables:</span>
          <span className="text-lg font-bold text-gray-900">{formatNum(totalConsommables)} €</span>
        </div>

        <div className="border-t border-gray-400 pt-3 mt-3"></div>

        {/* Total HT sans prestations */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold" style={{ color: '#FF6B35' }}>
            TOTAL HT (sans prestations ext.):
          </span>
          <span className="text-lg font-bold" style={{ color: '#FF6B35' }}>
            {formatNum(totalHTSansPrestations)} €
          </span>
        </div>

        {/* Contrôle Technique */}
        {includeControleTechnique && (
          <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded">
            <span className="font-semibold">Contrôle Technique:</span>
            <span className="font-semibold">42.00 €</span>
          </div>
        )}

        {/* Contre-visite */}
        {includeContrevisite && (
          <div className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded">
            <span className="font-semibold">Contre-visite:</span>
            <span className="font-semibold">10.00 €</span>
          </div>
        )}

        <div className="border-t-2 pt-3 mt-3" style={{ borderColor: '#FF6B35' }}></div>

        {/* Total HT Final */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold" style={{ color: '#FF6B35' }}>
            TOTAL HT:
          </span>
          <span className="text-xl font-bold" style={{ color: '#FF6B35' }}>
            {formatNum(totalHT)} €
          </span>
        </div>
      </div>
    </div>
  );
};

export default ORTotals;