import React from 'react';
import { calculateVehicleAge } from '../../utils/formatters';

const VehicleInfoForm = ({ headerInfo, updateHeaderInfo, toggleMoteur, toggleBoite, toggleClim, toggleFreinParking, toggleStartStop }) => {
  return (
    <div className="mb-8 p-4 md:p-6 rounded-xl border-2" style={{ backgroundColor: '#FFF0E6', borderColor: '#FF6B35' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Lead</label>
          <input 
            type="text" 
            value={headerInfo.lead} 
            onChange={(e) => updateHeaderInfo('lead', e.target.value)}
            placeholder="Nom..." 
            className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
            style={{ borderColor: '#FF6B35' }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Immatriculation</label>
          <input 
            type="text" 
            value={headerInfo.immatriculation} 
            onChange={(e) => updateHeaderInfo('immatriculation', e.target.value.toUpperCase())}
            placeholder="AB-123-CD..." 
            className="w-full px-3 py-2 border-2 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500" 
            style={{ borderColor: '#FF6B35' }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">VIN</label>
          <input 
            type="text" 
            value={headerInfo.vin} 
            onChange={(e) => updateHeaderInfo('vin', e.target.value.toUpperCase())}
            placeholder="VF1RFD00000000000..." 
            className="w-full px-3 py-2 border-2 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500" 
            style={{ borderColor: '#FF6B35' }}
          />
        </div>
          <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
    <input 
      type="text" 
      value={headerInfo.marque} 
      onChange={(e) => updateHeaderInfo('marque', e.target.value)}
      placeholder="Renault, Peugeot..." 
      className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
      style={{ borderColor: '#FF6B35' }}
    />
  </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kilomètres</label>
          <input 
            type="text" 
            value={headerInfo.kilometres} 
            onChange={(e) => updateHeaderInfo('kilometres', e.target.value)}
            placeholder="50000..." 
            className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
            style={{ borderColor: '#FF6B35' }}
          />
        </div>
          <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">Modèle</label>
    <input 
      type="text" 
      value={headerInfo.modele} 
      onChange={(e) => updateHeaderInfo('modele', e.target.value)}
      placeholder="Clio, 208..." 
      className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
      style={{ borderColor: '#FF6B35' }}
    />
  </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Moteur</label>
          <div className="flex gap-1">
            <button 
              onClick={() => toggleMoteur('essence')}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                headerInfo.moteur === 'essence' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.moteur === 'essence' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Essence
            </button>
            <button 
              onClick={() => toggleMoteur('diesel')}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                headerInfo.moteur === 'diesel' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.moteur === 'diesel' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Diesel
            </button>
            <button 
              onClick={() => toggleMoteur('hybride')}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                headerInfo.moteur === 'hybride' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.moteur === 'hybride' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Hybride
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Boîte</label>
          <div className="flex gap-1">
            <button 
              onClick={() => toggleBoite('manuelle')}
              className={`flex-1 px-1 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                headerInfo.boite === 'manuelle' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.boite === 'manuelle' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Man.
            </button>
            <button 
              onClick={() => toggleBoite('auto/cvt')}
              className={`flex-1 px-1 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                headerInfo.boite === 'auto/cvt' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.boite === 'auto/cvt' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Auto
            </button>
            <button 
              onClick={() => toggleBoite('dct')}
              className={`flex-1 px-1 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                headerInfo.boite === 'dct' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.boite === 'dct' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              DCT
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date du véhicule</label>
          <input 
            type="date" 
            value={headerInfo.dateVehicule} 
            onChange={(e) => updateHeaderInfo('dateVehicule', e.target.value)}
            className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
            style={{ borderColor: '#FF6B35' }}
          />
          {headerInfo.dateVehicule && (
            <div className="mt-1 text-xs font-medium" style={{ color: '#FF6B35' }}>
              Âge: {calculateVehicleAge(headerInfo.dateVehicule)}
            </div>
          )}
        </div>
      </div>

      {/* Options supplémentaires */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Climatisation</label>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleClim('clim')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border-2 ${
                headerInfo.clim === 'clim' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.clim === 'clim' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Clim
            </button>
            <button 
              onClick={() => toggleClim('clim bi-zone')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border-2 ${
                headerInfo.clim === 'clim bi-zone' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.clim === 'clim bi-zone' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Bi-zone
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Frein de parking</label>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleFreinParking('manuel')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border-2 ${
                headerInfo.freinParking === 'manuel' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.freinParking === 'manuel' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Manuel
            </button>
            <button 
              onClick={() => toggleFreinParking('electrique')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border-2 ${
                headerInfo.freinParking === 'electrique' 
                  ? 'text-white border-orange-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={headerInfo.freinParking === 'electrique' ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
            >
              Électrique
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
          <button 
            onClick={toggleStartStop}
            className={`w-full px-3 py-2 rounded-lg text-xs font-medium border-2 ${
              headerInfo.startStop 
                ? 'text-white border-orange-600' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
            style={headerInfo.startStop ? { backgroundColor: '#FF6B35', borderColor: '#E55A2B' } : {}}
          >
            Start and Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfoForm;
