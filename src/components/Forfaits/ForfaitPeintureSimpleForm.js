import React from 'react';

/**
 * Formulaire de forfait pour PEINTURE simple
 * Structure : 1 MO Peinture + Consommables (PAS de pièces)
 */
const ForfaitPeintureSimpleForm = ({ 
  item, 
  forfaitData, 
  updateForfaitField
}) => {
  const data = forfaitData[item.id] || {};
  
  // Section Peinture (MO)
  const peinture = data.peinture || { 
    designation: '', 
    quantity: '1', 
    prixUnitaire: '35.80', 
    prix: '' 
  };
  
  // Section Consommable
  const consommable = data.consommable || { 
    designation: 'Ingrédient peinture 500 ml', 
    quantity: '1', 
    prixUnitaire: '10', 
    prix: '' 
  };

  const handleChange = (section, field, value) => {
    let sectionData = section === "peinture" ? peinture : consommable;
    let newData = { ...sectionData, [field]: value };
    
    // Calcul automatique du prix total
    if (field === "quantity" || field === "prixUnitaire") {
      const q = parseFloat(newData.quantity || "0");
      const pu = parseFloat(newData.prixUnitaire || "0");
      newData.prix = (!isNaN(q) && !isNaN(pu) ? (q * pu).toFixed(2) : "");
    }
    
    updateForfaitField(item.id, section, newData);
  };

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
              value={peinture.designation}
              onChange={e => handleChange("peinture", "designation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Quantité (h)</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.1"
              value={peinture.quantity}
              onChange={e => handleChange("peinture", "quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Prix unitaire HT</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.01"
              value={peinture.prixUnitaire}
              onChange={e => handleChange("peinture", "prixUnitaire", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <div className="text-sm font-bold text-blue-700">
            Total HT : <span className="ml-2">{peinture.prix || "0.00"} €</span>
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
              value={consommable.designation}
              onChange={e => handleChange("consommable", "designation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Quantité</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.1"
              value={consommable.quantity}
              onChange={e => handleChange("consommable", "quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1 font-semibold">Prix unitaire HT</label>
            <input
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.01"
              value={consommable.prixUnitaire}
              onChange={e => handleChange("consommable", "prixUnitaire", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <div className="text-sm font-bold text-blue-700">
            Total HT : <span className="ml-2">{consommable.prix || "0.00"} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForfaitPeintureSimpleForm;