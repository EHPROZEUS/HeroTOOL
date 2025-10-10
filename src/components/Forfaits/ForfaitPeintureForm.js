import React, { useEffect } from 'react';
import { HOURLY_RATE } from '../../config/rates';

const ForfaitPeintureForm = ({
  forfait,
  forfaitData,
  updateForfaitField,
}) => {
  useEffect(() => {
    if (!forfaitData[forfait.id]) {
      updateForfaitField(forfait.id, 'mo1Designation', forfait.mo1Designation);
      updateForfaitField(forfait.id, 'mo1Quantity', forfait.mo1Quantity);
      updateForfaitField(forfait.id, 'mo2Designation', forfait.mo2Designation);
      updateForfaitField(forfait.id, 'mo2Quantity', forfait.mo2Quantity);
      updateForfaitField(forfait.id, 'consommableDesignation', forfait.consommableDesignation);
      updateForfaitField(forfait.id, 'consommableQuantity', forfait.consommableQuantity);
      updateForfaitField(forfait.id, 'consommablePrixUnitaire', forfait.consommablePrixUnitaire);
    }
  }, [forfait, forfaitData, updateForfaitField]);

  const fd = forfaitData[forfait.id] || {};
  const mo1 = parseFloat(fd.mo1Quantity || forfait.mo1Quantity || 0);
  const mo2 = parseFloat(fd.mo2Quantity || forfait.mo2Quantity || 0);
  const totalMOHT = ((mo1 + mo2) * HOURLY_RATE).toFixed(2);

  const consQ = parseFloat(fd.consommableQuantity || forfait.consommableQuantity || 0);
  const consPU = parseFloat(fd.consommablePrixUnitaire || forfait.consommablePrixUnitaire || 0);
  const consTotal = (consQ * consPU).toFixed(2);

  return (
    <div className="bg-gray-50 rounded-xl border-2 border-gray-300 p-6 mb-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: '#FF6B35' }}>{forfait.label}</h3>
      {/* MO 1 */}
      <div className="mb-4">
        <label className="text-xs font-semibold block mb-1">MO 1</label>
        <input
          type="text"
          value={fd.mo1Designation || ''}
          onChange={e => updateForfaitField(forfait.id, 'mo1Designation', e.target.value)}
          className="w-full px-3 py-2 border-2 rounded-lg text-sm mb-2"
        />
        <input
          type="number"
          value={fd.mo1Quantity || ''}
          onChange={e => updateForfaitField(forfait.id, 'mo1Quantity', e.target.value)}
          className="w-full px-3 py-2 border-2 rounded-lg text-sm"
          placeholder="Quantité (h)"
        />
      </div>
      {/* MO 2 */}
      <div className="mb-4">
        <label className="text-xs font-semibold block mb-1">MO 2</label>
        <input
          type="text"
          value={fd.mo2Designation || ''}
          onChange={e => updateForfaitField(forfait.id, 'mo2Designation', e.target.value)}
          className="w-full px-3 py-2 border-2 rounded-lg text-sm mb-2"
        />
        <input
          type="number"
          value={fd.mo2Quantity || ''}
          onChange={e => updateForfaitField(forfait.id, 'mo2Quantity', e.target.value)}
          className="w-full px-3 py-2 border-2 rounded-lg text-sm"
          placeholder="Quantité (h)"
        />
      </div>
      {/* Total MO */}
      <div className="mb-4">
        <label className="text-xs font-semibold block mb-1">Total MO HT</label>
        <input
          type="text"
          value={totalMOHT}
          readOnly
          className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
        />
      </div>
      {/* Consommable */}
      <div>
        <label className="text-xs font-semibold block mb-1">Consommable</label>
        <input
          type="text"
          value={fd.consommableDesignation || ''}
          onChange={e => updateForfaitField(forfait.id, 'consommableDesignation', e.target.value)}
          className="w-full px-3 py-2 border-2 rounded-lg text-sm mb-2"
        />
        <input
          type="number"
          value={fd.consommableQuantity || ''}
          onChange={e => updateForfaitField(forfait.id, 'consommableQuantity', e.target.value)}
          className="w-full px-3 py-2 border-2 rounded-lg text-sm mb-2"
          placeholder="Quantité"
        />
        <input
          type="number"
          value={fd.consommablePrixUnitaire || ''}
          onChange={e => updateForfaitField(forfait.id, 'consommablePrixUnitaire', e.target.value)}
          className="w-full px-3 py-2 border-2 rounded-lg text-sm mb-2"
          placeholder="Prix unitaire (€)"
        />
        <input
          type="text"
          value={consTotal}
          readOnly
          className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
        />
      </div>
    </div>
  );
};

export default ForfaitPeintureForm;