import React from 'react';
import { HUILES_CONFIG } from '../../config/constants';

const colors = {
  brand: '#F7931E',
  brandHover: '#e07d06',
  text: '#1F2933',
  textMuted: '#5A6572',
  border: '#E2E8EE',
  borderStrong: '#D1D7DE',
  rowSelectedBg: '#FFF6EC',
  rowHoverBg: '#F9FBFC',
  page: '#F7F9FA',
  focus: '#2563EB'
};

const OilInfoForm = ({ oilInfo, updateOilInfo }) => {
  return (
    <section
      className="rounded-lg border"
      style={{ borderColor: colors.border, backgroundColor: '#FFFFFF' }}
    >
      <header className="px-6 pt-5 pb-4 border-b" style={{ borderColor: colors.border }}>
        <h2 className="text-[18px] font-semibold" style={{ color: colors.text }}>
          Informations huile moteur
        </h2>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
              Viscosité
            </label>
            <select 
              value={oilInfo.viscosity || ''} 
              onChange={(e) => updateOilInfo('viscosity', e.target.value)}
              className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${colors.border}`,
                background: '#FFFFFF',
                color: colors.text
              }}
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
              Quantité nécessaire (litres)
            </label>
            <input 
              type="text" 
              value={oilInfo.quantity || ''}
              onChange={(e) => updateOilInfo('quantity', e.target.value)}
              placeholder="Ex: 4.5"
              className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${colors.border}`,
                background: '#FFFFFF',
                color: colors.text
              }}
            />
          </div>
        </div>

        {oilInfo.viscosity && oilInfo.quantity && (
          <div 
            className="p-4 rounded-md space-y-2"
            style={{ 
              backgroundColor: colors.rowSelectedBg,
              border: `1px solid ${colors.brand}`
            }}
          >
            <p className="text-sm font-semibold" style={{ color: colors.text }}>
              ✓ Prix automatiquement calculé dans le forfait "Filtre à huile"
            </p>
            {HUILES_CONFIG[oilInfo.viscosity]?.unite === 'bidon5L' && (
              <p className="text-xs" style={{ color: colors.textMuted }}>
                Note: Huile en bidon de 5L - {Math.ceil(parseFloat(oilInfo.quantity) / 5)} bidon(s) nécessaire(s)
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default OilInfoForm;
