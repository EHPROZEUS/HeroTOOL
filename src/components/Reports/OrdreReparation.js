import React from 'react';
import { calculateVehicleAge, formatDateFr } from '../../utils/formatters';
import { getDefaultValues } from '../../utils/calculations';
import { 
  DSP_ITEMS, 
  LUSTRAGE_ITEMS, 
  PEINTURE_FORFAITS, 
  PEINTURE_SEULE_FORFAITS, 
  PLUME_ITEMS, 
  TEXT_ITEMS_1, 
  TEXT_ITEMS_2 
} from '../../config/constants';

const tarifHoraire = 35.8;

// Fonction pour déterminer la couleur globale du dossier selon la MO mécanique totale
const getDossierColor = (totalMOMecanique) => {
  const total = parseFloat(totalMOMecanique) || 0;
  
  if (total >= 0.01 && total <= 0.2) return { color: '#22C55E', label: 'VERT', bg: '#DCFCE7' };
  if (total >= 0.21 && total <= 2.99) return { color: '#FACC15', label: 'JAUNE', bg: '#FEF9C3' };
  if (total >= 3 && total <= 4.99) return { color: '#E5E7EB', label: 'TRANSPARENT', bg: '#F9FAFB' };
  if (total >= 5) return { color: '#EF4444', label: 'ROUGE', bg: '#FEE2E2' };
  
  return { color: '#E5E7EB', label: 'TRANSPARENT', bg: '#F9FAFB' };
};

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
      type: "MO CONTROLLING PHOTOS",
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
      type: "MO CONTROLLING PHOTOS",
      designation: "Main d'oeuvre",
      moCategory: "Nettoyage",
      moQuantity: 0.42,
    },
  },
];

