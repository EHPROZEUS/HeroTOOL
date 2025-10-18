/**
 * Service d'authentification CAROL
 */

const CAROL_LOGIN_URL = '/api/carol-login';
const CAROL_LOGOUT_URL = '/api/carol-logout';

/**
 * Connexion à CAROL
 * @param {string} username - Identifiant CAROL
 * @param {string} password - Mot de passe CAROL
 * @returns {Promise<Object>}
 */
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
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur de connexion');
    }
    
    const data = await response.json();
    console.log('✅ Connexion CAROL réussie');
    
    // Sauvegarder le token
    if (data.token) {
      localStorage.setItem('carol_token', data.token);
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Erreur connexion CAROL:', error);
    throw error;
  }
};

/**
 * Déconnexion de CAROL
 */
export const logoutFromCAROL = async () => {
  try {
    localStorage.removeItem('carol_token');
    
    await fetch(CAROL_LOGOUT_URL, {
      method: 'POST'
    });
    
    console.log('✅ Déconnexion CAROL');
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
  }
};

/**
 * Récupérer le token CAROL
 */
export const getCAROLToken = () => {
  return localStorage.getItem('carol_token');
};

/**
 * Vérifier si connecté
 */
export const isLoggedInToCAROL = () => {
  return !!getCAROLToken();
};