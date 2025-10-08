import React, { useState } from 'react';
import { FOURNISSEURS } from '../../config/constants';

const COMPACT_MODE = true; // si tu mets false tu retrouves le style large

const IMPORT_FORMATS = [
  { id: 'auto', name: 'Détection automatique' },
  { id: 'ned', name: 'Forcer NED' },
  { id: 'autossimo', name: 'Forcer AUTOSSIMO' },
  { id: 'servicebox', name: 'Forcer SERVICEBOX' },
  { id: 'partslink', name: 'Forcer PARTSLINK' },
  { id: 'renault', name: 'Forcer RENAULT' },
  { id: 'xpr', name: 'XPR DISTRIBUTION' },
  { id: 'standard', name: 'Standard (Ref|Désig|Qté|Prix)' }
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

const baseInput =
  'border-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 transition';
const compactInput = COMPACT_MODE
  ? 'px-2 py-1 text-[11px] leading-tight'
  : 'px-3 py-2 text-sm';
const designationInput = COMPACT_MODE
  ? 'px-3 py-2 text-[12px] leading-snug'
  : 'px-4 py-2 text-sm';
const borderStyle = { borderColor: '#FF6B35' };

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
  const [sourceSystem, setSourceSystem] = useState('auto');
  const [defaultFournisseur, setDefaultFournisseur] = useState('');
  const forcedSupplier = SOURCE_FORCED_SUPPLIERS[sourceSystem] || '';

  const handleParsePieces = () => {
    parsePiecesText(selectedFormat, sourceSystem, defaultFournisseur);
  };

  const applyFournisseurToAll = fournisseur => {
    if (forcedSupplier) return;
    setDefaultFournisseur(fournisseur);
    if (parsedPieces.length) {
      setParsedPieces(parsedPieces.map(p => ({ ...p, fournisseur })));
    }
  };

  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Module d'Importation de Pièces
        </h2>
        <button
          onClick={() => setShowImportModule(!showImportModule)}
          className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
          style={{ background: '#FF6B35' }}
        >
          {showImportModule ? 'Masquer' : 'Ouvrir'} le module
        </button>
      </div>

      {showImportModule && (
        <div
          className="rounded-xl border-2 p-6 mb-8"
          style={{ background: '#FFF8F0', borderColor: '#FF6B35' }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Étape 1: Configurer l'importation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Provenance
                </label>
                <select
                  value={sourceSystem}
                  onChange={e => setSourceSystem(e.target.value)}
                  className={`${baseInput} ${compactInput} w-full`}
                  style={borderStyle}
                >
                  {SOURCE_SYSTEMS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Format interne
                </label>
                <select
                  value={selectedFormat}
                  onChange={e => setSelectedFormat(e.target.value)}
                  className={`${baseInput} ${compactInput} w-full`}
                  style={borderStyle}
                >
                  {IMPORT_FORMATS.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Fournisseur par défaut {forcedSupplier && '(forcé)'}
                </label>
                <select
                  value={forcedSupplier || defaultFournisseur}
                  disabled={!!forcedSupplier}
                  onChange={e => applyFournisseurToAll(e.target.value)}
                  className={`${baseInput} ${compactInput} w-full disabled:bg-gray-100`}
                  style={borderStyle}
                >
                  {forcedSupplier ? (
                    <option value={forcedSupplier}>{forcedSupplier}</option>
                  ) : (
                    <>
                      <option value="">-- Aucun --</option>
                      {FOURNISSEURS.map(f => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {forcedSupplier && (
                  <p className="text-[11px] mt-1 text-orange-700 font-semibold">
                    Fournisseur imposé.
                  </p>
                )}
              </div>
            </div>

            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Collez ici vos lignes..."
              className={`w-full h-40 font-mono ${baseInput} ${compactInput} resize-y`}
              style={borderStyle}
            />
            <div className="flex flex-wrap gap-3 mt-3">
              <button
                onClick={handleParsePieces}
                className="px-5 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
                style={{ background: '#FF6B35' }}
              >
                📋 Parser ({importText.split('\n').filter(l => l.trim()).length}{' '}
                lignes)
              </button>
              <button
                onClick={() => setImportText('')}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all text-sm"
              >
                Effacer
              </button>
            </div>
          </div>

          {parsedPieces.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Étape 2: Vérifier et dispatcher ({parsedPieces.length} pièces)
              </h3>
              <div
                className="bg-white rounded-lg border-2 p-3 max-h-96 overflow-y-auto"
                style={{ borderColor: '#FF6B35' }}
              >
                {parsedPieces.map((piece, idx) => (
                  <div
                    key={piece.id}
                    className="mb-4 pb-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-white px-2 py-[2px] rounded text-[10px] font-bold"
                          style={{ background: '#FF6B35' }}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {piece.reference || '(sans réf)'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeParsedPiece(piece.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-[11px] hover:bg-red-600 transition"
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-2">
                        <label className="text-[10px] font-semibold">
                          Référence *
                        </label>
                        <input
                          type="text"
                          value={piece.reference}
                          onChange={e =>
                            updateParsedPiece(
                              piece.id,
                              'reference',
                              e.target.value
                            )
                          }
                          className={`${baseInput} ${compactInput} w-full max-w-[130px]`}
                          style={borderStyle}
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="text-[10px] font-semibold">
                          Désignation
                        </label>
                        <textarea
                          rows={2}
                          value={piece.designation}
                          onChange={e =>
                            updateParsedPiece(
                              piece.id,
                              'designation',
                              e.target.value
                            )
                          }
                          placeholder="Description..."
                          className={`${baseInput} ${designationInput} w-full resize-y min-h-[50px]`}
                          style={borderStyle}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-semibold">Qté</label>
                        <input
                          type="text"
                          value={piece.quantity}
                          onChange={e =>
                            updateParsedPiece(
                              piece.id,
                              'quantity',
                              e.target.value
                            )
                          }
                          className={`${baseInput} ${compactInput} w-full max-w-[70px]`}
                          style={borderStyle}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-semibold">
                          PU HT
                        </label>
                        <input
                          type="text"
                          value={piece.prixUnitaire || piece.unitPrice || ''}
                          onChange={e =>
                            updateParsedPiece(
                              piece.id,
                              'prixUnitaire',
                              e.target.value
                            )
                          }
                          className={`${baseInput} ${compactInput} w-full`}
                          style={borderStyle}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-semibold">
                          Forfait *
                        </label>
                        <select
                          value={piece.targetForfait}
                          onChange={e =>
                            updateParsedPiece(
                              piece.id,
                              'targetForfait',
                              e.target.value
                            )
                          }
                          className={`${baseInput} ${compactInput} w-full`}
                          style={borderStyle}
                        >
                          <option value="">-</option>
                          {activeItems.map(it => (
                            <option key={it.id} value={it.id}>
                              {it.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={dispatchPieces}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow text-sm"
                >
                  ✓ Dispatcher (pièces principales)
                </button>
                <button
                  onClick={() => {
                    setImportText('');
                    setParsedPieces([]);
                  }}
                  className="px-5 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition text-sm"
                >
                  ↺ Réinitialiser
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
