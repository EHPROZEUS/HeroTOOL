import React, { useState } from 'react';
import { 

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


</div>
        




      </div>
      
      <div className="flex gap-2">
        <div class="div1">Coller le lead puis appuyer sur TAB:
        </div>
<p class="texte-entre">Import auto des smart et carrosserie.</p>
<div class="div2">(N'importe pas les remplacements ni les covering)</div>

      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-3">
          {error}
        </div>
      )}


    </div>
  );
};

export default CAROLImport;