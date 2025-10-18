/**
 * Proxy de connexion CAROL
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

    console.log('🔐 Tentative de connexion CAROL:', username);

    // Appel à l'API de login CAROL
    const response = await fetch('https://www.carol.autohero.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur login CAROL:', response.status);
      
      return res.status(response.status).json({ 
        error: 'Identifiants invalides',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ Connexion CAROL réussie');

    // Extraire le token (selon la structure de la réponse CAROL)
    const token = data.token || data.accessToken || data.auth_token;

    return res.status(200).json({
      success: true,
      token: token,
      user: data.user || { username }
    });

  } catch (error) {
    console.error('❌ Erreur proxy login:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}