import React from 'react';

/**
 * Formulaire de forfait pour PEINTURE seule (PEINTURE_SEULE_FORFAITS)
 * Structure : 1 MO Peinture + Consommables (PAS de pièces)
 */
const ForfaitPeintureSeuleForm = ({ 
  item, 
  forfaitData, 
  updateForfaitField
}) => {
  const forfait = forfaitData[item.id] || {};
  
  // Valeurs par défaut
  const moDesignation = forfait.moDesignation || 'Peinture';
  const moQuantity = forfait.moQuantity || '0';
  const consommableDesignation = forfait.consommableDesignation || 'Ingrédient peinture 500 ml';
  const consommableQuantity = forfait.consommableQuantity || '1';
  const consommablePrixUnitaire = forfait.consommablePrixUnitaire || '10';

  // Calcul automatique des totaux
  const moQty = parseFloat(moQuantity) || 0;
  const moTotal = (moQty * 35.8).toFixed(2);
  
  const consQty = parseFloat(consommableQuantity) || 0;
  const consPU = parseFloat(consommablePrixUnitaire) || 0;
  const consTotal = (consQty * consPU).toFixed(2);

  return (
    <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700">{item.label}</h3>

      {/* Main d'œuvre Peinture */}
      <div className="mb-8 pb-6 border-b-2 border-blue-200">
        <div className="text-lg font-bold mb-3 text-blue-600">Peinture (Main d'œuvre)</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Désignation</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
              placeholder="Désignation peinture..."
              value={moDesignation}
              onChange={e => updateForfaitField(item.id, "moDesignation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Quantité (h)</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.1"
              value={moQuantity}
              onChange={e => updateForfaitField(item.id, "moQuantity", e.target.value)}
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

      {/* Consommables */}
      <div>
        <div className="text-lg font-bold mb-3 text-blue-600">Consommable</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Désignation</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
              placeholder="Désignation consommable..."
              value={consommableDesignation}
              onChange={e => updateForfaitField(item.id, "consommableDesignation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Quantité</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.1"
              value={consommableQuantity}
              onChange={e => updateForfaitField(item.id, "consommableQuantity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Prix unitaire HT</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.01"
              value={consommablePrixUnitaire}
              onChange={e => updateForfaitField(item.id, "consommablePrixUnitaire", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <div className="text-sm font-bold text-blue-700">
            Total HT : <span className="ml-2">{consTotal} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForfaitPeintureSeuleForm;