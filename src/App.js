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
import QuoteManager from './components/QuoteManager/QuoteManager';
import { mapCarolToHeroTool, resetCounters } from './utils/carolMapping';
import CAROLImport from './components/Import/CAROLImport';
import Papa from 'papaparse';
import { processCarolDataWithAutoCheck, mapCarolToHeroToolWithAutoCheck } from './carolMappingWithAutoCheck';
import { useAutoCheck } from './autoCheckHelper';


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
  PLUME_ITEMS,
  DEFAULT_VALUES
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

const CAROL_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1518__XGgk9Sl-b-6TBqF-sNtraeQa0f3sgFti_WBcf0/export?format=csv&gid=0';

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
  const downloadListePiecesPDF = useCallback(() => {
  const el = document.getElementById('liste-pieces-content');
  if (!el) {
    alert('⚠️ Liste de pièces non trouvée');
    return;
  }
  
function App() {
  const [headerInfo, setHeaderInfo] = useState({
    lead: '',
    immatriculation: '',
    vin: '',
    marque: '',
    moteur: '',
    boite: '',
    dateVehicule: '',
    kilometres: '',
     modele: '',
    clim: '',
    freinParking: '',
    startStop: false
  });
  const [itemStates, setItemStates] = useState(
    Object.fromEntries(ALL_ITEMS.map(i => [i.id, 0]))
  );
  
  // Hook d'auto-cochage (DOIT être après useState itemStates)
  const autoCheck = useAutoCheck(setItemStates);
  
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
    mecanique: false,
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

  const printOrdreReparation = useCallback(() => {
  console.log('Fonction d\'impression désactivée');
}, []);

// Mode Maurice ULTIMATE
const [mauriceMode, setMauricMode] = useState(() => {
  const saved = localStorage.getItem('mauriceMode');
  return saved === 'true';
});
const [mauriceClicks, setMauriceClicks] = useState(0);
const [showConfetti, setShowConfetti] = useState(false);
const [darkMaurice, setDarkMaurice] = useState(() => {
  const saved = localStorage.getItem('darkMaurice');
  return saved === 'true';
});
const [footerClicks, setFooterClicks] = useState(0);
const [currentQuote, setCurrentQuote] = useState(0);
const [mauriceTheme, setMauriceTheme] = useState(() => {
  const saved = localStorage.getItem('mauriceTheme');
  return saved || 'classic'; // 'classic' ou 'vegas'
});
const [mauriceStats, setMauriceStats] = useState(() => {
  const saved = localStorage.getItem('mauriceStats');
  return saved ? JSON.parse(saved) : {
    activations: 0,
    devisCrees: 0,
    modeNuitActivations: 0,
    firstActivation: null
  };
});

const toggleBothSections = useCallback(() => {
  const newState = !showOrdreReparation;
  setShowOrdreReparation(newState);
  setShowListePieces(newState);
}, [showOrdreReparation]);

const [konamiSequence, setKonamiSequence] = useState([]);
const [ultraMaurice, setUltraMaurice] = useState(false);

// Citations de Maurice
const mauriceQuotes = [
  "Maurice ne fait jamais d'erreur, seulement des approximations stratégiques",
  "Un bon devis, c'est comme une bonne baguette : croustillant",
  "Maurice travaille vite, mais il travaille bien",
  "La précision, c'est l'élégance de Maurice",
  "Pourquoi payer plus quand Maurice peut négocier ?",
  "Maurice : 20 ans d'expérience, 0 regret",
  "Un client satisfait vaut mieux que deux tu l'auras",
  "Maurice optimise, jamais il n'improvise",
  "La qualité n'attend pas, Maurice non plus",
  "Avec Maurice, même les pièces ont la classe"
];

// Messages Maurice pour les alertes
const mauriceAlert = (message) => {
  if (mauriceMode) {
    const mauriceMessages = {
      'sauvegarde': '🧙‍♂️ Maurice a tout sauvegardé, chef !',
      'charge': '🎩 Maurice a retrouvé ton dossier !',
      'lead_requis': '⚠️ Maurice dit : Donne-moi un nom de lead, frérot !',
      'erreur': '❌ Maurice a un souci : ',
      'aucun_devis': '❌ Maurice trouve rien avec ce nom...',
      'pieces_importees': '✨ Maurice a importé '
    };
    return mauriceMessages[message] || message;
  }
  return message;
};

// Rotation automatique des citations
useEffect(() => {
  if (!mauriceMode) return;
  const interval = setInterval(() => {
    setCurrentQuote(prev => (prev + 1) % mauriceQuotes.length);
  }, 5000);
  return () => clearInterval(interval);
}, [mauriceMode]);

// Détection Konami Code
useEffect(() => {
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight' ,'b', 'a'];
  
  const handleKeyDown = (e) => {
    const newSequence = [...konamiSequence, e.key].slice(-10);
    setKonamiSequence(newSequence);
    
    if (newSequence.join(',') === konamiCode.join(',')) {
      setUltraMaurice(true);
      playMauriceSound('ding');
      alert('🚀 ULTRA MAURICE MODE ACTIVÉ ! 🌈');
      setTimeout(() => setUltraMaurice(false), 30000); // 30 secondes
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [konamiSequence]);

// Sons Maurice
const playMauriceSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'ding') {
      // Son "ding" joyeux
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'whoosh') {
      // Son "whoosh" pour mode nuit
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  } catch (e) {
    // Si le son ne marche pas, on ignore silencieusement
    console.log('Audio non disponible');
  }
};
  // Firebase auth user state
  const [firebaseUser, setFirebaseUser] = useState(null);

const [carolData, setCarolData] = useState([]);
const [carolLoading, setCarolLoading] = useState(false);



// Puis remplace le useEffect Carol par :
useEffect(() => {
  const fetchCarolData = async () => {
    try {
      setCarolLoading(true);
      
      const CAROL_CSV_URL = 'https://docs.google.com/spreadsheets/d/1iFfy7DNR3ClgTBSCoeBsFZh2Ma-FMOMV-TDo5S6O56c/export?format=csv&gid=0';
      
      const response = await fetch(CAROL_CSV_URL);
      const csvText = await response.text();
      
      // Parser avec PapaParse (gère les retours à la ligne)
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCarolData(results.data);
          console.log('✅ Carol chargé:', results.data.length, 'lignes');
          console.log('📋 Exemple:', results.data[0]);
        },
        error: (error) => {
          console.error('❌ Erreur parsing CSV:', error);
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur Carol:', error);
    } finally {
      setCarolLoading(false);
    }
  };
  
  fetchCarolData();
}, []);// Plus besoin de firebaseUser ! // Dépend de firebaseUser

  useEffect(() => {
    // listen auth state
    const unsub = auth.onAuthStateChanged(user => {
      setFirebaseUser(user || null);
    });
    return () => unsub();
  }, []);



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

// Fonction pour gérer l'import complet depuis CAROL
const handleCAROLImport = useCallback((data) => {
  console.log('✅ Import CAROL complet:', data);
  
  const { vehicleData, taskMapping, carolMetadata } = data;
  
  // 1. Remplir les infos du véhicule
  setHeaderInfo(vehicleData);
  
  // 2. Activer les items
  if (taskMapping.itemStates && Object.keys(taskMapping.itemStates).length > 0) {
    setItemStates(prev => ({
      ...prev,
      ...taskMapping.itemStates
    }));
  }
  
  // 3. Ajouter les notes
  if (taskMapping.itemNotes && Object.keys(taskMapping.itemNotes).length > 0) {
    setItemNotes(prev => ({
      ...prev,
      ...taskMapping.itemNotes
    }));
  }
  
  // 4. Importer les forfaits
  if (taskMapping.forfaitData && Object.keys(taskMapping.forfaitData).length > 0) {
    setForfaitData(prev => ({
      ...prev,
      ...taskMapping.forfaitData
    }));
  }
  
  // 5. Importer les pièces supplémentaires
  if (taskMapping.pieceLines && Object.keys(taskMapping.pieceLines).length > 0) {
    setPieceLines(prev => ({
      ...prev,
      ...taskMapping.pieceLines
    }));
  }
  
  // Notification de succès
  const tasksCount = Object.keys(taskMapping.itemStates || {}).length;
  const message = `✅ Import CAROL réussi !\n\n` +
    `🚗 ${vehicleData.marque || '?'} ${vehicleData.modele || '?'}\n` +
    `📋 VIN: ${vehicleData.vin || 'N/A'}\n` +
    `📍 Immat: ${vehicleData.immatriculation || 'N/A'}\n` +
    `📊 ${vehicleData.kilometres || 'N/A'} km\n\n` +
    `✨ ${tasksCount} tâche(s) + pièces importées`;
  
  alert(message);
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

const handleDownload = () => {
  downloadListePiecesPDF();
  downloadOrdreReparationPDF();
};

// ========== LISTENER BOOKMARKLET ==========
useEffect(() => {
  const handleBookmarkletMessage = (event) => {
    // Sécurité : vérifier l'origine (en production)
    // if (event.origin !== 'https://www.carol.autohero.com') {
    //   return;
    // }
    
    if (event.data?.type === 'CAROL_IMPORT') {
      console.log('📥 Données reçues du Bookmarklet CAROL:', event.data.data);
      
      try {
        const carolData = event.data.data;
        
        const mappedData = {
          vehicleData: {
            lead: carolData.id || '',
            immatriculation: (carolData.vehicle?.licensePlate || '').toUpperCase(),
            vin: (carolData.vehicle?.vin || '').toUpperCase(),
            marque: carolData.vehicle?.make || '',
            modele: carolData.vehicle?.model || '',
            kilometres: (carolData.vehicle?.mileage || '').toString().replace(/\D/g, ''),
            moteur: carolData.vehicle?.fuelType || '',
            boite: carolData.vehicle?.transmission || '',
            dateVehicule: carolData.vehicle?.firstRegistration || '',
            clim: carolData.vehicle?.airConditioning || '',
            freinParking: carolData.vehicle?.parkingBrake || '',
            startStop: Boolean(carolData.vehicle?.startStop)
          },
          taskMapping: {
            itemStates: {},
            itemNotes: {},
            forfaitData: {},
            pieceLines: {}
          },
          carolMetadata: {
            refurbishmentNumber: carolData.refurbishmentNumber || '',
            status: carolData.status || '',
            workshop: carolData.workshop?.name || '',
            position: carolData.position || '',
            estimatedCost: carolData.estimatedTotalCost || 0,
            actualCost: carolData.actualTotalCost || 0,
            tasks: carolData.tasks || []
          }
        };
        
        handleCAROLImport(mappedData);
        
        alert('✅ Données CAROL importées avec succès via Bookmarklet !');
        
      } catch (error) {
        console.error('❌ Erreur traitement données Bookmarklet:', error);
        alert('❌ Erreur lors de l\'import des données : ' + error.message);
      }
    }
  };
  
  window.addEventListener('message', handleBookmarkletMessage);
  
  return () => {
    window.removeEventListener('message', handleBookmarkletMessage);
  };
}, [handleCAROLImport]);

const cycleState = useCallback(itemId => {
  setItemStates(prev => {
    const current = prev[itemId] ?? 0;
    const next = (current + 1) % 3;
    const updated = { ...prev, [itemId]: next };

    // ✅ INITIALISER forfaitData avec les valeurs par défaut si l'item passe à l'état 1
    if (next === 1 && !forfaitData[itemId]) {
      setForfaitData(prevForfait => {
        // Ne rien faire si le forfait existe déjà
        if (prevForfait[itemId]) return prevForfait;

        // Récupérer les valeurs par défaut
        const defaults = DEFAULT_VALUES[itemId] || DEFAULT_VALUES.default || {};
        
        return {
          ...prevForfait,
          [itemId]: {
            moQuantity: defaults.moQuantity || '0.1',
            moPrix: defaults.moPrix || 35.8,
            moCategory: 'Mécanique',
            pieceReference: defaults.pieceReference || '',
            pieceDesignation: defaults.pieceDesignation || '',
            pieceQuantity: defaults.pieceQuantity || '1',
            piecePrixUnitaire: defaults.piecePrixUnitaire || '0',
            piecePrix: defaults.piecePrix || '0',
            pieceFournisseur: defaults.pieceFournisseur || '',
            consommableReference: defaults.consommableReference || '',
            consommableDesignation: defaults.consommableDesignation || '',
            consommableQuantity: defaults.consommableQuantity || '0',
            consommablePrixUnitaire: defaults.consommablePrixUnitaire || '0',
            consommablePrix: defaults.consommablePrix || '0'
          }
        };
      });
    }


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
  // Formatage spécial pour les pneus
  if (['pneusAvant', 'pneusArriere', 'pneus4'].includes(id)) {
    setItemNotes(prev => ({ ...prev, [id]: formatTireSize(value) }));
  } else {
    setItemNotes(prev => ({ ...prev, [id]: value }));
  }
  
  // ✅ NOUVEAU : Synchroniser avec forfaitData pour REPC et REMPC
  const isREPC = TEXT_ITEMS_1.some(item => item.id === id);
  const isREMPC = TEXT_ITEMS_2.some(item => item.id === id);
  
  if (isREPC || isREMPC) {
    setForfaitData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        moDesignation: value
      }
    }));
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
    
    // 🔧 NOUVEAU : Toujours recalculer piecePrix si qty ou pu changent
    if (field === 'pieceQuantity' || field === 'piecePrixUnitaire') {
      const qty = parseFloat(fd.pieceQuantity || 0);
      const pu = parseFloat(fd.piecePrixUnitaire || 0);
      const calculatedPrice = (qty * pu).toFixed(2);
      fd.piecePrix = calculatedPrice;
      console.log('🔧 Calcul piecePrix:', { itemId, field, value, qty, pu, result: calculatedPrice });
    }
    
    // 🔧 NOUVEAU : Aussi pour les consommables
    if (field === 'consommableQuantity' || field === 'consommablePrixUnitaire') {
      const qty = parseFloat(fd.consommableQuantity || 0);
      const pu = parseFloat(fd.consommablePrixUnitaire || 0);
      fd.consommablePrix = (qty * pu).toFixed(2);
    }
    
    return nextForfait;
  });
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
// Remplace la fonction dispatchPieces existante par ce bloc
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
      } else if (typeof firstPiece.quantity === 'number') {
        qty = firstPiece.quantity;
      }

      let pu = 0;
      if (typeof firstPiece.prixUnitaire === 'string' && firstPiece.prixUnitaire.trim() !== '') {
        pu = parseFloat(firstPiece.prixUnitaire.replace(',', '.'));
        if (isNaN(pu)) pu = 0;
      } else if (typeof firstPiece.prixUnitaire === 'number') {
        pu = firstPiece.prixUnitaire;
      }

      const prix = +(qty * pu || 0); // nombre

      nextData[forfaitId] = {
        ...existing,
        pieceReference: firstPiece.reference,
        pieceDesignation: firstPiece.designation || existing.pieceDesignation || '',
        pieceQuantity: qty ? qty.toString() : '',
        piecePrixUnitaire: pu ? +pu.toFixed(2) : '',
        piecePrix: prix ? +prix.toFixed(2) : '',
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
        if (!nextLines[forfaitId]) {
          nextLines[forfaitId] = [];
        }

        additionalPieces.forEach(piece => {
          let qty = 1;
          if (typeof piece.quantity === 'string' && piece.quantity.trim() !== '') {
            qty = parseFloat(piece.quantity.replace(',', '.'));
            if (isNaN(qty)) qty = 1;
          } else if (typeof piece.quantity === 'number') {
            qty = piece.quantity;
          }

          let pu = 0;
          if (typeof piece.prixUnitaire === 'string' && piece.prixUnitaire.trim() !== '') {
            pu = parseFloat(piece.prixUnitaire.replace(',', '.'));
            if (isNaN(pu)) pu = 0;
          } else if (typeof piece.prixUnitaire === 'number') {
            pu = piece.prixUnitaire;
          }

          const prix = +(qty * pu || 0);

          nextLines[forfaitId].push({
            reference: piece.reference,
            designation: piece.designation || '',
            fournisseur: piece.fournisseur || '',
            quantity: qty.toString(),
            prixUnitaire: pu ? +pu.toFixed(2) : '',
            prix: prix ? +prix.toFixed(2) : ''
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
  alert(mauriceMode ? `✨ Maurice a importé ${totalPieces} pièce(s) dans ${totalForfaits} forfait(s), nickel !` : `✓ ${totalPieces} pièce(s) importée(s) vers ${totalForfaits} forfait(s)`);
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
      alert(mauriceMode ? '⚠️ C\'est quoi ce lead ?' : '⚠️ Lead requis');
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
      alert(mauriceMode ? '🧙‍♂️ Maurice a tout sauvegardé, chef !' : '✅ Devis sauvegardé');
    } catch (e) {
      alert(mauriceMode ? '❌ Maurice a un souci : ' + e.message : '❌ ' + e.message);

      // Incrémenter les devis Maurice
if (mauriceMode) {
  setMauriceStats(prev => {
    const newStats = {
      ...prev,
      devisCrees: prev.devisCrees + 1
    };
    localStorage.setItem('mauriceStats', JSON.stringify(newStats));
    return newStats;
  });
}
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



  const loadQuoteFromFirebase = useCallback((data) => {
  setHeaderInfo(data.headerInfo || {});
  setItemStates(data.itemStates || {});
  setItemNotes(data.itemNotes || {});
  setForfaitData(data.forfaitData || {});
  setPieceLines(data.pieceLines || {});
  setLastMaintenance(data.lastMaintenance || {});
  setOilInfo(data.oilInfo || { viscosity: '', quantity: '' });
  setIncludeControleTechnique(data.includeControleTechnique ?? true);
  setIncludeContrevisite(data.includeContrevisite ?? false);
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

// Fonction Maurice Mode ULTIMATE
const handleLogoClick = () => {
  const newClicks = mauriceClicks + 1;
  setMauriceClicks(newClicks);

  if (newClicks === 6) {
  const newMode = !mauriceMode;
  setMauricMode(newMode);
  localStorage.setItem('mauriceMode', newMode);
  setShowConfetti(true);
  playMauriceSound('ding');


    // Mise à jour des stats Maurice
  if (newMode) {
    setMauriceStats(prev => {
      const newStats = {
        ...prev,
        activations: prev.activations + 1,
        firstActivation: prev.firstActivation || new Date().toISOString()
      };
      localStorage.setItem('mauriceStats', JSON.stringify(newStats));
      return newStats;
    });
  }
    
    // Reset dark mode si on désactive Maurice
    if (!newMode && darkMaurice) {
      setDarkMaurice(false);
      localStorage.setItem('darkMaurice', 'false');
    }
    
    setTimeout(() => {
      setShowConfetti(false);
      setMauriceClicks(0);
    }, 3000);
  } else if (newClicks < 6) {
    setTimeout(() => setMauriceClicks(0), 2000);
  }
};

// Fonction Footer pour Mode Nuit
const handleFooterClick = () => {
  if (!mauriceMode) return;
  
  const newClicks = footerClicks + 1;
  setFooterClicks(newClicks);
  
  if (newClicks === 3) {
    const newDarkMode = !darkMaurice;
    setDarkMaurice(newDarkMode);
    localStorage.setItem('darkMaurice', newDarkMode);
    setFooterClicks(0);
    playMauriceSound('whoosh');
      // Stats mode nuit
  if (newDarkMode) {
    setMauriceStats(prev => {
      const newStats = {
        ...prev,
        modeNuitActivations: prev.modeNuitActivations + 1
      };
      localStorage.setItem('mauriceStats', JSON.stringify(newStats));
      return newStats;
    });
  }
    alert(newDarkMode ? '🌙 Mode Nuit Maurice activé !' : '☀️ Mode Jour Maurice activé !');
  } else {
    setTimeout(() => setFooterClicks(0), 2000);
  }
};



 // Couleurs dynamiques ULTIMATE avec thèmes
const colors = mauriceMode ? (darkMaurice ? {
  // MODE NUIT CYBERPUNK
  primary: '#00FFFF',
  secondary: '#FF00FF',
  bg: 'linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%)',
  bgCard: '#0a0a0a',
  text: '#00FFFF',
  textSecondary: '#FF00FF',
  btnPrimary: '#00FFFF',
  btnSuccess: '#00FF00',
  borderColor: '#00FFFF',
  borderSecondary: '#FF00FF'
} : (mauriceTheme === 'vegas' ? {
  // MODE VEGAS (Doré/Noir)
  primary: '#FFD700',
  secondary: '#FF6B00',
  bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
  bgCard: '#1a1a1a',
  text: '#FFD700',
  textSecondary: '#FF6B00',
  btnPrimary: '#FFD700',
  btnSuccess: '#32CD32',
  borderColor: '#FFD700',
  borderSecondary: '#FF6B00'
} : {
  // MODE JOUR MAURICE CLASSIQUE
  primary: '#9333EA',
  secondary: '#EC4899',
  bg: 'linear-gradient(135deg, #FDF4FF 0%, #FCE7F3 50%, #FEF3C7 100%)',
  bgCard: '#FFFFFF',
  text: '#9333EA',
  textSecondary: '#EC4899',
  btnPrimary: '#9333EA',
  btnSuccess: '#10B981',
  borderColor: '#E9D5FF',
  borderSecondary: '#FED7AA'
})) : {
  // MODE NORMAL HEROTOOL
  primary: '#003D5C',
  secondary: '#0891B2',
  bg: 'linear-gradient(135deg, #F0F4F8 0%, #E1E8ED 100%)',
  bgCard: '#FFFFFF',
  text: '#003D5C',
  textSecondary: '#0891B2',
  btnPrimary: '#003D5C',
  btnSuccess: '#0891B2',
  borderColor: '#CBD5E1',
  borderSecondary: '#E1E8ED'
};

// Calcul des badges Maurice (FONCTION SÉPARÉE)
const getMauriceBadges = () => {
  const badges = [];
  
  if (mauriceStats.activations >= 1) {
    badges.push({ emoji: '🎩', label: 'Découvreur Maurice' });
  }
  if (mauriceStats.activations >= 10) {
    badges.push({ emoji: '⭐', label: 'Fan Maurice' });
  }
  if (mauriceStats.activations >= 50) {
    badges.push({ emoji: '👑', label: 'Maurice Légendaire' });
  }
  if (mauriceStats.modeNuitActivations >= 5) {
    badges.push({ emoji: '🌙', label: 'Maurice Nocturne' });
  }
  if (mauriceStats.devisCrees >= 10) {
    badges.push({ emoji: '💼', label: 'Maurice Pro' });
  }
  if (mauriceStats.devisCrees >= 100) {
    badges.push({ emoji: '🏆', label: 'Maurice Expert' });
  }
  
  return badges;
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



// Fonction pour télécharger l'Ordre de Réparation en PDF
const downloadOrdreReparationPDF = useCallback(() => {
  const el = document.getElementById('ordre-reparation-content');
  if (!el) return;

  // Sauvegarde des styles originaux
  const originalStyles = {};
  const elements = el.querySelectorAll('*');
  elements.forEach(el => {
    originalStyles[el.getAttribute('id') || el.getAttribute('class')] = el.style.backgroundColor;
    el.style.backgroundColor = 'transparent'; // Annule les fonds
  });

  html2pdf()
    .set({
      margin: 0.05,
      filename: `Ordre_Reparation_${headerInfo.lead || 'vehicule'}.pdf`,
      html2canvas: { scale: 8 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      // Restaure les styles originaux après conversion
      elements.forEach(el => {
        const key = el.getAttribute('id') || el.getAttribute('class');
        el.style.backgroundColor = originalStyles[key] || '';
      });
      pdf.save();
    })
    .catch((error) => {
      // Restaure en cas d'erreur
      elements.forEach(el => {
        const key = el.getAttribute('id') || el.getAttribute('class');
        el.style.backgroundColor = originalStyles[key] || '';
      });
      console.error('Erreur lors de la conversion PDF :', error);
    });
}, [headerInfo.lead]);


// ✅ Fonction de téléchargement PDF de la liste de pièces
const downloadListePiecesPDF = useCallback(() => {
  const el = document.getElementById('liste-pieces-content');
  if (!el) {
    alert('⚠️ Liste de pièces non trouvée');
    return;
  }
  
  html2pdf()
    .set({
      margin: 0.00025,
      filename: `Liste_Pieces_${headerInfo.lead || 'vehicule'}.pdf`,
      html2canvas: { scale: 8},
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .save();
}, [headerInfo.lead]);

// 🚗 Fonction Carol - Chargement automatique des dommages
const loadFromCarol = useCallback(async (leadValue) => {
  if (!leadValue || !leadValue.trim()) return;
  
  const lead = leadValue.trim().toUpperCase();
  
  console.log('🔍 Recherche Carol pour:', lead);
  console.log('📊 carolData length:', carolData.length);
  console.log('📋 carolData[0]:', carolData[0]);
  
  const damages = carolData.filter(row => 
    row.stock_number && row.stock_number.toUpperCase() === lead
  );
  
  console.log('✅ Dommages trouvés:', damages.length);
  console.log('📋 Premier dommage:', damages[0]);
  
  if (damages.length === 0) {
    console.log('Aucun dommage Carol trouvé pour:', lead);
    return;
  }
  
  // Demander confirmation
  const confirmLoad = window.confirm(
    `🔍 ${damages.length} dommage(s) trouvé(s) dans Carol pour le lead ${lead}.\n\n` +
    `Voulez-vous charger automatiquement ces dommages ?`
  );
  
  if (!confirmLoad) return;
  
  // Parser et mapper les dommages
resetCounters();
const mappedDamages = damages.map(damage => mapCarolToHeroToolWithAutoCheck(damage, setItemStates));
console.log('🗺️ Mapped damages:', mappedDamages);
  
  // CALCULER LES STATS AVANT (pas après)
let successCount = 0;
let failedCount = 0;
let ignoredCount = 0;
let needsInputCount = 0;  // ← Cette ligne manque !
const needsInputDamages = [];
const failedDamages = [];
  
mappedDamages.forEach(mapped => {
  if (mapped.action === 'ignore') {
    ignoredCount++;
  } else if (mapped.needsUserInput) {
    needsInputCount++;
    needsInputDamages.push(mapped);
  } else if (mapped.success) {  // ← ICI
    successCount++;
  } else {
    failedCount++;
    failedDamages.push(mapped);
  }
});
  
  // Appliquer les dommages aux états
  setItemStates(prev => {
    const newStates = { ...prev };
    
    mappedDamages.forEach(mapped => {
      if (mapped.success && mapped.itemId) {
        newStates[mapped.itemId] = 1;
      }
    });
    
    return newStates;
  });
  
  // Ajouter les notes
  setItemNotes(prev => {
    const newNotes = { ...prev };
    
    mappedDamages.forEach(mapped => {
      if (mapped.success && mapped.itemId && mapped.note) {
        newNotes[mapped.itemId] = (newNotes[mapped.itemId] || '') + '\n' + mapped.note;
      }
    });
    
    return newNotes;
  });
  
  // Message de résultat
  let message = `✅ Chargement Carol terminé !\n\n`;
  message += `✓ ${successCount} dommage(s) mappé(s) avec succès\n`;
  
  if (failedCount > 0) {
    message += `⚠️ ${failedCount} dommage(s) non mappé(s):\n`;
    failedDamages.slice(0, 3).forEach(note => {
      message += `  • ${note}\n`;
    });
    if (failedCount > 3) {
      message += `  ... et ${failedCount - 3} autre(s)\n`;
    }
  }
  
  alert(message);
}, [carolData]);
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
  itemStates
  
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


  return (
<div className={`min-h-screen p-4 md:p-8 transition-all-smooth ${mauriceMode ? 'maurice-cursor' : ''} ${ultraMaurice ? 'ultra-maurice' : ''}`} style={{ background: colors.bg }}>      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8">
<div 
  className="text-center mb-8 pb-6 border-b-2 transition-all-smooth" 
  style={{ 
    borderColor: colors.borderColor,
    backgroundColor: darkMaurice ? colors.bgCard : 'transparent'
  }}
>
  <div className="flex items-center justify-center mb-3">
    <div 
      onClick={handleLogoClick}
      className="transition-all-smooth"
      style={{ 
        width: 60, 
        height: 60, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginRight: 15,
        overflow: 'hidden',
        transform: mauriceClicks > 0 ? `rotate(${mauriceClicks * 15}deg) scale(${1 + mauriceClicks * 0.1})` : 'none',
        boxShadow: darkMaurice ? '0 0 20px #00FFFF' : 'none'
      }}

    >
      {mauriceMode ? (
  <img 
    src="/elon.png" 
    alt="Maurice"
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover',
      filter: darkMaurice ? 'brightness(1.2) contrast(1.3)' : 'none',
      backgroundColor: darkMaurice ? '#1a1a1a' : '#9333EA'
    }}
  />
      ) : (
        <img 
          src="/logo.png" 
          alt="HeroTOOL Logo"
          style={{ width: '140%', height: '140%', objectFit: 'contain' }}
        />
      )}
    </div>
    <h1 className="text-4xl md:text-5xl font-bold transition-all-smooth">
  {mauriceMode ? (
    <>
      <span style={{ color: colors.primary }}>Maurice</span>
      <span style={{ color: colors.secondary }}> le chiffreur</span>
    </>
  ) : (
    <>
      <span style={{ color: '#FF6B35' }}>Hero</span>
      <span style={{ color: '#003D5C' }}>TOOL</span>
    </>
  )}
</h1>
  </div>
  
  {/* Compteur de clics */}
  {mauriceClicks >= 3 && mauriceClicks < 5 && (
    <p className="text-xs mb-2 animate-pulse" style={{ color: darkMaurice ? colors.primary : '#6b7280' }}>
      🤫 {5 - mauriceClicks} clic{5 - mauriceClicks > 1 ? 's' : ''} restant{5 - mauriceClicks > 1 ? 's' : ''}...
    </p>
  )}
  
  {/* Confetti */}
  {showConfetti && (
    <div className="text-4xl mb-2 animate-bounce">
      🎉 🎊 ✨ 🎈 🎁 
    </div>
  )}
  
  {/* Citation de Maurice (en tooltip sur le logo) */}
  {mauriceMode && (
    <div 
      className="text-xs italic mb-2 transition-all-smooth" 
      style={{ 
        color: darkMaurice ? colors.secondary : colors.primary,
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px'
      }}
    >
      💬 "{mauriceQuotes[currentQuote]}"
    </div>
  )}
  
  {/* Bouton changement de thème Maurice */}
{mauriceMode && !darkMaurice && (
  <button
    onClick={() => {
      const newTheme = mauriceTheme === 'classic' ? 'vegas' : 'classic';
      setMauriceTheme(newTheme);
      localStorage.setItem('mauriceTheme', newTheme);
      playMauriceSound('ding');
    }}
    className="text-xs px-4 py-2 rounded-full font-semibold hover:opacity-80 transition-all mb-2"
    style={{ 
      backgroundColor: mauriceTheme === 'vegas' ? '#FFD700' : '#9333EA',
      color: '#000'
    }}
  >
    {mauriceTheme === 'vegas' ? '🎰 Mode Vegas' : '💜 Mode Classique'} • Cliquez pour changer
  </button>
)}
{/* Ultra Maurice Indicator */}
{ultraMaurice && (
  <div className="text-lg font-bold mt-2 ultra-maurice-spin" style={{ color: colors.primary }}>
    🚀 ULTRA MAURICE MODE 🌈
  </div>
)}

  {/* Footer cliquable pour mode nuit */}
  <p 
    className="text-sm font-bold italic transition-all-smooth" 
    style={{ color: darkMaurice ? colors.text : '#6b7280' }}
  >
    {mauriceMode 
      ? "Maurice fait des prix d'ami" 
      : "Outil professionnel de chiffrage automobile"
    }
  </p>
  
  {darkMaurice && (
    <p className="text-xs mt-2 animate-glow" style={{ color: colors.primary }}>
      🌙 Mode Nuit Cyberpunk
    </p>
  )}
</div>

{/* ========== IMPORT CAROL ========== */}

<CAROLImport onImportSuccess={handleCAROLImport} />
{/* ================================== */}

<VehicleInfoForm
  headerInfo={headerInfo}
  updateHeaderInfo={updateHeaderInfo}
  toggleMoteur={toggleMoteur}
  toggleBoite={toggleBoite}
  toggleClim={toggleClim}
  toggleFreinParking={toggleFreinParking}
  toggleStartStop={toggleStartStop}
  loadFromCarol={loadFromCarol}
  carolLoading={carolLoading}
/>

{/* 💾 Gestionnaire de devis Firebase - SYSTÈME UNIFIÉ */}
<QuoteManager
  headerInfo={headerInfo}
  itemStates={itemStates}
  itemNotes={itemNotes}
  forfaitData={forfaitData}
  pieceLines={pieceLines}
  lastMaintenance={lastMaintenance}
  oilInfo={oilInfo}
  includeControleTechnique={includeControleTechnique}
  includeContrevisite={includeContrevisite}
  onLoadQuote={loadQuoteFromFirebase}
  mauriceMode={mauriceMode}
  colors={colors}
/>
        <MaintenanceHistory lastMaintenance={lastMaintenance} updateLastMaintenance={updateLastMaintenance} />
        <VehicleSummary headerInfo={headerInfo} oilInfo={oilInfo} lastMaintenance={lastMaintenance} />
        <div className="mb-8">
          <OilInfoForm oilInfo={oilInfo} updateOilInfo={updateOilInfo} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ENTRETIEN</h2>
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
            <h2 className="text-2xl font-bold text-gray-800">PNEUS ET FREINS</h2>
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
    <h2 className="text-2xl font-bold text-gray-800">MECANIQUE</h2>
    <button 
      onClick={() => toggleCategory('mecanique')} 
      className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90" 
      style={{ backgroundColor: '#FF6B35' }}
    >
      {expandedCategories.mecanique ? 'Fermer' : 'Ouvrir'}
    </button>
  </div>
  {expandedCategories.mecanique && (
    <ChecklistSection
      leftItems={TEXT_ITEMS_3}
      rightItems={TEXT_ITEMS_4}
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
            <p className="text-green-800 font-semibold">Checklist terminée ! 🎉</p>
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

{/* Carrosserie */}
<div className="mb-2">
  <h3 className="text-xl font-bold text-gray-800 mb-4">Carrosserie</h3>
  {Object.entries(forfaitData)
    .filter(([key, data]) => {
      // REPC et REMPC
      const isREPC = TEXT_ITEMS_1.some(item => item.id === key);
      const isREMPC = TEXT_ITEMS_2.some(item => item.id === key);
      
      // ❌ ON MASQUE Réparation Peinture
      // const isReparationPeinture = data.peintureForfait;
      
      // Peinture Seule
      const isPeintureSeule = data.peintureSeuleForfait;
      
      // On retourne seulement REPC, REMPC et Peinture Seule
      return isREPC || isREMPC;
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
              setShowOrdreReparation={toggleBothSections}
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
              itemNotes={itemNotes}
              updateForfaitField={updateForfaitField}
              activePeintureForfaits={activePeintureForfaits}
              itemStates={itemStates}
              />
            <div className="mt-4 text-center">
              <button
                onClick={handleDownload}
              className="print-button px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg"
              >
                📄 Télécharger les documents (PDF)
              </button>
            </div>

            <ListePieces
              showListePieces={showListePieces}
              setShowListePieces={setShowListePieces}
              headerInfo={headerInfo}
              piecesBySupplier={piecesBySupplier}
              printListePieces={downloadListePiecesPDF}
            />
          </>
        )}
{/* Footer */}
<div 
  onClick={handleFooterClick}
  className="mt-8 pt-6 pb-4 border-t-2 text-center transition-all-smooth" 
  style={{ 
    borderColor: colors.borderColor,
    background: darkMaurice 
      ? 'linear-gradient(90deg, #000000 0%, #1a0033 50%, #000000 100%)'
      : (mauriceMode ? 'linear-gradient(90deg, #FDF4FF 0%, #FCE7F3 100%)' : 'transparent'),
    cursor: mauriceMode ? 'pointer' : 'default',
    boxShadow: darkMaurice ? `0 -5px 20px ${colors.primary}` : 'none'
  }}
  title={mauriceMode ? "Triple-clic pour le mode nuit !" : ""}
>
  <p 
    className="text-sm font-semibold transition-all-smooth" 
    style={{ color: darkMaurice ? colors.primary : (mauriceMode ? colors.primary : '#6b7280') }}
  >
    {mauriceMode ? (
      <>
        <span style={{ fontSize: '1.2em' }}>
          {darkMaurice ? '🌙' : '🎩'}
        </span> Maurice le chiffreur © 2025
      </>
    ) : (
      'HeroTOOL © 2025 - Développé par Loïc.L, codé par Claude.ia'
    )}
  </p>
  <p 
    className="text-xs mt-1 transition-all-smooth" 
    style={{ color: darkMaurice ? colors.secondary : (mauriceMode ? colors.secondary : '#9ca3af') }}
  >
    {mauriceMode 
      ? (darkMaurice ? "💎 Expert en devis nocturnes" : "👔 Le pro des prix d'ami depuis toujours")
      : "Version 1.0 - Reconditionnement & Devis"
    }
  </p>
  {mauriceMode && (
    <p 
      className="text-xs mt-2 italic animate-pulse" 
      style={{ color: colors.primary }}
    >
      {darkMaurice ? '✨ Mode Cyberpunk activé ✨' : '✨ Mode secret activé ✨'}
    </p>
  )}
  {mauriceMode && footerClicks > 0 && footerClicks < 3 && (
    <p className="text-xs mt-1 animate-pulse" style={{ color: colors.secondary }}>
      🤫 {3 - footerClicks} clic{3 - footerClicks > 1 ? 's' : ''} pour le mode nuit...
    </p>
  )}
  
  {/* Stats et Badges Maurice */}
  {mauriceMode && (
    <div className="mt-4 pt-4 border-t transition-all-smooth" style={{ borderColor: colors.borderColor }}>
      <p className="text-xs font-semibold mb-2" style={{ color: colors.text }}>
        📊 Stats Maurice : {mauriceStats.activations} activation{mauriceStats.activations > 1 ? 's' : ''} • {mauriceStats.devisCrees} devis • {mauriceStats.modeNuitActivations} nuit{mauriceStats.modeNuitActivations > 1 ? 's' : ''}
      </p>
      {getMauriceBadges().length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {getMauriceBadges().map((badge, i) => (
            <span 
              key={i}
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ 
                backgroundColor: darkMaurice ? 'rgba(0,255,255,0.2)' : 'rgba(147,51,234,0.2)',
                color: colors.primary,
                border: `1px solid ${colors.primary}`
              }}
            >
              {badge.emoji} {badge.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )}
</div>

      </div>

    </div>
  );

export default App;
