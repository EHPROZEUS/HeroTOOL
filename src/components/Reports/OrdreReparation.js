import React from 'react';
import { calculateVehicleAge, formatDateFr } from '../../utils/formatters';
import { getDefaultValues } from '../../utils/calculations';
import { DSP_ITEMS } from '../../config/constants';

const OrdreReparation = ({ 
  showOrdreReparation,
  setShowOrdreReparation,
  includeControleTechnique,
  setIncludeControleTechnique,
  includeContrevisite,
  setIncludeContrevisite,
  headerInfo,
  activeMecaniqueItems,
  activeDSPItems,
  forfaitData,
  pieceLines,
  totals,
  moByCategory,
  printOrdreReparation
}) => {
  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ordre de réparation</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeControleTechnique}
              onChange={(e) => setIncludeControleTechnique(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contrôle Technique (42€)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeContrevisite}
              onChange={(e) => setIncludeContrevisite(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contre-visite (+10€)</span>
          </label>
          <button 
            onClick={() => setShowOrdreReparation(!showOrdreReparation)}
            className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {showOrdreReparation ? 'Masquer' : 'Générer'} l'ordre
          </button>
        </div>
      </div>

      {showOrdreReparation && (
        <div id="ordre-reparation-content" className="bg-white border-4 rounded-xl p-8 shadow-2xl" style={{ borderColor: '#FF6B35' }}>
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#FF6B35' }}>ORDRE DE RÉPARATION</h1>
            <p className="text-gray-600">Document généré le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          {includeContrevisite && (
            <div className="mb-8 p-4 border-2 rounded-lg" style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B35' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="text-lg font-bold" style={{ color: '#FF6B35' }}>CONTRE-VISITE REQUISE</p>
                  <p className="text-sm text-gray-800">Le véhicule nécessite une contre-visite du contrôle technique</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF0E6' }}>
              Informations Véhicule
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {headerInfo.lead && (
                <div className="flex">
                  <span className="font-bold w-40">Client:</span>
                  <span>{headerInfo.lead}</span>
                </div>
              )}
              {headerInfo.immatriculation && (
                <div className="flex">
                  <span className="font-bold w-40">Immatriculation:</span>
                  <span>{headerInfo.immatriculation}</span>
                </div>
              )}
              {headerInfo.vin && (
                <div className="flex">
                  <span className="font-bold w-40">VIN:</span>
                  <span className="text-xs">{headerInfo.vin}</span>
                </div>
              )}
              {headerInfo.kilometres && (
                <div className="flex">
                  <span className="font-bold w-40">Kilomètres:</span>
                  <span>{headerInfo.kilometres} km</span>
                </div>
              )}
              {headerInfo.dateVehicule && (
                <div className="flex">
                  <span className="font-bold w-40">Âge du véhicule:</span>
                  <span>{calculateVehicleAge(headerInfo.dateVehicule)}</span>
                </div>
              )}
              {headerInfo.dateVehicule && (
                <div className="flex">
                  <span className="font-bold w-40">Mise en circulation:</span>
                  <span>{formatDateFr(headerInfo.dateVehicule)}</span>
                </div>
              )}
              {headerInfo.moteur && (
                <div className="flex">
                  <span className="font-bold w-40">Moteur:</span>
                  <span className="capitalize">{headerInfo.moteur}</span>
                </div>
              )}
              {headerInfo.boite && (
                <div className="flex">
                  <span className="font-bold w-40">Boîte:</span>
                  <span className="capitalize">
                    {headerInfo.boite === 'auto/cvt' ? 'Auto/CVT' : headerInfo.boite === 'dct' ? 'DCT' : headerInfo.boite}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF0E6' }}>
              Détail des Opérations
            </h2>
            
            <table className="w-full border-collapse border-2 border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Type</th>
                  <th className="border border-gray-300 p-2 text-left">Référence</th>
                  <th className="border border-gray-300 p-2 text-left">Désignation</th>
                  <th className="border border-gray-300 p-2 text-left">Catégorie MO</th>
                  <th className="border border-gray-300 p-2 text-right">Quantité</th>
                  <th className="border border-gray-300 p-2 text-right">Prix Unit. HT</th>
                  <th className="border border-gray-300 p-2 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {activeMecaniqueItems.map(item => {
                  const forfait = forfaitData[item.id] || {};
                  const defaults = getDefaultValues(item.id);
                  
                  const moQuantity = forfait.moQuantity !== undefined ? forfait.moQuantity : defaults.moQuantity;
                  const pieceReference = forfait.pieceReference !== undefined ? forfait.pieceReference : defaults.pieceReference;
                  const pieceQuantity = forfait.pieceQuantity !== undefined ? forfait.pieceQuantity : defaults.pieceQuantity;
                  const piecePrix = forfait.piecePrix !== undefined ? forfait.piecePrix : defaults.piecePrix;
                  
                  const moCategory = forfait.moCategory || 'Mécanique';
                  
                  return (
                    <React.Fragment key={item.id}>
                      <tr style={{ backgroundColor: '#FFE4D6' }}>
                        <td colSpan="7" className="border border-gray-300 p-2 font-bold">{item.label}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">Main d'œuvre</td>
                        <td className="border border-gray-300 p-2">-</td>
                        <td className="border border-gray-300 p-2">{forfait.moDesignation || 'Temps de travail'}</td>
                        <td className="border border-gray-300 p-2">{moCategory}</td>
                        <td className="border border-gray-300 p-2 text-right">{moQuantity} h</td>
                        <td className="border border-gray-300 p-2 text-right">-</td>
                        <td className="border border-gray-300 p-2 text-right">-</td>
                      </tr>
                      {item.id !== 'miseANiveau' && pieceReference && (
                        <tr>
                          <td className="border border-gray-300 p-2">Pièce</td>
                          <td className="border border-gray-300 p-2">{pieceReference}</td>
                          <td className="border border-gray-300 p-2">{forfait.pieceDesignation || '-'}</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2 text-right">{pieceQuantity}</td>
                          <td className="border border-gray-300 p-2 text-right">{forfait.piecePrixUnitaire || '-'} €</td>
                          <td className="border border-gray-300 p-2 text-right">{piecePrix} €</td>
                        </tr>
                      )}
                      {pieceLines[item.id]?.map((line, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-300 p-2">Pièce suppl.</td>
                          <td className="border border-gray-300 p-2">{line.reference}</td>
                          <td className="border border-gray-300 p-2">{line.designation || '-'}</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2 text-right">{line.quantity}</td>
                          <td className="border border-gray-300 p-2 text-right">{line.prixUnitaire || '-'} €</td>
                          <td className="border border-gray-300 p-2 text-right">{line.prix} €</td>
                        </tr>
                      ))}
                      {item.id === 'filtreHuile' && forfait.consommableReference && (
                        <tr>
                          <td className="border border-gray-300 p-2">Consommable</td>
                          <td className="border border-gray-300 p-2">{forfait.consommableReference}</td>
                          <td className="border border-gray-300 p-2">{forfait.consommableDesignation || 'Huile moteur'}</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2 text-right">{forfait.consommableQuantity} L</td>
                          <td className="border border-gray-300 p-2 text-right">{forfait.consommablePrixUnitaire || '-'} €</td>
                          <td className="border border-gray-300 p-2 text-right">{forfait.consommablePrix} €</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {includeControleTechnique && (
                  <>
                    <tr style={{ backgroundColor: '#FFE4D6' }}>
                      <td colSpan="7" className="border border-gray-300 p-2 font-bold">Contrôle Technique</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Prestation extérieure</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2">Contrôle technique obligatoire</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2 text-right">1</td>
                      <td className="border border-gray-300 p-2 text-right">42.00 €</td>
                      <td className="border border-gray-300 p-2 text-right">42.00 €</td>
                    </tr>
                  </>
                )}
                {includeContrevisite && (
                  <tr>
                    <td className="border border-gray-300 p-2">Prestation extérieure</td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2 bg-orange-50 font-semibold">Contre-visite</td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2 text-right">1</td>
                    <td className="border border-gray-300 p-2 text-right">10.00 €</td>
                    <td className="border border-gray-300 p-2 text-right">10.00 €</td>
                  </tr>
                )}
                
                {/* Section DSP */}
                {activeDSPItems.length > 0 && (
                  <>
                    <tr style={{ backgroundColor: '#DBEAFE' }}>
                      <td colSpan="7" className="border border-gray-300 p-3 font-bold text-blue-600 text-lg">
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
                          <td className="border border-gray-300 p-2 text-right">{dspConfig.moQuantity} h</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF0E6' }}>
              Récapitulatif Financier
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Main d'œuvre:</span>
                  <span>{totals.totalMO} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Pièces:</span>
                  <span>{totals.totalPieces} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Consommables:</span>
                  <span>{totals.totalConsommables} €</span>
                </div>
                <div className="border-t-2 border-gray-400 pt-2 mt-2"></div>
                <div className="flex justify-between text-xl font-bold" style={{ color: '#FF6B35' }}>
                  <span>TOTAL HT (sans prestations ext.):</span>
                  <span>{totals.totalHTSansPrestations} €</span>
                </div>
                {includeControleTechnique && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Contrôle Technique:</span>
                    <span>42.00 €</span>
                  </div>
                )}
                {includeContrevisite && (
                  <div className="flex justify-between bg-orange-50 px-2 py-1 rounded">
                    <span className="font-semibold">Contre-visite:</span>
                    <span>10.00 €</span>
                  </div>
                )}
                <div className="border-t-2 pt-2 mt-2" style={{ borderColor: '#FF6B35' }}></div>
                <div className="flex justify-between text-2xl font-bold" style={{ color: '#FF6B35' }}>
                  <span>TOTAL HT:</span>
                  <span>{totals.totalHT} €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={printOrdreReparation}
              className="print-button px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg"
            >
              🖨️ Imprimer l'ordre de réparation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdreReparation;