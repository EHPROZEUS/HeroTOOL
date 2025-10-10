import React, { useState } from 'react';
import { FOURNISSEURS } from '../../config/constants';

const IMPORT_FORMATS = [
  { id: 'auto', name: 'Détection automatique' },
  { id: 'ned', name: 'Forcer NED' },
  { id: 'autossimo', name: 'Forcer AUTOSSIMO' },
  { id: 'servicebox', name: 'Forcer SERVICEBOX' },
  { id: 'partslink', name: 'Forcer PARTSLINK' },
  { id: 'renault', name: 'Forcer RENAULT' },
  { id: 'xpr', name: 'XPR DISTRIBUTION' },
  { id: 'standard', name: 'Format standard (Ref | Désignation | Qté | Prix)' }
];

const SOURCE_SYSTEMS = [
  { id: 'auto', label: 'Auto (détecter)' },
  { id: 'NED', label: 'NED' },
  { id: 'AUTOSSIMO', label: 'AUTOSSIMO' },
  { id: 'SERVICEBOX', label: 'SERVICEBOX' },
  { id: 'PARTSLINK', label: 'PARTSLINK' },
  { id: 'RENAULT', label: 'RENAULT' }
];

const SOURCE_FORCED_SUPPLIERS = {
  NED: 'NED',
  SERVICEBOX: 'XPR',
  RENAULT: 'GUEUDET',
  AUTOSSIMO: 'AUTOSSIMO'
};

// Générateur d'id simple
function uuid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

