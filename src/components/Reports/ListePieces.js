import React from 'react';

const ListePieces = ({ 
  showListePieces,
  setShowListePieces,
  headerInfo,
  piecesBySupplier,
  printListePieces
}) => {
  const suppliers = Object.keys(piecesBySupplier).sort();

  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Liste des Pièces à Commander</h2>
        <button 
          onClick={() => setShowListePieces(!showListePieces)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
        >
          {showListePieces ? 'Masquer' : 'Générer'} la liste
        </button>
      </div>

      {showListePieces && (
        <div id="liste-pieces-content" className="bg-white border-4 border-green-600 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-green-600 mb-2">LISTE DES PIÈCES À COMMANDER</h1>
            <p className="text-gray-600">Document généré le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-green-100 p-3 rounded-lg">
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
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-green-100 p-3 rounded-lg">
              Pièces par Fournisseur
            </h2>
            
            {suppliers.length === 0 ? (
              <p className="text-gray-600 italic">Aucune pièce à commander</p>
            ) : (
              suppliers.map(supplier => (
                <div key={supplier} className="mb-6">
                  <h3 className="text-lg font-bold text-white bg-green-600 p-3 rounded-t-lg">
                    Fournisseur: {supplier}
                  </h3>
                  <table className="w-full border-collapse border-2 border-gray-300 text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border border-gray-300 p-2 text-left">Référence</th>
                        <th className="border border-gray-300 p-2 text-left">Désignation</th>
                        <th className="border border-gray-300 p-2 text-right">Quantité</th>
                        <th className="border border-gray-300 p-2 text-right">Prix Unitaire HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {piecesBySupplier[supplier].map((piece, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">{piece.reference}</td>
                          <td className="border border-gray-300 p-2">{piece.designation || '-'}</td>
                          <td className="border border-gray-300 p-2 text-right">{piece.quantity}</td>
                          <td className="border border-gray-300 p-2 text-right">
                            {piece.unitPrice ? `${piece.unitPrice} €` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={printListePieces}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg"
            >
              🖨️ Imprimer la liste des pièces
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListePieces;
