import React from 'react';
import { calculateVehicleAge, formatDateFr, calculateTimeSince } from '../../utils/formatters';

const VehicleSummary = ({ headerInfo, oilInfo, lastMaintenance, includeContrevisite, setIncludeContrevisite }) => {
  return (
    <div className="mb-8 p-4 md:p-6 rounded-xl border-2" style={{ backgroundColor: '#FFF8F0', borderColor: '#FF6B35' }}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Récapitulatif véhicule</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {headerInfo.lead && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Lead:</span>
              <a
                href={`https://admin.wkda.de/car/detail/${headerInfo.lead}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 underline font-medium"
                style={{ wordBreak: 'break-all' }}
                title="Voir la fiche admin"
              >
                {headerInfo.lead}
              </a>
            </div>
          )}
          {headerInfo.immatriculation && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Immatriculation:</span>
              <span className="text-gray-900 font-medium">{headerInfo.immatriculation}</span>
            </div>
          )}
          {headerInfo.vin && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">VIN:</span>
              <span className="text-gray-900 font-medium text-sm">{headerInfo.vin}</span>
            </div>
          )}
          {headerInfo.moteur && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Moteur:</span>
              <span className="text-gray-900 font-medium capitalize">{headerInfo.moteur}</span>
            </div>
          )}
          {headerInfo.boite && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Boîte:</span>
              <span className="text-gray-900 font-medium capitalize">
                {headerInfo.boite === 'auto/cvt' ? 'Auto/CVT' : headerInfo.boite === 'dct' ? 'DCT' : headerInfo.boite}
              </span>
            </div>
          )}
          {headerInfo.dateVehicule && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Âge:</span>
              <span className="text-gray-900 font-medium">{calculateVehicleAge(headerInfo.dateVehicule)}</span>
            </div>
          )}
          {headerInfo.kilometres && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Kilomètres:</span>
              <span className="text-gray-900 font-medium">{headerInfo.kilometres} km</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {headerInfo.clim && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Climatisation:</span>
              <span className="text-gray-900 font-medium capitalize">{headerInfo.clim}</span>
            </div>
          )}
          {headerInfo.freinParking && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Frein parking:</span>
              <span className="text-gray-900 font-medium capitalize">{headerInfo.freinParking}</span>
            </div>
          )}
          {headerInfo.startStop && (
            <div className="flex items-center">
              <span className="font-bold text-gray-700 w-32">Start & Stop:</span>
              <span className="text-gray-900 font-medium">Oui</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Alerte Contre-visite */}
      {includeContrevisite && (
        <div className="mt-6 p-4 rounded-lg border-2 flex items-center gap-3" style={{ backgroundColor: '#FFF4E6', borderColor: '#FF6B35' }}>
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="text-lg font-bold" style={{ color: '#FF6B35' }}>CONTRE-VISITE REQUISE</p>
            <p className="text-sm text-gray-700">Le véhicule nécessite une contre-visite du contrôle technique</p>
          </div>
        </div>
      )}
      
      {(oilInfo.viscosity || oilInfo.quantity || Object.values(lastMaintenance).some(val => val)) && (
        <div className="mt-6 pt-6 border-t-2" style={{ borderColor: '#FF6B35' }}>
          <h3 className="text-md font-bold text-gray-800 mb-3">Derniers entretiens:</h3>
          
          {(oilInfo.viscosity || oilInfo.quantity) && (
            <div className="mb-3 p-3 rounded-lg border" style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B35' }}>
              <span className="font-semibold text-gray-700">Huile moteur:</span>
              {oilInfo.viscosity && <span className="ml-2 text-gray-900">{oilInfo.viscosity}</span>}
              {oilInfo.quantity && <span className="ml-2 text-gray-900">- {oilInfo.quantity}L</span>}
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(lastMaintenance).map(key => {
              if (!lastMaintenance[key]) return null;
              
              const [date, km] = lastMaintenance[key].split('|');
              const labels = {
                filtreHuile: 'Filtre huile',
                filtrePollen: 'Filtre pollen',
                filtreAir: 'Filtre air',
                filtreCarburant: 'Filtre carburant',
                bougies: 'Bougies',
                vidangeBoite: 'Vidange boîte',
                liquideFrein: 'Liquide frein',
                liquideRefroidissement: 'Liquide refroid.',
                courroieDistribution: 'Courroie distrib.',
                courroieAccessoire: 'Courroie access.'
              };
              
              return (
                <div key={key} className="text-sm">
                  <span className="font-semibold text-gray-700">{labels[key] || key}:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDateFr(date)}
                    {km && ` - ${km} km`}
                  </span>
                  <span className="ml-2 font-medium" style={{ color: '#FF6B35' }}>
                    ({calculateTimeSince(date)})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSummary;
