import React from 'react';
import { FOURNISSEURS } from '../../config/constants';

/**
 * Formulaire de forfait pour REPC et REMPC
 * Structure : Pièces + Main d'œuvre (pas de consommables)
 */
const ForfaitCarrosserieForm = ({ 
  item, 
  forfaitData, 
  pieceLines, 
  updateForfaitField, 
  addPieceLine, 
  removePieceLine, 
  updatePieceLine
}) => {
  const forfait = forfaitData[item.id] || {};
  
  // Valeurs par défaut
  const moQuantity = forfait.moQuantity || '0';
  const moCategory = forfait.moCategory || 'Carrosserie';
  const pieceReference = forfait.pieceReference || '';
  const pieceDesignation = forfait.pieceDesignation || '';
  const pieceQuantity = forfait.pieceQuantity || '1';
  const piecePrixUnitaire = forfait.piecePrixUnitaire || '';
  const pieceFournisseur = forfait.pieceFournisseur || '';

  // Calcul automatique du prix total de la pièce
  const qty = parseFloat(pieceQuantity) || 0;
  const pu = parseFloat(piecePrixUnitaire) || 0;
  const piecePrixTotal = (qty > 0 && pu > 0) ? (qty * pu).toFixed(2) : '';

  // Calcul du total MO
  const moQty = parseFloat(moQuantity) || 0;
  const moTotal = (moQty * 35.8).toFixed(2);

  // Pièces supplémentaires
  const supplementaryPieces = pieceLines[item.id] || [];

  return (
    <div className="bg-orange-50 rounded-xl border-2 border-orange-300 p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-orange-700">{item.label}</h3>

      {/* Main d'œuvre */}
      <div className="mb-6 pb-6 border-b-2 border-orange-200">
        <span className="font-semibold block mb-4 text-orange-600">Main d'œuvre</span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold block mb-1">Désignation</label>
            <textarea
              rows={2}
              value={forfait.moDesignation || ''}
              onChange={(e) => updateForfaitField(item.id, 'moDesignation', e.target.value)}
              placeholder="Description du travail..."
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Quantité (heures)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={moQuantity}
              onChange={(e) => updateForfaitField(item.id, 'moQuantity', e.target.value)}
              className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Total HT</label>
            <input
              type="text"
              value={`${moTotal} €`}
              readOnly
              className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Pièce principale */}
      <div className="mb-6">
        <span className="font-semibold block mb-4 text-orange-600">Pièce principale</span>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Référence</label>
              <input
                type="text"
                value={pieceReference}
                onChange={(e) => updateForfaitField(item.id, 'pieceReference', e.target.value)}
                placeholder="Référence pièce..."
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Désignation</label>
              <input
                type="text"
                value={pieceDesignation}
                onChange={(e) => updateForfaitField(item.id, 'pieceDesignation', e.target.value)}
                placeholder="Désignation pièce..."
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Fournisseur</label>
              <select
                value={pieceFournisseur}
                onChange={(e) => updateForfaitField(item.id, 'pieceFournisseur', e.target.value)}
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Sélectionner...</option>
                {FOURNISSEURS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Quantité</label>
              <input
                type="number"
                min="0"
                step="1"
                value={pieceQuantity}
                onChange={(e) => updateForfaitField(item.id, 'pieceQuantity', e.target.value)}
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Prix unitaire HT</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={piecePrixUnitaire}
                onChange={(e) => updateForfaitField(item.id, 'piecePrixUnitaire', e.target.value)}
                className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Total HT</label>
              <input
                type="text"
                value={piecePrixTotal ? `${piecePrixTotal} €` : '-'}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pièces supplémentaires */}
      {supplementaryPieces.length > 0 && (
        <div className="mb-4">
          <span className="font-semibold block mb-4 text-orange-600">Pièces supplémentaires</span>
          <div className="space-y-3">
            {supplementaryPieces.map((piece, index) => {
              const suppQty = parseFloat(piece.quantity) || 0;
              const suppPU = parseFloat(piece.prixUnitaire) || 0;
              const suppTotal = (suppQty > 0 && suppPU > 0) ? (suppQty * suppPU).toFixed(2) : '';

              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end bg-white p-3 rounded-lg border border-orange-200">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Référence</label>
                    <input
                      type="text"
                      value={piece.reference || ''}
                      onChange={(e) => updatePieceLine(item.id, index, 'reference', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Désignation</label>
                    <input
                      type="text"
                      value={piece.designation || ''}
                      onChange={(e) => updatePieceLine(item.id, index, 'designation', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Fournisseur</label>
                    <select
                      value={piece.fournisseur || ''}
                      onChange={(e) => updatePieceLine(item.id, index, 'fournisseur', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">-</option>
                      {FOURNISSEURS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Qté</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={piece.quantity || ''}
                      onChange={(e) => updatePieceLine(item.id, index, 'quantity', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">P.U. HT</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={piece.prixUnitaire || ''}
                      onChange={(e) => updatePieceLine(item.id, index, 'prixUnitaire', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-semibold block mb-1">Total</label>
                      <input
                        type="text"
                        value={suppTotal ? `${suppTotal} €` : '-'}
                        readOnly
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100 font-semibold"
                      />
                    </div>
                    <button
                      onClick={() => removePieceLine(item.id, index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-semibold"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => addPieceLine(item.id)}
        className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm"
      >
        + Ajouter une pièce
      </button>
    </div>
  );
};

export default ForfaitCarrosserieForm;