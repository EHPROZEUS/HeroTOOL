import React, { useState } from 'react';
import { 
  fetchVehicleFromWKDA, 
  isValidWKDAId, 
  extractIdFromWKDAUrl,
  checkWKDAAuth
} from '../../utils/wkdaApi';

const WKDAImport = ({ onImportSuccess }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Vérifier l'authentification au montage
  React.useEffect(() => {
    checkWKDAAuth().then(setIsAuthenticated);
  }, []);

  const openWKDA = () => {
    window.open('https://admin.wkda.de', '_blank');
  };

  const handleImport = async () => {
    setError('');
    
    if (!input.trim()) {
      setError('⚠️ Veuillez entrer un UUID ou une URL WKDA');
      return;
    }

    setLoading(true);

    try {
      // Extraire l'UUID
      let carId = input.trim();
      
      if (input.includes('http') || input.includes('wkda') || input.includes('carol')) {
        const extractedId = extractIdFromWKDAUrl(input);
        if (!extractedId) {
          throw new Error('URL invalide. UUID non trouvé.');
        }
        carId = extractedId;
      }

      // Valider le format UUID
      if (!isValidWKDAId(carId)) {
        throw new Error('Format UUID invalide');
      }

      console.log('🚗 Import WKDA pour:', carId);

      // Récupérer les données
      const vehicleData = await fetchVehicleFromWKDA(carId);

      if (!vehicleData) {
        throw new Error('Aucune donnée reçue de WKDA');
      }

      // Succès
      onImportSuccess(vehicleData);
      setInput('');
      setError('');
      setIsAuthenticated(true);
      
    } catch (err) {
      console.error('Erreur import WKDA:', err);
      
      // Message d'erreur personnalisé
      if (err.message.includes('Non authentifié')) {
        setError('🔐 Vous devez être connecté à WKDA Admin');
        setIsAuthenticated(false);
      } else {
        setError(`❌ ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleImport();
    }
  };

  return (
    <div className="mb-6 p-4 rounded-xl border-2 border-blue-300 bg-blue-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">
          🔗 Import depuis WKDA Admin
        </h3>
        
        {isAuthenticated === false && (
          <button
            onClick={openWKDA}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm"
          >
            🔓 Se connecter à WKDA
          </button>
        )}
      </div>

      {/* Statut de connexion */}
      {isAuthenticated !== null && (
        <div className={`mb-3 text-sm px-3 py-2 rounded ${
          isAuthenticated 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-orange-100 text-orange-800 border border-orange-300'
        }`}>
          {isAuthenticated ? (
            <>✅ Connecté à WKDA Admin</>
          ) : (
            <>⚠️ Non connecté à WKDA. Cliquez sur "Se connecter à WKDA" puis revenez ici.</>
          )}
        </div>
      )}
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="UUID ou URL WKDA/CAROL..."
          className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        
        <button
          onClick={handleImport}
          disabled={loading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '⏳ Import...' : '📥 Importer'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-3">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-600">
        <strong>💡 Formats acceptés :</strong>
        <ul className="mt-1 ml-4 list-disc space-y-1">
          <li>UUID : <code className="bg-white px-1 rounded">913c173c-fe77-...</code></li>
          <li>URL WKDA : <code className="bg-white px-1 rounded">https://admin.wkda.de/car/detail/...</code></li>
          <li>URL CAROL : <code className="bg-white px-1 rounded">https://www.carol.autohero.com/.../...</code></li>
        </ul>
      </div>
    </div>
  );
};

export default WKDAImport;