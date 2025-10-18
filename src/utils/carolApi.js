/**
 * API CAROL GraphQL pour l'import de données de reconditionnement
 * Endpoint: /api/v1/refurbishment-aggregation/graphql
 */

const CAROL_API_URL = 'https://www.carol.autohero.com/api/v1/refurbishment-aggregation/graphql';

/**
 * Requête GraphQL pour récupérer un véhicule
 */
const GET_VEHICLE_QUERY = `
  query GetRefurbishment($id: ID!) {
    refurbishment(id: $id) {
      id
      refurbishmentNumber
      vehicle {
        id
        vin
        licensePlate
        make
        model
        mileage
        fuelType
        transmission
        firstRegistration
        airConditioning
        parkingBrake
        startStop
      }
      status
      workshop {
        name
      }
      position
      tasks {
        id
        name
        status
        category
      }
    }
  }
`;

/**
 * Récupère les données d'un véhicule depuis CAROL
 * @param {string} vehicleId - L'UUID du véhicule
 * @returns {Promise<Object|null>}
 */
export const fetchVehicleFromCAROL = async (vehicleId) => {
  try {
    const cleanId = vehicleId.trim();
    
    console.log('🔍 Récupération depuis CAROL GraphQL:', cleanId);
    
    const response = await fetch(CAROL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include', // ✅ Utiliser les cookies de session
      body: JSON.stringify({
        query: GET_VEHICLE_QUERY,
        variables: {
          id: cleanId
        }
      })
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('⚠️ Non authentifié. Connectez-vous à CAROL/WKDA puis réessayez.');
      }
      throw new Error(`Erreur CAROL: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Réponse GraphQL:', result);
    
    if (result.errors) {
      console.error('❌ Erreurs GraphQL:', result.errors);
      throw new Error(result.errors[0]?.message || 'Erreur GraphQL');
    }
    
    if (!result.data?.refurbishment) {
      throw new Error('Véhicule non trouvé dans CAROL');
    }
    
    return mapCAROLToHeroTool(result.data.refurbishment);
    
  } catch (error) {
    console.error('❌ Erreur import CAROL:', error);
    throw error;
  }
};

/**
 * Mapper les données CAROL vers le format HeroTOOL
 */
const mapCAROLToHeroTool = (refurbishment) => {
  const vehicle = refurbishment.vehicle || {};
  
  return {
    lead: refurbishment.id || '',
    
    immatriculation: (vehicle.licensePlate || '').toUpperCase(),
    
    vin: (vehicle.vin || '').toUpperCase(),
    
    marque: vehicle.make || '',
    
    modele: vehicle.model || '',
    
    kilometres: (vehicle.mileage || '').toString().replace(/\D/g, ''),
    
    moteur: mapFuelType(vehicle.fuelType),
    
    boite: mapTransmission(vehicle.transmission),
    
    dateVehicule: formatDate(vehicle.firstRegistration),
    
    clim: mapClimate(vehicle.airConditioning),
    
    freinParking: mapParkingBrake(vehicle.parkingBrake),
    
    startStop: Boolean(vehicle.startStop),
    
    // Infos supplémentaires CAROL
    _carolData: {
      refurbishmentNumber: refurbishment.refurbishmentNumber,
      status: refurbishment.status,
      workshop: refurbishment.workshop?.name,
      position: refurbishment.position,
      tasks: refurbishment.tasks || []
    }
  };
};

/**
 * Mapper le type de carburant
 */
const mapFuelType = (fuel) => {
  if (!fuel) return '';
  const fuelLower = fuel.toString().toLowerCase();
  
  if (fuelLower.includes('petrol') || fuelLower.includes('essence') || fuelLower.includes('gasoline')) {
    return 'essence';
  }
  if (fuelLower.includes('diesel')) {
    return 'diesel';
  }
  if (fuelLower.includes('hybrid') || fuelLower.includes('hybride')) {
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
  
  if (transLower.includes('manual') || transLower.includes('manuel')) {
    return 'manuelle';
  }
  if (transLower.includes('automatic') || transLower.includes('auto') || transLower.includes('cvt')) {
    return 'auto/cvt';
  }
  if (transLower.includes('dct') || transLower.includes('dsg')) {
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
  
  if (climateLower.includes('bi-zone') || climateLower.includes('dual') || climateLower.includes('2-zone')) {
    return 'bi-zone';
  }
  if (climateLower.includes('clim') || climateLower.includes('air') || climateLower.includes('ac')) {
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
  
  if (brakeLower.includes('electric') || brakeLower.includes('électrique')) {
    return 'electrique';
  }
  if (brakeLower.includes('manual') || brakeLower.includes('manuel') || brakeLower.includes('hand')) {
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
 * Valider un UUID
 */
export const isValidVehicleId = (id) => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id.trim());
};

/**
 * Extraire l'UUID depuis une URL
 */
export const extractIdFromURL = (url) => {
  if (!url) return null;
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = url.match(uuidPattern);
  return match ? match[1] : null;
};