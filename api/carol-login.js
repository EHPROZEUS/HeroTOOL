/**
 * Proxy de connexion CAROL OAuth
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Identifiants requis' });
    }

    console.log('🔐 Tentative de connexion CAROL OAuth:', username);

    // Endpoint OAuth CAROL
    const response = await fetch('https://www.carol.autohero.com/api/v1/auth/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
        grant_type: 'password' // OAuth grant type
      })
    });

    console.log('📊 Statut CAROL:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur login CAROL:', response.status, errorText);
      
      let errorMessage = 'Identifiants invalides';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error_description || errorData.message || errorMessage;
      } catch (e) {
        // Impossible de parser l'erreur
      }
      
      return res.status(response.status).json({ 
        error: errorMessage,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Connexion CAROL réussie');

    // Extraire le token OAuth
    const token = data.access_token || data.token || data.accessToken;

    if (!token) {
      console.error('⚠️ Pas de token dans la réponse:', data);
      return res.status(500).json({ 
        error: 'Token non reçu',
        rawResponse: data
      });
    }

    return res.status(200).json({
      success: true,
      token: token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      user: {
        username: username
      }
    });

  } catch (error) {
    console.error('❌ Erreur proxy login:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message
    });
  }
}