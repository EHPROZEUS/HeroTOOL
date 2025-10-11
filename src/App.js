import React, { useState, useEffect, useCallback } from 'react';
import html2pdf from "html2pdf.js";
import VehicleInfoForm from './components/Header/VehicleInfoForm';
import MaintenanceHistory from './components/Maintenance/MaintenanceHistory';
import OilInfoForm from './components/Maintenance/OilInfoForm';
import VehicleSummary from './components/Summary/VehicleSummary';
import TaskSummary from './components/Summary/TaskSummary';
import ChecklistSection from './components/Checklist/ChecklistSection';
import ForfaitForm from './components/Forfaits/ForfaitForm';
import ForfaitReparationPeintureForm from './components/Forfaits/ForfaitReparationPeintureForm';
import ForfaitCarrosserieForm from './components/Forfaits/ForfaitCarrosserieForm';
import ForfaitPeintureSeuleForm from './components/Forfaits/ForfaitPeintureSeuleForm';
import ImportModule from './components/Import/ImportModule';
import OrdreReparation from './components/Reports/OrdreReparation';
import ListePieces from './components/Reports/ListePieces';

import {
  HUILES_CONFIG,
  ALL_ITEMS,
  LEFT_ITEMS,
  RIGHT_ITEMS,
  LEFT_ITEMS_2,
  RIGHT_ITEMS_2,
  LEFT_ITEMS_3,
  RIGHT_ITEMS_3,
  TEXT_ITEMS_1,
  TEXT_ITEMS_2,
  TEXT_ITEMS_3,
  TEXT_ITEMS_4,
  EXCLUDED_MULTI_PIECES,
  DSP_ITEMS,
  LUSTRAGE_ITEMS,
  PEINTURE_FORFAITS,
  PEINTURE_SEULE_FORFAITS,
  PLUME_ITEMS
} from './config/constants';

import { formatTireSize } from './utils/formatters';
import {
  calculateTotals,
  calculateMOByCategory,
  getPiecesListBySupplier
} from './utils/calculations';
import { parsePieces } from './utils/parser';

import ReparationPeintureSubMenu from './components/Carrosserie/ReparationPeintureSubMenu';
import PeintureSubMenu from './components/Carrosserie/PeintureSubMenu';
import LustrageSubMenu from './components/Smart/LustrageSubMenu';
import PlumeSubMenu from './components/Smart/PlumeSubMenu';
import ForfaitSmartForm from './components/Forfaits/ForfaitSmartForm';


