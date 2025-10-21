/**
 * COMPOSANT: Informations du véhicule dans l'Ordre de Réparation
 * Affiche les détails du véhicule (immatriculation, marque, modèle, etc.)
 */
import React from 'react';
import { calculateVehicleAge, formatDateFr } from '../../utils/formatters';

const ORVehicleInfo = ({ headerInfo = {} }) => {
  const vehicleAge = calculateVehicleAge(headerInfo.dateVehicule || headerInfo.firstRegistrationDate);

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
      <h3 className="text-sm font-bold text-gray-800 mb-2 p-1 rounded" style={{ backgroundColor: '#FFF0E6' }}>
        Informations du Véhicule
      </h3>

      <div className="grid gap-x-6 gap-y-2 text-xs">
        {/* Lead */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Lead:&nbsp;</span>
          <span className="font-semibold text-gray-900">{headerInfo.lead || '-'}</span>
        </div>

        {/* Immatriculation */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Immatriculation:&nbsp;</span>
          <span className="font-semibold text-gray-900">{headerInfo.immatriculation || '-'}</span>
        </div>

        {/* Modèle */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Modèle:&nbsp;</span>
          <span className="font-semibold text-gray-900">{headerInfo.modele || headerInfo.model || '-'}</span>
        </div>

        {/* Marque */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Marque:&nbsp;</span>
          <span className="font-semibold text-gray-900">{headerInfo.marque || headerInfo.brand || '-'}</span>
        </div>

        {/* Kilométrage */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Kilométrage:&nbsp;</span>
          <span className="font-semibold text-gray-900">
            {headerInfo.kilometres || headerInfo.mileage 
              ? `${(headerInfo.kilometres || headerInfo.mileage).toLocaleString()} km` 
              : '-'}
          </span>
        </div>

        {/* Première immat */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Première immat.:&nbsp;</span>
          <span className="font-semibold text-gray-900">
            {headerInfo.dateVehicule || headerInfo.firstRegistrationDate 
              ? formatDateFr(headerInfo.dateVehicule || headerInfo.firstRegistrationDate)
              : '-'}
          </span>
        </div>

        {/* Âge du véhicule */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Âge du véhicule:&nbsp;</span>
          <span className="font-semibold text-gray-900">{vehicleAge || '-'}</span>
        </div>

        {/* Carburant */}
        <div className="flex items-baseline">
          <span className="text-gray-600 w-28 flex-shrink-0">Carburant:&nbsp;</span>
          <span className="font-semibold text-gray-900">{headerInfo.moteur || headerInfo.fuel || '-'}</span>
        </div>

        {/* VIN sur toute la largeur */}
        {headerInfo.vin && (
          <div className="flex items-baseline col-span-2">
            <span className="text-gray-600 w-28 flex-shrink-0">VIN:&nbsp;</span>
            <span className="font-semibold text-gray-900 break-all">{headerInfo.vin}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ORVehicleInfo;