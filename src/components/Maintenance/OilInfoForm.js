import React from 'react';
import { HUILES_CONFIG } from '../../config/constants';

const OilInfoForm = ({ oilInfo, updateOilInfo }) => {
  return (
    <div className="bg-white rounded-xl border-2 p-6 shadow-sm" style={{ borderColor: '#FF6B35' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#FF6B35' }}>
        Informations huile moteur
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-3 text-gray-700 uppercase tracking-wide">
            Viscosité
          </label>
          <select 
            value={oilInfo.viscosity || ''} 
            onChange={(e) => updateOilInfo('viscosity', e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
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
          <label className="block text-sm font-bold mb-3 text-gray-700 uppercase tracking-wide">
            Quantité nécessaire (litres)
          </label>
          <input 
            type="text" 
            value={oilInfo.quantity || ''}
            onChange={(e) => updateOilInfo('quantity', e.target.value)}
            placeholder="Ex: 4.5"
            className="w-full px-4 py-3 border-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ borderColor: '#FF6B35' }}
          />
        </div>

        {oilInfo.viscosity && oilInfo.quantity && (
          <div 
            className="p-4 rounded-xl border-2"
            style={{ 
              backgroundColor: '#FFF4E6',
              borderColor: '#FF6B35'
            }}
          >
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span style={{ color: '#FF6B35' }}>✓</span>
              Prix automatiquement calculé dans le forfait &quot;Filtre à huile&quot;
            </p>
            {HUILES_CONFIG[oilInfo.viscosity]?.unite === 'bidon5L' && (
              <p className="text-xs text-gray-700 mt-2 ml-6">
                Note: Huile en bidon de 5L - {Math.ceil(parseFloat(oilInfo.quantity) / 5)} bidon(s) nécessaire(s)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OilInfoForm;