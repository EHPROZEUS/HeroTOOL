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
  canHaveMultiplePieces 
}) => {
  const forfait = forfaitData[item.id] || {};
  const defaults = getDefaultValues(item.id);
  
  const moQuantity = forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity;
  const moPrix = defaults.moPrix;
  const pieceReference = forfait.pieceReference !== undefined ? forfait.pieceReference : defaults.pieceReference;
  const pieceQuantity = forfait.pieceQuantity !== undefined ? forfait.pieceQuantity : defaults.pieceQuantity;
  const piecePrix = forfait.piecePrix !== undefined ? forfait.piecePrix : defaults.piecePrix;
  
  const isLustrageItem = LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id);

  const handleQuantityChange = (itemId, field, value) => {
    if (value === '') {
      updateForfaitField(itemId, field, value);
      return;
    }
    const num = parseFloat(value);
    updateForfaitField(itemId, field, !isNaN(num) ? Math.max(1, num) : '1');
  };

  const handleSupplementaryQuantityChange = (itemId, index, field, value) => {
    if (value === '') {
      updatePieceLine(itemId, index, field, value);
      return;
    }
    const num = parseFloat(value);
    updatePieceLine(itemId, index, field, !isNaN(num) ? Math.max(1, num) : '1');
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
                value={forfait.moCategory || (isLustrageItem ? 'Lustrage' : 'Mécanique')} 
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
                value={moQuantity} 
                onChange={(e) => updateForfaitField(item.id, 'moQuantity', e.target.value)}
                placeholder={defaults.moQuantity} 
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
                value={((parseFloat(moQuantity) || 0) * 35.8).toFixed(2)} 
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
              <div>
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
              <div>
                <label className="text-xs font-semibold block mb-1">Désignation (agrandie)</label>
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
                    value={pieceQuantity} 
                    onChange={(e) => handleQuantityChange(item.id, 'pieceQuantity', e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === '' || parseFloat(e.target.value) < 1) {
                        updateForfaitField(item.id, 'pieceQuantity', '1');
                      }
                    }}
                    placeholder="1" 
                    className="w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
                    style={{ borderColor: '#FF6B35' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">Prix unitaire HT</label>
                  <input 
                    type="text" 
                    value={forfait.piecePrixUnitaire || ''} 
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
                    value={piecePrix} 
                    readOnly 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 font-semibold" 
                  />
                </div>
              </div>
            </div>

            {/* Pièces supplémentaires */}
            {pieceLines[item.id]?.map((line, index) => (
              <div key={index} className="mt-6 p-4 border rounded-lg bg-white space-y-4">
                <div>
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
                <div>
                  <label className="text-xs font-semibold block mb-1">Désignation (agrandie)</label>
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
                      onChange={(e) => handleSupplementaryQuantityChange(item.id, index, 'quantity', e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value === '' || parseFloat(e.target.value) < 1) {
                          updatePieceLine(item.id, index, 'quantity', '1');
                        }
                      }}
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
                        value={line.prix} 
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
            ))}

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
              <div>
                <label className="text-xs font-semibold block mb-1">Référence</label>
                <input 
                  type="text" 
                  value={forfait.consommableReference || ''} 
                  onChange={(e) => updateForfaitField(item.id, 'consommableReference', e.target.value)}
                  placeholder={item.id === 'filtreHuile' ? "Huile 5W-30" : "Référence produit"} 
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Désignation (agrandie)</label>
                <textarea 
                  rows={2}
                  value={forfait.consommableDesignation || ''} 
                  onChange={(e) => updateForfaitField(item.id, 'consommableDesignation', e.target.value)}
                  placeholder={item.id === 'filtreHuile' ? "Huile moteur..." : "Produit lustrage..."} 
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
                    onChange={(e) => handleQuantityChange(item.id, 'consommableQuantity', e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value === '' || parseFloat(e.target.value) < 1) {
                        updateForfaitField(item.id, 'consommableQuantity', '1');
                      }
                    }}
                    placeholder={item.id === 'filtreHuile' ? "4.5" : "1"} 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-orange-50" 
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold block mb-1">Prix unitaire HT</label>
                  <input 
                    type="text" 
                    value={forfait.consommablePrixUnitaire || ''} 
                    onChange={(e) => updateForfaitField(item.id, 'consommablePrixUnitaire', e.target.value)}
                    placeholder={item.id === 'filtreHuile' ? "7.50" : "15.00"} 
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
