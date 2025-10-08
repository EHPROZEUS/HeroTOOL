// NOTE: Ce fichier reprend ta version actuelle en remplaçant UNIQUEMENT la fonction parsePiecesText
// et en adaptant dispatchPieces pour utiliser prixUnitaire. Le reste est inchangé.

import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import VehicleInfoForm from './components/Header/VehicleInfoForm';
import MaintenanceHistory from './components/Maintenance/MaintenanceHistory';
import OilInfoForm from './components/Maintenance/OilInfoForm';
import VehicleSummary from './components/Summary/VehicleSummary';
import TaskSummary from './components/Summary/TaskSummary';
import ChecklistSection from './components/Checklist/ChecklistSection';
import ForfaitForm from './components/Forfaits/ForfaitForm';
import ImportModule from './components/Import/ImportModule';
import OrdreReparation from './components/Reports/OrdreReparation';
import ListePieces from './components/Reports/ListePieces';

import { 
  FOURNISSEURS, 
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
  DSP_LEFT_ITEMS,
  DSP_RIGHT_ITEMS,
  LUSTRAGE_ITEMS,
} from './config/constants';

import { formatTireSize } from './utils/formatters';
import { 
  calculateTotals, 
  calculateMOByCategory, 
  getPiecesListBySupplier 
} from './utils/calculations';
import { parsePieces } from './utils/parser'; // <-- NOUVEAU IMPORT

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

function App() {
  // (États existants inchangés)
  const [headerInfo, setHeaderInfo] = useState({
    lead: '', immatriculation: '', vin: '', moteur: '', boite: '', dateVehicule: '', 
    kilometres: '', clim: '', freinParking: '', startStop: false
  });
  const [itemStates, setItemStates] = useState(
    Object.fromEntries(ALL_ITEMS.map(item => [item.id, 0]))
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
  const [googleApiState, setGoogleApiState] = useState({
    loaded: false, initialized: false, signedIn: false, error: null
  });
  const [expandedCategories, setExpandedCategories] = useState({
    mecanique: false, pneusFreins: false, dsp: false, lustrage: false, carrosserie: false
  });

  // (useEffect Google + autosave — inchangés)
  useEffect(() => {
    const initGoogleApi = async () => {
      try {
        if (!CLIENT_ID || !API_KEY) {
          throw new Error('Credentials Google manquants. Vérifiez vos variables d\'environnement.');
        }
        let attempts = 0;
        while (!window.gapi && attempts < 50) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        if (!window.gapi) throw new Error('Google API script not loaded');

        setGoogleApiState(prev => ({ ...prev, loaded: true }));
        await new Promise((resolve, reject) => {
          window.gapi.load('client:auth2', { callback: resolve, onerror: reject });
        });
        await window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        const auth2 = window.gapi.auth2.getAuthInstance();
        if (!auth2) throw new Error('Failed to get auth2 instance');
        setGoogleApiState({
          loaded: true,
          initialized: true,
            signedIn: auth2.isSignedIn.get(),
          error: null
        });
        auth2.isSignedIn.listen(isSignedIn => {
          setGoogleApiState(prev => ({ ...prev, signedIn: isSignedIn }));
        });
      } catch (e) {
        setGoogleApiState({
          loaded: false, initialized: false, signedIn: false, error: e.message
        });
      }
    };
    initGoogleApi();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (headerInfo.lead.trim()) {
        const quoteData = {
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
        localStorage.setItem(`herotool_quote_${headerInfo.lead}`, JSON.stringify(quoteData));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [headerInfo, itemStates, itemNotes, forfaitData, pieceLines, lastMaintenance, oilInfo, includeControleTechnique, includeContrevisite]);

  const toggleCategory = (cat) =>
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  // Update helpers (inchangés)
  const updateHeaderInfo = (f, v) => setHeaderInfo(p => ({ ...p, [f]: v }));
  const toggleMoteur = (t) => setHeaderInfo(p => ({ ...p, moteur: p.moteur === t ? '' : t }));
  const toggleBoite = (t) => setHeaderInfo(p => ({ ...p, boite: p.boite === t ? '' : t }));
  const toggleClim = (t) => setHeaderInfo(p => ({ ...p, clim: p.clim === t ? '' : t }));
  const toggleFreinParking = (t) => setHeaderInfo(p => ({ ...p, freinParking: p.freinParking === t ? '' : t }));
  const toggleStartStop = () => setHeaderInfo(p => ({ ...p, startStop: !p.startStop }));

  const cycleState = (id) => setItemStates(p => ({ ...p, [id]: (p[id] + 1) % 3 }));

  const updateNote = (id, v) => {
    if (['pneusAvant','pneusArriere','pneus4'].includes(id)) {
      setItemNotes(p => ({ ...p, [id]: formatTireSize(v) }));
    } else {
      setItemNotes(p => ({ ...p, [id]: v }));
    }
  };

  // Maintenance + huile (inchangés sauf formatage)
  const updateLastMaintenance = (f, v) => setLastMaintenance(p => ({ ...p, [f]: v }));
  const updateOilInfo = (field, value) => {
    setOilInfo(prev => {
      const newOilInfo = { ...prev, [field]: value };
      if (newOilInfo.viscosity && newOilInfo.quantity) {
        const huileConfig = HUILES_CONFIG[newOilInfo.viscosity];
        if (huileConfig) {
          const quantity = parseFloat(newOilInfo.quantity) || 0;
          let quantiteCalculee = quantity;
          let prixTotal = 0;
          if (huileConfig.unite === 'bidon5L') {
            const bidons = Math.ceil(quantity / 5);
            quantiteCalculee = bidons;
            prixTotal = bidons * huileConfig.prixUnitaire;
          } else {
            prixTotal = quantity * huileConfig.prixUnitaire;
          }
          setForfaitData(prevForfait => ({
            ...prevForfait,
            filtreHuile: {
              ...prevForfait.filtreHuile,
              consommableReference: `Huile ${newOilInfo.viscosity}`,
              consommableDesignation: huileConfig.unite === 'bidon5L' ? 'Huile moteur (bidon 5L)' : 'Huile moteur',
              consommableQuantity: quantiteCalculee.toString(),
              consommablePrixUnitaire: huileConfig.prixUnitaire.toFixed(2),
              consommablePrix: prixTotal.toFixed(2)
            }
          }));
        }
      }
      return newOilInfo;
    });
  };

  // Forfaits (inchangé)
  const updateForfaitField = (itemId, field, value) => {
    setForfaitData(prev => {
      const newData = { ...prev, [itemId]: { ...prev[itemId], [field]: value } };
      const itemData = newData[itemId];
      if (field === 'pieceQuantity' || field === 'piecePrixUnitaire') {
        const qty = parseFloat(itemData.pieceQuantity || 0);
        const unitPrice = parseFloat(itemData.piecePrixUnitaire || 0);
        itemData.piecePrix = (qty * unitPrice).toFixed(2);
      }
      if (field === 'consommableQuantity' || field === 'consommablePrixUnitaire') {
        const qty = parseFloat(itemData.consommableQuantity || 0);
        const unitPrice = parseFloat(itemData.consommablePrixUnitaire || 0);
        itemData.consommablePrix = (qty * unitPrice).toFixed(2);
      }
      return newData;
    });
  };

  const addPieceLine = (itemId) => {
    setPieceLines(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { reference: '', designation: '', fournisseur: '', quantity: '1', prixUnitaire: '', prix: '' }]
    }));
  };

  const removePieceLine = (itemId, index) => {
    setPieceLines(prev => ({
      ...prev,
      [itemId]: prev[itemId].filter((_, i) => i !== index)
    }));
  };

  const updatePieceLine = (itemId, index, field, value) => {
    setPieceLines(prev => ({
      ...prev,
      [itemId]: prev[itemId].map((line, i) => {
        if (i === index) {
          const newLine = { ...line, [field]: value };
            if (field === 'quantity' || field === 'prixUnitaire') {
            const qty = parseFloat(newLine.quantity || 0);
            const unitPrice = parseFloat(newLine.prixUnitaire || 0);
            newLine.prix = (qty * unitPrice).toFixed(2);
          }
          return newLine;
        }
        return line;
      })
    }));
  };

  const canHaveMultiplePieces = (itemId) => !EXCLUDED_MULTI_PIECES.includes(itemId);

  /* === NOUVELLE FONCTION D'IMPORT ===
     Remplace complètement l'ancienne logique manuelle (regex diverses) */
  const parsePiecesText = (selectedFormat = 'auto', sourceSystem = 'auto', defaultSupplier = '') => {
    if (!importText.trim()) {
      setParsedPieces([]);
      return;
    }
    const results = parsePieces(importText, selectedFormat, sourceSystem, defaultSupplier);

    const enriched = results.map((p, idx) => ({
      id: `import_${idx}_${Date.now()}`,
      reference: p.reference || '',
      designation: p.designation || '',
      quantity: p.quantity || '1',
      prixUnitaire: p.prixUnitaire || p.unitPrice || '',
      unitPrice: p.prixUnitaire || p.unitPrice || '', // rétro‑compat
      prix: p.prix || (
        p.prixUnitaire && p.quantity
          ? (parseFloat(p.prixUnitaire) * parseFloat(p.quantity)).toFixed(2)
          : ''
      ),
      fournisseur: p.fournisseur || defaultSupplier || '',
      targetForfait: ''
    }));

    setParsedPieces(enriched);
  };

  // Mise à jour d’une pièce parsée
  const updateParsedPiece = (id, field, value) => {
    setParsedPieces(prev => prev.map(piece =>
      piece.id === id ? { ...piece, [field]: value } : piece
    ));
  };

  const removeParsedPiece = (id) => {
    setParsedPieces(prev => prev.filter(p => p.id !== id));
  };

  // Adaptation: utiliser prixUnitaire
  const dispatchPieces = () => {
    parsedPieces.forEach(piece => {
      if (piece.targetForfait && piece.reference) {
        addPieceLine(piece.targetForfait);
        setPieceLines(prev => {
          const targetLines = prev[piece.targetForfait] || [];
          const lastIndex = targetLines.length - 1;
          return {
            ...prev,
            [piece.targetForfait]: targetLines.map((line, idx) =>
              idx === lastIndex ? {
                reference: piece.reference,
                designation: piece.designation,
                fournisseur: piece.fournisseur,
                quantity: piece.quantity,
                prixUnitaire: piece.prixUnitaire || piece.unitPrice || '',
                prix: (
                  (parseFloat(piece.quantity) || 0) *
                  (parseFloat(piece.prixUnitaire || piece.unitPrice || 0) || 0)
                ).toFixed(2)
              } : line
            )
          };
        });
      }
    });
    setImportText('');
    setParsedPieces([]);
    setShowImportModule(false);
  };

  // Sauvegarde / chargement / Drive / impression (inchangés)
  const saveQuote = () => {
    if (!headerInfo.lead.trim()) {
      alert('⚠️ Veuillez renseigner un Lead avant de sauvegarder');
      return;
    }
    try {
      const data = {
        headerInfo, itemStates, itemNotes, forfaitData, pieceLines,
        lastMaintenance, oilInfo, includeControleTechnique, includeContrevisite,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`herotool_quote_${headerInfo.lead}`, JSON.stringify(data));
      alert(`✅ Devis "${headerInfo.lead}" sauvegardé`);
    } catch (e) {
      alert('❌ Erreur: ' + e.message);
    }
  };

  const loadQuote = (leadName) => {
    if (!leadName.trim()) {
      alert('⚠️ Nom de Lead requis');
      return;
    }
    try {
      const savedData = localStorage.getItem(`herotool_quote_${leadName}`);
      if (!savedData) {
        alert(`❌ Aucun devis trouvé pour "${leadName}"`);
        return;
      }
      const data = JSON.parse(savedData);
      setHeaderInfo(data.headerInfo);
      setItemStates(data.itemStates);
      setItemNotes(data.itemNotes);
      setForfaitData(data.forfaitData);
      setPieceLines(data.pieceLines);
      setLastMaintenance(data.lastMaintenance);
      setOilInfo(data.oilInfo);
      setIncludeControleTechnique(data.includeControleTechnique);
      setIncludeContrevisite(data.includeContrevisite);
      alert(`✅ Devis "${leadName}" chargé`);
    } catch (e) {
      alert('❌ Erreur: ' + e.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!googleApiState.initialized) {
        alert('⏳ Google API pas encore prête');
        return;
      }
      const auth2 = window.gapi?.auth2?.getAuthInstance();
      if (!auth2) throw new Error('Auth2 non dispo');
      await auth2.signIn();
    } catch (e) {
      alert('❌ Erreur connexion Google: ' + e.message);
    }
  };

  const uploadToDrive = async () => {
    if (!headerInfo.lead.trim()) {
      alert('⚠️ Lead requis avant export Drive');
      return;
    }
    try {
      if (!googleApiState.initialized) throw new Error('Google API non initialisée');
      const auth2 = window.gapi?.auth2?.getAuthInstance();
      if (!auth2) throw new Error('Auth2 non dispo');
      if (!auth2.isSignedIn.get()) await auth2.signIn();
      if (!auth2.isSignedIn.get()) throw new Error('Non connecté');
      const quoteData = {
        headerInfo, itemStates, itemNotes, forfaitData, pieceLines,
        lastMaintenance, oilInfo, includeControleTechnique, includeContrevisite,
        savedAt: new Date().toISOString()
      };
      const fileContent = JSON.stringify(quoteData, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });
      const metadata = {
        name: `HeroTOOL_${headerInfo.lead}_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json',
      };
      const user = auth2.currentUser.get();
      const accessToken = user.getAuthResponse().access_token;
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': `Bearer ${accessToken}` }),
        body: form,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      alert('✅ Exporté sur Drive');
    } catch (e) {
      alert('❌ Erreur Drive: ' + e.message);
    }
  };

  const getSavedQuotes = () => {
    const quotes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('herotool_quote_')) {
        const lead = key.replace('herotool_quote_', '');
        const data = JSON.parse(localStorage.getItem(key));
        quotes.push({ lead, savedAt: data.savedAt });
      }
    }
    return quotes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  };

  const deleteQuote = (leadName) => {
    if (window.confirm(`Supprimer le devis "${leadName}" ?`)) {
      localStorage.removeItem(`herotool_quote_${leadName}`);
      window.location.reload();
    }
  };

  const printOrdreReparation = () => {
    const printContent = document.getElementById('ordre-reparation-content');
    const fileName = headerInfo.lead ? `Ordre_Reparation_${headerInfo.lead}` : 'Ordre_Reparation';
    const w = window.open('', '', 'height=800,width=1000');
    w.document.write(`<html><head><title>${fileName}</title>`);
    w.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #333;padding:8px;font-size:12px;}th{background:#e5e7eb;}h1{color:#FF6B35;text-align:center;}@media print{.print-button{display:none}}</style>');
    w.document.write('</head><body>');
    w.document.write(printContent.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  };

  const printListePieces = () => {
    const printContent = document.getElementById('liste-pieces-content');
    const fileName = headerInfo.lead ? `Liste_Pieces_${headerInfo.lead}` : 'Liste_Pieces';
    const w = window.open('', '', 'height=800,width=1000');
    w.document.write(`<html><head><title>${fileName}</title>`);
    w.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #333;padding:8px;font-size:12px;}th{background:#e5e7eb;}h1{color:#27AE60;text-align:center;}@media print{.print-button{display:none}}</style>');
    w.document.write('</head><body>');
    w.document.write(printContent.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  };

  const activeItems = ALL_ITEMS.filter(item => itemStates[item.id] === 1 || itemStates[item.id] === 2);
  const activeMecaniqueItems = activeItems.filter(item => !DSP_ITEMS.some(dsp => dsp.id === item.id));
  const activeDSPItems = activeItems.filter(item => DSP_ITEMS.some(dsp => dsp.id === item.id));
  const totalActive = activeItems.length;
  const totalCompleted = ALL_ITEMS.filter(item => itemStates[item.id] === 2).length;
  const allCompleted = totalActive > 0 && totalActive === totalCompleted;

  const totals = calculateTotals(activeMecaniqueItems, forfaitData, pieceLines, includeControleTechnique, includeContrevisite, activeDSPItems);
  const moByCategory = calculateMOByCategory(activeMecaniqueItems, forfaitData, activeDSPItems);
  const piecesBySupplier = getPiecesListBySupplier(activeMecaniqueItems, forfaitData, pieceLines);

  const getGoogleApiStatusDisplay = () => {
    if (googleApiState.error) return { text: `❌ Erreur: ${googleApiState.error}`, color: 'text-red-600' };
    if (!googleApiState.loaded) return { text: '⏳ Chargement Google API...', color: 'text-orange-600' };
    if (!googleApiState.initialized) return { text: '⏳ Initialisation Google API...', color: 'text-orange-600' };
    if (googleApiState.signedIn) return { text: '✅ Connecté à Google Drive', color: 'text-green-600' };
    return { text: '🔓 Google API prêt (non connecté)', color: 'text-blue-600' };
  };
  const statusDisplay = getGoogleApiStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8">
        {/* En-tête */}
        <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-center mb-3">
            <div style={{
              width: '60px', height: '60px', background: '#FF6B35',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginRight: '15px'
            }}>
              <span style={{ fontSize: '32px', color: 'white', fontWeight: 'bold' }}>H</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-sans tracking-tight">
              <span style={{ color: '#FF6B35' }}>Hero</span>
              <span style={{ color: '#002F6C' }}>TOOL</span>
            </h1>
          </div>
          <p className="text-sm font-bold text-gray-500 italic">
            Développé par Loïc.L, codé par Claude.ia
          </p>
        </div>

        {/* Sauvegarde */}
        <div className="mb-8 p-6 rounded-xl border-2 border-green-200 bg-green-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sauvegardez votre progression</h2>
          <p className="text-sm text-gray-600 mb-4">Enregistrez et rechargez vos devis</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={saveQuote} className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md">
              💾 Sauvegarder localement
            </button>
            <button
              onClick={() => {
                const leadName = prompt('Entrez le nom du Lead à charger:');
                if (leadName) loadQuote(leadName);
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
            >
              📂 Charger un devis
            </button>
            <button
              onClick={handleGoogleSignIn}
              className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!googleApiState.initialized}
            >
              🔐 Se connecter à Google Drive
            </button>
            <button
              onClick={uploadToDrive}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!googleApiState.initialized}
            >
              ☁️ Sauvegarder sur Drive
            </button>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-current opacity-50"></div>
                <span className={`font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span>
              </div>
              {googleApiState.error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  <strong>Erreur de configuration:</strong><br/>
                  Vérifiez vos variables d'environnement REACT_APP_GOOGLE_CLIENT_ID et REACT_APP_GOOGLE_API_KEY
                </div>
              )}
            </div>
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

        <MaintenanceHistory
          lastMaintenance={lastMaintenance}
          updateLastMaintenance={updateLastMaintenance}
        />

        <VehicleSummary
          headerInfo={headerInfo}
          oilInfo={oilInfo}
          lastMaintenance={lastMaintenance}
        />

        <div className="mb-8">
          <OilInfoForm
            oilInfo={oilInfo}
            updateOilInfo={updateOilInfo}
          />
        </div>

        {/* Entretien */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2">
            Entretien
          </h2>
          <ChecklistSection
            leftItems={LEFT_ITEMS}
            rightItems={RIGHT_ITEMS}
            itemStates={itemStates}
            itemNotes={itemNotes}
            onCycleState={cycleState}
            onUpdateNote={updateNote}
          />
        </div>

        <div className="border-t-2 border-orange-400 my-8"></div>

        {/* Mécanique */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 pb-2 ">
            <h2 className="text-2xl font-bold text-gray-800">Mécanique</h2>
            <button 
              onClick={() => toggleCategory('mecanique')}
              className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {expandedCategories.mecanique ? 'Fermer le module' : 'Ouvrir le module'}
            </button>
          </div>
          {expandedCategories.mecanique && (
            <>
              <ChecklistSection
                leftItems={LEFT_ITEMS_2}
                rightItems={RIGHT_ITEMS_2}
                itemStates={itemStates}
                itemNotes={itemNotes}
                onCycleState={cycleState}
                onUpdateNote={updateNote}
              />
              <ChecklistSection
                leftItems={TEXT_ITEMS_3}
                rightItems={TEXT_ITEMS_4}
                itemStates={itemStates}
                itemNotes={itemNotes}
                onCycleState={cycleState}
                onUpdateNote={updateNote}
              />
            </>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8"></div>

        {/* Pneus & Freins */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 pb-2 ">
            <h2 className="text-2xl font-bold text-gray-800">Pneus et Freins</h2>
            <button 
              onClick={() => toggleCategory('pneusFreins')}
              className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {expandedCategories.pneusFreins ? 'Fermer le module' : 'Ouvrir le module'}
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

        <div className="border-t-2 border-orange-400 my-8"></div>

        {/* SMART - DSP */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">SMART - DSP</h2>
            <button 
              onClick={() => toggleCategory('dsp')}
              className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {expandedCategories.dsp ? 'Fermer le module' : 'Ouvrir le module'}
            </button>
          </div>
          <div className="border-t-2 border-orange-400 my-8"></div>
          {expandedCategories.dsp && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DSP_ITEMS.map(item => {
                const state = itemStates[item.id];
                const bgColor = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const borderColor = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const textColor = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div
                    key={item.id}
                    onClick={() => cycleState(item.id)}
                    className={`rounded-lg border-2 transition-all cursor-pointer hover:shadow-md px-4 py-4 ${bgColor} ${borderColor} flex items-center justify-center text-center`}
                  >
                    <span className={`text-sm font-medium ${textColor}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SMART - LUSTRAGE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">SMART - LUSTRAGE</h2>
            <button 
              onClick={() => toggleCategory('lustrage')}
              className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {expandedCategories.lustrage ? 'Fermer le module' : 'Ouvrir le module'}
            </button>
          </div>
          {expandedCategories.lustrage && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LUSTRAGE_ITEMS.map(item => {
                const state = itemStates[item.id];
                const bgColor = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const borderColor = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const textColor = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div
                    key={item.id}
                    onClick={() => cycleState(item.id)}
                    className={`rounded-lg border-2 transition-all cursor-pointer hover:shadow-md px-4 py-4 ${bgColor} ${borderColor} flex items-center justify-center text-center`}
                  >
                    <span className={`text-sm font-medium ${textColor}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8"></div>

        {/* Carrosserie */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 ">
            <h2 className="text-2xl font-bold text-orange-800">Carrosserie</h2>
            <button 
              onClick={() => toggleCategory('carrosserie')}
              className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {expandedCategories.carrosserie ? 'Fermer le module' : 'Ouvrir le module'}
            </button>
          </div>
          {expandedCategories.carrosserie && (
            <ChecklistSection
              leftItems={TEXT_ITEMS_1}
              rightItems={TEXT_ITEMS_2}
              itemStates={itemStates}
              itemNotes={itemNotes}
              onCycleState={cycleState}
              onUpdateNote={updateNote}
            />
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8"></div>

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
              activeItems={activeItems}
            />

            <TaskSummary
              allItems={ALL_ITEMS}
              itemStates={itemStates}
              itemNotes={itemNotes}
              cycleState={cycleState}
            />

            <div className="mt-8 border-t-2 border-gray-300 pt-8">
              <h2 className="text-2xl font-bold mb-6">Forfaits</h2>
              {activeMecaniqueItems.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Mécanique</h3>
                  {activeMecaniqueItems
                    .filter(item => !LUSTRAGE_ITEMS.some(l => l.id === item.id))
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
                      />
                    ))}
                </div>
              )}
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
              forfaitData={forfaitData}
              pieceLines={pieceLines}
              totals={totals}
              moByCategory={moByCategory}
              printOrdreReparation={printOrdreReparation}
            />

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
