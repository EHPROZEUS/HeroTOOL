import React from 'react';

/**
 * ListePieces
 * Réécriture robuste :
 * - Tolère piecesBySupplier vide / mal formé
 * - Affiche un tableau global (avec fournisseur) + sections par fournisseur
 * - Met en évidence les fournisseurs "Non défini"
 * - Evite les crash en cas de champs manquants
 *
 * IMPORTANT : Pour que les fournisseurs principaux apparaissent bien,
 * il faut que dispatchPieces alimente forfaitData.pieceFournisseur.
 * (Patch déjà communiqué : ajouter pieceFournisseur lors du dispatch).
 */
const ListePieces = ({
  showListePieces,
  setShowListePieces,
  headerInfo = {},
  piecesBySupplier = {},
  printListePieces
}) => {
  // Normalisation défensive
  const safeSuppliers = Object.keys(piecesBySupplier || {}).filter(
    k => Array.isArray(piecesBySupplier[k]) && piecesBySupplier[k].length > 0
  );

  // Aplatir toutes les pièces pour un tableau global
  const flatPieces = safeSuppliers.flatMap(supp =>
    (piecesBySupplier[supp] || []).map(p => ({
      fournisseur: supp,
      reference: p.reference || '',
      designation: p.designation || '',
      quantity: p.quantity || '',
      unitPrice: p.unitPrice || ''
    }))
  );

  // Totaux (si prix unitaires numériques)
  const totalBySupplier = {};
  flatPieces.forEach(p => {
    const key = p.fournisseur || 'Non défini';
    const qty = parseFloat(p.quantity) || 0;
    const pu = parseFloat(
      (p.unitPrice || '').toString().replace(',', '.')
    );
    const total = !isNaN(pu) ? qty * pu : 0;
    if (!totalBySupplier[key]) totalBySupplier[key] = { qty: 0, mt: 0 };
    totalBySupplier[key].qty += qty;
    totalBySupplier[key].mt += total;
  });

  const grandTotalQty = Object.values(totalBySupplier).reduce(
    (acc, v) => acc + v.qty,
    0
  );
  const grandTotalMt = Object.values(totalBySupplier).reduce(
    (acc, v) => acc + v.mt,
    0
  );

  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Liste des Pièces à Commander
        </h2>
        <button
          onClick={() => setShowListePieces(!showListePieces)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
        >
          {showListePieces ? 'Masquer' : 'Générer'} la liste
        </button>
      </div>

      {showListePieces && (
        <div
          id="liste-pieces-content"
          className="bg-white border-4 border-green-600 rounded-xl p-8 shadow-2xl"
        >
          {/* En-tête */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              LISTE DES PIÈCES À COMMANDER
            </h1>
            <p className="text-gray-600">
              Document généré le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Informations véhicule */}
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
                  <span className="text-xs break-all">{headerInfo.vin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tableau global */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-green-100 p-3 rounded-lg">
              Tableau Global (avec Fournisseur)
            </h2>
            {flatPieces.length === 0 ? (
              <p className="text-gray-600 italic">
                Aucune pièce disponible (vérifiez que pieceFournisseur est bien
                alimenté lors du dispatch).
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-300 text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left">
                        Fournisseur
                      </th>
                      <th className="border border-gray-300 p-2 text-left">
                        Référence
                      </th>
                      <th className="border border-gray-300 p-2 text-left">
                        Désignation
                      </th>
                      <th className="border border-gray-300 p-2 text-right">
                        Qté
                      </th>
                      <th className="border border-gray-300 p-2 text-right">
                        PU HT
                      </th>
                      <th className="border border-gray-300 p-2 text-right">
                        Total HT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatPieces.map((p, i) => {
                      const qty = parseFloat(p.quantity) || 0;
                      const pu = parseFloat(
                        (p.unitPrice || '').toString().replace(',', '.')
                      );
                      const total =
                        !isNaN(pu) && qty
                          ? (qty * pu).toFixed(2)
                          : '-';
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td
                            className={`border border-gray-300 p-2 font-medium ${
                              p.fournisseur === 'Non défini'
                                ? 'text-red-600'
                                : ''
                            }`}
                          >
                            {p.fournisseur}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {p.reference}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {p.designation || '-'}
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            {p.quantity}
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            {p.unitPrice ? `${p.unitPrice} €` : '-'}
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            {total === '-' ? '-' : `${total} €`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50 font-semibold">
                      <td
                        colSpan={3}
                        className="border border-gray-300 p-2 text-right"
                      >
                        Totaux
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {grandTotalQty.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        -
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {grandTotalMt.toFixed(2)} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            {flatPieces.some(p => p.fournisseur === 'Non défini') && (
              <p className="mt-2 text-xs text-red-600">
                Astuce : Assure-toi que dispatchPieces ajoute
                pieceFournisseur pour les pièces principales importées.
              </p>
            )}
          </div>

          {/* Sections par fournisseur */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-green-100 p-3 rounded-lg">
              Pièces par Fournisseur (groupées)
            </h2>

            {safeSuppliers.length === 0 ? (
              <p className="text-gray-600 italic">
                Aucune pièce à afficher par fournisseur.
              </p>
            ) : (
              safeSuppliers
                .sort((a, b) => a.localeCompare(b))
                .map(supplier => {
                  const rows = piecesBySupplier[supplier] || [];
                  const supTotals = totalBySupplier[supplier] || {
                    qty: 0,
                    mt: 0
                  };
                  return (
                    <div key={supplier} className="mb-8">
                      <h3
                        className={`text-lg font-bold p-3 rounded-t-lg ${
                          supplier === 'Non défini'
                            ? 'bg-red-600'
                            : 'bg-green-600'
                        } text-white flex justify-between items-center`}
                      >
                        <span>
                          Fournisseur: {supplier}{' '}
                          {supplier === 'Non défini' && '(à vérifier)'}
                        </span>
                        <span className="text-xs font-normal">
                          Total Qté: {supTotals.qty.toFixed(2)} | Total HT:{' '}
                          {supTotals.mt.toFixed(2)} €
                        </span>
                      </h3>
                      <table className="w-full border-collapse border-2 border-gray-300 text-sm">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="border border-gray-300 p-2 text-left">
                              Référence
                            </th>
                            <th className="border border-gray-300 p-2 text-left">
                              Désignation
                            </th>
                            <th className="border border-gray-300 p-2 text-right">
                              Quantité
                            </th>
                            <th className="border border-gray-300 p-2 text-right">
                              Prix Unitaire HT
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((piece, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-2 font-medium">
                                {piece.reference}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {piece.designation || '-'}
                              </td>
                              <td className="border border-gray-300 p-2 text-right">
                                {piece.quantity}
                              </td>
                              <td className="border border-gray-300 p-2 text-right">
                                {piece.unitPrice
                                  ? `${piece.unitPrice} €`
                                  : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })
            )}
          </div>

          {/* Impression */}
          <div className="mt-8 text-center">

          </div>
        </div>
      )}
    </div>
  );
};

export default ListePieces;
