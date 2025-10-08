import React, { useState } from 'react';
import { FOURNISSEURS } from '../../config/constants';

const IMPORT_FORMATS = [
  { id: 'auto', name: 'Détection automatique' },
  { id: 'xpr', name: 'XPR DISTRIBUTION' },
  { id: 'standard', name: 'Format standard (Ref | Désignation | Qté | Prix)' },
  { id: 'fournisseur', name: 'Format fournisseur complet' },
  { id: 'or', name: 'Format ordre réparation' }
];

const ImportModule = ({ 
  showImportModule,
  setShowImportModule,
  importText,
  setImportText,
  parsedPieces,
  setParsedPieces,
  parsePiecesText,
  updateParsedPiece,
  removeParsedPiece,
  dispatchPieces,
  activeItems
}) => {
  const [selectedFormat, setSelectedFormat] = useState('auto');
  const [defaultFournisseur, setDefaultFournisseur] = useState('');
  
  // Fonction modifiée pour prendre en compte le format sélectionné
  const handleParsePieces = () => {
    // On passe le format sélectionné à la fonction de parsing
    parsePiecesText(selectedFormat, defaultFournisseur);
  };
  
  // Fonction pour appliquer le fournisseur à toutes les pièces
  const applyFournisseurToAll = (fournisseur) => {
    setDefaultFournisseur(fournisseur);
    if (parsedPieces.length > 0) {
      const updatedPieces = parsedPieces.map(piece => ({
        ...piece,
        fournisseur: fournisseur
      }));
      setParsedPieces(updatedPieces);
    }
  };

  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Module d'Importation de Pièces</h2>
        <button 
          onClick={() => setShowImportModule(!showImportModule)}
          className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {showImportModule ? 'Masquer' : 'Ouvrir'} le module
        </button>
      </div>

      {showImportModule && (
        <div className="rounded-xl border-2 p-6 mb-8" style={{ backgroundColor: '#FFF8F0', borderColor: '#FF6B35' }}>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Étape 1: Configurer l'importation</h3>
            
            {/* Nouveaux sélecteurs de format et fournisseur */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format des données
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                >
                  {IMPORT_FORMATS.map(format => (
                    <option key={format.id} value={format.id}>{format.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fournisseur par défaut (appliqué à toutes les pièces)
                </label>
                <select
                  value={defaultFournisseur}
                  onChange={(e) => applyFournisseurToAll(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                >
                  <option value="">-- Sélectionner un fournisseur --</option>
                  {FOURNISSEURS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold text-blue-900 mb-2">Formats acceptés :</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ <strong>XPR DISTRIBUTION</strong> - Copiez directement les lignes du tableau de commande</li>
                <li>✓ Tableaux copiés depuis un site web (avec tabulations)</li>
                <li>✓ Format fournisseur : Ref | Fournisseur | Désignation | Délai | Qté | Prix unit. | Remises | Total</li>
                <li>✓ Format ordre réparation : Ref | Désignation | Qté | PC/MO | Prix</li>
                <li>✓ Format simple : Ref ; Désignation ; Qté ; Prix (séparés par ; , ou tabulation)</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2 italic">Astuce: Sélectionnez les lignes dans votre tableau et collez-les directement !</p>
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Collez ici votre tableau de pièces...&#10;&#10;Format XPR DISTRIBUTION:&#10;1654515380    KIT COURROIE DISTRI COMPLET    W    1    V    ...    190.62 EUR    38.00%    118.1[...]"
              className="w-full h-40 px-4 py-3 border-2 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#FF6B35' }}
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleParsePieces}
                className="px-6 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: '#FF6B35' }}
              >
                📋 Parser les pièces ({importText.split('\n').filter(l => l.trim()).length} lignes)
              </button>
              <button
                onClick={() => setImportText('')}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
              >
                Effacer
              </button>
            </div>
          </div>

          {parsedPieces.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Étape 2: Vérifier et dispatcher ({parsedPieces.length} pièces détectées)
              </h3>
              <div className="bg-white rounded-lg border-2 p-4 max-h-96 overflow-y-auto" style={{ borderColor: '#FF6B35' }}>
                <div className="mb-3 p-3 bg-green-50 border border-green-300 rounded">
                  <p className="text-sm font-semibold text-green-800">
                    ✓ {parsedPieces.length} pièce(s) parsée(s) avec succès !
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Vérifiez les données ci-dessous, sélectionnez les fournisseurs et forfaits cibles, puis cliquez sur "Dispatcher".
                  </p>
                </div>
                
                {parsedPieces.map((piece, idx) => (
                  <div key={piece.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="text-white px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: '#FF6B35' }}
                      >
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Référence *</label>
                        <input
                          type="text"
                          value={piece.reference}
                          onChange={(e) => updateParsedPiece(piece.id, 'reference', e.target.value)}
                          className="w-full px-2 py-1 border-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                          style={{ borderColor: '#FF6B35' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Désignation</label>
                        <input
                          type="text"
                          value={piece.designation}
                          onChange={(e) => updateParsedPiece(piece.id, 'designation', e.target.value)}
                          className="w-full px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          style={{ borderColor: '#FF6B35' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Quantité</label>
                        <input
                          type="text"
                          value={piece.quantity}
                          onChange={(e) => updateParsedPiece(piece.id, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          style={{ borderColor: '#FF6B35' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Prix Unit.</label>
                        <input
                          type="text"
                          value={piece.unitPrice}
                          onChange={(e) => updateParsedPiece(piece.id, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          style={{ borderColor: '#FF6B35' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Fournisseur</label>
                        <select
                          value={piece.fournisseur}
                          onChange={(e) => updateParsedPiece(piece.id, 'fournisseur', e.target.value)}
                          className="w-full px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          style={{ borderColor: '#FF6B35' }}
                        >
                          <option value="">-</option>
                          {FOURNISSEURS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700">Forfait cible *</label>
                        <div className="flex gap-1">
                          <select
                            value={piece.targetForfait}
                            onChange={(e) => updateParsedPiece(piece.id, 'targetForfait', e.target.value)}
                            className="w-full px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            style={{ borderColor: '#FF6B35' }}
                          >
                            <option value="">Choisir...</option>
                            {activeItems.map(item => (
                              <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeParsedPiece(piece.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-all"
                            title="Supprimer cette pièce"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={dispatchPieces}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-lg transition-all"
                >
                  ✓ Dispatcher toutes les pièces dans les forfaits
                </button>
                <button
                  onClick={() => { 
                    setImportText(''); 
                    setParsedPieces([]); 
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  ↺ Réinitialiser tout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportModule;
