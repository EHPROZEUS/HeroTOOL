import React from 'react';
import { safeNum, formatNum } from '../../utils/dataValidator';
import { DSP_ITEMS, LUSTRAGE_ITEMS } from '../../config/constants';
import { 
  OBLIGATORY_PRESTATIONS, 
  OBLIGATORY_CLEANING 
} from '../../utils/moCalculator';

const OROperationsTable = ({
  pureActiveMecaniqueItems = [],
  activeDSPItems = [],
  activeLustrageItems = [],
  activePlumeItems = [],
  forfaitData = {},
  includeControleTechnique,
  includeContrevisite
}) => {
  return (
    <div className="mb-6">
      <h2 
        className="text-lg font-bold text-gray-800 mb-3 p-2 rounded-lg"
        style={{ backgroundColor: '#FFF0E6' }}
      >
        Détail des Opérations
      </h2>

      <table className="w-full border-collapse border-2 border-gray-300 text-xs">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 p-2 text-left text-xs">Type</th>
            <th className="border border-gray-300 p-2 text-left text-xs">Référence</th>
            <th className="border border-gray-300 p-2 text-left text-xs">Désignation</th>
            <th className="border border-gray-300 p-2 text-left text-xs">Catégorie MO</th>
            <th className="border border-gray-300 p-2 text-right text-xs">Quantité</th>
            <th className="border border-gray-300 p-2 text-right text-xs">Prix Unit. HT</th>
            <th className="border border-gray-300 p-2 text-right text-xs">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {/* === CONTROLE TECHNIQUE === */}
          {includeControleTechnique && (
            <>
              <tr style={{ backgroundColor: '#E6F0FA' }}>
                <td colSpan="7" className="border border-gray-300 p-2 font-bold text-blue-700">
                  Contrôle Technique
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Prestation</td>
                <td className="border border-gray-300 p-2">-</td>
                <td className="border border-gray-300 p-2 bg-blue-50 font-semibold">
                  Contrôle Technique
                </td>
                <td className="border border-gray-300 p-2">-</td>
                <td className="border border-gray-300 p-2 text-right">1</td>
                <td className="border border-gray-300 p-2 text-right">42.00 €</td>
                <td className="border border-gray-300 p-2 text-right">42.00 €</td>
              </tr>
            </>
          )}

          {/* === CONTRE-VISITE === */}
          {includeContrevisite && (
            <>
              <tr style={{ backgroundColor: '#FFF3CD' }}>
                <td colSpan="7" className="border border-gray-300 p-2 font-bold text-amber-700">
                  Contre-visite
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Prestation</td>
                <td className="border border-gray-300 p-2">-</td>
                <td className="border border-gray-300 p-2 bg-orange-50 font-semibold">
                  Contre-visite
                </td>
                <td className="border border-gray-300 p-2">-</td>
                <td className="border border-gray-300 p-2 text-right">1</td>
                <td className="border border-gray-300 p-2 text-right">10.00 €</td>
                <td className="border border-gray-300 p-2 text-right">10.00 €</td>
              </tr>
            </>
          )}

          {/* === PRESTATIONS OBLIGATOIRES === */}
          {OBLIGATORY_PRESTATIONS.length > 0 && (
            <>
              <tr style={{ backgroundColor: '#D1E7DD' }}>
                <td colSpan="7" className="border border-gray-300 p-2 font-bold text-green-700">
                  Prestations Obligatoires
                </td>
              </tr>
              {OBLIGATORY_PRESTATIONS.map(item => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.type}</td>
                  <td className="border border-gray-300 p-2">{item.reference}</td>
                  <td className="border border-gray-300 p-2">{item.designation}</td>
                  <td className="border border-gray-300 p-2">{item.moCategory}</td>
                  <td className="border border-gray-300 p-2 text-right">{item.moQuantity} h</td>
                  <td className="border border-gray-300 p-2 text-right">-</td>
                  <td className="border border-gray-300 p-2 text-right">-</td>
                </tr>
              ))}
            </>
          )}

          {/* === NETTOYAGE INTERIEUR/EXTERIEUR === */}
          {OBLIGATORY_CLEANING.length > 0 && (
            <>
              <tr style={{ backgroundColor: '#FCE4EC' }}>
                <td colSpan="7" className="border border-gray-300 p-2 font-bold text-pink-700">
                  Nettoyage Intérieur/Extérieur
                </td>
              </tr>
              {OBLIGATORY_CLEANING.map(item => (
                <React.Fragment key={item.id}>
                  {/* Main d'oeuvre */}
                  <tr>
                    <td className="border border-gray-300 p-2">{item.type}</td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2">{item.mo.designation}</td>
                    <td className="border border-gray-300 p-2">{item.mo.moCategory}</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {item.mo.moQuantity} h
                    </td>
                    <td className="border border-gray-300 p-2 text-right">-</td>
                    <td className="border border-gray-300 p-2 text-right">-</td>
                  </tr>

                  {/* Consommable */}
                  <tr>
                    <td className="border border-gray-300 p-2">{item.type}</td>
                    <td className="border border-gray-300 p-2">{item.consommable.reference}</td>
                    <td className="border border-gray-300 p-2">{item.consommable.designation}</td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {item.consommable.quantity}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatNum(item.consommable.unitPrice)} €
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatNum(item.consommable.totalPrice)} €
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </>
          )}

          {/* === PRESTATIONS MÉCANIQUE === */}
          {pureActiveMecaniqueItems.filter(item => !item.id.startsWith('plu')).length > 0 && (
            <>
              <tr style={{ backgroundColor: '#E0E7FF' }}>
                <td colSpan="7" className="border border-gray-300 p-2 font-bold text-indigo-700">
                  Prestations Mécanique
                </td>
              </tr>
              {pureActiveMecaniqueItems.map(item => {
                const forfait = forfaitData?.[item.id];
                if (!forfait || item.id.startsWith('plu')) return null;

                return (
                  <React.Fragment key={item.id}>
                    {/* Ligne de prestation */}
                    <tr className="bg-gray-100">
                      <td colSpan="7" className="p-2 border-none font-semibold">
                        {item.label || 'Prestation'}
                      </td>
                    </tr>

                    {/* Main d'oeuvre */}
                    {safeNum(forfait.moQuantity) > 0 && (
                      <tr>
                        <td className="border border-gray-300 p-2">MO</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2">{item.label}</td>
                        <td className="border border-gray-300 p-2">Mécanique</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {safeNum(forfait.moQuantity).toFixed(2)} h
                        </td>
                        <td className="border border-gray-300 p-2 text-right">-</td>
                        <td className="border border-gray-300 p-2 text-right">-</td>
                      </tr>
                    )}

                    {/* Pièce */}
                    {safeNum(forfait.pieceQuantity) > 0 && (
                      <tr>
                        <td className="border border-gray-300 p-2">Pièce</td>
                        <td className="border border-gray-300 p-2">{forfait.pieceReference || '-'}</td>
                        <td className="border border-gray-300 p-2">{forfait.pieceDesignation || item.label}</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {safeNum(forfait.pieceQuantity).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {formatNum(forfait.piecePrixUnitaire)} €
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {formatNum(forfait.piecePrix)} €
                        </td>
                      </tr>
                    )}

                    {/* Consommable */}
                    {safeNum(forfait.consommableQuantity) > 0 && (
                      <tr>
                        <td className="border border-gray-300 p-2">Consommable</td>
                        <td className="border border-gray-300 p-2">{forfait.consommableReference || 'CONSO'}</td>
                        <td className="border border-gray-300 p-2">{forfait.consommableDesignation || 'Consommables'}</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {safeNum(forfait.consommableQuantity).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {formatNum(forfait.consommablePrixUnitaire)} €
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {formatNum(forfait.consommablePrix)} €
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* === SECTION DSP === */}
          {activeDSPItems.length > 0 && (
            <>
              <tr style={{ backgroundColor: '#DBEAFE' }}>
                <td colSpan="7" className="border border-gray-300 p-2 font-bold text-blue-600">
                  SMART - DSP
                </td>
              </tr>
              {activeDSPItems.map(dspItem => {
                const dspConfig = DSP_ITEMS.find(item => item.id === dspItem.id);
                if (!dspConfig) return null;

                return (
                  <tr key={dspItem.id}>
                    <td className="border border-gray-300 p-2">Main d'œuvre DSP</td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2">{dspConfig.label}</td>
                    <td className="border border-gray-300 p-2">DSP</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {dspConfig.moQuantity} h
                    </td>
                    <td className="border border-gray-300 p-2 text-right">-</td>
                    <td className="border border-gray-300 p-2 text-right">-</td>
                  </tr>
                );
              })}
            </>
          )}

          {/* === SECTION LUSTRAGE === */}
          {activeLustrageItems.length > 0 && (
            <>
              <tr style={{ backgroundColor: '#FEF3C7' }}>
                <td colSpan="7" className="border border-gray-300 p-2 font-bold text-amber-600">
                  SMART - LUSTRAGE
                </td>
              </tr>
              {activeLustrageItems.map(lustrageItem => {
                const lustrageConfig = LUSTRAGE_ITEMS.find(item => item.id === lustrageItem.id);
                const forfait = forfaitData?.[lustrageItem.id];
                if (!lustrageConfig) return null;

                return (
                  <React.Fragment key={lustrageItem.id}>
                    {/* MO Lustrage */}
                    <tr>
                      <td className="border border-gray-300 p-2">MO Lustrage</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2">{lustrageConfig.label}</td>
                      <td className="border border-gray-300 p-2">Lustrage</td>
                      <td className="border border-gray-300 p-2 text-right">
                        {lustrageConfig.moQuantity} h
                      </td>
                      <td className="border border-gray-300 p-2 text-right">-</td>
                      <td className="border border-gray-300 p-2 text-right">-</td>
                    </tr>
                    {/* Consommable */}
                    {(forfait?.consommableQuantity > 0 || lustrageConfig.consommable > 0) && (
                      <tr>
                        <td className="border border-gray-300 p-2">Consommable</td>
                        <td className="border border-gray-300 p-2">CONSO</td>
                        <td className="border border-gray-300 p-2">Produits de lustrage</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2 text-right">
                          {safeNum(forfait?.consommableQuantity || lustrageConfig.consommable).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          1.00 €
                        </td>
                        <td className="border border-gray-300 p-2 text-right">
                          {formatNum(safeNum(forfait?.consommableQuantity || lustrageConfig.consommable) * 1.00)} €
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}

{/* === SECTION SMART - PLUMES === */}
{activePlumeItems.length > 0 && (
  <>
    <tr style={{ backgroundColor: '#FFE4B5' }}>
      <td colSpan="7" className="border border-gray-300 p-2 font-bold text-orange-700">
        SMART - PLUMES
      </td>
    </tr>
    {activePlumeItems.map(item => {
      const forfait = forfaitData?.[item.id];
      if (!forfait) return null;

      return (
        <React.Fragment key={item.id}>
          {/* Main d'oeuvre */}
          {safeNum(forfait.moQuantity) > 0 && (
            <tr>
              <td className="border border-gray-300 p-2">MO</td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2">{item.label}</td>
              <td className="border border-gray-300 p-2">Plume</td>
              <td className="border border-gray-300 p-2 text-right">
                {safeNum(forfait.moQuantity).toFixed(2)} h
              </td>
              <td className="border border-gray-300 p-2 text-right">-</td>
              <td className="border border-gray-300 p-2 text-right">-</td>
            </tr>
          )}

          {/* Pièce */}
          {safeNum(forfait.pieceQuantity) > 0 && (
            <tr>
              <td className="border border-gray-300 p-2">Pièce</td>
              <td className="border border-gray-300 p-2">{forfait.pieceReference || '-'}</td>
              <td className="border border-gray-300 p-2">{forfait.pieceDesignation || item.label}</td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">
                {safeNum(forfait.pieceQuantity).toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatNum(forfait.piecePrixUnitaire)} €
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatNum(forfait.piecePrix)} €
              </td>
            </tr>
          )}

          {/* Consommable */}
          {safeNum(forfait.consommableQuantity) > 0 && (
            <tr>
              <td className="border border-gray-300 p-2">Consommable</td>
              <td className="border border-gray-300 p-2">{forfait.consommableReference || 'CONSO'}</td>
              <td className="border border-gray-300 p-2">{forfait.consommableDesignation || 'Consommables'}</td>
              <td className="border border-gray-300 p-2">-</td>
              <td className="border border-gray-300 p-2 text-right">
                {safeNum(forfait.consommableQuantity).toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatNum(forfait.consommablePrixUnitaire)} €
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatNum(forfait.consommablePrix)} €
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })}
  </>
)}
        </tbody>  
      </table>  
    </div>
  );
};

export default OROperationsTable;