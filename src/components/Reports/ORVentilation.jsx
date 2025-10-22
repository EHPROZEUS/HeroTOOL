/**
 * COMPOSANT: Ventilation comptable
 * Affiche le tableau de répartition des coûts par catégorie
 */
import React from 'react';
import { safeNum, formatNum } from '../../utils/dataValidator';

const VENTILATION_CATEGORIES = [
  { key: 'moMecanique', label: 'MO MECANIQUE' },
  { key: 'moPeinture', label: 'MO PEINTURE' },
  { key: 'moTolerie', label: 'MO TOLERIE' },
  { key: 'moSmart', label: 'MO SMART' },
  { key: 'moControlling', label: 'MO CONTROLLING' },
  { key: 'moForfaitaire', label: 'MO FORFAITAIRE' },
  { key: 'ingredientPeinture', label: 'INGREDIENT PEINTURE' },
  { key: 'fluides', label: 'FLUIDES' },
  { key: 'piecesMecanique', label: 'PIECES MECANIQUE' },
  { key: 'piecesRemploi', label: 'PIECES REMPLOI' },
  { key: 'piecesTolerie', label: 'PIECES TOLERIE' },
  { key: 'pneumatiques', label: 'PNEUMATIQUES' },
  { key: 'presSousTraitees', label: 'PRES. SOUS-TRAITEES' },
  // { key: 'recyclageDechets', label: 'RECYCLAGE DECHETS' }, ← supprimé
];

const ORVentilation = ({ ventilation = {} }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3
        className="text-base font-bold text-gray-800 mb-3 p-2 rounded-lg"
        style={{ backgroundColor: '#FFF0E6' }}
      >
        Ventilation Comptable
      </h3>

      <div className="overflow-x-auto w-[500px]">
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-1 text-left text-xs">Catégorie</th>
              <th className="border border-gray-300 p-1 text-right text-xs">Quantité</th>
              <th className="border border-gray-300 p-1 text-right text-xs">Montant HT (€)</th>
            </tr>
          </thead>
          <tbody>
            {VENTILATION_CATEGORIES.map(cat => {
              const qty = safeNum(ventilation[cat.key]?.qty, 0);
              const ht = safeNum(ventilation[cat.key]?.ht, 0);

              return (
                <tr key={cat.key} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-1 font-medium text-xs">
                    {cat.label}
                  </td>
                  <td className="border border-gray-300 p-1 text-right text-xs">
                    {qty.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-1 text-right text-xs">
                    {formatNum(ht)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ORVentilation;
