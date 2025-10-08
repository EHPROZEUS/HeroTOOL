import React from 'react';
import { calculateVehicleAge, formatDateFr } from '../../utils/formatters';
import { getDefaultValues } from '../../utils/calculations';
import { DSP_ITEMS, LUSTRAGE_ITEMS } from '../../config/constants';

// Lignes obligatoires à afficher en haut du tableau des prestations
const OBLIGATORY_PRESTATIONS = [
  {
    id: 'plaque-imt',
    type: "MO MECANIQUE PLAQUE IMT",
    reference: "-",
    designation: "POSE DE PLAQUE ET FOURNITURE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'essai',
    type: "MO MECANIQUE ESSAI",
    reference: "-",
    designation: "ESSAI+ 70 POINTS DE CONTROLE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'pec',
    type: "MO MECANIQUE PEC",
    reference: "-",
    designation: "PRISE EN CHARGE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'lg',
    type: "MO MECANIQUE LG",
    reference: "-",
    designation: "MISE A NIVEAU LAVE GLACE",
    moCategory: "Mécanique",
    moQuantity: 0.10,
  },
  {
    id: 'photos',
    type: "MO CONTROLLING PHOTOS",
    reference: "-",
    designation: "PHOTOS",
    moCategory: "Controlling",
    moQuantity: 0.50,
  },
];

// Lignes obligatoires de nettoyage (avec consommables + MO)
const OBLIGATORY_CLEANING = [
  {
    id: 'nettoyage-interieur',
    type: "NETTOYAGE INTERIEUR",
    consommable: {
      reference: "CONSO",
      designation: "Consommables",
      quantity: 1.00,
      unitPrice: 3.70,
      totalPrice: 3.70,
    },
    mo: {
      type: "MO",
      designation: "Main d'oeuvre",
      moCategory: "Nettoyage",
      moQuantity: 0.75,
    },
  },
  {
    id: 'nettoyage-exterieur',
    type: "NETTOYAGE EXTERIEUR",
    consommable: {
      reference: "CONSO",
      designation: "Consommables",
      quantity: 2.00,
      unitPrice: 1.85,
      totalPrice: 3.70,
    },
    mo: {
      type: "MO",
      designation: "Main d'oeuvre",
      moCategory: "Nettoyage",
      moQuantity: 0.42,
    },
  },
];

// Catégories pour la ventilation comptable (dans l'ordre et style de l'image)
const VENTILATION_CATEGORIES = [
  { key: 'moMecanique', label: 'MO MECANIQUE' },
  { key: 'moPeinture', label: 'MO PEINTURE' },
  { key: 'moTolerie', label: 'MO TOLERIE' },
  { key: 'moLustrage', label: 'MO LUSTRAGE' },
  { key: 'moDSP', label: 'MO DSP' },
  { key: 'moControlling', label: 'MO CONTROLLING' },
  { key: 'moForfaitaire', label: 'MO FORFAITAIRE' },
  { key: 'ingredientPeinture', label: 'INGREDIENT PEINTURE' },
  { key: 'fluides', label: 'FLUIDES' },
  { key: 'piecesMecanique', label: 'PIECES MECANIQUE' },
  { key: 'piecesRemploi', label: 'PIECES REMPLOI' },
  { key: 'piecesTolerie', label: 'PIECES TOLERIE' },
  { key: 'pneumatiques', label: 'PNEUMATIQUES' },
  { key: 'presSousTraitees', label: 'PRES. SOUS-TRAITEES' },
  { key: 'recyclageDechets', label: 'RECYCLAGE DECHETS' },
];

