import React, { useState } from 'react';
import { 
  fetchVehicleFromWKDA, 
  isValidWKDAId, 
  extractIdFromWKDAUrl 
} from '../../utils/wkdaApi';

const WKDAImport = ({ onImportSuccess }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    setError('');
    
    if (!input.trim()) {
      setError('⚠️ Veuillez entrer un UUID ou une URL WKDA');
      return;
    }

    setLoading(true);

    try {
      // Extraire l'UUID si c'est une URL
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
        throw new Error('Format UUID invalide. Format attendu: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
      }

      console.log('🚗 Import WKDA pour:', carId);

      // Récupérer les données
      const vehicleData = await fetchVehicleFromWKDA(carId);

      if (!vehicleData) {
        throw new Error('Aucune donnée reçue de WKDA');
      }

      // Succès : callback avec les données
      onImportSuccess(vehicleData);
      
      // Reset
      setInput('');
      setError('');
      
    } catch (err) {
      console.error('Erreur import WKDA:', err);
      setError(`❌ ${err.message}`);
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
    <div className="mb-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          🔗 Import depuis WKDA
        </label>
        
        <div className="flex gap-2">
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
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 <strong>Formats acceptés :</strong>
          <ul className="mt-1 ml-4 list-disc">
            <li>UUID direct: <code className="bg-gray-200 px-1 rounded">913c173c-fe77-...</code></li>
            <li>URL WKDA: <code className="bg-gray-200 px-1 rounded">https://admin.wkda.de/car/detail/...</code></li>
            <li>URL CAROL: <code className="bg-gray-200 px-1 rounded">https://www.carol.autohero.com/.../...</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WKDAImport;