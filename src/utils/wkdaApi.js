/**
 * API WKDA pour l'import de données véhicules
 * Compatible avec admin.wkda.de via proxy Vercel
 */

// Utiliser le proxy Vercel au lieu de l'API directe
const USE_PROXY = true;
const PROXY_URL = '/api/wkda-proxy';
const WKDA_BASE_URL = 'https://admin.wkda.de';

/**
 * Récupère les données d'un véhicule depuis WKDA
 * @param {string} carId - L'UUID du véhicule
 * @param {string} authToken - Token d'authentification (optionnel)
 * @returns {Promise<Object|null>}
 */
export const fetchVehicleFromWKDA = async (carId, authToken = null) => {
  try {
    const cleanId = carId.trim();
    
    // Construire l'URL (proxy ou direct)
    const url = USE_PROXY 
      ? `${PROXY_URL}?carId=${cleanId}`
      : `${WKDA_BASE_URL}/api/cars/${cleanId}`;
    
    console.log('🔍 Récupération depuis WKDA:', cleanId, USE_PROXY ? '(via proxy)' : '(direct)');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Ajouter le token si disponible (uniquement en mode direct)
    if (!USE_PROXY && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        throw new Error('Véhicule non trouvé dans WKDA');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentification requise pour accéder à WKDA');
      }
      
      throw new Error(errorData.error || `Erreur WKDA: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Données WKDA reçues:', data);
    
    // Mapper les données vers le format HeroTOOL
    return mapWKDAToHeroTool(data);
    
  } catch (error) {
    console.error('❌ Erreur import WKDA:', error);
    throw error;
  }
};

/**
 * Mapper les données WKDA vers le format HeroTOOL
 */
const mapWKDAToHeroTool = (wkdaData) => {
  // Structure attendue de l'API WKDA (à adapter selon la vraie structure)
  const vehicle = wkdaData.vehicle || wkdaData.car || wkdaData;
  
  return {
    lead: vehicle.id || vehicle.uuid || '',
    immatriculation: (
      vehicle.licensePlate || 
      vehicle.registration || 
      vehicle.plateNumber ||
      vehicle.immatriculation ||
      ''
    ).toUpperCase(),
    
    vin: (
      vehicle.vin || 
      vehicle.chassisNumber || 
      vehicle.vinNumber ||
      ''
    ).toUpperCase(),
    
    marque: vehicle.make || vehicle.brand || vehicle.manufacturer || '',
    
    modele: vehicle.model || vehicle.modelName || '',
    
    kilometres: (
      vehicle.mileage || 
      vehicle.kilometers || 
      vehicle.odometer ||
      vehicle.kilometrage ||
      ''
    ).toString().replace(/\D/g, ''),
    
    moteur: mapFuelType(
      vehicle.fuelType || 
      vehicle.fuel || 
      vehicle.carburant ||
      vehicle.engineType
    ),
    
    boite: mapTransmission(
      vehicle.transmission || 
      vehicle.gearbox || 
      vehicle.boiteDeVitesse
    ),
    
    dateVehicule: formatDate(
      vehicle.firstRegistration || 
      vehicle.registrationDate || 
      vehicle.dateFirstCirculation ||
      vehicle.miseEnCirculation
    ),
    
    clim: mapClimate(
      vehicle.airConditioning || 
      vehicle.climate || 
      vehicle.climatisation
    ),
    
    freinParking: mapParkingBrake(
      vehicle.parkingBrake || 
      vehicle.freinDeParking ||
      vehicle.handbrake
    ),
    
    startStop: Boolean(
      vehicle.startStop || 
      vehicle.startStopSystem ||
      vehicle.hasStartStop
    )
  };
};

// Reste des fonctions helper (mapFuelType, mapTransmission, etc.)
const mapFuelType = (fuel) => {
  if (!fuel) return '';
  const fuelLower = fuel.toString().toLowerCase();
  if (fuelLower.includes('petrol') || fuelLower.includes('essence') || fuelLower.includes('gasoline') || fuelLower.includes('benzin')) return 'essence';
  if (fuelLower.includes('diesel') || fuelLower.includes('gasoil')) return 'diesel';
  if (fuelLower.includes('hybrid') || fuelLower.includes('hybride') || fuelLower.includes('phev')) return 'hybride';
  return '';
};

const mapTransmission = (transmission) => {
  if (!transmission) return '';
  const transLower = transmission.toString().toLowerCase();
  if (transLower.includes('manual') || transLower.includes('manuel') || transLower.includes('manuell')) return 'manuelle';
  if (transLower.includes('automatic') || transLower.includes('auto') || transLower.includes('cvt') || transLower.includes('automatique')) return 'auto/cvt';
  if (transLower.includes('dct') || transLower.includes('dsg') || transLower.includes('dual clutch')) return 'dct';
  return '';
};

const mapClimate = (climate) => {
  if (!climate) return '';
  const climateLower = climate.toString().toLowerCase();
  if (climateLower.includes('bi-zone') || climateLower.includes('dual') || climateLower.includes('2-zone')) return 'bi-zone';
  if (climateLower.includes('clim') || climateLower.includes('air') || climateLower.includes('ac')) return 'clim';
  return '';
};

const mapParkingBrake = (brake) => {
  if (!brake) return '';
  const brakeLower = brake.toString().toLowerCase();
  if (brakeLower.includes('electric') || brakeLower.includes('électrique') || brakeLower.includes('elektronisch')) return 'electrique';
  if (brakeLower.includes('manual') || brakeLower.includes('manuel') || brakeLower.includes('hand')) return 'manuel';
  return '';
};

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Erreur formatage date:', e);
    return '';
  }
};

export const isValidWKDAId = (id) => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id.trim());
};

export const extractIdFromWKDAUrl = (url) => {
  if (!url) return null;
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = url.match(uuidPattern);
  return match ? match[1] : null;
};