// Fonction pour ventiler les quantités et montants HT par catégorie
function computeVentilation({
  activeMecaniqueItems = [],
  activeDSPItems = [],
  forfaitData = {},
  pieceLines = {},
  moByCategory = {},
  totals = {},
  includeControleTechnique = false,
}) {
  // Initialisation des résultats
  const result = {};
  VENTILATION_CATEGORIES.forEach(cat => {
    result[cat.key] = { qty: 0, ht: 0 };
  });

  // MO OBLIGATOIRES
  for (const ob of OBLIGATORY_PRESTATIONS) {
    switch (ob.moCategory) {
      case 'Mécanique':
        result.moMecanique.qty += ob.moQuantity;
        break;
      case 'Controlling':
        result.moControlling.qty += ob.moQuantity;
        break;
      default:
        break;
    }
  }
  // Nettoyage obligatoire (consommables sur pièces mécanique)
  for (const ob of OBLIGATORY_CLEANING) {
    result.piecesMecanique.ht += ob.consommable.totalPrice || 0;
    result.piecesMecanique.qty += ob.consommable.quantity || 0;
  }

  // MO dynamiques
  result.moMecanique.qty += moByCategory.mecanique || 0;
  result.moLustrage.qty += moByCategory.lustrage || 0;
  result.moDSP.qty += moByCategory.dsp || 0;
  result.moControlling.qty += moByCategory.controlling || 0;
  result.moForfaitaire.qty += moByCategory.forfaitaire || 0;
  result.moPeinture.qty += moByCategory.peinture || 0;
  result.moTolerie.qty += moByCategory.tolerie || 0;

  // PIECES MECANIQUE (somme totalPieces)
  result.piecesMecanique.ht += totals.totalPieces || 0;

  // PRES. SOUS-TRAITEES (contrôle technique)
  if (includeControleTechnique) {
    result.presSousTraitees.qty += 1;
    result.presSousTraitees.ht += 42;
  }

  return result;
}

