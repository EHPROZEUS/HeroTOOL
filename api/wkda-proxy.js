/**
 * Proxy Vercel pour l'API WKDA
 * Contourne les restrictions CORS
 */

export default async function handler(req, res) {
  // Activer CORS pour votre domaine
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { carId } = req.query;

  if (!carId) {
    return res.status(400).json({ error: 'carId requis' });
  }

  try {
    console.log('🔍 Proxy WKDA - Récupération véhicule:', carId);

    // Appel à l'API WKDA depuis le serveur
    const response = await fetch(`https://admin.wkda.de/api/cars/${carId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Ajouter l'authentification si nécessaire
        // 'Authorization': `Bearer ${process.env.WKDA_API_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API WKDA:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: `Erreur WKDA: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Données WKDA récupérées');

    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Erreur proxy WKDA:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}