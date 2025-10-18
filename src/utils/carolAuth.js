/**
 * Service d'authentification CAROL OAuth
 */

const CAROL_LOGIN_URL = '/api/carol-login';

export const loginToCAROL = async (username, password) => {
  try {
    console.log('🔐 Connexion à CAROL...');
    
    const response = await fetch(CAROL_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur de connexion' }));
      throw new Error(error.error || 'Identifiants invalides');
    }
    
    const data = await response.json();
    console.log('✅ Connexion CAROL réussie');
    
    // Sauvegarder le token
    if (data.token) {
      localStorage.setItem('carol_token', data.token);
      
      // Sauvegarder aussi le refresh token si disponible
      if (data.refresh_token) {
        localStorage.setItem('carol_refresh_token', data.refresh_token);
      }
      
      // Sauvegarder l'expiration
      if (data.expires_in) {
        const expiresAt = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('carol_token_expires_at', expiresAt.toString());
      }
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Erreur connexion CAROL:', error);
    throw error;
  }
};

export const logoutFromCAROL = async () => {
  try {
    localStorage.removeItem('carol_token');
    localStorage.removeItem('carol_refresh_token');
    localStorage.removeItem('carol_token_expires_at');
    console.log('✅ Déconnexion CAROL');
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
  }
};

export const getCAROLToken = () => {
  const token = localStorage.getItem('carol_token');
  const expiresAt = localStorage.getItem('carol_token_expires_at');
  
  // Vérifier si le token est expiré
  if (token && expiresAt) {
    if (Date.now() > parseInt(expiresAt)) {
      console.warn('⚠️ Token expiré');
      logoutFromCAROL();
      return null;
    }
  }
  
  return token;
};

export const isLoggedInToCAROL = () => {
  return !!getCAROLToken();
};