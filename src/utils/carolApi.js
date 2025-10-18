/**
 * API CAROL GraphQL via Proxy Vercel
 */

const CAROL_PROXY_URL = '/api/carol-proxy';

const GET_REFURBISHMENT_QUERY = `
  query GetRefurbishment($id: ID!) {
    refurbishment(id: $id) {
      id
      refurbishmentNumber
      status
      position
      workshop {
        name
        id
      }
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
      tasks {
        id
        name
        category
        status
        description
        estimatedCost
        laborTime
        parts {
          id
          name
          reference
          partNumber
          quantity
          unitPrice
          totalPrice
          supplier
        }
        labor {
          hours
          rate
          total
        }
      }
      estimatedTotalCost
      actualTotalCost
    }
  }
`;

/**
 * Récupère les données depuis CAROL via proxy Vercel
 */
export const fetchRefurbishmentFromCAROL = async (vehicleId) => {
  try {
    const cleanId = vehicleId.trim();
    
    console.log('🔍 Récupération depuis CAROL via proxy:', cleanId);
    
    const response = await fetch(CAROL_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: GET_REFURBISHMENT_QUERY,
        variables: { id: cleanId }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403 || errorData.needsAuth) {
        throw new Error('⚠️ Non authentifié.\n\nℹ️ L\'API CAROL nécessite une authentification.\n\nContactez l\'équipe IT d\'AutoHero pour ajouter "herotool.vercel.app" à la whitelist CORS de l\'API CAROL.');
      }
      
      throw new Error(errorData.error || `Erreur CAROL: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Réponse GraphQL via proxy:', result);
    
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
 * Mapper les données CAROL vers HeroTOOL
 */
const mapCAROLToHeroTool = (refurbishment) => {
  const vehicle = refurbishment.vehicle || {};
  
  const vehicleData = {
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
    startStop: Boolean(vehicle.startStop)
  };
  
  const taskMapping = mapTasksToHeroToolItems(refurbishment.tasks || []);
  
  const carolMetadata = {
    refurbishmentNumber: refurbishment.refurbishmentNumber,
    status: refurbishment.status,
    workshop: refurbishment.workshop?.name,
    position: refurbishment.position,
    estimatedCost: refurbishment.estimatedTotalCost,
    actualCost: refurbishment.actualTotalCost,
    tasks: refurbishment.tasks || []
  };
  
  return { vehicleData, taskMapping, carolMetadata };
};

const mapTasksToHeroToolItems = (tasks) => {
  const itemStates = {};
  const itemNotes = {};
  const forfaitData = {};
  const pieceLines = {};
  
  tasks.forEach(task => {
    const heroToolItemId = mapTaskCategoryToHeroToolItem(task.category, task.name);
    
    if (heroToolItemId) {
      itemStates[heroToolItemId] = task.status === 'COMPLETED' ? 2 : 1;
      
      if (task.description) {
        itemNotes[heroToolItemId] = task.description;
      }
      
      forfaitData[heroToolItemId] = {
        moQuantity: task.labor?.hours?.toString() || '0.5',
        moPrix: 35.8,
        moCategory: determineMOCategory(task.category),
        pieceReference: '',
        pieceDesignation: '',
        pieceQuantity: '0',
        piecePrixUnitaire: '0',
        piecePrix: '0',
        pieceFournisseur: '',
        consommableReference: '',
        consommableDesignation: '',
        consommableQuantity: '0',
        consommablePrixUnitaire: '0',
        consommablePrix: '0'
      };
      
      if (task.parts && task.parts.length > 0) {
        task.parts.forEach((part, index) => {
          if (index === 0) {
            forfaitData[heroToolItemId].pieceReference = part.reference || part.partNumber || '';
            forfaitData[heroToolItemId].pieceDesignation = part.name || '';
            forfaitData[heroToolItemId].pieceQuantity = part.quantity?.toString() || '1';
            forfaitData[heroToolItemId].piecePrixUnitaire = part.unitPrice?.toString() || '0';
            forfaitData[heroToolItemId].piecePrix = part.totalPrice?.toString() || '0';
            forfaitData[heroToolItemId].pieceFournisseur = part.supplier || '';
          } else {
            if (!pieceLines[heroToolItemId]) {
              pieceLines[heroToolItemId] = [];
            }
            
            pieceLines[heroToolItemId].push({
              reference: part.reference || part.partNumber || '',
              designation: part.name || '',
              fournisseur: part.supplier || '',
              quantity: part.quantity?.toString() || '1',
              prixUnitaire: part.unitPrice?.toString() || '0',
              prix: part.totalPrice?.toString() || '0'
            });
          }
        });
      }
    }
  });
  
  return { itemStates, itemNotes, forfaitData, pieceLines };
};

const mapTaskCategoryToHeroToolItem = (category, taskName) => {
  const categoryLower = (category || '').toLowerCase();
  const nameLower = (taskName || '').toLowerCase();
  
  const categoryMap = {
    'oil': 'filtreHuile',
    'vidange': 'filtreHuile',
    'air_filter': 'filtreAir',
    'pollen_filter': 'filtrePollen',
    'fuel_filter': 'filtreCarburant',
    'spark_plugs': 'bougies',
    'brake': 'disquesPlaquettesAv',
    'freins': 'disquesPlaquettesAv',
    'tire': 'pneus4',
    'pneu': 'pneus4',
    'timing_belt': 'courroieDistribution',
    'battery': 'batterie',
    'suspension': 'amortisseursAvant',
    'body': 'carrosserie',
    'paint': 'peinture',
    'detail': 'dsp',
    'clean': 'dsp',
    'polish': 'lustrage'
  };
  
  for (const [key, itemId] of Object.entries(categoryMap)) {
    if (categoryLower.includes(key) || nameLower.includes(key)) {
      return itemId;
    }
  }
  return null;
};

const determineMOCategory = (taskCategory) => {
  const categoryLower = (taskCategory || '').toLowerCase();
  if (categoryLower.includes('body') || categoryLower.includes('paint')) return 'Carrosserie';
  if (categoryLower.includes('detail') || categoryLower.includes('clean')) return 'Lustrage';
  return 'Mécanique';
};

const mapFuelType = (fuel) => {
  if (!fuel) return '';
  const fuelLower = fuel.toString().toLowerCase();
  if (fuelLower.includes('petrol') || fuelLower.includes('essence')) return 'essence';
  if (fuelLower.includes('diesel')) return 'diesel';
  if (fuelLower.includes('hybrid')) return 'hybride';
  return '';
};

const mapTransmission = (transmission) => {
  if (!transmission) return '';
  const transLower = transmission.toString().toLowerCase();
  if (transLower.includes('manual') || transLower.includes('manuel')) return 'manuelle';
  if (transLower.includes('automatic') || transLower.includes('auto')) return 'auto/cvt';
  if (transLower.includes('dct')) return 'dct';
  return '';
};

const mapClimate = (climate) => {
  if (!climate) return '';
  const climateLower = climate.toString().toLowerCase();
  if (climateLower.includes('bi-zone') || climateLower.includes('dual')) return 'bi-zone';
  if (climateLower.includes('clim')) return 'clim';
  return '';
};

const mapParkingBrake = (brake) => {
  if (!brake) return '';
  const brakeLower = brake.toString().toLowerCase();
  if (brakeLower.includes('electric') || brakeLower.includes('électrique')) return 'electrique';
  if (brakeLower.includes('manual') || brakeLower.includes('manuel')) return 'manuel';
  return '';
};

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

export const isValidVehicleId = (id) => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id.trim());
};

export const extractIdFromURL = (url) => {
  if (!url) return null;
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = url.match(uuidPattern);
  return match ? match[1] : null;
};