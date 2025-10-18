import React, { useState } from 'react';
import { 
  fetchRefurbishmentFromCAROL, 
  isValidVehicleId, 
  extractIdFromURL 
} from '../../utils/carolApi';

const CAROLImport = ({ onImportSuccess }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openCAROL = () => {
    window.open('https://www.carol.autohero.com', '_blank');
  };

  const handleImport = async () => {
    setError('');
    
    if (!input.trim()) {
      setError('⚠️ Veuillez entrer un UUID ou une URL CAROL');
      return;
    }

    setLoading(true);

    try {
      let vehicleId = input.trim();
      
      if (input.includes('http')) {
        const extractedId = extractIdFromURL(input);
        if (!extractedId) {
          throw new Error('URL invalide. UUID non trouvé.');
        }
        vehicleId = extractedId;
      }

      if (!isValidVehicleId(vehicleId)) {
        throw new Error('Format UUID invalide');
      }

      console.log('🚗 Import complet depuis CAROL:', vehicleId);

      const data = await fetchRefurbishmentFromCAROL(vehicleId);

      if (!data) {
        throw new Error('Aucune donnée reçue');
      }

      onImportSuccess(data);
      
      setInput('');
      setError('');
      
    } catch (err) {
      console.error('Erreur import CAROL:', err);
      
      if (err.message.includes('Non authentifié')) {
        setError('🔐 Connectez-vous à CAROL puis réessayez');
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
<div className="flex items-center gap-2">
  <h3 className="text-lg font-bold text-gray-800">
    🔗 Import automatique depuis CAROL
  </h3>
  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded">
    Work in Progress
  </span>
</div>
        
<button
  onClick={openCAROL}
  className="px-4 py-2 text-white rounded-lg font-semibold text-sm transition-all"
  style={{ backgroundColor: '#FF6B35' }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#E55A2B'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B35'}
>
  🔓 Ouvrir CAROL
</button>
      </div>

      <div className="mb-3 text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded border border-blue-300">
        ✨ <strong>Import intelligent :</strong> Véhicule + Tâches + Pièces en un clic
      </div>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="UUID ou URL CAROL..."
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
        <strong>💡 Ce qui sera importé :</strong>
        <ul className="mt-1 ml-4 list-disc space-y-1">
          <li>✅ Infos véhicule (VIN, immat, marque, modèle, km...)</li>
          <li>✅ Tâches de reconditionnement (activées automatiquement)</li>
        </ul>
      </div>
    </div>
  );
};

export default CAROLImport;