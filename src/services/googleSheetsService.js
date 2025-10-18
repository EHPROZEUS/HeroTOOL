// Configuration
const SPREADSHEET_ID = '1A7fH-rv1jXSISFEz_YHoPmXUvj8NZ4Im5q5Gjx4hJ1M';
const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || 'VOTRE_CLE_API';
const RANGE = 'A:Z'; // Toutes les colonnes

/**
 * Récupère un véhicule par son stock_number (colonne B)
 */
export const getVehicleByLead = async (leadId) => {
  if (!leadId || leadId.trim() === '') {
    return null;
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    console.log('🔍 Recherche du lead:', leadId);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur API Google Sheets:', errorData);
      throw new Error(`Erreur ${response.status}: ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length < 2) {
      console.log('⚠️ Aucune donnée dans le sheet');
      return null;
    }

    // Headers en ligne 0
    const headers = rows[0];
    console.log('📋 Headers:', headers.slice(0, 20));

    // Chercher le véhicule par stock_number (colonne B = index 1)
    const vehicleRow = rows.slice(1).find(row => {
      const stockNumber = row[1]?.toString().trim().toUpperCase();
      const searchId = leadId.toString().trim().toUpperCase();
      return stockNumber === searchId;
    });

    if (!vehicleRow) {
      console.log(`❌ Aucun véhicule trouvé pour le lead: ${leadId}`);
      return null;
    }

    console.log('✅ Véhicule trouvé:', vehicleRow.slice(0, 20));

    // Mapping complet des colonnes selon votre Google Sheet
    const vehicleData = {
      // Colonnes brutes
      time_reporting: vehicleRow[0] || '',
      stock_number: vehicleRow[1] || '',
      state: vehicleRow[2] || '',
      autohero_purchase_on: vehicleRow[3] || '',
      auto1buy_price: vehicleRow[4] || '',
      purchase_branch_name: vehicleRow[5] || '',
      sourcing_country: vehicleRow[6] || '',
      sourcing_type: vehicleRow[7] || '',
      registration_date: vehicleRow[8] || '',
      brand: vehicleRow[9] || '',
      model: vehicleRow[10] || '',
      fuel_type: vehicleRow[11] || '',
      mileage: vehicleRow[12] || '',
      build_year: vehicleRow[13] || '',
      country_of_origin: vehicleRow[14] || '',
      document_location: vehicleRow[15] || '',
      // Colonne 16 est vide (blank)
      vin: vehicleRow[17] || '', // ✅ Colonne R
      license_plate: vehicleRow[18] || '', // ✅ Colonne S
      
      // Mapping vers votre formulaire HeroTool
      lead: vehicleRow[1] || '', // stock_number
      immatriculation: vehicleRow[18] || '', // ✅ license_plate
      kilometres: vehicleRow[12] || '', // mileage
      dateVehicule: formatDateForInput(vehicleRow[8]), // registration_date
      moteur: mapFuelType(vehicleRow[11]), // fuel_type
      marque: vehicleRow[9] || '', // brand
      modele: vehicleRow[10] || '', // model
    };

    console.log('✅ Données formatées:', vehicleData);
    return vehicleData;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données:', error);
    throw error;
  }
};

/**
 * Convertir le format de date du sheet vers input date
 */
function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  // Si déjà au format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Autres formats
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('⚠️ Format de date non reconnu:', dateString);
  }
  
  return '';
}

/**
 * Mapper fuel_type vers les options de votre formulaire
 */
function mapFuelType(fuelType) {
  if (!fuelType) return '';
  
  const fuel = fuelType.toLowerCase();
  
  if (fuel.includes('benzin') || fuel.includes('essence')) {
    return 'essence';
  }
  if (fuel.includes('diesel')) {
    return 'diesel';
  }
  if (fuel.includes('hybrid') || fuel.includes('hybride')) {
    return 'hybride';
  }
  if (fuel.includes('electric') || fuel.includes('électrique')) {
    return 'électrique';
  }
  if (fuel.includes('other')) {
    return 'hybride'; // ✅ Other = Hybride
  }
  
  return '';
}