const OrdreReparation = ({
  showOrdreReparation,
  setShowOrdreReparation,
  includeControleTechnique = false,
  setIncludeControleTechnique,
  includeContrevisite = false,
  setIncludeContrevisite,
  headerInfo = {},
  activeMecaniqueItems = [],
  activeDSPItems = [],
  forfaitData = {},
  pieceLines = {},
  totals = {},
  moByCategory = {},
  printOrdreReparation
}) => {
  // Identifie les items de lustrage actifs
  const activeLustrageItems = Array.isArray(activeMecaniqueItems)
    ? activeMecaniqueItems.filter(item =>
        LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
      )
    : [];

  // Filtre les items de mécanique pour exclure les items de lustrage
  const pureActiveMecaniqueItems = Array.isArray(activeMecaniqueItems)
    ? activeMecaniqueItems.filter(item =>
        !LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
      )
    : [];

  // Calcul ventilation comptable
  const ventilation = computeVentilation({
    activeMecaniqueItems,
    activeDSPItems,
    forfaitData,
    pieceLines,
    moByCategory,
    totals,
    includeControleTechnique,
  });

  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ordre de réparation</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!includeControleTechnique}
              onChange={e => setIncludeControleTechnique && setIncludeControleTechnique(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contrôle Technique (42€)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!includeContrevisite}
              onChange={e => setIncludeContrevisite && setIncludeContrevisite(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contre-visite (+10€)</span>
          </label>
          <button
            onClick={() => setShowOrdreReparation && setShowOrdreReparation(!showOrdreReparation)}
            className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {showOrdreReparation ? 'Masquer' : 'Générer'} l'ordre
          </button>
        </div>
      </div>

      {showOrdreReparation && (
        <div
          id="ordre-reparation-content"
          className="bg-white border-4 rounded-xl p-8 shadow-2xl"
          style={{ borderColor: '#FF6B35' }}
        >
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#FF6B35' }}>
              ORDRE DE RÉPARATION
            </h1>
            <p className="text-gray-600">
              Document généré le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {includeContrevisite && (
            <div
              className="mb-8 p-4 border-2 rounded-lg"
              style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B35' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="text-lg font-bold" style={{ color: '#FF6B35' }}>
                    CONTRE-VISITE REQUISE
                  </p>
                  <p className="text-sm text-gray-800">
                    Le véhicule nécessite une contre-visite du contrôle technique
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =============== INFOS VEHICULE + VENTILATION COMPTABLE =============== */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Informations véhicule condensées */}
              <div className="flex-1 min-w-[250px] max-w-[370px]">
                <div className="flex items-center mb-2 border-b border-gray-200 pb-1">
                  <h2 className="text-base font-bold text-gray-800">Informations Véhicule</h2>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {headerInfo?.lead && (
                    <div className="flex">
                      <span className="font-bold w-28">Client:</span>
                      <span>{headerInfo.lead}</span>
                    </div>
                  )}
                  {headerInfo?.immatriculation && (
                    <div className="flex">
                      <span className="font-bold w-28">Immatriculation:</span>
                      <span>{headerInfo.immatriculation}</span>
                    </div>
                  )}
                  {headerInfo?.vin && (
                    <div className="flex">
                      <span className="font-bold w-28">VIN:</span>
                      <span className="text-xs">{headerInfo.vin}</span>
                    </div>
                  )}
                  {headerInfo?.kilometres && (
                    <div className="flex">
                      <span className="font-bold w-28">Kilomètres:</span>
                      <span>{headerInfo.kilometres} km</span>
                    </div>
                  )}
                  {headerInfo?.dateVehicule && (
                    <div className="flex">
                      <span className="font-bold w-28">Âge véhicule:</span>
                      <span>{calculateVehicleAge(headerInfo.dateVehicule)}</span>
                    </div>
                  )}
                  {headerInfo?.dateVehicule && (
                    <div className="flex">
                      <span className="font-bold w-28">Mise en circ.:</span>
                      <span>{formatDateFr(headerInfo.dateVehicule)}</span>
                    </div>
                  )}
                  {headerInfo?.moteur && (
                    <div className="flex">
                      <span className="font-bold w-28">Moteur:</span>
                      <span className="capitalize">{headerInfo.moteur}</span>
                    </div>
                  )}
                  {headerInfo?.boite && (
                    <div className="flex">
                      <span className="font-bold w-28">Boîte:</span>
                      <span className="capitalize">
                        {headerInfo.boite === 'auto/cvt'
                          ? 'Auto/CVT'
                          : headerInfo.boite === 'dct'
                          ? 'DCT'
                          : headerInfo.boite}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Tableau ventilation comptable */}
              <div className="flex-1 min-w-[280px] max-w-[400px]">
                <div className="flex items-center mb-2 border-b border-gray-200 pb-1">
                  <h2 className="text-base font-bold text-gray-800">Ventilation comptable</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-gray-300 text-xs bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-1 text-left">
                          Ventilation comptable
                        </th>
                        <th className="border border-gray-300 p-1 text-right">
                          MO/H<br />
                          ou Qté
                        </th>
                        <th className="border border-gray-300 p-1 text-right">
                          Montant HT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {VENTILATION_CATEGORIES.map(cat => (
                        <tr key={cat.key}>
                          <td className="border border-gray-300 p-1">{cat.label}</td>
                          <td className="border border-gray-300 p-1 text-right">
                            {ventilation?.[cat.key]?.qty !== undefined
                              ? ventilation[cat.key].qty
                              : 0}
                          </td>
                          <td className="border border-gray-300 p-1 text-right">
                            {ventilation?.[cat.key]?.ht !== undefined
                              ? Number(ventilation[cat.key].ht).toFixed(2)
                              : "0.00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* =============== FIN INFOS + VENTILATION =============== */}

          <div className="mb-8">
            <h2
              className="text-xl font-bold text-gray-800 mb-4 p-3 rounded-lg"
              style={{ backgroundColor: '#FFF0E6' }}
            >
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
                {/* === PRESTATIONS OBLIGATOIRES === */}
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

                {/* === NETTOYAGE INTERIEUR/EXTERIEUR : Consommable + MO === */}
                {OBLIGATORY_CLEANING.map(item => (
                  <React.Fragment key={item.id}>
                    {/* Consommable */}
                    <tr>
                      <td className="border border-gray-300 p-2">{item.type}</td>
                      <td className="border border-gray-300 p-2">{item.consommable.reference}</td>
                      <td className="border border-gray-300 p-2">{item.consommable.designation}</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2 text-right">{item.consommable.quantity}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.consommable.unitPrice.toFixed(2)} €</td>
                      <td className="border border-gray-300 p-2 text-right">{item.consommable.totalPrice.toFixed(2)} €</td>
                    </tr>
                    {/* Main d'oeuvre */}
                    <tr>
                      <td className="border border-gray-300 p-2">{item.type}</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2">{item.mo.designation}</td>
                      <td className="border border-gray-300 p-2">{item.mo.moCategory}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.mo.moQuantity} h</td>
                      <td className="border border-gray-300 p-2 text-right">-</td>
                      <td className="border border-gray-300 p-2 text-right">-</td>
                    </tr>
                  </React.Fragment>
                ))}

                {/* === PRESTATIONS DYNAMIQUES EXISTANTES === */}
                {Array.isArray(pureActiveMecaniqueItems) &&
                  pureActiveMecaniqueItems.map(item => {
                    const forfait = forfaitData?.[item.id] || {};
                    const defaults = typeof getDefaultValues === "function" ? getDefaultValues(item.id) : {};
                    const moQuantity =
                      forfait.moQuantity !== undefined
                        ? forfait.moQuantity
                        : defaults.moQuantity || 0;
                    const pieceReference =
                      forfait.pieceReference !== undefined
                        ? forfait.pieceReference
                        : defaults.pieceReference || "-";
                    const pieceQuantity =
                      forfait.pieceQuantity !== undefined
                        ? forfait.pieceQuantity
                        : defaults.pieceQuantity || 0;
                    const piecePrix =
                      forfait.piecePrix !== undefined
                        ? forfait.piecePrix
                        : defaults.piecePrix || 0;
                    const moCategory = forfait.moCategory || "Mécanique";

                    return (
                      <React.Fragment key={item.id}>
                        <tr style={{ backgroundColor: "#FFE4D6" }}>
                          <td colSpan="7" className="border border-gray-300 p-2 font-bold">
                            {item.label}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2">Main d'œuvre</td>
                          <td className="border border-gray-300 p-2">-</td>
                          <td className="border border-gray-300 p-2">
                            {forfait.moDesignation || "Temps de travail"}
                          </td>
                          <td className="border border-gray-300 p-2">{moCategory}</td>
                          <td className="border border-gray-300 p-2 text-right">{moQuantity} h</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                          <td className="border border-gray-300 p-2 text-right">-</td>
                        </tr>
                        {item.id !== "miseANiveau" && pieceReference && (
                          <tr>
                            <td className="border border-gray-300 p-2">Pièce</td>
                            <td className="border border-gray-300 p-2">{pieceReference}</td>
                            <td className="border border-gray-300 p-2">
                              {forfait.pieceDesignation || "-"}
                            </td>
                            <td className="border border-gray-300 p-2">-</td>
                            <td className="border border-gray-300 p-2 text-right">
                              {pieceQuantity}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {forfait.piecePrixUnitaire !== undefined
                                ? `${forfait.piecePrixUnitaire} €`
                                : "-"}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {piecePrix} €
                            </td>
                          </tr>
                        )}
                        {pieceLines?.[item.id]?.map((line, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 p-2">Pièce suppl.</td>
                            <td className="border border-gray-300 p-2">{line.reference}</td>
                            <td className="border border-gray-300 p-2">
                              {line.designation || "-"}
                            </td>
                            <td className="border border-gray-300 p-2">-</td>
                            <td className="border border-gray-300 p-2 text-right">
                              {line.quantity}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {line.prixUnitaire !== undefined ? `${line.prixUnitaire} €` : "-"}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {line.prix} €
                            </td>
                          </tr>
                        ))}
                        {item.id === "filtreHuile" && forfait.consommableReference && (
                          <tr>
                            <td className="border border-gray-300 p-2">Consommable</td>
                            <td className="border border-gray-300 p-2">
                              {forfait.consommableReference}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {forfait.consommableDesignation || "Huile moteur"}
                            </td>
                            <td className="border border-gray-300 p-2">-</td>
                            <td className="border border-gray-300 p-2 text-right">
                              {forfait.consommableQuantity || 0} L
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {forfait.consommablePrixUnitaire !== undefined
                                ? `${forfait.consommablePrixUnitaire} €`
                                : "-"}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {forfait.consommablePrix !== undefined
                                ? `${forfait.consommablePrix} €`
                                : "-"}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                {includeControleTechnique && (
                  <>
                    <tr style={{ backgroundColor: "#FFE4D6" }}>
                      <td colSpan="7" className="border border-gray-300 p-2 font-bold">
                        Contrôle Technique
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Prestation extérieure</td>
                      <td className="border border-gray-300 p-2">-</td>
                      <td className="border border-gray-300 p-2">
                        Contrôle technique obligatoire
                      </td>
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
                    <td className="border border-gray-300 p-2 bg-orange-50 font-semibold">
                      Contre-visite
                    </td>
                    <td className="border border-gray-300 p-2">-</td>
                    <td className="border border-gray-300 p-2 text-right">1</td>
                    <td className="border border-gray-300 p-2 text-right">10.00 €</td>
                    <td className="border border-gray-300 p-2 text-right">10.00 €</td>
                  </tr>
                )}

                {/* Section DSP */}
                {Array.isArray(activeDSPItems) && activeDSPItems.length > 0 && (
                  <>
                    <tr style={{ backgroundColor: "#DBEAFE" }}>
                      <td
                        colSpan="7"
                        className="border border-gray-300 p-3 font-bold text-blue-600 text-lg"
                      >
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
                          <td className="border border-gray-300 p-2">
                            {dspConfig.label}
                          </td>
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

                {/* Section LUSTRAGE */}
                {Array.isArray(activeLustrageItems) && activeLustrageItems.length > 0 && (
                  <>
                    <tr style={{ backgroundColor: "#FEF3C7" }}>
                      <td
                        colSpan="7"
                        className="border border-gray-300 p-3 font-bold text-amber-600 text-lg"
                      >
                        SMART - LUSTRAGE
                      </td>
                    </tr>
                    {activeLustrageItems.map(lustrageItem => {
                      const lustrageConfig = LUSTRAGE_ITEMS.find(
                        item => item.id === lustrageItem.id
                      );
                      if (!lustrageConfig) return null;

                      const forfait = forfaitData?.[lustrageItem.id] || {};
                      const moQuantity =
                        forfait.moQuantity !== undefined
                          ? forfait.moQuantity
                          : lustrageConfig.moQuantity || 0;
                      const consommableQuantity =
                        forfait.consommableQuantity !== undefined
                          ? forfait.consommableQuantity
                          : lustrageConfig.consommable || 0;
                      const consommablePrixUnitaire =
                        forfait.consommablePrixUnitaire !== undefined
                          ? forfait.consommablePrixUnitaire
                          : 1.0;
                      const consommablePrix = consommableQuantity * consommablePrixUnitaire;

                      return (
                        <React.Fragment key={lustrageItem.id}>
                          <tr>
                            <td className="border border-gray-300 p-2">
                              Main d'œuvre Lustrage
                            </td>
                            <td className="border border-gray-300 p-2">-</td>
                            <td className="border border-gray-300 p-2">
                              {lustrageConfig.label}
                            </td>
                            <td className="border border-gray-300 p-2">Lustrage</td>
                            <td className="border border-gray-300 p-2 text-right">
                              {moQuantity} h
                            </td>
                            <td className="border border-gray-300 p-2 text-right">-</td>
                            <td className="border border-gray-300 p-2 text-right">-</td>
                          </tr>
                          {consommableQuantity > 0 && (
                            <tr>
                              <td className="border border-gray-300 p-2">Consommable</td>
                              <td className="border border-gray-300 p-2">
                                {forfait.consommableReference || "-"}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {forfait.consommableDesignation ||
                                  "Consommable lustrage"}
                              </td>
                              <td className="border border-gray-300 p-2">-</td>
                              <td className="border border-gray-300 p-2 text-right">
                                {consommableQuantity}
                              </td>
                              <td className="border border-gray-300 p-2 text-right">
                                {consommablePrixUnitaire.toFixed(2)} €
                              </td>
                              <td className="border border-gray-300 p-2 text-right">
                                {consommablePrix.toFixed(2)} €
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

          <div className="mb-8">
            <h2
              className="text-xl font-bold text-gray-800 mb-4 p-3 rounded-lg"
              style={{ backgroundColor: '#FFF0E6' }}
            >
              Récapitulatif Financier
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Main d'œuvre:</span>
                  <span>{totals?.totalMO !== undefined ? totals.totalMO : "0.00"} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Pièces:</span>
                  <span>{totals?.totalPieces !== undefined ? totals.totalPieces : "0.00"} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total Consommables:</span>
                  <span>
                    {totals?.totalConsommables !== undefined
                      ? totals.totalConsommables
                      : "0.00"}{" "}
                    €
                  </span>
                </div>
                <div className="border-t-2 border-gray-400 pt-2 mt-2"></div>
                <div
                  className="flex justify-between text-xl font-bold"
                  style={{ color: '#FF6B35' }}
                >
                  <span>TOTAL HT (sans prestations ext.):</span>
                  <span>
                    {totals?.totalHTSansPrestations !== undefined
                      ? totals.totalHTSansPrestations
                      : "0.00"}{" "}
                    €
                  </span>
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
                <div
                  className="border-t-2 pt-2 mt-2"
                  style={{ borderColor: '#FF6B35' }}
                ></div>
                <div
                  className="flex justify-between text-2xl font-bold"
                  style={{ color: '#FF6B35' }}
                >
                  <span>TOTAL HT:</span>
                  <span>
                    {totals?.totalHT !== undefined ? totals.totalHT : "0.00"} €
                  </span>
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
