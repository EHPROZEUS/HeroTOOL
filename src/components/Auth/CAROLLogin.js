import React, { useState } from 'react';
import { loginToCAROL, logoutFromCAROL, isLoggedInToCAROL } from '../../utils/carolAuth';

const CAROLLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(isLoggedInToCAROL());

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginToCAROL(username, password);
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutFromCAROL();
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <div className="mb-6 p-4 rounded-xl border-2 border-green-300 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-green-800">Connecté à CAROL</p>
              <p className="text-sm text-green-600">Vous pouvez maintenant importer des véhicules</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm"
          >
            🔓 Déconnexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-xl border-2 border-orange-300 bg-orange-50">
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        🔐 Connexion CAROL
      </h3>
      
      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Identifiant CAROL
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="votre.email@auto1.com"
            className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            ❌ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
        </button>
      </form>

      <p className="text-xs text-gray-600 mt-3">
        💡 Utilisez vos identifiants CAROL habituels
      </p>
    </div>
  );
};

export default CAROLLogin;