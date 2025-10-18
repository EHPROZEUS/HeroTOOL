/**
 * API WKDA pour l'import de données véhicules
 * Compatible avec admin.wkda.de
 */

const WKDA_BASE_URL = 'https://admin.wkda.de';

/**
 * Récupère les données d'un véhicule depuis WKDA
 * @param {string} carId - L'UUID du véhicule
 * @param {string} authToken - Token d'authentification (optionnel)
 * @returns {Promise<Object|null>}
 */
export const fetchVehicleFromWKDA = async (carId, authToken = null) => {
  try {
    // Nettoyer l'ID (enlever espaces, tirets superflus)
    const cleanId = carId.trim();
    
    // Construire l'URL
    const url = `${WKDA_BASE_URL}/api/cars/${cleanId}`;
    
    // Headers de la requête
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Ajouter le token si disponible
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    console.log('🔍 Récupération depuis WKDA:', cleanId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: 'include' // Pour les cookies de session
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Véhicule non trouvé dans WKDA');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentification requise pour accéder à WKDA');
      }
      throw new Error(`Erreur WKDA: ${response.status} ${response.statusText}`);
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
    ).toString().replace(/\D/g, ''), // Garder que les chiffres
    
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

/**
 * Mapper le type de carburant
 */
const mapFuelType = (fuel) => {
  if (!fuel) return '';
  
  const fuelLower = fuel.toString().toLowerCase();
  
  if (fuelLower.includes('petrol') || 
      fuelLower.includes('essence') || 
      fuelLower.includes('gasoline') ||
      fuelLower.includes('benzin')) {
    return 'essence';
  }
  
  if (fuelLower.includes('diesel') || fuelLower.includes('gasoil')) {
    return 'diesel';
  }
  
  if (fuelLower.includes('hybrid') || 
      fuelLower.includes('hybride') ||
      fuelLower.includes('phev')) {
    return 'hybride';
  }
  
  return '';
};

/**
 * Mapper le type de transmission
 */
const mapTransmission = (transmission) => {
  if (!transmission) return '';
  
  const transLower = transmission.toString().toLowerCase();
  
  if (transLower.includes('manual') || 
      transLower.includes('manuel') || 
      transLower.includes('manuell')) {
    return 'manuelle';
  }
  
  if (transLower.includes('automatic') || 
      transLower.includes('auto') || 
      transLower.includes('cvt') ||
      transLower.includes('automatique')) {
    return 'auto/cvt';
  }
  
  if (transLower.includes('dct') || 
      transLower.includes('dsg') || 
      transLower.includes('dual clutch')) {
    return 'dct';
  }
  
  return '';
};

/**
 * Mapper la climatisation
 */
const mapClimate = (climate) => {
  if (!climate) return '';
  
  const climateLower = climate.toString().toLowerCase();
  
  if (climateLower.includes('bi-zone') || 
      climateLower.includes('dual') || 
      climateLower.includes('2-zone')) {
    return 'bi-zone';
  }
  
  if (climateLower.includes('clim') || 
      climateLower.includes('air') || 
      climateLower.includes('ac')) {
    return 'clim';
  }
  
  return '';
};

/**
 * Mapper le frein de parking
 */
const mapParkingBrake = (brake) => {
  if (!brake) return '';
  
  const brakeLower = brake.toString().toLowerCase();
  
  if (brakeLower.includes('electric') || 
      brakeLower.includes('électrique') || 
      brakeLower.includes('elektronisch')) {
    return 'electrique';
  }
  
  if (brakeLower.includes('manual') || 
      brakeLower.includes('manuel') || 
      brakeLower.includes('hand')) {
    return 'manuel';
  }
  
  return '';
};

/**
 * Formater la date au format ISO (YYYY-MM-DD)
 */
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

/**
 * Valider un UUID WKDA
 */
export const isValidWKDAId = (id) => {
  if (!id) return false;
  
  // Format UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id.trim());
};

/**
 * Extraire l'UUID depuis une URL WKDA
 */
export const extractIdFromWKDAUrl = (url) => {
  if (!url) return null;
  
  // Patterns possibles:
  // https://admin.wkda.de/car/detail/913c173c-fe77-4637-b42b-82d025320110
  // https://www.carol.autohero.com/fr-BE/refurbishment/913c173c-fe77-4637-b42b-82d025320110
  
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = url.match(uuidPattern);
  
  return match ? match[1] : null;
};