import React from 'react';
import { FOURNISSEURS } from '../../config/constants';
import { getDefaultValues } from '../../utils/calculations';
import { LUSTRAGE_ITEMS } from '../../config/constants';

const COMPACT_MODE = true;
const baseInput =
  'border-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 transition';
const compactInput = COMPACT_MODE
  ? 'px-2 py-1 text-[11px] leading-tight'
  : 'px-3 py-2 text-sm';
const designationInput = COMPACT_MODE
  ? 'px-3 py-2 text-[12px] leading-snug'
  : 'px-4 py-2 text-sm';
const borderStyle = { borderColor: '#FF6B35' };

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

  const moQuantity =
    forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity;
  const pieceReference =
    forfait.pieceReference !== undefined
      ? forfait.pieceReference
      : defaults.pieceReference;
  const pieceQuantity =
    forfait.pieceQuantity !== undefined
      ? forfait.pieceQuantity
      : defaults.pieceQuantity;
  const piecePrix =
    forfait.piecePrix !== undefined ? forfait.piecePrix : defaults.piecePrix;

  const isLustrageItem = LUSTRAGE_ITEMS.some(l => l.id === item.id);

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
    <div className="bg-gray-50 rounded-xl border-2 border-gray-300 p-5 mb-6">
      <h3 className="text-lg font-bold mb-3" style={{ color: '#FF6B35' }}>
        {item.label}
      </h3>

      {/* MO */}
      <div className="mb-4 pb-3 border-b border-gray-300">
        <span className="font-semibold block mb-2 text-sm">Main d'œuvre</span>
        <div className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-5">
            <label className="text-[10px] font-semibold">Désignation</label>
            <textarea
              rows={2}
              value={forfait.moDesignation || ''}
              onChange={e =>
                updateForfaitField(item.id, 'moDesignation', e.target.value)
              }
              placeholder="Temps de travail..."
              className={`${baseInput} ${designationInput} w-full resize-y min-h-[54px]`}
              style={borderStyle}
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-semibold">Catégorie</label>
            <select
              value={
                forfait.moCategory ||
                (isLustrageItem ? 'Lustrage' : 'Mécanique')
              }
              onChange={e =>
                updateForfaitField(item.id, 'moCategory', e.target.value)
              }
              className={`${baseInput} ${compactInput} w-full`}
              style={borderStyle}
            >
              <option value="Mécanique">Mécanique</option>
              <option value="Carrosserie">Carrosserie</option>
              <option value="Peinture">Peinture</option>
              <option value="DSP">DSP</option>
              <option value="Lustrage">Lustrage</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-semibold">Quantité (h)</label>
            <input
              type="text"
              value={moQuantity}
              onChange={e =>
                updateForfaitField(item.id, 'moQuantity', e.target.value)
              }
              className={`${baseInput} ${compactInput} w-full`}
              style={borderStyle}
            />
          </div>
          <div className="col-span-1">
            <label className="text-[10px] font-semibold block">PU HT</label>
            <input
              type="text"
              value="35.80"
              readOnly
              className="w-full px-2 py-1 border rounded text-[11px] bg-gray-100 font-semibold"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-semibold block">Total HT</label>
            <input
              type="text"
              value={((parseFloat(moQuantity) || 0) * 35.8).toFixed(2)}
              readOnly
              className="w-full px-2 py-1 border rounded text-[11px] bg-gray-100 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Pièce principale */}
      {item.id !== 'miseANiveau' && (
        <>
          <div className="mb-4 pb-3 border-b border-gray-300">
            <span className="font-semibold block mb-2 text-sm">Pièce</span>
            <div className="grid grid-cols-12 gap-3 mb-2 items-start">
              <div className="col-span-2">
                <label className="text-[10px] font-semibold">Référence</label>
                <input
                  type="text"
                  value={pieceReference}
                  onChange={e =>
                    updateForfaitField(item.id, 'pieceReference', e.target.value)
                  }
                  className={`${baseInput} ${compactInput} w-full max-w-[130px]`}
                  style={borderStyle}
                  placeholder="Réf."
                />
              </div>
              <div className="col-span-5">
                <label className="text-[10px] font-semibold">Désignation</label>
                <textarea
                  rows={2}
                  value={forfait.pieceDesignation || ''}
                  onChange={e =>
                    updateForfaitField(
                      item.id,
                      'pieceDesignation',
                      e.target.value
                    )
                  }
                  placeholder="Description..."
                  className={`${baseInput} ${designationInput} w-full resize-y min-h-[54px]`}
                  style={borderStyle}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-semibold">Qté</label>
                <input
                  type="text"
                  value={pieceQuantity}
                  onChange={e =>
                    handleQuantityChange(
                      item.id,
                      'pieceQuantity',
                      e.target.value
                    )
                  }
                  onBlur={e => {
                    if (
                      e.target.value === '' ||
                      parseFloat(e.target.value) < 1
                    ) {
                      updateForfaitField(item.id, 'pieceQuantity', '1');
                    }
                  }}
                  className={`${baseInput} ${compactInput} w-full max-w-[70px]`}
                  style={borderStyle}
                  placeholder="1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-semibold">PU HT</label>
                <input
                  type="text"
                  value={forfait.piecePrixUnitaire || ''}
                  onChange={e =>
                    updateForfaitField(
                      item.id,
                      'piecePrixUnitaire',
                      e.target.value
                    )
                  }
                  className={`${baseInput} ${compactInput} w-full`}
                  style={borderStyle}
                  placeholder="45.00"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-semibold">Total HT</label>
                <input
                  type="text"
                  value={piecePrix}
                  readOnly
                  className="w-full px-2 py-1 border rounded text-[11px] bg-gray-100 font-semibold"
                />
              </div>
            </div>

            {/* Pièces supplémentaires */}
            {pieceLines[item.id]?.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 mb-2 items-start"
              >
                <input
                  type="text"
                  value={line.reference}
                  onChange={e =>
                    updatePieceLine(item.id, index, 'reference', e.target.value)
                  }
                  placeholder="Réf."
                  className={`${baseInput} ${compactInput} col-span-2 max-w-[130px]`}
                  style={borderStyle}
                />
                <textarea
                  rows={2}
                  value={line.designation || ''}
                  onChange={e =>
                    updatePieceLine(
                      item.id,
                      index,
                      'designation',
                      e.target.value
                    )
                  }
                  placeholder="Description..."
                  className={`${baseInput} ${designationInput} col-span-5 resize-y min-h-[54px]`}
                  style={borderStyle}
                />
                <input
                  type="text"
                  value={line.quantity}
                  onChange={e =>
                    handleSupplementaryQuantityChange(
                      item.id,
                      index,
                      'quantity',
                      e.target.value
                    )
                  }
                  onBlur={e => {
                    if (
                      e.target.value === '' ||
                      parseFloat(e.target.value) < 1
                    ) {
                      updatePieceLine(item.id, index, 'quantity', '1');
                    }
                  }}
                  className={`${baseInput} ${compactInput} col-span-1 max-w-[70px]`}
                  style={borderStyle}
                  placeholder="1"
                />
                <input
                  type="text"
                  value={line.prixUnitaire || ''}
                  onChange={e =>
                    updatePieceLine(
                      item.id,
                      index,
                      'prixUnitaire',
                      e.target.value
                    )
                  }
                  placeholder="45.00"
                  className={`${baseInput} ${compactInput} col-span-2`}
                  style={borderStyle}
                />
                <div className="col-span-2 flex gap-2">
                  <input
                    type="text"
                    value={line.prix}
                    readOnly
                    className="w-full px-2 py-1 border rounded text-[11px] bg-gray-100 font-semibold"
                  />
                  <button
                    onClick={() => removePieceLine(item.id, index)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-[11px] hover:bg-red-600 transition"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}

            {canHaveMultiplePieces(item.id) && (
              <button
                onClick={() => addPieceLine(item.id)}
                className="mt-1 px-3 py-1 text-white rounded text-[11px] hover:opacity-90 transition"
                style={{ background: '#FF6B35' }}
              >
                + Ajouter une pièce
              </button>
            )}
          </div>

          {(item.id === 'filtreHuile' || isLustrageItem) && (
            <div>
              <span className="font-semibold block mb-2 text-sm">
                {item.id === 'filtreHuile'
                  ? 'Consommable (Huile)'
                  : 'Consommable (Lustrage)'}
              </span>
              <div className="grid grid-cols-12 gap-3 items-start">
                <input
                  type="text"
                  value={forfait.consommableReference || ''}
                  onChange={e =>
                    updateForfaitField(
                      item.id,
                      'consommableReference',
                      e.target.value
                    )
                  }
                  placeholder={item.id === 'filtreHuile' ? 'Huile 5W-30' : 'Réf'}
                  className="col-span-2 px-2 py-1 border rounded text-[11px] bg-orange-50"
                />
                <textarea
                  rows={2}
                  value={forfait.consommableDesignation || ''}
                  onChange={e =>
                    updateForfaitField(
                      item.id,
                      'consommableDesignation',
                      e.target.value
                    )
                  }
                  placeholder={
                    item.id === 'filtreHuile'
                      ? 'Huile moteur...'
                      : 'Produit lustrage...'
                  }
                  className="col-span-5 px-3 py-2 border rounded text-[12px] resize-y bg-orange-50 leading-snug"
                />
                <input
                  type="text"
                  value={forfait.consommableQuantity || ''}
                  onChange={e =>
                    handleQuantityChange(
                      item.id,
                      'consommableQuantity',
                      e.target.value
                    )
                  }
                  onBlur={e => {
                    if (
                      e.target.value === '' ||
                      parseFloat(e.target.value) < 1
                    ) {
                      updateForfaitField(
                        item.id,
                        'consommableQuantity',
                        '1'
                      );
                    }
                  }}
                  placeholder={item.id === 'filtreHuile' ? '4.5' : '1'}
                  className="col-span-1 px-2 py-1 border rounded text-[11px] bg-orange-50"
                />
                <input
                  type="text"
                  value={forfait.consommablePrixUnitaire || ''}
                  onChange={e =>
                    updateForfaitField(
                      item.id,
                      'consommablePrixUnitaire',
                      e.target.value
                    )
                  }
                  placeholder="7.50"
                  className="col-span-2 px-2 py-1 border rounded text-[11px] bg-orange-50"
                />
                <input
                  type="text"
                  value={forfait.consommablePrix || ''}
                  readOnly
                  className="col-span-2 px-2 py-1 border rounded text-[11px] bg-gray-100 font-semibold"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ForfaitForm;
