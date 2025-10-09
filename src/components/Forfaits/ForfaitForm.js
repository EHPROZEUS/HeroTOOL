import React from 'react';
import { FOURNISSEURS } from '../../config/constants';
import { getDefaultValues } from '../../utils/calculations';
import { LUSTRAGE_ITEMS } from '../../config/constants';

const ForfaitForm = ({ 
  item, 
  forfaitData, 
  pieceLines, 
  updateForfaitField, 
  addPieceLine, 
  removePieceLine, 
  updatePieceLine,
  canHaveMultiplePieces,
  moDefaultCategory
}) => {
  const forfait = forfaitData[item.id] || {};
  const defaults = getDefaultValues(item.id);

  const isLustrageItem = LUSTRAGE_ITEMS.some(l => l.id === item.id);

  // Initialiser la catégorie par défaut si absente
  React.useEffect(() => {
    if (!forfait.moCategory && moDefaultCategory) {
      updateForfaitField(item.id, 'moCategory', moDefaultCategory);
    }
  }, [item.id, forfait.moCategory, moDefaultCategory, updateForfaitField]);

  // Valeurs brutes
  const moQuantityRaw = forfait.moQuantity ?? defaults.moQuantity;
  const pieceReference = forfait.pieceReference ?? defaults.pieceReference;
  const pieceQuantityRaw = forfait.pieceQuantity ?? defaults.pieceQuantity;
  const piecePUraw = forfait.piecePrixUnitaire ?? '';
  const storedPiecePrix = forfait.piecePrix ?? defaults.piecePrix;
  const pieceFournisseur = forfait.pieceFournisseur ?? (defaults.pieceFournisseur || '');

  // Parsing pour affichage dynamique
  const qtyNum = parseFloat(pieceQuantityRaw);
  const puNum = parseFloat(piecePUraw);
  const moQtyNum = parseFloat(moQuantityRaw);
  const computedPieceTotal = (!isNaN(qtyNum) && qtyNum > 0 && !isNaN(puNum) && puNum >= 0)
    ? (qtyNum * puNum).toFixed(2)
    : '';

  const displayPieceTotal = computedPieceTotal || (storedPiecePrix || '');

  const handleQuantityChange = (itemId, field, value) => {
    updateForfaitField(itemId, field, value);
  };

  const handleSupplementaryQuantityChange = (itemId, index, field, value) => {
    updatePieceLine(itemId, index, field, value);
  };

  return (
    <div className="bg-gray-50 rounded-xl border-2 border-gray-300 p-6 mb-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: '#FF6B35' }}>{item.label}</h3>

      {/* Main d'œuvre */}
      <div className="mb-6 pb-6 border-b border-gray-300">
        <span className="font-semibold block mb-4">Main d'œuvre</span>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Désignation</label>
            <textarea
              rows={2}
              value={forfait.moDesignation || ''}
              onChange={(e) => updateForfaitField(item.id, 'moDesignation', e.target.value)}
              placeholder="Temps de travail..."
              className="w-full px-3 py-2 border-2 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#FF6B35' }}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold block mb-1">Catégorie</label>
              <select
                value={forfait.moCategory || moDefaultCategory || (isLustrageItem ? 'Lustrage' : 'Mécanique')}
                onChange={(e) => updateForfaitField(item.id, 'moCategory', e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#FF6B35' }}
              >
                <option value="Mécanique">Mécanique</option>
                <option value="Carrosserie">Carrosserie</option>
                <option value="Peinture">Peinture</option>
                <option value="DSP">DSP</option>
                <option value="Lustrage">Lustrage</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold block mb-1">Quantité (heures)</label>
              <input
                type="text"
                value={moQuantityRaw}
                onChange={(e) => updateForfaitField(item.id, 'moQuantity', e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#FF6B35' }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold block mb-1">Prix unitaire HT</label>
              <input
                type="text"
                value="35.80"
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold block mb-1">Total HT</label>
              <input
                type="text"
                value={((!isNaN(moQtyNum) ? moQtyNum : 0) * 35.8).toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pièce principale */}
      {item.id !== 'miseANiveau' && (
        <>
          <div className="mb-6 pb-6 border-b border-gray-300">
            <span className="font-semibold block mb-4">Pièce principale</span>

            <div className="space-y-4">
              <div className="w-full max-w-[180px]">
                <label className="text-xs font-semibold block mb-1">Référence</label>
                <input
                  type="text"
                  value={pieceReference}
                  onChange={(e) => updateForfaitField(item.id, 'pieceReference', e.target.value)}
                  placeholder="Référence..."
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                />
              </div>

              <div className="w-full max-w-[220px]">
                <label className="text-xs font-semibold block mb-1">Fournisseur</label>
                <select
                  value={pieceFournisseur}
                  onChange={(e) => updateForfaitField(item.id, 'pieceFournisseur', e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                >
                  <option value="">-</option>
                  {FOURNISSEURS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Désignation</label>
                <textarea
                  rows={2}
                  value={forfait.pieceDesignation || ''}
                  onChange={(e) => updateForfaitField(item.id, 'pieceDesignation', e.target.value)}
                  placeholder="Description..."
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ borderColor: '#FF6B35' }}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">Quantité</label>
                  <input
                    type="text"
                    value={pieceQuantityRaw}
                    onChange={(e) => handleQuantityChange(item.id, 'pieceQuantity', e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#FF6B35' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">Prix unitaire HT</label>
                  <input
                    type="text"
                    value={piecePUraw}
                    onChange={(e) => updateForfaitField(item.id, 'piecePrixUnitaire', e.target.value)}
                    placeholder="45.00"
                    className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ borderColor: '#FF6B35' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">Total HT</label>
                  <input
                    type="text"
                    value={displayPieceTotal}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Pièces supplémentaires */}
            {pieceLines[item.id]?.map((line, index) => {
              const lQty = parseFloat(line.quantity);
              const lPU = parseFloat(line.prixUnitaire);
              const lTotal = (!isNaN(lQty) && lQty > 0 && !isNaN(lPU) && lPU >= 0)
                ? (lQty * lPU).toFixed(2)
                : line.prix || '';

              return (
                <div key={index} className="mt-6 p-4 border rounded-lg bg-white space-y-4">
                  <div className="w-full max-w-[180px]">
                    <label className="text-xs font-semibold block mb-1">Référence</label>
                    <input
                      type="text"
                      value={line.reference}
                      onChange={(e) => updatePieceLine(item.id, index, 'reference', e.target.value)}
                      placeholder="Référence..."
                      className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ borderColor: '#FF6B35' }}
                    />
                  </div>

                  <div className="w-full max-w-[220px]">
                    <label className="text-xs font-semibold block mb-1">Fournisseur</label>
                    <select
                      value={line.fournisseur || ''}
                      onChange={(e) => updatePieceLine(item.id, index, 'fournisseur', e.target.value)}
                      className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ borderColor: '#FF6B35' }}
                    >
                      <option value="">-</option>
                      {FOURNISSEURS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Désignation</label>
                    <textarea
                      rows={2}
                      value={line.designation || ''}
                      onChange={(e) => updatePieceLine(item.id, index, 'designation', e.target.value)}
                      placeholder="Description..."
                      className="w-full px-3 py-2 border-2 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ borderColor: '#FF6B35' }}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-semibold block mb-1">Quantité</label>
                      <input
                        type="text"
                        value={line.quantity}
                        onChange={(e) => updatePieceLine(item.id, index, 'quantity', e.target.value)}
                        placeholder="1"
                        className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{ borderColor: '#FF6B35' }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold block mb-1">Prix unitaire HT</label>
                      <input
                        type="text"
                        value={line.prixUnitaire || ''}
                        onChange={(e) => updatePieceLine(item.id, index, 'prixUnitaire', e.target.value)}
                        placeholder="45.00"
                        className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{ borderColor: '#FF6B35' }}
                      />
                    </div>
                    <div className="flex-1 flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-semibold block mb-1">Total HT</label>
                        <input
                          type="text"
                          value={lTotal}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
                        />
                      </div>
                      <button
                        onClick={() => removePieceLine(item.id, index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all h-[42px] mt-auto"
                      >
                        -
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {canHaveMultiplePieces(item.id) && (
              <button
                onClick={() => addPieceLine(item.id)}
                className="mt-4 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: '#FF6B35' }}
              >
                + Ajouter une pièce
              </button>
            )}
          </div>

          {/* Consommables */}
          {(item.id === 'filtreHuile' || isLustrageItem) && (
            <div className="space-y-4">
              <span className="font-semibold block mb-2">
                {item.id === 'filtreHuile' ? 'Consommable (Huile)' : 'Consommable (Lustrage)'}
              </span>
              <div className="w-full max-w-[180px]">
                <label className="text-xs font-semibold block mb-1">Référence</label>
                <input
                  type="text"
                  value={forfait.consommableReference || ''}
                  onChange={(e) => updateForfaitField(item.id, 'consommableReference', e.target.value)}
                  placeholder={item.id === 'filtreHuile' ? 'Huile 5W-30' : 'Réf produit'}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Désignation</label>
                <textarea
                  rows={2}
                  value={forfait.consommableDesignation || ''}
                  onChange={(e) => updateForfaitField(item.id, 'consommableDesignation', e.target.value)}
                  placeholder={item.id === 'filtreHuile' ? 'Huile moteur...' : 'Produit lustrage...'}
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-y bg-orange-50"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">
                    {item.id === 'filtreHuile' ? 'Quantité (litres)' : 'Quantité'}
                  </label>
                  <input
                    type="text"
                    value={forfait.consommableQuantity || ''}
                    onChange={(e) => updateForfaitField(item.id, 'consommableQuantity', e.target.value)}
                    placeholder={item.id === 'filtreHuile' ? '4.5' : '1'}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">Prix unitaire HT</label>
                  <input
                    type="text"
                    value={forfait.consommablePrixUnitaire || ''}
                    onChange={(e) => updateForfaitField(item.id, 'consommablePrixUnitaire', e.target.value)}
                    placeholder={item.id === 'filtreHuile' ? '7.50' : '15.00'}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">Total HT</label>
                  <input
                    type="text"
                    value={forfait.consommablePrix || ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ForfaitForm;