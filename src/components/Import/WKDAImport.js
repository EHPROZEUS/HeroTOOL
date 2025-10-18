import React, { useState } from 'react';
import { fetchVehicleFromCAROL, fetchVehicleFromCAROLPage, isValidVehicleId, extractIdFromURL } from '../../utils/carolApi';

const WKDAImport = ({ onImportSuccess }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openCAROL = () => {
    window.open('https://www.carol.autohero.com', '_blank');
  };

  const handleImport = async () => {
    setError('');
    
    if (!input.trim()) {
      setError('⚠️ Veuillez entrer un UUID ou une URL');
      return;
    }

    setLoading(true);

    try {
      // Extraire l'UUID
      let vehicleId = input.trim();
      
      if (input.includes('http')) {
        const extractedId = extractIdFromURL(input);
        if (!extractedId) {
          throw new Error('URL invalide. UUID non trouvé.');
        }
        vehicleId = extractedId;
      }

      // Valider le format UUID
      if (!isValidVehicleId(vehicleId)) {
        throw new Error('Format UUID invalide');
      }

      console.log('🚗 Import véhicule:', vehicleId);

      // Essayer d'abord l'API, puis fallback sur la page
      let vehicleData;
      
      try {
        vehicleData = await fetchVehicleFromCAROL(vehicleId);
      } catch (apiError) {
        console.log('⚠️ API échouée, tentative extraction page...');
        vehicleData = await fetchVehicleFromCAROLPage(vehicleId);
      }

      if (!vehicleData) {
        throw new Error('Aucune donnée reçue');
      }

      // Succès
      onImportSuccess(vehicleData);
      setInput('');
      setError('');
      
    } catch (err) {
      console.error('Erreur import:', err);
      
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('🔐 Connectez-vous d\'abord à CAROL/WKDA Admin puis réessayez');
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
          🔗 Import depuis CAROL / WKDA
        </h3>
        
        <button
          onClick={openCAROL}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm"
        >
          🔓 Ouvrir CAROL
        </button>
      </div>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="UUID ou URL CAROL/WKDA..."
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
        <strong>💡 Mode d'emploi :</strong>
        <ol className="mt-1 ml-4 list-decimal space-y-1">
          <li>Connectez-vous à <strong>CAROL</strong> ou <strong>WKDA Admin</strong></li>
          <li>Copiez l'UUID du véhicule ou l'URL complète</li>
          <li>Collez-le ici et cliquez sur "Importer"</li>
        </ol>
      </div>
    </div>
  );
};

export default WKDAImport;
