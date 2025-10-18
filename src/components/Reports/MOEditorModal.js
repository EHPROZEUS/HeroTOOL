import React, { useState } from 'react';

const MOEditorModal = ({ isOpen, onClose, forfaitItem, onUpdate }) => {
  const [tempReparation, setTempReparation] = useState(
    forfaitItem?.reparation?.quantity || 0
  );
  const [tempPeinture, setTempPeinture] = useState(
    forfaitItem?.peinture?.quantity || 0
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(forfaitItem.id, {
      reparation: {
        ...forfaitItem.reparation,
        quantity: parseFloat(tempReparation) || 0,
        prix: (
          (parseFloat(tempReparation) || 0) *
          (parseFloat(forfaitItem.reparation?.prixUnitaire) || 0)
        ).toFixed(2)
      },
      peinture: {
        ...forfaitItem.peinture,
        quantity: parseFloat(tempPeinture) || 0,
        prix: (
          (parseFloat(tempPeinture) || 0) *
          (parseFloat(forfaitItem.peinture?.prixUnitaire) || 0)
        ).toFixed(2)
      }
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-6 text-orange-700">
          Modifier les quantités de MO
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {forfaitItem?.label || 'Forfait Réparation Peinture'}
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            MO Réparation (heures)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={tempReparation}
            onChange={(e) => setTempReparation(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-sm font-semibold text-orange-700 mt-1">
            Total:{' '}
            {(
              (parseFloat(tempReparation) || 0) *
              (parseFloat(forfaitItem?.reparation?.prixUnitaire) || 0)
            ).toFixed(2)}{' '}
            €
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            MO Peinture (heures)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={tempPeinture}
            onChange={(e) => setTempPeinture(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-sm font-semibold text-orange-700 mt-1">
            Total:{' '}
            {(
              (parseFloat(tempPeinture) || 0) *
              (parseFloat(forfaitItem?.peinture?.prixUnitaire) || 0)
            ).toFixed(2)}{' '}
            €
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MOEditorModal;