// Catégories pour la ventilation comptable (dans l'ordre et style de l'image)
const VENTILATION_CATEGORIES = [
  { key: 'moMecanique', label: 'MO MECANIQUE' },
  { key: 'moNettoyage', label: 'MO NETTOYAGE' },
  { key: 'moPeinture', label: 'MO PEINTURE' },
  { key: 'moTolerie', label: 'MO TOLERIE' },
  { key: 'moLustrage', label: 'MO LUSTRAGE' },
  { key: 'moDSP', label: 'MO DSP' },
  { key: 'moControlling', label: 'MO CONTROLLING' },
  { key: 'ingredientPeinture', label: 'INGREDIENT PEINTURE' },
  { key: 'fluides', label: 'FLUIDES' },
  { key: 'pneumatiques', label: 'PNEUMATIQUES' },
  { key: 'piecesMecanique', label: 'PIECES MECANIQUE' },
  { key: 'piecesTolerie', label: 'PIECES TOLERIE' },
  { key: 'presSousTraitees', label: 'PRES. SOUS-TRAITEES' }
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
  itemStates = {}
}) {
  // Initialisation des résultats
  const result = {};
  VENTILATION_CATEGORIES.forEach(cat => {
    result[cat.key] = { qty: 0, ht: 0 };
  });

  const tarifHoraire = 35.8;

  // ===== 1. MO OBLIGATOIRES =====
  OBLIGATORY_PRESTATIONS.forEach(ob => {
    if (ob.moCategory === 'Mécanique') {
      result.moMecanique.qty += ob.moQuantity;
    } else if (ob.moCategory === 'Controlling') {
      result.moControlling.qty += ob.moQuantity;
    }
  });

  // ===== 2. MO NETTOYAGE =====
  OBLIGATORY_CLEANING.forEach(ob => {
    result.moNettoyage.qty += ob.mo.moQuantity;
    // Consommables de nettoyage → FLUIDES
    result.fluides.ht += ob.consommable.totalPrice || 0;
  });

  // ===== 3. MO DYNAMIQUES (depuis moByCategory) =====
  result.moMecanique.qty += moByCategory.mecanique || 0;
  result.moLustrage.qty += moByCategory.lustrage || 0;
  result.moDSP.qty += moByCategory.dsp || 0;
  result.moControlling.qty += moByCategory.controlling || 0;
  result.moPeinture.qty += moByCategory.peinture || 0;
  result.moTolerie.qty += moByCategory.tolerie || 0;

  // ===== 4. PIECES ET CONSOMMABLES MECANIQUE =====
  // Séparer les pneus des autres pièces
  activeMecaniqueItems.forEach(item => {
    const forfait = forfaitData[item.id] || {};
    const piecePrix = parseFloat(forfait.piecePrix) || 0;

    // Pneus → PNEUMATIQUES
    if (item.id === 'pneusAvant' || item.id === 'pneusArriere' || item.id === 'pneus4') {
      result.pneumatiques.ht += piecePrix;
    } else {
      // Autres pièces → PIECES MECANIQUE
      result.piecesMecanique.ht += piecePrix;
    }

    // Consommables (huile, liquides) → FLUIDES
    const consommablePrix = parseFloat(forfait.consommablePrix) || 0;
    if (consommablePrix > 0) {
      result.fluides.ht += consommablePrix;
    }

    // Pièces supplémentaires
    if (pieceLines[item.id]) {
      pieceLines[item.id].forEach(line => {
        const linePrix = parseFloat(line.prix) || 0;
        result.piecesMecanique.ht += linePrix;
      });
    }
  });

  // ===== 5. FORFAITS PEINTURE (INGREDIENT PEINTURE) =====
  PEINTURE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      result.ingredientPeinture.ht += forfait.consommablePrix || 0;
    }
  });

  PEINTURE_SEULE_FORFAITS.forEach(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    if (state > 0) {
      result.ingredientPeinture.ht += forfait.consommablePrix || 0;
    }
  });

  // ===== 6. FORFAITS CARROSSERIE (PIECES TOLERIE) =====
  activeMecaniqueItems
    .filter(item => {
      const isREPC = TEXT_ITEMS_1.some(textItem => textItem.id === item.id);
      const isREMPC = TEXT_ITEMS_2.some(textItem => textItem.id === item.id);
      return isREPC || isREMPC;
    })
    .forEach(item => {
      const forfait = forfaitData[item.id] || {};
      const piecePrix = parseFloat(forfait.piecePrix) || 0;
      result.piecesTolerie.ht += piecePrix;

      // Pièces supplémentaires
      if (pieceLines[item.id]) {
        pieceLines[item.id].forEach(line => {
          result.piecesTolerie.ht += parseFloat(line.prix) || 0;
        });
      }
    });

  // ===== 7. PRESTATIONS SOUS-TRAITEES =====
  if (includeControleTechnique) {
    result.presSousTraitees.qty += 1;
    result.presSousTraitees.ht += 42;
  }

  // ===== 8. CALCUL DES MONTANTS HT POUR TOUTES LES MO =====
  result.moMecanique.ht = result.moMecanique.qty * tarifHoraire;
  result.moNettoyage.ht = result.moNettoyage.qty * tarifHoraire;
  result.moLustrage.ht = result.moLustrage.qty * tarifHoraire;
  result.moDSP.ht = result.moDSP.qty * tarifHoraire;
  result.moControlling.ht = result.moControlling.qty * tarifHoraire;
  result.moPeinture.ht = result.moPeinture.qty * tarifHoraire;
  result.moTolerie.ht = result.moTolerie.qty * tarifHoraire;

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
  activePlumeItems = [], 
  forfaitData = {},
  pieceLines = {},
  totals = {},
  moByCategory = {},
  printOrdreReparation,
  itemStates = {}
}) => {
  // Identifie les items de lustrage actifs
  const activeLustrageItems = Array.isArray(activeMecaniqueItems)
    ? activeMecaniqueItems.filter(item =>
        LUSTRAGE_ITEMS.some(lustrageItem => lustrageItem.id === item.id)
      )
    : [];
  
  const activePeintureForfaits = PEINTURE_FORFAITS.filter(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    return state > 0;
  });

  // Items de peinture seule actifs
  const activePeintureSeuleForfaits = PEINTURE_SEULE_FORFAITS.filter(forfait => {
    const state = itemStates[forfait.id] ?? 0;
    return state > 0;
  });

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
    itemStates
  });

  // === INSERTED BLOCK: fallback computation of moByCategory ===
  // Copiez-collez tel quel : ce bloc reconstruit les heures MO si moByCategory fourni est incomplet.
  const computeFallbackMoByCategory = () => {
    const res = {
      mecanique: 0,
      lustrage: 0,
      dsp: 0,
      controlling: 0,
      peinture: 0,
      tolerie: 0,
      nettoyage: 0
    };

    const safeNum = v => {
      if (v === undefined || v === null || v === '') return 0;
      if (typeof v === 'number') return v;
      const s = String(v).replace(/\u00A0|\u202F/g, '').replace(/\s/g, '').replace(',', '.');
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    // 1) Prestations obligatoires
    OBLIGATORY_PRESTATIONS.forEach(ob => {
      const q = safeNum(ob.moQuantity);
      const cat = (ob.moCategory || '').toString().toLowerCase();
      if (cat.includes('mécanique') || cat.includes('mecanique')) res.mecanique += q;
      else if (cat.includes('controlling')) res.controlling += q;
      else if (cat.includes('nettoyage')) res.nettoyage += q;
      else res.mecanique += q;
    });

    // 2) Nettoyages obligatoires
    OBLIGATORY_CLEANING.forEach(ob => {
      const q = safeNum(ob.mo?.moQuantity);
      res.nettoyage += q;
    });

    // 3) Items mécaniques actifs (forfaitData -> item -> defaults)
    (activeMecaniqueItems || []).forEach(item => {
      const id = item.id;
      const forfait = (forfaitData && forfaitData[id]) || {};
      const defaults = typeof getDefaultValues === 'function' ? getDefaultValues(id) : {};

      const moQty = safeNum(
        forfait.moQuantity !== undefined ? forfait.moQuantity
          : (item && item.moQuantity !== undefined ? item.moQuantity
            : defaults.moQuantity)
      );

      const catRaw = (forfait.moCategory || defaults.moCategory || item.moCategory || '').toString().toLowerCase();
      const cat = catRaw.normalize ? catRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : catRaw;

      if (cat.includes('lustrage')) res.lustrage += moQty;
      else if (cat.includes('dsp')) res.dsp += moQty;
      else if (cat.includes('controlling')) res.controlling += moQty;
      else if (cat.includes('peinture')) res.peinture += moQty;
      else if (cat.includes('tolerie') || cat.includes('tôlerie')) res.tolerie += moQty;
      else if (cat.includes('nettoyage')) res.nettoyage += moQty;
      else res.mecanique += moQty;
    });

    // 4) DSP actifs (forfaitData -> item -> config)
    (activeDSPItems || []).forEach(dspItem => {
      const id = dspItem.id;
      const forfait = (forfaitData && forfaitData[id]) || {};
      const moFromForfaitOrItem = safeNum(
        forfait.moQuantity !== undefined ? forfait.moQuantity
          : (dspItem && dspItem.moQuantity !== undefined ? dspItem.moQuantity : 0)
      );
      if (moFromForfaitOrItem > 0) {
        res.dsp += moFromForfaitOrItem;
      } else {
        const dspConfig = DSP_ITEMS.find(d => d.id === id);
        if (dspConfig) res.dsp += safeNum(dspConfig.moQuantity);
      }
    });

    // 5) Forfaits peinture activés via itemStates
    PEINTURE_FORFAITS.forEach(forfait => {
      const state = itemStates[forfait.id] ?? 0;
      if (state > 0) {
        const data = forfaitData[forfait.id] || {};
        res.tolerie += safeNum(data.mo1Quantity !== undefined ? data.mo1Quantity : forfait.mo1Quantity);
        res.peinture += safeNum(data.mo2Quantity !== undefined ? data.mo2Quantity : forfait.mo2Quantity);
      }
    });
    PEINTURE_SEULE_FORFAITS.forEach(forfait => {
      const state = itemStates[forfait.id] ?? 0;
      if (state > 0) {
        const data = forfaitData[forfait.id] || {};
        res.peinture += safeNum(data.moQuantity !== undefined ? data.moQuantity : forfait.moQuantity);
      }
    });

    // 6) Forfaits dynamiques (lustrage1Elem / plume1Elem)
    Object.entries(forfaitData || {}).forEach(([key, data]) => {
      if (!key) return;
      if (data.lustrage1Elem === true) {
        res.lustrage += safeNum(data.moQuantity || 0);
      }
      if (data.plume1Elem === true) {
        res.mecanique += safeNum(data.moQuantity || 0);
      }
    });

    return res;
  };

  const fallbackMoByCategory = computeFallbackMoByCategory();

  // Prioritise le moByCategory fourni par le parent si il contient des données valides,
  // sinon utilise le fallback reconstruit localement.
  const finalMoByCategory = {
    mecanique: (typeof moByCategory?.mecanique === 'number' && moByCategory.mecanique > 0) ? moByCategory.mecanique : fallbackMoByCategory.mecanique,
    lustrage: (typeof moByCategory?.lustrage === 'number' && moByCategory.lustrage > 0) ? moByCategory.lustrage : fallbackMoByCategory.lustrage,
    dsp: (typeof moByCategory?.dsp === 'number' && moByCategory.dsp > 0) ? moByCategory.dsp : fallbackMoByCategory.dsp,
    controlling: (typeof moByCategory?.controlling === 'number' && moByCategory.controlling > 0) ? moByCategory.controlling : fallbackMoByCategory.controlling,
    peinture: (typeof moByCategory?.peinture === 'number' && moByCategory.peinture > 0) ? moByCategory.peinture : fallbackMoByCategory.peinture,
    tolerie: (typeof moByCategory?.tolerie === 'number' && moByCategory.tolerie > 0) ? moByCategory.tolerie : fallbackMoByCategory.tolerie,
    nettoyage: (typeof moByCategory?.nettoyage === 'number' && moByCategory.nettoyage > 0) ? moByCategory.nettoyage : fallbackMoByCategory.nettoyage
  };
  // === END INSERTED BLOCK ===




    // ✅ CALCUL DU TOTAL MO MÉCANIQUE
 const totalMOMecanique = finalMoByCategory.mecanique || 0;

  const dossierStatus = getDossierColor(totalMOMecanique);


// Styles pour éviter les coupures dans le PDF
  const pdfStyles = `
    @media print {
      .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      thead {
        display: table-header-group;
      }
    }
  `;

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
    <style>{pdfStyles}</style>
    
    {/* ✅ HEADER : STATUT + TITRE ALIGNÉS */}
    <div className="mb-6 pb-4 border-b-2 border-gray-300">
      <div className="flex items-center justify-between">
        {/* Statut du dossier à gauche */}
        <div 
          className="p-4 rounded-lg border-2 shadow-md"
          style={{ 
            backgroundColor: dossierStatus.bg,
            borderColor: dossierStatus.color
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full shadow-lg"
              style={{ backgroundColor: dossierStatus.color }}
            ></div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Statut du dossier</p>
              <p 
                className="text-2xl font-bold"
                style={{ color: dossierStatus.color }}
              >
                {dossierStatus.label}
              </p>
              <p className="text-sm font-medium text-gray-700">
                MO Méca : <span className="font-bold">{totalMOMecanique.toFixed(2)}h</span>
              </p>
            </div>
          </div>
        </div>

        {/* Titre au centre */}
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
            ORDRE DE RÉPARATION
          </h1>
          <p className="text-sm text-gray-600">
            Document généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Espace vide à droite pour équilibrer */}
        <div style={{ width: '220px' }}></div>
      </div>
    </div>

    {/* ALERTE CONTRE-VISITE */}
    {includeContrevisite && (
      <div
        className="mb-6 p-3 border-2 rounded-lg"
        style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B35' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
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
<div className="mb-6 no-break"> 
  <div className="flex flex-col md:flex-row gap-4">
    {/* Informations véhicule condensées */}
    <div className="flex-1 min-w-[200px] max-w-[280px]">
      <h2
        className="text-base font-bold text-gray-800 mb-2 p-1.5 rounded-lg"
        style={{ backgroundColor: '#FFF0E6' }}
      >
        Informations Véhicule
      </h2>
      <div className="grid grid-cols-1 gap-0.5 text-xs">
        {headerInfo?.lead && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Lead: </span>
            <span>{headerInfo.lead}</span>
          </div>
        )}
        {headerInfo?.immatriculation && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Immatriculation: </span>
            <span>{headerInfo.immatriculation}</span>
          </div>
        )}
        {headerInfo?.vin && (
          <div className="flex gap-1">
            <span className="font-bold w-28">VIN: </span>
            <span className="text-xs">{headerInfo.vin}</span>
          </div>
        )}
        {headerInfo?.kilometres && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Kilomètres: </span>
            <span>{headerInfo.kilometres} km</span>
          </div>
        )}
        {headerInfo?.dateVehicule && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Âge véhicule: </span>
            <span>{calculateVehicleAge(headerInfo.dateVehicule)}</span>
          </div>
        )}
        {headerInfo?.dateVehicule && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Mise en circ.: </span>
            <span>{formatDateFr(headerInfo.dateVehicule)}</span>
          </div>
        )}
        {headerInfo?.moteur && (
          <div className="flex gap-1">
            <span className="font-bold w-28 mr-2">Moteur: </span>
            <span className="capitalize">{headerInfo.moteur}</span>
          </div>
        )}
        {headerInfo?.boite && (
          <div className="flex gap-1">
            <span className="font-bold w-28">Boîte: </span>
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
{/* Liste des fournisseurs avec nombre de pièces */}
<div className="mt-3 pt-2 border-t border-gray-300">
  <h3 className="text-xs font-bold text-gray-700 mb-1.5">Fournisseurs</h3>
  <div className="text-xs space-y-0.5">
    {(() => {
      // Regrouper toutes les pièces par fournisseur
      const fournisseurCount = {};
      
      // Pièces principales des forfaits mécanique
      activeMecaniqueItems.forEach(item => {
        const forfait = forfaitData?.[item.id];
        if (forfait?.pieceFournisseur && forfait.pieceFournisseur.trim()) {
          fournisseurCount[forfait.pieceFournisseur] = 
            (fournisseurCount[forfait.pieceFournisseur] || 0) + 
            (parseFloat(forfait.pieceQuantity) || 0);
        }
      });
      
      // Pièces supplémentaires
      Object.values(pieceLines || {}).forEach(lines => {
        lines.forEach(line => {
          if (line.fournisseur && line.fournisseur.trim()) {
            fournisseurCount[line.fournisseur] = 
              (fournisseurCount[line.fournisseur] || 0) + 
              (parseFloat(line.quantity) || 0);
          }
        });
      });
      
      // Afficher les fournisseurs triés
      const fournisseurs = Object.entries(fournisseurCount)
        .sort(([a], [b]) => a.localeCompare(b));
      
      if (fournisseurs.length === 0) {
        return <p className="text-gray-500 italic">Aucun fournisseur</p>;
      }
      
      return fournisseurs.map(([fournisseur, count]) => (
        <div key={fournisseur} className="flex gap-2">
          <span className="font-medium">{fournisseur}:</span>
          <span className="text-gray-600">{Math.round(count)} pièce{count > 1 ? 's' : ''}</span>
        </div>
      ));
    })()}
  </div>
</div>
    </div>
    
    {/* Tableau ventilation comptable ultra-compact */}
    <div className="flex-1" style={{ maxWidth: '280px', minWidth: '200px' }}>
      <h2
        className="text-sm font-bold text-gray-800 mb-1 p-1 rounded"
        style={{ backgroundColor: '#FFF0E6' }}
      >
        Ventilation comptable
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 bg-white" style={{ fontSize: '10px' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-0.5 text-left">Ventilation</th>
              <th className="border border-gray-200 p-0.5 text-right">MO/H<br/>ou Qté</th>
              <th className="border border-gray-200 p-0.5 text-right">HT</th>
            </tr>
          </thead>
          <tbody>
            {VENTILATION_CATEGORIES.map(cat => (
              <tr key={cat.key}>
                <td className="border border-gray-200 p-0.5">{cat.label}</td>
                <td className="border border-gray-200 p-0.5 text-right">
                  {ventilation?.[cat.key]?.qty !== undefined
                    ? ventilation[cat.key].qty.toFixed(2)
                    : '0.00'}
                </td>
                <td className="border border-gray-200 p-0.5 text-right">
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

          <div className="mb-6 no-break">
            <h2
              className="text-lg font-bold text-gray-800 mb-3 p-2 rounded-lg"
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
                <tr style={{ backgroundColor: "#FFE4D6" }}>
                      <td colSpan="7" className="border border-gray-300 p-2 font-bold">
                        PRESTATIONS OBLIGATOIRES
                      </td>
                    </tr>
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
{/* ... le reste du fichier inchangé ... */}
              </tbody>
            </table>
          </div>

          <div className="mb-6 no-break">
            <h2
              className="text-lg font-bold text-gray-800 mb-3 p-2 rounded-lg"
              style={{ backgroundColor: '#FFF0E6' }}
            >
              Récapitulatif Financier
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Main d'oeuvre:</span>
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
                <div className="border-t border-gray-400 pt-1 mt-1"></div>
                <div
                  className="flex justify-between text-lg font-bold"
                  style={{ color: '#FF6B35' }}
                >
                  <span>TOTAL PIECES HT (sans prestations ext.):</span>
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
                  className="border-t pt-1 mt-1"
                  style={{ borderColor: '#FF6B35' }}
                ></div>
                <div
                  className="flex justify-between text-xl font-bold"
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

        
        </div>
      )}
    </div>
  );
};

export default OrdreReparation;
