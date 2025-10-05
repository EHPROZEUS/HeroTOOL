import React from 'react';
import { HUILES_CONFIG } from '../../config/constants';

const OilInfoForm = ({ oilInfo, updateOilInfo }) => {
  return (
    <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B35' }}>
      <h3 className="text-md font-semibold text-gray-800 mb-3">Informations huile moteur</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Viscosité</label>
          <select 
            value={oilInfo.viscosity} 
            onChange={(e) => updateOilInfo('viscosity', e.target.value)}
            className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ borderColor: '#FF6B35' }}
          >
            <option value="">Sélectionner...</option>
            <optgroup label="Huiles au litre (3€/L)">
              <option value="5W30">5W30</option>
              <option value="5W40">5W40</option>
              <option value="0W30">0W30</option>
              <option value="0W20 PSA">0W20 PSA</option>
              <option value="5W30 RN17">5W30 RN17</option>
            </optgroup>
            <optgroup label="Huiles au litre (3.67€/L)">
              <option value="5W30 PSA">5W30 PSA</option>
            </optgroup>
            <optgroup label="Huiles en bidon 5L (25€/bidon)">
              <option value="5W20 FORD">5W20 FORD</option>
              <option value="0W20 VW AUDI FIAT">0W20 VW AUDI FIAT</option>
              <option value="5W30 RN720">5W30 RN720</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité nécessaire (litres)</label>
          <input 
            type="text" 
            value={oilInfo.quantity}
            onChange={(e) => updateOilInfo('quantity', e.target.value)}
            placeholder="Ex: 4.5"
            className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ borderColor: '#FF6B35' }}
          />
        </div>
      </div>
      {oilInfo.viscosity && oilInfo.quantity && (
        <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded">
          <p className="text-sm font-semibold text-green-800">
            ✓ Prix automatiquement calculé dans le forfait "Filtre à huile"
          </p>
          {HUILES_CONFIG[oilInfo.viscosity]?.unite === 'bidon5L' && (
            <p className="text-xs text-green-700 mt-1">
              Note: Huile en bidon de 5L - {Math.ceil(parseFloat(oilInfo.quantity) / 5)} bidon(s) nécessaire(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OilInfoForm;