const ImportModule = ({ 
  showImportModule,
  setShowImportModule,
  importText,
  setImportText,
  parsedPieces,
  setParsedPieces,
  updateParsedPiece,
  removeParsedPiece,
  dispatchPieces,
  activeItems
}) => {
  const [selectedFormat, setSelectedFormat] = useState('auto');
  const [sourceSystem, setSourceSystem] = useState('auto');
  const [defaultFournisseur, setDefaultFournisseur] = useState('');
  const [globalForfait, setGlobalForfait] = useState('');
  const forcedSupplier = SOURCE_FORCED_SUPPLIERS[sourceSystem] || '';

  // Nouveau parseur prenant en compte les [Forfait: ...] et la saisie libre
  const parsePiecesText = (selectedFormat, sourceSystem, defaultFournisseur) => {
    const lines = importText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    let currentForfait = '';
    let forfaitsTrouves = false;
    const pieces = [];

    lines.forEach(line => {
      // Gestion du changement de forfait cible
      const forfaitMatch = line.match(/^\[Forfait\s*:\s*(.+)\]$/i);
      if (forfaitMatch) {
        currentForfait = forfaitMatch[1].trim();
        forfaitsTrouves = true;
        return;
      }

      // Split ligne (|, ;, tab)
      const parts = line.split(/\s*\|\s*|\t|;/).map(s => s.trim());
      let [reference, designation, quantity, prixUnitaire] = parts;

      // Saisie libre (1 champ = désignation, 2 = ref+désignation ou désignation+qte)
      if (parts.length === 1) {
        designation = parts[0];
        reference = '';
        quantity = '';
        prixUnitaire = '';
      } else if (parts.length === 2) {
        // Heuristique : si le premier champ ressemble à une quantité (num), alors c'est désignation + quantité
        if (/^\d+([,.]\d+)?$/.test(parts[1])) {
          designation = parts[0];
          quantity = parts[1];
          reference = '';
          prixUnitaire = '';
        } else {
          reference = parts[0];
          designation = parts[1];
          quantity = '';
          prixUnitaire = '';
        }
      } else if (parts.length === 3) {
        [reference, designation, quantity] = parts;
        prixUnitaire = '';
      }

      // Si pas de forfait dans la saisie, on utilisera le global
      let targetForfait = currentForfait || '';

      pieces.push({
        id: uuid(),
        reference: reference || '',
        designation: designation || '',
        quantity: quantity || '',
        prixUnitaire: prixUnitaire || '',
        targetForfait, // à finaliser plus tard
        fournisseur: forcedSupplier || defaultFournisseur || ''
      });
    });

    // Si aucun forfait trouvé dans la saisie, on propose le globalForfait
    if (!forfaitsTrouves && globalForfait) {
      pieces.forEach(piece => {
        piece.targetForfait = globalForfait;
      });
    }
    setParsedPieces(pieces);
  };

  const handleParsePieces = () => {
    parsePiecesText(selectedFormat, sourceSystem, defaultFournisseur);
  };
  
  const applyFournisseurToAll = (fournisseur) => {
    if (forcedSupplier) return;
    setDefaultFournisseur(fournisseur);
    if (parsedPieces.length > 0) {
      setParsedPieces(parsedPieces.map(p => ({ ...p, fournisseur })));
    }
  };

  const handleGlobalForfait = (e) => {
    setGlobalForfait(e.target.value);
    if (parsedPieces.length > 0) {
      setParsedPieces(parsedPieces.map(p => ({ ...p, targetForfait: e.target.value })));
    }
  };

  // Vérifie si au moins une pièce n'a pas de targetForfait
  const someNeedsForfait = parsedPieces.some(p => !p.targetForfait);

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
          {/* Étape 1 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Étape 1: Configurer l'importation</h3>
            
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Provenance
                </label>
                <select
                  value={sourceSystem}
                  onChange={(e) => setSourceSystem(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                >
                  {SOURCE_SYSTEMS.map(src => <option key={src.id} value={src.id}>{src.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Format interne
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                >
                  {IMPORT_FORMATS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fournisseur par défaut {forcedSupplier && '(forcé)'}
                </label>
                <select
                  value={forcedSupplier || defaultFournisseur}
                  disabled={!!forcedSupplier}
                  onChange={(e) => applyFournisseurToAll(e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none disabled:bg-gray-100 focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                >
                  {forcedSupplier ? (
                    <option value={forcedSupplier}>{forcedSupplier}</option>
                  ) : (
                    <>
                      <option value="">-- Aucun --</option>
                      {FOURNISSEURS.map(f => <option key={f} value={f}>{f}</option>)}
                    </>
                  )}
                </select>
                {forcedSupplier && (
                  <p className="text-[11px] mt-1 text-orange-700 font-semibold">
                    Fournisseur imposé par la source.
                  </p>
                )}
              </div>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Collez ici vos lignes pièces (multi-sources ou saisie libre).
Chaque ligne = 1 pièce. Vous pouvez utiliser :
- Réf | Désignation | Qté | Prix
- Désignation | Qté
- ou juste Désignation
Pour dispatcher dans plusieurs forfaits :
[Forfait: Vidange]
Filtre à huile | 1 | 10
Huile moteur 5W30 | 4 | 8
[Forfait: Freinage]
Plaquettes avant | 1 | 40
Disque avant | 2 | 35
Laisser vide pour choisir un forfait global.`}
              className="w-full h-48 px-4 py-3 border-2 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
              style={{ borderColor: '#FF6B35' }}
            />
            <div className="flex gap-3 mt-3 flex-wrap">
              <button
                onClick={handleParsePieces}
                className="px-6 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
                style={{ backgroundColor: '#FF6B35' }}
              >
                📋 Parser ({importText.split('\n').filter(l => l.trim()).length} lignes)
              </button>
              <button
                onClick={() => setImportText('')}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all text-sm"
              >
                Effacer
              </button>
            </div>
          </div>

          {/* Sélection d'un forfait global si besoin */}
          {parsedPieces.length > 0 && parsedPieces.every(p => !p.targetForfait) && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Aucun forfait détecté dans la saisie. Choisissez un forfait cible pour toutes les pièces :
              </label>
              <select
                value={globalForfait}
                onChange={handleGlobalForfait}
                className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#FF6B35' }}
              >
                <option value="">Choisir...</option>
                {activeItems.map(it => (
                  <option key={it.id} value={it.id}>{it.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Étape 2 */}
          {parsedPieces.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Étape 2: Vérifier et dispatcher ({parsedPieces.length} pièces)
              </h3>
              <div className="bg-white rounded-lg border-2 p-4 max-h-96 overflow-y-auto" style={{ borderColor: '#FF6B35' }}>
                {parsedPieces.map((piece, idx) => (
                  <div key={piece.id} className="mb-5 pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-white px-2 py-1 rounded text-xs font-bold"
                          style={{ backgroundColor: '#FF6B35' }}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {piece.reference || '(sans réf)'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeParsedPiece(piece.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Lignes simples verticales */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Référence</label>
                        <input
                          type="text"
                          value={piece.reference}
                          onChange={(e) => updateParsedPiece(piece.id, 'reference', e.target.value)}
                          className="w-full px-3 py-2 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          style={{ borderColor: '#FF6B35' }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Désignation</label>
                        <textarea
                          rows={2}
                          value={piece.designation}
                          onChange={(e) => updateParsedPiece(piece.id, 'designation', e.target.value)}
                          placeholder="Description détaillée..."
                          className="w-full px-3 py-2 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                          style={{ borderColor: '#FF6B35' }}
                        />
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold mb-1">Quantité</label>
                          <input
                            type="text"
                            value={piece.quantity}
                            onChange={(e) => updateParsedPiece(piece.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            style={{ borderColor: '#FF6B35' }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold mb-1">Prix Unit. HT</label>
                          <input
                            type="text"
                            value={piece.prixUnitaire || piece.unitPrice || ''}
                            onChange={(e) => updateParsedPiece(piece.id, 'prixUnitaire', e.target.value)}
                            className="w-full px-3 py-2 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            style={{ borderColor: '#FF6B35' }}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold mb-1">Forfait cible</label>
                          <select
                            value={piece.targetForfait}
                            onChange={(e) => updateParsedPiece(piece.id, 'targetForfait', e.target.value)}
                            className="w-full px-3 py-2 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            style={{ borderColor: '#FF6B35' }}
                          >
                            <option value="">Choisir...</option>
                            {activeItems.map(it => (
                              <option key={it.id} value={it.id}>{it.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={dispatchPieces}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-lg transition-all text-sm"
                  disabled={someNeedsForfait}
                  title={someNeedsForfait ? "Toutes les pièces doivent avoir un forfait cible." : ""}
                >
                  ✓ Dispatcher (pièces principales)
                </button>
                <button
                  onClick={() => { setImportText(''); setParsedPieces([]); setGlobalForfait(''); }}
                  className="px-5 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all text-sm"
                >
                  ↺ Réinitialiser
                </button>
              </div>
              {someNeedsForfait && (
                <div className="mt-2 text-red-600 text-sm">
                  Veuillez sélectionner un forfait cible pour chaque pièce avant de dispatcher.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportModule;
