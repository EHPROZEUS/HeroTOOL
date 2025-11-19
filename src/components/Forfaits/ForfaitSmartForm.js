import React from 'react';
import { LUSTRAGE_ITEMS } from '../../config/constants';

/**
 * Formulaire pour Lustrage/Plume 1 élément
 * Désignation modifiable, MO forcée
 */
const ForfaitSmartForm = ({ 
  item, 
  forfaitData, 
  updateForfaitField,
  type // 'lustrage' ou 'plume'
}) => {
  const forfait = forfaitData[item.id] || {};
  
  const moDesignation = forfait.moDesignation || '';
  const moQuantity = forfait.moQuantity || '0';
  const moCategory = type === 'lustrage' ? 'Lustrage' : 'Mécanique';
  
  // Calcul du total MO (fixe)
  const moQty = parseFloat(moQuantity) || 0;
  const moTotal = (moQty * 35.8).toFixed(2);
  
  // Récupérer la configuration de lustrage pour obtenir la valeur par défaut
  const lustrageConfig = type === 'lustrage' ? LUSTRAGE_ITEMS.find(l => l.id === item.id) : null;
  
  // Consommables (pour lustrage uniquement)
  const consommableQuantity = forfait.consommableQuantity !== undefined 
    ? forfait.consommableQuantity 
    : (lustrageConfig?.consommable || 0);
  const consommablePrixUnitaire = forfait.consommablePrixUnitaire !== undefined
    ? forfait.consommablePrixUnitaire
    : 1.00;
  const consQty = parseFloat(consommableQuantity) || 0;
  const consPU = parseFloat(consommablePrixUnitaire) || 0;
  const consTotal = (consQty * consPU).toFixed(2);

  const bgColor = type === 'lustrage' ? 'bg-purple-50' : 'bg-amber-50';
  const borderColor = type === 'lustrage' ? 'border-purple-300' : 'border-amber-300';
  const textColor = type === 'lustrage' ? 'text-purple-700' : 'text-amber-700';
  const accentColor = type === 'lustrage' ? 'border-purple-200' : 'border-amber-200';

  return (
    <div className={`${bgColor} rounded-xl border-2 ${borderColor} p-6 mb-6`}>
      <h3 className={`text-xl font-bold mb-4 ${textColor}`}>{item.label}</h3>

      {/* Main d'œuvre */}
      <div className={`mb-6 ${type === 'lustrage' ? 'pb-6 border-b-2 border-purple-200' : ''}`}> 
        <div className={`text-lg font-bold mb-3 ${textColor}`}>Main d'œuvre</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Désignation (modifiable)</label>
            <input
              className={`w-full px-3 py-2 border-2 ${accentColor} rounded-lg text-sm focus:ring-2 focus:ring-${type === 'lustrage' ? 'purple' : 'amber'}-400`}
              placeholder="Description du travail..."
              value={moDesignation}
              onChange={e => updateForfaitField(item.id, "moDesignation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Quantité (h) - FORCÉE</label>
            <input
              type="text"
              value={moQuantity}
              readOnly
              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-200 font-semibold cursor-not-allowed"
              title="MO forcée selon le forfait"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Total HT</label>
            <input
              type="text"
              value={`${moTotal} €`}
              readOnly
              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Consommables (uniquement pour Lustrage) */}
      {type === 'lustrage' && (
        <div>
          <div className={`text-lg font-bold mb-3 ${textColor}`}>Consommable</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-700 mb-1 font-semibold">Désignation</label>
              <input
                type="text"
                value="Consommable lustrage"
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-200 font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-semibold">Quantité - FORCÉE</label>
              <input
                type="text"
                value={consommableQuantity}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-200 font-semibold cursor-not-allowed"
                title="Quantité forcée selon le forfait"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1 font-semibold">Total HT</label>
              <input
                type="text"
                value={`${consTotal} €`}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForfaitSmartForm;