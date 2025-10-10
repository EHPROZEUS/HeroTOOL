import React from "react";

export default function ForfaitReparationPeintureForm({
  item,
  forfaitData,
  updateForfaitField,
}) {
  const data = forfaitData[item.id] || {};
  const rep = data.reparation || { designation: "", quantity: "1", prixUnitaire: "", prix: "" };
  const pein = data.peinture || { designation: "", quantity: "1", prixUnitaire: "", prix: "" };
  const consommable = data.consommable || { designation: "", quantity: "", prixUnitaire: "", prix: "" };

  const handleChange = (section, field, value) => {
    let sectionData, label, update;
    if(section === "reparation") {
      sectionData = rep;
      label = "Réparation";
    } else if(section === "peinture") {
      sectionData = pein;
      label = "Peinture";
    } else {
      sectionData = consommable;
      label = "Consommable";
    }
    let newData = { ...sectionData, [field]: value };
    if (field === "quantity" || field === "prixUnitaire") {
      const q = parseFloat(newData.quantity || "0");
      const pu = parseFloat(newData.prixUnitaire || "0");
      newData.prix = (!isNaN(q) && !isNaN(pu) ? (q * pu).toFixed(2) : "");
    }
    updateForfaitField(item.id, section, newData);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-orange-400 shadow-xl p-6 mb-8 max-w-3xl mx-auto">
      {/* Header */}
      <h2 className="text-2xl font-bold mb-3 text-orange-700 uppercase tracking-tight">
        {item.label || "Réparation Peinture"}
      </h2>

      {/* Réparation */}
      <div className="mb-8">
        <div className="text-lg font-bold mb-2 text-orange-600 tracking-tight">Réparation</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Désignation</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
              placeholder="Désignation réparation..."
              value={rep.designation}
              onChange={e => handleChange("reparation", "designation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Quantité (h)</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.1"
              value={rep.quantity}
              onChange={e => handleChange("reparation", "quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Prix unitaire HT</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.01"
              value={rep.prixUnitaire}
              onChange={e => handleChange("reparation", "prixUnitaire", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="text-sm font-bold text-orange-700">
            Total HT : <span className="ml-2">{rep.prix || "0.00"} €</span>
          </div>
        </div>
      </div>

      {/* Peinture */}
      <div className="mb-8">
        <div className="text-lg font-bold mb-2 text-orange-600 tracking-tight">Peinture</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Désignation</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
              placeholder="Désignation peinture..."
              value={pein.designation}
              onChange={e => handleChange("peinture", "designation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Quantité (h)</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.1"
              value={pein.quantity}
              onChange={e => handleChange("peinture", "quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Prix unitaire HT</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.01"
              value={pein.prixUnitaire}
              onChange={e => handleChange("peinture", "prixUnitaire", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="text-sm font-bold text-orange-700">
            Total HT : <span className="ml-2">{pein.prix || "0.00"} €</span>
          </div>
        </div>
      </div>

      {/* Consommable */}
      <div>
        <div className="text-lg font-bold mb-2 text-orange-600 tracking-tight">Consommable</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Désignation</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm"
              placeholder="Désignation consommable..."
              value={consommable.designation}
              onChange={e => handleChange("consommable", "designation", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Quantité</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.1"
              value={consommable.quantity}
              onChange={e => handleChange("consommable", "quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Prix unitaire HT</label>
            <input
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm"
              type="number"
              min="0"
              step="0.01"
              value={consommable.prixUnitaire}
              onChange={e => handleChange("consommable", "prixUnitaire", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="text-sm font-bold text-orange-700">
            Total HT : <span className="ml-2">{consommable.prix || "0.00"} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
