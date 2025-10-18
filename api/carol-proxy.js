/**
 * Proxy Vercel pour l'API CAROL GraphQL avec authentification
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { query, variables } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query GraphQL requise' });
    }

    // ✅ Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    console.log('🔍 Proxy CAROL GraphQL:', token ? 'avec token' : 'sans token');

    // Headers pour l'API CAROL
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // ✅ Ajouter le token si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('https://www.carol.autohero.com/api/v1/refurbishment-aggregation/graphql', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API CAROL:', response.status);
      
      return res.status(response.status).json({ 
        error: `Erreur CAROL: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Données CAROL récupérées');

    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Erreur proxy CAROL:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}