// Firebase helpers (you must create src/firebase.js with your config)
import { auth, googleProvider, storage, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SOURCE_FORCED_SUPPLIERS = {
  NED: 'NED',
  SERVICEBOX: 'XPR',
  RENAULT: 'GUEUDET',
  AUTOSSIMO: 'AUTOSSIMO'
};

const CarrosserieSubMenus = ({
  toggleSubMenu,
  subMenuStates,
  forfaitData,
  updateForfaitField,
  addPeintureForfait,
  removePeintureForfait,
  countRP1,
  countP1Elem,
  addPeintureSeuleForfait,
  removePeintureSeuleForfait
}) => {
  
  return (
    <div className="section-carrosserie mb-6 flex justify-end">
      <div className="sous-menus space-y-4">
        <div className="submenu flex flex-col items-end">

          {subMenuStates['peinture'] && (
            <div className="submenu-content mt-2 flex flex-col items-end">
              <PeintureSubMenu
                forfaitData={forfaitData}
                addPeintureSeuleForfait={addPeintureSeuleForfait}
                removePeintureSeuleForfait={removePeintureSeuleForfait}
                countP1Elem={countP1Elem}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [headerInfo, setHeaderInfo] = useState({
    lead: '',
    immatriculation: '',
    vin: '',
    moteur: '',
    boite: '',
    dateVehicule: '',
    kilometres: '',
    clim: '',
    freinParking: '',
    startStop: false
  });
  const [itemStates, setItemStates] = useState(
    Object.fromEntries(ALL_ITEMS.map(i => [i.id, 0]))
  );
  const selectedCarrosserieItems = ALL_ITEMS.filter(
    item => item.moCategory === 'Carrosserie' && itemStates[item.id] > 0
  );
  const [itemNotes, setItemNotes] = useState({});
  const [forfaitData, setForfaitData] = useState({});
  const [pieceLines, setPieceLines] = useState({});
  const [showOrdreReparation, setShowOrdreReparation] = useState(false);
  const [includeControleTechnique, setIncludeControleTechnique] = useState(true);
  const [includeContrevisite, setIncludeContrevisite] = useState(false);
  const [showListePieces, setShowListePieces] = useState(false);
  const [showImportModule, setShowImportModule] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedPieces, setParsedPieces] = useState([]);
  const [lastMaintenance, setLastMaintenance] = useState({});
  const [oilInfo, setOilInfo] = useState({ viscosity: '', quantity: '' });
  const [expandedCategories, setExpandedCategories] = useState({
    mecanique: false,
    pneusFreins: false,
    dsp: false,
    lustrage: false,
    carrosserie: false,
    reparationPeinture: false,
    peinture: false,
    plume: false
  });
  const [subMenuStates, setSubMenuStates] = useState({
    'reparation-peinture': false,
    'peinture': false
  });

  // Firebase auth user state
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    // listen auth state
    const unsub = auth.onAuthStateChanged(user => {
      setFirebaseUser(user || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (headerInfo.lead.trim()) {
        const data = {
          headerInfo,
          itemStates,
          itemNotes,
          forfaitData,
          pieceLines,
          lastMaintenance,
          oilInfo,
          includeControleTechnique,
          includeContrevisite,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(`herotool_quote_${headerInfo.lead}`, JSON.stringify(data));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [
    headerInfo,
    itemStates,
    itemNotes,
    forfaitData,
    pieceLines,
    lastMaintenance,
    oilInfo,
    includeControleTechnique,
    includeContrevisite
  ]);

  const toggleCategory = useCallback(cat => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const toggleSubMenu = useCallback(id => {
    setSubMenuStates(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const updateHeaderInfo = useCallback((field, value) => {
    setHeaderInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleMoteur = useCallback(type => {
    setHeaderInfo(prev => ({ ...prev, moteur: prev.moteur === type ? '' : type }));
  }, []);

  const toggleBoite = useCallback(type => {
    setHeaderInfo(prev => ({ ...prev, boite: prev.boite === type ? '' : type }));
  }, []);

  const toggleClim = useCallback(type => {
    setHeaderInfo(prev => ({ ...prev, clim: prev.clim === type ? '' : type }));
  }, []);

  const toggleFreinParking = useCallback(type => {
    setHeaderInfo(prev => ({
      ...prev,
      freinParking: prev.freinParking === type ? '' : type
    }));
  }, []);

  const toggleStartStop = useCallback(() => {
    setHeaderInfo(prev => ({ ...prev, startStop: !prev.startStop }));
  }, []);

  const cycleState = useCallback(itemId => {
    setItemStates(prev => {
      const current = prev[itemId] ?? 0;
      const next = (current + 1) % 3;
      const updated = { ...prev, [itemId]: next };

      // REPC/REMPC - Ajouter à forfaitData quand activés
      const isREPC = TEXT_ITEMS_1.some(item => item.id === itemId);
      const isREMPC = TEXT_ITEMS_2.some(item => item.id === itemId);
      
      if ((isREPC || isREMPC) && next === 1) {
        setForfaitData(prevForfait => ({
          ...prevForfait,
          [itemId]: {
            ...prevForfait[itemId],
            moQuantity: '0',
            moCategory: 'Carrosserie'
          }
        }));
      }

      // Réparation Peinture - Ajouter à forfaitData quand activés
      const isPeintureForfait = PEINTURE_FORFAITS.some(f => f.id === itemId);
      if (isPeintureForfait && next === 1) {
        const forfaitConfig = PEINTURE_FORFAITS.find(f => f.id === itemId);
        if (forfaitConfig) {
          setForfaitData(prevForfait => ({
            ...prevForfait,
            [itemId]: {
              ...forfaitConfig,
              peintureForfait: itemId,
              state: next
            }
          }));
        }
      }

      // Peinture Seule - Ajouter à forfaitData quand activés
      const isPeintureSeule = PEINTURE_SEULE_FORFAITS.some(f => f.id === itemId);
      if (isPeintureSeule && next === 1) {
        const forfaitConfig = PEINTURE_SEULE_FORFAITS.find(f => f.id === itemId);
        if (forfaitConfig) {
          setForfaitData(prevForfait => ({
            ...prevForfait,
            [itemId]: {
              ...forfaitConfig,
              peintureSeuleForfait: itemId,
              state: next
            }
          }));
        }
      }

      return updated;
    });
  }, []);
  const updateNote = useCallback((id, value) => {
    if (['pneusAvant', 'pneusArriere', 'pneus4'].includes(id)) {
      setItemNotes(prev => ({ ...prev, [id]: formatTireSize(value) }));
    } else {
      setItemNotes(prev => ({ ...prev, [id]: value }));
    }
  }, []);

  const updateLastMaintenance = useCallback((field, value) => {
    setLastMaintenance(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateOilInfo = useCallback((field, value) => {
    setOilInfo(prev => {
      const next = { ...prev, [field]: value };
      if (next.viscosity && next.quantity) {
        const cfg = HUILES_CONFIG[next.viscosity];
        if (cfg) {
          const q = parseFloat(next.quantity) || 0;
          let qCalc = q;
          let total = 0;
          if (cfg.unite === 'bidon5L') {
            const bidons = Math.ceil(q / 5);
            qCalc = bidons;
            total = bidons * cfg.prixUnitaire;
          } else {
            total = q * cfg.prixUnitaire;
          }
          setForfaitData(prevForfait => ({
            ...prevForfait,
            filtreHuile: {
              ...prevForfait.filtreHuile,
              consommableReference: `Huile ${next.viscosity}`,
              consommableDesignation: cfg.unite === 'bidon5L' ? 'Huile moteur (bidon 5L)' : 'Huile moteur',
              consommableQuantity: qCalc.toString(),
              consommablePrixUnitaire: cfg.prixUnitaire.toFixed(2),
              consommablePrix: total.toFixed(2)
            }
          }));
        }
      }
      return next;
    });
  }, []);

  const updateForfaitField = useCallback((itemId, field, value) => {
    setForfaitData(prev => {
      if (field === "reparation" || field === "peinture") {
        return {
          ...prev,
          [itemId]: {
            ...prev[itemId],
            [field]: value,
          }
        };
      }
      const nextForfait = { ...prev, [itemId]: { ...prev[itemId], [field]: value } };
      const fd = nextForfait[itemId];
      if (field === 'pieceQuantity' || field === 'piecePrixUnitaire') {
        const qty = parseFloat(fd.pieceQuantity || 0);
        const pu = parseFloat(fd.piecePrixUnitaire || 0);
        fd.piecePrix = (qty * pu).toFixed(2);
      }
      if (field === 'consommableQuantity' || field === 'consommablePrixUnitaire') {
        const qty = parseFloat(fd.consommableQuantity || 0);
        const pu = parseFloat(fd.consommablePrixUnitaire || 0);
        fd.consommablePrix = (qty * pu).toFixed(2);
      }
      return nextForfait;
    });
  }, []);

  const addPieceLine = useCallback(itemId => {
    setPieceLines(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), {
        reference: '',
        designation: '',
        fournisseur: '',
        quantity: '1',
        prixUnitaire: '',
        prix: ''
      }]
    }));
  }, []);

  const removePieceLine = useCallback((itemId, index) => {
    setPieceLines(prev => ({
      ...prev,
      [itemId]: prev[itemId]?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const updatePieceLine = useCallback((itemId, index, field, value) => {
    setPieceLines(prev => ({
      ...prev,
      [itemId]: prev[itemId]?.map((line, i) => {
        if (i === index) {
          const newLine = { ...line, [field]: value };
          if (field === 'quantity' || field === 'prixUnitaire') {
            const q = parseFloat(newLine.quantity || 0);
            const pu = parseFloat(newLine.prixUnitaire || 0);
            newLine.prix = (q * pu).toFixed(2);
          }
          return newLine;
        }
        return line;
      }) || prev[itemId]
    }));
  }, []);

  const canHaveMultiplePieces = useCallback(itemId => {
    return !EXCLUDED_MULTI_PIECES.includes(itemId);
  }, []);

  const parsePiecesText = useCallback((
    selectedFormat = 'auto',
    sourceSystem = 'auto',
    defaultSupplier = ''
  ) => {
    if (!importText.trim()) {
      setParsedPieces([]);
      return;
    }
    const forced = SOURCE_FORCED_SUPPLIERS[sourceSystem] || '';
    const supplier = forced || defaultSupplier;
    const results = parsePieces(importText, selectedFormat, sourceSystem, supplier);

    const enriched = results.map((p, idx) => {
      const pu = p.prixUnitaire || p.unitPrice || '';
      const q = p.quantity || '1';
      return {
        id: `import_${idx}_${Date.now()}`,
        reference: p.reference || '',
        designation: p.designation || '',
        quantity: q,
        prixUnitaire: pu,
        unitPrice: pu,
        prix: (pu && q) ? (parseFloat(pu) * parseFloat(q)).toFixed(2) : '',
        fournisseur: forced || p.fournisseur || supplier || '',
        targetForfait: '',
        _forcedFournisseur: !!forced
      };
    });
    setParsedPieces(enriched);
  }, [importText]);

  const updateParsedPiece = useCallback((id, field, value) => {
    setParsedPieces(prev =>
      prev.map(p =>
        p.id === id
          ? (field === 'fournisseur' && p._forcedFournisseur ? p : { ...p, [field]: value })
          : p
      )
    );
  }, []);

  const removeParsedPiece = useCallback(id => {
    setParsedPieces(prev => prev.filter(p => p.id !== id));
  }, []);

  // ✅ FONCTION CORRIGÉE - Support multi-pièces
  const dispatchPieces = useCallback(() => {
    if (!parsedPieces.length) {
      alert('Aucune pièce à dispatcher.');
      return;
    }
    const sansForfait = parsedPieces.filter(p => !p.targetForfait);
    if (sansForfait.length) {
      const ok = window.confirm(
        `${sansForfait.length} pièce(s) sans forfait cible seront ignorées. Continuer ?`
      );
      if (!ok) return;
    }

    // Grouper les pièces par forfait
    const piecesByForfait = {};
    parsedPieces.forEach(piece => {
      if (!piece.targetForfait || !piece.reference) return;
      if (!piecesByForfait[piece.targetForfait]) {
        piecesByForfait[piece.targetForfait] = [];
      }
      piecesByForfait[piece.targetForfait].push(piece);
    });

    // Dispatcher : 1ère pièce → forfaitData, autres → pieceLines
    setForfaitData(prev => {
      const nextData = { ...prev };

      Object.entries(piecesByForfait).forEach(([forfaitId, pieces]) => {
        const existing = nextData[forfaitId] || {};

        // La première pièce va dans le forfait principal
        const firstPiece = pieces[0];
        let qty = 1;
        if (typeof firstPiece.quantity === 'string' && firstPiece.quantity.trim() !== '') {
          qty = parseFloat(firstPiece.quantity.replace(',', '.'));
          if (isNaN(qty)) qty = 1;
        }
        let pu = 0;
        if (typeof firstPiece.prixUnitaire === 'string' && firstPiece.prixUnitaire.trim() !== '') {
          pu = parseFloat(firstPiece.prixUnitaire.replace(',', '.'));
          if (isNaN(pu)) pu = 0;
        }
        const prix = (qty * pu).toFixed(2);

        nextData[forfaitId] = {
          ...existing,
          pieceReference: firstPiece.reference,
          pieceDesignation: firstPiece.designation || existing.pieceDesignation || '',
          pieceQuantity: qty ? qty.toString() : '',
          piecePrixUnitaire: pu ? pu.toFixed(2) : '',
          piecePrix: prix,
          pieceFournisseur: firstPiece.fournisseur || existing.pieceFournisseur || ''
        };
      });

      return nextData;
    });

    // Ajouter les pièces supplémentaires (2ème, 3ème, etc.) dans pieceLines
    setPieceLines(prev => {
      const nextLines = { ...prev };

      Object.entries(piecesByForfait).forEach(([forfaitId, pieces]) => {
        // Ignorer la première pièce (déjà dans forfaitData)
        const additionalPieces = pieces.slice(1);

        if (additionalPieces.length > 0) {
          // Créer ou compléter le tableau de pièces supplémentaires
          if (!nextLines[forfaitId]) {
            nextLines[forfaitId] = [];
          }

          additionalPieces.forEach(piece => {
            let qty = 1;
            if (typeof piece.quantity === 'string' && piece.quantity.trim() !== '') {
              qty = parseFloat(piece.quantity.replace(',', '.'));
              if (isNaN(qty)) qty = 1;
            }
            let pu = 0;
            if (typeof piece.prixUnitaire === 'string' && piece.prixUnitaire.trim() !== '') {
              pu = parseFloat(piece.prixUnitaire.replace(',', '.'));
              if (isNaN(pu)) pu = 0;
            }
            const prix = (qty * pu).toFixed(2);

            nextLines[forfaitId].push({
              reference: piece.reference,
              designation: piece.designation || '',
              fournisseur: piece.fournisseur || '',
              quantity: qty.toString(),
              prixUnitaire: pu.toFixed(2),
              prix: prix
            });
          });
        }
      });

      return nextLines;
    });

    setImportText('');
    setParsedPieces([]);
    setShowImportModule(false);

    const totalPieces = parsedPieces.length;
    const totalForfaits = Object.keys(piecesByForfait).length;
    alert(`✓ ${totalPieces} pièce(s) importée(s) vers ${totalForfaits} forfait(s)`);
  }, [parsedPieces]);

  const countRP1 = Object.keys(forfaitData).filter(
    k => forfaitData[k]?.peintureForfait === "R-P1"
  ).length;

  const addPeintureForfait = id => {
    setForfaitData(prev => {
      if (id === "R-P1") {
        const uniqKey = `R-P1_${Date.now()}`;
        return {
          ...prev,
          [uniqKey]: {
            ...PEINTURE_FORFAITS.find(f => f.id === "R-P1"),
            peintureForfait: "R-P1"
          }
        };
      }
      if (Object.values(prev).some(fd => fd.peintureForfait === id)) return prev;
      return {
        ...prev,
        [id]: {
          ...PEINTURE_FORFAITS.find(f => f.id === id),
          peintureForfait: id
        }
      };
    });
  };

  const removePeintureForfait = id => {
    setForfaitData(prev => {
      if (id === "R-P1") {
        const keys = Object.keys(prev).filter(
          k => prev[k]?.peintureForfait === "R-P1"
        );
        if (!keys.length) return prev;
        const lastKey = keys[keys.length - 1];
        const next = { ...prev };
        delete next[lastKey];
        return next;
      }
      const key = Object.keys(prev).find(
        k => prev[k]?.peintureForfait === id
      );
      if (!key) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const saveQuote = useCallback(() => {
    if (!headerInfo.lead.trim()) {
      alert('⚠️ Lead requis');
      return;
    }
    try {
      const data = {
        headerInfo,
        itemStates,
        itemNotes,
        forfaitData,
        pieceLines,
        lastMaintenance,
        oilInfo,
        includeControleTechnique,
        includeContrevisite,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`herotool_quote_${headerInfo.lead}`, JSON.stringify(data));
      alert('✅ Devis sauvegardé');
    } catch (e) {
      alert('❌ ' + e.message);
    }
  }, [
    headerInfo,
    itemStates,
    itemNotes,
    forfaitData,
    pieceLines,
    lastMaintenance,
    oilInfo,
    includeControleTechnique,
    includeContrevisite
  ]);

  const loadQuote = useCallback(lead => {
    if (!lead?.trim()) {
      alert('⚠️ Nom requis');
      return;
    }
    const raw = localStorage.getItem(`herotool_quote_${lead}`);
    if (!raw) {
      alert('❌ Aucun devis');
      return;
    }
    try {
      const data = JSON.parse(raw);
      setHeaderInfo(data.headerInfo || {});
      setItemStates(data.itemStates || {});
      setItemNotes(data.itemNotes || {});
      setForfaitData(data.forfaitData || {});
      setPieceLines(data.pieceLines || {});
      setLastMaintenance(data.lastMaintenance || {});
      setOilInfo(data.oilInfo || { viscosity: '', quantity: '' });
      setIncludeControleTechnique(data.includeControleTechnique ?? true);
      setIncludeContrevisite(data.includeContrevisite ?? false);
      alert('✅ Chargé');
    } catch (e) {
      alert('❌ ' + e.message);
    }
  }, []);

  // ---- Firebase authentication and upload helpers ----
  const handleFirebaseSignIn = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        alert(`Connecté en tant que ${result.user.displayName || result.user.email}`);
      }
    } catch (e) {
      alert('Erreur connexion Firebase: ' + e.message);
    }
  }, []);

  // --- Logique Peinture seule ---
  const countP1Elem = Object.keys(forfaitData).filter(
    k => forfaitData[k]?.peintureSeuleForfait === "P-1ELEM"
  ).length;

  const addPeintureSeuleForfait = id => {
    setForfaitData(prev => {
      if (id === "P-1ELEM") {
        const uniqKey = `P-1ELEM_${Date.now()}`;
        return {
          ...prev,
          [uniqKey]: {
            ...PEINTURE_SEULE_FORFAITS.find(f => f.id === "P-1ELEM"),
            peintureSeuleForfait: "P-1ELEM"
          }
        };
      }
      if (Object.values(prev).some(fd => fd.peintureSeuleForfait === id)) return prev;
      return {
        ...prev,
        [id]: {
          ...PEINTURE_SEULE_FORFAITS.find(f => f.id === id),
          peintureSeuleForfait: id
        }
      };
    });
  };

  const removePeintureSeuleForfait = id => {
    setForfaitData(prev => {
      if (id === "P-1ELEM") {
        const keys = Object.keys(prev).filter(
          k => prev[k]?.peintureSeuleForfait === "P-1ELEM"
        );
        if (!keys.length) return prev;
        const lastKey = keys[keys.length - 1];
        const next = { ...prev };
        delete next[lastKey];
        return next;
      }
      const key = Object.keys(prev).find(
        k => prev[k]?.peintureSeuleForfait === id
      );
      if (!key) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  // --- Fin logique Peinture seule ---

  // --- Logique Lustrage 1 élément ---
  const countL1 = Object.keys(forfaitData).filter(
    k => forfaitData[k]?.lustrage1Elem === true
  ).length;

  const addLustrage1Elem = () => {
    setForfaitData(prev => {
      const uniqKey = `L1_${Date.now()}`;
      return {
        ...prev,
        [uniqKey]: {
          moDesignation: 'Lustrage 1 élément',
          moQuantity: '0.25',
          moCategory: 'Lustrage',
          consommableQuantity: '1',
          consommablePrixUnitaire: '1',
          lustrage1Elem: true
        }
      };
    });
  };

  const removeLustrage1Elem = () => {
    setForfaitData(prev => {
      const keys = Object.keys(prev).filter(k => prev[k]?.lustrage1Elem === true);
      if (!keys.length) return prev;
      const lastKey = keys[keys.length - 1];
      const next = { ...prev };
      delete next[lastKey];
      return next;
    });
  };

  // --- Logique Plume 1 élément ---
  const countPlume1 = Object.keys(forfaitData).filter(
    k => forfaitData[k]?.plume1Elem === true
  ).length;

  const addPlume1Elem = () => {
    setForfaitData(prev => {
      const uniqKey = `PLUME1_${Date.now()}`;
      return {
        ...prev,
        [uniqKey]: {
          moDesignation: 'Plume 1 élément',
          moQuantity: '0.2',
          moCategory: 'Mécanique',
          plume1Elem: true
        }
      };
    });
  };

  const removePlume1Elem = () => {
    setForfaitData(prev => {
      const keys = Object.keys(prev).filter(k => prev[k]?.plume1Elem === true);
      if (!keys.length) return prev;
      const lastKey = keys[keys.length - 1];
      const next = { ...prev };
      delete next[lastKey];
      return next;
    });
  };
  const handleFirebaseSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      alert('Déconnecté');
    } catch (e) {
      alert('Erreur déconnexion: ' + e.message);
    }
  }, []);

  const uploadToFirebaseStorage = useCallback(async () => {
    if (!headerInfo.lead?.trim()) {
      alert('⚠️ Lead requis');
      return;
    }
    try {
      const payload = {
        headerInfo,
        itemStates,
        itemNotes,
        forfaitData,
        pieceLines,
        lastMaintenance,
        oilInfo,
        includeControleTechnique,
        includeContrevisite,
        savedAt: new Date().toISOString()
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: 'application/json' });

      const path = `herotool/${headerInfo.lead.replace(/\s+/g, '_')}/${Date.now()}.json`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, blob);
      const url = await getDownloadURL(sRef);
      alert('✅ Export Storage OK — URL: ' + url);
    } catch (e) {
      alert('❌ ' + e.message);
    }
  }, [
    headerInfo,
    itemStates,
    itemNotes,
    forfaitData,
    pieceLines,
    lastMaintenance,
    oilInfo,
    includeControleTechnique,
    includeContrevisite
  ]);

  const saveToFirestore = useCallback(async () => {
    if (!headerInfo.lead?.trim()) {
      alert('⚠️ Lead requis');
      return;
    }
    try {
      const payload = {
        headerInfo,
        itemStates,
        itemNotes,
        forfaitData,
        pieceLines,
        lastMaintenance,
        oilInfo,
        includeControleTechnique,
        includeContrevisite,
        createdAt: serverTimestamp()
      };
      const id = `${headerInfo.lead.replace(/\s+/g, '_')}_${Date.now()}`;
      const docRef = doc(db, 'herotoolQuotes', id);
      await setDoc(docRef, payload);
      alert('✅ Export Firestore OK');
    } catch (e) {
      alert('❌ ' + e.message);
    }
  }, [
    headerInfo,
    itemStates,
    itemNotes,
    forfaitData,
    pieceLines,
    lastMaintenance,
    oilInfo,
    includeControleTechnique,
    includeContrevisite
  ]);

  // ---- Print / PDF helpers ----
  const printOrdreReparation = useCallback(() => {
    const el = document.getElementById('ordre-reparation-content');
    if (!el) return;
    const w = window.open('', '', 'height=800,width=1000');
    w.document.write('<html><head><title>Ordre</title>');
    w.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #333;padding:6px;font-size:12px;}th{background:#e5e7eb;}</style>');
    w.document.write('</head><body>');
    w.document.write(el.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 200);
  }, []);

  const downloadOrdreReparationPDF = useCallback(() => {
    const el = document.getElementById('ordre-reparation-content');
    if (!el) return;
    html2pdf()
      .set({
        margin: 0.25,
        filename: `Ordre_Reparation_${headerInfo.lead || 'vehicule'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      })
      .from(el)
      .save();
  }, [headerInfo.lead]);

  const printListePieces = useCallback(() => {
    const el = document.getElementById('liste-pieces-content');
    if (!el) return;
    const w = window.open('', '', 'height=800,width=1000');
    w.document.write('<html><head><title>Pièces</title>');
    w.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #333;padding:6px;font-size:12px;}th{background:#e5e7eb;}</style>');
    w.document.write('</head><body>');
    w.document.write(el.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 200);
  }, []);

  const activeItemsList = ALL_ITEMS.filter(i => itemStates[i.id] === 1 || itemStates[i.id] === 2);
  const activeMecaniqueItems = activeItemsList.filter(i => !DSP_ITEMS.some(d => d.id === i.id));
  const activeDSPItems = activeItemsList.filter(i => DSP_ITEMS.some(d => d.id === i.id));
  const activePlumeItems = activeItemsList.filter(i => PLUME_ITEMS.some(p => p.id === i.id));
  const totalActive = activeItemsList.length;
  const totalCompleted = ALL_ITEMS.filter(i => itemStates[i.id] === 2).length;
  const allCompleted = totalActive > 0 && totalActive === totalCompleted;
  const activePeintureForfaits = Object.entries(forfaitData)
    .filter(([key, data]) => data.peintureForfait)
    .map(([key, data]) => ({ id: key, ...data }));

  const totals = calculateTotals(
    activeMecaniqueItems,
    forfaitData,
    pieceLines,
    includeControleTechnique,
    includeContrevisite,
    activeDSPItems,
    activePlumeItems
  );
  const moByCategory = calculateMOByCategory(
    activeMecaniqueItems,
    forfaitData,
    activeDSPItems,
    activePlumeItems,
    itemStates
  );
  const piecesBySupplier = getPiecesListBySupplier(
    activeMecaniqueItems,
    forfaitData,
    pieceLines
  );

  const CARROSSERIE_IDS = new Set([
    ...TEXT_ITEMS_1.map(i => i.id),
    ...TEXT_ITEMS_2.map(i => i.id),
  ]);
  const isLustrageId = (id) => LUSTRAGE_ITEMS.some(l => l.id === id);
  const defaultCategoryForItem = (item) => {
    if (isLustrageId(item.id)) return 'Lustrage';
    if (CARROSSERIE_IDS.has(item.id)) return 'Carrosserie';
    return 'Mécanique';
  };

  const mecaForfaitItems = activeMecaniqueItems
    .filter(i => !LUSTRAGE_ITEMS.some(l => l.id === i.id))
    .filter(i => (forfaitData[i.id]?.moCategory || defaultCategoryForItem(i)) === 'Mécanique');

  const statusDisplay = (() => {
    if (firebaseUser) return { text: `✅ Connecté: ${firebaseUser.displayName || firebaseUser.email}`, color: 'text-green-600' };
    return { text: '🔓 Non connecté (Firebase)', color: 'text-blue-600' };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8">
        <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: '#E5E7EB' }}>
  <div className="flex items-center justify-center mb-3">
    <div style={{ width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 15, overflow: 'hidden' }}>
      <img 
        src="/logo.png" 
        alt="HeroTOOL Logo" 
        style={{ width: '140%', height: '140%', objectFit: 'contain' }}
      />
    </div>
    <h1 className="text-4xl md:text-5xl font-bold">
      <span style={{ color: '#FF6B35' }}>Hero</span><span style={{ color: '#002F6C' }}>TOOL</span>
    </h1>
  </div>
  <p className="text-sm font-bold text-gray-500 italic">
    Développé par Loïc.L, codé par Claude.ia
  </p>
</div>

        <div className="mb-8 p-6 rounded-xl border-2 border-green-200 bg-green-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sauvegardez votre progression</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={saveQuote} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
              💾 Sauvegarder
            </button>
            <button
              onClick={() => {
                const lead = prompt('Nom du Lead à charger:');
                if (lead) loadQuote(lead);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              📂 Charger
            </button>

            {firebaseUser ? (
              <button onClick={handleFirebaseSignOut} className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700">
                🔓 Déconnexion Firebase
              </button>
            ) : (
              <button onClick={handleFirebaseSignIn} className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700">
                🔐 Connexion Firebase
              </button>
            )}

            <div className="flex gap-2">
              <button onClick={uploadToFirebaseStorage} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                ☁️ Export Firebase Storage
              </button>
              <button onClick={saveToFirestore} className="px-6 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800">
                ☁️ Enregistrer sur Firestore
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className={statusDisplay.color}>{statusDisplay.text}</span>
          </div>
        </div>

        <VehicleInfoForm
          headerInfo={headerInfo}
          updateHeaderInfo={updateHeaderInfo}
          toggleMoteur={toggleMoteur}
          toggleBoite={toggleBoite}
          toggleClim={toggleClim}
          toggleFreinParking={toggleFreinParking}
          toggleStartStop={toggleStartStop}
        />
        <MaintenanceHistory lastMaintenance={lastMaintenance} updateLastMaintenance={updateLastMaintenance} />
        <VehicleSummary headerInfo={headerInfo} oilInfo={oilInfo} lastMaintenance={lastMaintenance} />
        <div className="mb-8">
          <OilInfoForm oilInfo={oilInfo} updateOilInfo={updateOilInfo} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Entretien</h2>
          <ChecklistSection
            leftItems={LEFT_ITEMS}
            rightItems={RIGHT_ITEMS}
            itemStates={itemStates}
            itemNotes={itemNotes}
            onCycleState={cycleState}
            onUpdateNote={updateNote}
          />
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pneus et Freins</h2>
            <button onClick={() => toggleCategory('pneusFreins')} className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.pneusFreins ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.pneusFreins && (
            <ChecklistSection
              leftItems={LEFT_ITEMS_3}
              rightItems={RIGHT_ITEMS_3}
              itemStates={itemStates}
              itemNotes={itemNotes}
              onCycleState={cycleState}
              onUpdateNote={updateNote}
            />
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">SMART - DSP</h2>
            <button onClick={() => toggleCategory('dsp')} className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.dsp ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.dsp && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DSP_ITEMS.map(item => {
                const state = itemStates[item.id] ?? 0;
                const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div key={item.id} onClick={() => cycleState(item.id)} className={`rounded-lg border-2 px-4 py-4 cursor-pointer ${bg} ${border} flex items-center justify-content text-center`}>
                    <span className={`text-sm font-medium ${txt}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">SMART - LUSTRAGE</h2>
            <button onClick={() => toggleCategory('lustrage')} className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.lustrage ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.lustrage && (
            <>
              <div className="mb-6 flex justify-end">
                <LustrageSubMenu
                  forfaitData={forfaitData}
                  addLustrage1Elem={addLustrage1Elem}
                  removeLustrage1Elem={removeLustrage1Elem}
                  countL1={countL1}
                />
              </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LUSTRAGE_ITEMS.map(item => {
                const state = itemStates[item.id] ?? 0;
                const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div key={item.id} onClick={() => cycleState(item.id)} className={`rounded-lg border-2 px-4 py-4 cursor-pointer ${bg} ${border} flex items-center justify-content text-center`}>
                    <span className={`text-sm font-medium ${txt}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">SMART - PLUME</h2>
            <button onClick={() => toggleCategory('plume')} className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.plume ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.plume && (
            <>
              <div className="mb-6 flex justify-end">
                <PlumeSubMenu
                  forfaitData={forfaitData}
                  addPlume1Elem={addPlume1Elem}
                  removePlume1Elem={removePlume1Elem}
                  countPlume1={countPlume1}
                />
              </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLUME_ITEMS.map(item => {
                const state = itemStates[item.id] ?? 0;
                const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div key={item.id} onClick={() => cycleState(item.id)} className={`rounded-lg border-2 px-4 py-4 cursor-pointer ${bg} ${border} flex items-center justify-center text-center`}>
                    <span className={`text-sm font-medium ${txt}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-orange-800">CARROSSERIE</h2>
            <button onClick={() => toggleCategory('carrosserie')} className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.carrosserie ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.carrosserie && (
            <>
              <CarrosserieSubMenus
                toggleSubMenu={toggleSubMenu}
                subMenuStates={subMenuStates}
                forfaitData={forfaitData}
                updateForfaitField={updateForfaitField}
                addPeintureForfait={addPeintureForfait}
                removePeintureForfait={removePeintureForfait}
                countRP1={countRP1}
                countP1Elem={countP1Elem}
                addPeintureSeuleForfait={addPeintureSeuleForfait}
                removePeintureSeuleForfait={removePeintureSeuleForfait}
              />
              <ChecklistSection
                leftItems={TEXT_ITEMS_1}
                rightItems={TEXT_ITEMS_2}
                itemStates={itemStates}
                itemNotes={itemNotes}
                onCycleState={cycleState}
                onUpdateNote={updateNote}
              />
            </>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">RÉPARATION PEINTURE</h2>
            <button onClick={() => toggleCategory('reparationPeinture')} className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.reparationPeinture ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.reparationPeinture && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PEINTURE_FORFAITS.map(forfait => {
                const state = itemStates[forfait.id] ?? 0;
                const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div key={forfait.id} onClick={() => cycleState(forfait.id)} className={`rounded-lg border-2 px-4 py-4 cursor-pointer ${bg} ${border} flex items-center justify-center text-center`}>
                    <span className={`text-sm font-medium ${txt}`}>{forfait.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">PEINTURE</h2>
            <button onClick={() => toggleCategory('peinture')} className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.peinture ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.peinture && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PEINTURE_SEULE_FORFAITS.map(forfait => {
                const state = itemStates[forfait.id] ?? 0;
                const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div key={forfait.id} onClick={() => cycleState(forfait.id)} className={`rounded-lg border-2 px-4 py-4 cursor-pointer ${bg} ${border} flex items-center justify-center text-center`}>
                    <span className={`text-sm font-medium ${txt}`}>{forfait.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        {allCompleted && (
          <div className="mt-6 p-4 bg-green-100 rounded-xl text-center">
            <p className="text-green-800 font-semibold">Bravo ! Entretien terminé</p>
          </div>
        )}

        {totalActive > 0 && (
          <>
            <ImportModule
              showImportModule={showImportModule}
              setShowImportModule={setShowImportModule}
              importText={importText}
              setImportText={setImportText}
              parsedPieces={parsedPieces}
              setParsedPieces={setParsedPieces}
              parsePiecesText={parsePiecesText}
              updateParsedPiece={updateParsedPiece}
              removeParsedPiece={removeParsedPiece}
              dispatchPieces={dispatchPieces}
              activeItems={activeItemsList}
            />

            <TaskSummary allItems={ALL_ITEMS} itemStates={itemStates} itemNotes={itemNotes} cycleState={cycleState} />

            <div className="mt-8 border-t-2 border-gray-300 pt-8">
              <h2 className="text-2xl font-bold mb-6">Forfaits</h2>
            {/* Lustrage 1 élément */}
              {Object.entries(forfaitData)
                .filter(([key, data]) => data.lustrage1Elem === true)
                .map(([key, data]) => (
                  <ForfaitSmartForm
                    key={key}
                    item={{ id: key, label: data.moDesignation || 'Lustrage 1 élément' }}
                    forfaitData={forfaitData}
                    updateForfaitField={updateForfaitField}
                    type="lustrage"
                  />
                ))
              }

              {/* Plume 1 élément */}
              {Object.entries(forfaitData)
                .filter(([key, data]) => data.plume1Elem === true)
                .map(([key, data]) => (
                  <ForfaitSmartForm
                    key={key}
                    item={{ id: key, label: data.moDesignation || 'Plume 1 élément' }}
                    forfaitData={forfaitData}
                    updateForfaitField={updateForfaitField}
                    type="plume"
                  />
                ))
              }
              {mecaForfaitItems && mecaForfaitItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Mécanique</h3>
                      {mecaForfaitItems
                      .filter(item =>
                        !item.label.toLowerCase().includes("plume") &&
                        !item.id.toLowerCase().includes("plume")
                      )
                   .map(item => (

                    <ForfaitForm
                      key={item.id}
                      item={item}
                      forfaitData={forfaitData}
                      pieceLines={pieceLines}
                      updateForfaitField={updateForfaitField}
                      addPieceLine={addPieceLine}
                      removePieceLine={removePieceLine}
                      updatePieceLine={updatePieceLine}
                      canHaveMultiplePieces={canHaveMultiplePieces}
                      moDefaultCategory={defaultCategoryForItem(item)}
                    />
                  ))}
                </div>
              )}

                            <div className="mb-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Carrosserie</h3>
                {Object.entries(forfaitData)
                  .filter(([key, data]) => {
                    // REPC et REMPC
                    const isREPC = TEXT_ITEMS_1.some(item => item.id === key);
                    const isREMPC = TEXT_ITEMS_2.some(item => item.id === key);
                    
                    // Réparation Peinture
                    const isReparationPeinture = data.peintureForfait;
                    
                    // Peinture Seule
                    const isPeintureSeule = data.peintureSeuleForfait;
                    
                    return isREPC || isREMPC || isReparationPeinture || isPeintureSeule;
                  })
                  .map(([key, data]) => {
                    // REPC ou REMPC
                    if (TEXT_ITEMS_1.some(item => item.id === key) || TEXT_ITEMS_2.some(item => item.id === key)) {
                      const item = ALL_ITEMS.find(i => i.id === key);
                      return (
                        <ForfaitCarrosserieForm
                          key={key}
                          item={item}
                          forfaitData={forfaitData}
                          pieceLines={pieceLines}
                          updateForfaitField={updateForfaitField}
                          addPieceLine={addPieceLine}
                          removePieceLine={removePieceLine}
                          updatePieceLine={updatePieceLine}
                        />
                      );
                    }
                    
                    // Réparation Peinture (2 MO + consommables)
                    if (data.peintureForfait) {
                      const forfait = PEINTURE_FORFAITS.find(f => f.id === data.peintureForfait);
                      if (!forfait) return null;
                      return (
                        <ForfaitReparationPeintureForm
                          key={key}
                          item={{ id: key, label: forfait.label }}
                          forfaitData={forfaitData}
                          updateForfaitField={updateForfaitField}
                        />
                      );
                    }
                    
                    // Peinture Seule (1 MO + consommables)
                    if (data.peintureSeuleForfait) {
                      const forfait = PEINTURE_SEULE_FORFAITS.find(f => f.id === data.peintureSeuleForfait);
                      if (!forfait) return null;
                      return (
                        <ForfaitPeintureSeuleForm
                          key={key}
                          item={{ id: key, label: forfait.label }}
                          forfaitData={forfaitData}
                          updateForfaitField={updateForfaitField}
                        />
                      );
                    }
                    
                    return null;
                  })
                }
                {Object.values(forfaitData).filter(data =>
                  data.peintureForfait || data.moCategory === 'Carrosserie' || data.moCategory === 'Peinture'
                ).length === 0 && (
                  <p className="text-sm text-gray-500"> </p>
                )}
              </div>
            </div>

            <OrdreReparation
              showOrdreReparation={showOrdreReparation}
              setShowOrdreReparation={setShowOrdreReparation}
              includeControleTechnique={includeControleTechnique}
              setIncludeControleTechnique={setIncludeControleTechnique}
              includeContrevisite={includeContrevisite}
              setIncludeContrevisite={setIncludeContrevisite}
              headerInfo={headerInfo}
              activeMecaniqueItems={activeMecaniqueItems}
              activeDSPItems={activeDSPItems}
              activePlumeItems={activePlumeItems}
              forfaitData={forfaitData}
              pieceLines={pieceLines}
              totals={totals}
              moByCategory={moByCategory}
              printOrdreReparation={printOrdreReparation}
              itemStates={itemStates}
              activePeintureForfaits={activePeintureForfaits}
            />
            <div className="mt-4 text-center">
              <button
                onClick={downloadOrdreReparationPDF}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg"
              >
                📄 Télécharger l'ordre de réparation (PDF)
              </button>
            </div>

            <ListePieces
              showListePieces={showListePieces}
              setShowListePieces={setShowListePieces}
              headerInfo={headerInfo}
              piecesBySupplier={piecesBySupplier}
              printListePieces={printListePieces}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;