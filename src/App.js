// VERSION AVEC FOURNISSEURS FORCÉS (MAJ: SERVICEBOX -> XPR, AUTOSSIMO ajouté)
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
} from './config/constants';

import { formatTireSize } from './utils/formatters';
import { 
  calculateTotals, 
  calculateMOByCategory, 
  getPiecesListBySupplier 
} from './utils/calculations';
import { parsePieces } from './utils/parser';

// Fournisseurs forcés par provenance (MAJ)
const SOURCE_FORCED_SUPPLIERS = {
  NED: 'NED',
  SERVICEBOX: 'XPR',
  RENAULT: 'GUEUDET',
  AUTOSSIMO: 'AUTOSSIMO'
};

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

function App() {
  const [headerInfo, setHeaderInfo] = useState({
    lead: '', immatriculation: '', vin: '', moteur: '', boite: '',
    dateVehicule: '', kilometres: '', clim: '', freinParking: '', startStop: false
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

  // Google API init
  useEffect(() => {
    const initGoogleApi = async () => {
      try {
        if (!CLIENT_ID || !API_KEY) throw new Error('Credentials Google manquants.');
        let attempts = 0;
        while (!window.gapi && attempts < 50) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        if (!window.gapi) throw new Error('Google API script non chargé');
        setGoogleApiState(p => ({ ...p, loaded: true }));
        await new Promise((res, rej) => {
          window.gapi.load('client:auth2', { callback: res, onerror: rej });
        });
        await window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });
        const auth2 = window.gapi.auth2.getAuthInstance();
        if (!auth2) throw new Error('Instance auth2 introuvable');
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
        setGoogleApiState({ loaded: false, initialized: false, signedIn: false, error: e.message });
      }
    };
    initGoogleApi();
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (headerInfo.lead.trim()) {
        const data = {
          headerInfo, itemStates, itemNotes, forfaitData,
          pieceLines, lastMaintenance, oilInfo,
          includeControleTechnique, includeContrevisite,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(`herotool_quote_${headerInfo.lead}`, JSON.stringify(data));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [headerInfo, itemStates, itemNotes, forfaitData, pieceLines, lastMaintenance, oilInfo, includeControleTechnique, includeContrevisite]);

  const toggleCategory = (c) => setExpandedCategories(p => ({ ...p, [c]: !p[c] }));
  const updateHeaderInfo = (f, v) => setHeaderInfo(p => ({ ...p, [f]: v }));
  const toggleMoteur = (t) => setHeaderInfo(p => ({ ...p, moteur: p.moteur === t ? '' : t }));
  const toggleBoite = (t) => setHeaderInfo(p => ({ ...p, boite: p.boite === t ? '' : t }));
  const toggleClim = (t) => setHeaderInfo(p => ({ ...p, clim: p.clim === t ? '' : t }));
  const toggleFreinParking = (t) => setHeaderInfo(p => ({ ...p, freinParking: p.freinParking === t ? '' : t }));
  const toggleStartStop = () => setHeaderInfo(p => ({ ...p, startStop: !p.startStop }));
  const cycleState = (id) => setItemStates(p => ({ ...p, [id]: (p[id] + 1) % 3 }));

  const updateNote = (id, v) => {
    if (['pneusAvant', 'pneusArriere', 'pneus4'].includes(id)) {
      setItemNotes(p => ({ ...p, [id]: formatTireSize(v) }));
    } else {
      setItemNotes(p => ({ ...p, [id]: v }));
    }
  };

  const updateLastMaintenance = (f, v) => setLastMaintenance(p => ({ ...p, [f]: v }));
  const updateOilInfo = (field, value) => {
    setOilInfo(prev => {
      const newOilInfo = { ...prev, [field]: value };
      if (newOilInfo.viscosity && newOilInfo.quantity) {
        const cfg = HUILES_CONFIG[newOilInfo.viscosity];
        if (cfg) {
          const q = parseFloat(newOilInfo.quantity) || 0;
          let qCalc = q;
          let total = 0;
          if (cfg.unite === 'bidon5L') {
            const bidons = Math.ceil(q / 5);
            qCalc = bidons;
            total = bidons * cfg.prixUnitaire;
          } else {
            total = q * cfg.prixUnitaire;
          }
          setForfaitData(p => ({
            ...p,
            filtreHuile: {
              ...p.filtreHuile,
              consommableReference: `Huile ${newOilInfo.viscosity}`,
              consommableDesignation: cfg.unite === 'bidon5L' ? 'Huile moteur (bidon 5L)' : 'Huile moteur',
              consommableQuantity: qCalc.toString(),
              consommablePrixUnitaire: cfg.prixUnitaire.toFixed(2),
              consommablePrix: total.toFixed(2)
            }
          }));
        }
      }
      return newOilInfo;
    });
  };

  const updateForfaitField = (itemId, field, value) => {
    setForfaitData(prev => {
      const newData = { ...prev, [itemId]: { ...prev[itemId], [field]: value } };
      const d = newData[itemId];
      if (field === 'pieceQuantity' || field === 'piecePrixUnitaire') {
        const qty = parseFloat(d.pieceQuantity || 0);
        const unit = parseFloat(d.piecePrixUnitaire || 0);
        d.piecePrix = (qty * unit).toFixed(2);
      }
      if (field === 'consommableQuantity' || field === 'consommablePrixUnitaire') {
        const qty = parseFloat(d.consommableQuantity || 0);
        const unit = parseFloat(d.consommablePrixUnitaire || 0);
        d.consommablePrix = (qty * unit).toFixed(2);
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
          const l = { ...line, [field]: value };
          if (field === 'quantity' || field === 'prixUnitaire') {
            const qty = parseFloat(l.quantity || 0);
            const unit = parseFloat(l.prixUnitaire || 0);
            l.prix = (qty * unit).toFixed(2);
          }
          return l;
        }
        return line;
      })
    }));
  };

  const canHaveMultiplePieces = (itemId) => !EXCLUDED_MULTI_PIECES.includes(itemId);

  // Nouveau parse avec fournisseur forcé
  const parsePiecesText = (selectedFormat = 'auto', sourceSystem = 'auto', defaultSupplier = '') => {
    if (!importText.trim()) {
      setParsedPieces([]);
      return;
    }
    const forced = SOURCE_FORCED_SUPPLIERS[sourceSystem] || '';
    const supplierToUse = forced || defaultSupplier;
    const results = parsePieces(importText, selectedFormat, sourceSystem, supplierToUse);
    const enriched = results.map((p, idx) => ({
      id: `import_${idx}_${Date.now()}`,
      reference: p.reference || '',
      designation: p.designation || '',
      quantity: p.quantity || '1',
      prixUnitaire: p.prixUnitaire || p.unitPrice || '',
      unitPrice: p.prixUnitaire || p.unitPrice || '',
      prix: p.prix || (
        p.prixUnitaire && p.quantity
          ? (parseFloat(p.prixUnitaire) * parseFloat(p.quantity)).toFixed(2)
          : ''
      ),
      fournisseur: forced || p.fournisseur || supplierToUse || '',
      targetForfait: '',
      _forcedFournisseur: !!forced
    }));
    setParsedPieces(enriched);
  };

  const updateParsedPiece = (id, field, value) => {
    setParsedPieces(prev => prev.map(piece => {
      if (piece.id !== id) return piece;
      if (field === 'fournisseur' && piece._forcedFournisseur) return piece;
      return { ...piece, [field]: value };
    }));
  };

  const removeParsedPiece = (id) => setParsedPieces(prev => prev.filter(p => p.id !== id));

  const dispatchPieces = () => {
    parsedPieces.forEach(piece => {
      if (piece.targetForfait && piece.reference) {
        addPieceLine(piece.targetForfait);
        setPieceLines(prev => {
          const arr = prev[piece.targetForfait] || [];
          const lastIndex = arr.length - 1;
          return {
            ...prev,
            [piece.targetForfait]: arr.map((line, idx) =>
              idx === lastIndex
                ? {
                    reference: piece.reference,
                    designation: piece.designation,
                    fournisseur: piece.fournisseur,
                    quantity: piece.quantity,
                    prixUnitaire: piece.prixUnitaire || piece.unitPrice || '',
                    prix: (
                      (parseFloat(piece.quantity) || 0) *
                      (parseFloat(piece.prixUnitaire || piece.unitPrice || 0) || 0)
                    ).toFixed(2)
                  }
                : line
            )
          };
        });
      }
    });
    setImportText('');
    setParsedPieces([]);
    setShowImportModule(false);
  };

  // Sauvegarde / chargement / Drive
  const saveQuote = () => {
    if (!headerInfo.lead.trim()) return alert('⚠️ Lead requis');
    try {
      const data = {
        headerInfo, itemStates, itemNotes, forfaitData,
        pieceLines, lastMaintenance, oilInfo,
        includeControleTechnique, includeContrevisite,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`herotool_quote_${headerInfo.lead}`, JSON.stringify(data));
      alert('✅ Devis sauvegardé');
    } catch (e) { alert('❌ ' + e.message); }
  };

  const loadQuote = (lead) => {
    if (!lead.trim()) return alert('⚠️ Nom requis');
    const raw = localStorage.getItem(`herotool_quote_${lead}`);
    if (!raw) return alert('❌ Aucun devis');
    try {
      const data = JSON.parse(raw);
      setHeaderInfo(data.headerInfo);
      setItemStates(data.itemStates);
      setItemNotes(data.itemNotes);
      setForfaitData(data.forfaitData);
      setPieceLines(data.pieceLines);
      setLastMaintenance(data.lastMaintenance);
      setOilInfo(data.oilInfo);
      setIncludeControleTechnique(data.includeControleTechnique);
      setIncludeContrevisite(data.includeContrevisite);
      alert('✅ Chargé');
    } catch (e) { alert('❌ ' + e.message); }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!googleApiState.initialized) return alert('API non prête');
      const auth2 = window.gapi?.auth2?.getAuthInstance();
      if (!auth2) throw new Error('Auth2 indisponible');
      await auth2.signIn();
    } catch (e) { alert('❌ ' + e.message); }
  };

  const uploadToDrive = async () => {
    if (!headerInfo.lead.trim()) return alert('⚠️ Lead requis');
    try {
      if (!googleApiState.initialized) throw new Error('API non initialisée');
      const auth2 = window.gapi?.auth2?.getAuthInstance();
      if (!auth2) throw new Error('Auth2 indisponible');
      if (!auth2.isSignedIn.get()) await auth2.signIn();
      if (!auth2.isSignedIn.get()) throw new Error('Connexion refusée');
      const data = {
        headerInfo, itemStates, itemNotes, forfaitData,
        pieceLines, lastMaintenance, oilInfo,
        includeControleTechnique, includeContrevisite,
        savedAt: new Date().toISOString()
      };
      const fileContent = JSON.stringify(data, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });
      const metadata = {
        name: `HeroTOOL_${headerInfo.lead}_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json'
      };
      const accessToken = auth2.currentUser.get().getAuthResponse().access_token;
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);
      const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        body: form
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      alert('✅ Export Drive OK');
    } catch (e) { alert('❌ ' + e.message); }
  };

  const printOrdreReparation = () => {
    const el = document.getElementById('ordre-reparation-content');
    const w = window.open('', '', 'height=800,width=1000');
    w.document.write('<html><head><title>Ordre</title>');
    w.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #333;padding:6px;font-size:12px;}th{background:#eee;}@media print{.print-button{display:none}}</style>');
    w.document.write('</head><body>');
    w.document.write(el.innerHTML);
    w.document.write('</body></html>');
    w.document.close(); w.focus();
    setTimeout(()=>{ w.print(); w.close(); },200);
  };

  const printListePieces = () => {
    const el = document.getElementById('liste-pieces-content');
    const w = window.open('', '', 'height=800,width=1000');
    w.document.write('<html><head><title>Pièces</title>');
    w.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #333;padding:6px;font-size:12px;}th{background:#eee;}@media print{.print-button{display:none}}</style>');
    w.document.write('</head><body>');
    w.document.write(el.innerHTML);
    w.document.write('</body></html>');
    w.document.close(); w.focus();
    setTimeout(()=>{ w.print(); w.close(); },200);
  };

  const activeItems = ALL_ITEMS.filter(i => itemStates[i.id] === 1 || itemStates[i.id] === 2);
  const activeMecaniqueItems = activeItems.filter(i => !DSP_ITEMS.some(d => d.id === i.id));
  const activeDSPItems = activeItems.filter(i => DSP_ITEMS.some(d => d.id === i.id));
  const totalActive = activeItems.length;
  const totalCompleted = ALL_ITEMS.filter(i => itemStates[i.id] === 2).length;
  const allCompleted = totalActive > 0 && totalActive === totalCompleted;
  const totals = calculateTotals(activeMecaniqueItems, forfaitData, pieceLines, includeControleTechnique, includeContrevisite, activeDSPItems);
  const moByCategory = calculateMOByCategory(activeMecaniqueItems, forfaitData, activeDSPItems);
  const piecesBySupplier = getPiecesListBySupplier(activeMecaniqueItems, forfaitData, pieceLines);

  const statusDisplay = (() => {
    if (googleApiState.error) return { text: `❌ Erreur: ${googleApiState.error}`, color: 'text-red-600' };
    if (!googleApiState.loaded) return { text: '⏳ Chargement Google API...', color: 'text-orange-600' };
    if (!googleApiState.initialized) return { text: '⏳ Initialisation Google API...', color: 'text-orange-600' };
    if (googleApiState.signedIn) return { text: '✅ Connecté à Google Drive', color: 'text-green-600' };
    return { text: '🔓 Google API prêt (non connecté)', color: 'text-blue-600' };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8">
        {/* En-tête */}
        <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-center mb-3">
            <div style={{ width: 60, height: 60, background: '#FF6B35',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginRight: 15 }}>
              <span style={{ fontSize: 32, color: '#fff', fontWeight: 'bold' }}>H</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span style={{ color: '#FF6B35' }}>Hero</span><span style={{ color: '#002F6C' }}>TOOL</span>
            </h1>
          </div>
          <p className="text-sm font-bold text-gray-500 italic">
            Développé par Loïc.L, codé par Claude.ia
          </p>
        </div>

        {/* Sauvegarde */}
        <div className="mb-8 p-6 rounded-xl border-2 border-green-200 bg-green-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sauvegardez votre progression</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={saveQuote} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">💾 Sauvegarder</button>
            <button onClick={() => { const lead = prompt('Lead à charger ?'); if (lead) loadQuote(lead); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">📂 Charger</button>
            <button onClick={handleGoogleSignIn} disabled={!googleApiState.initialized} className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50">🔐 Google Drive</button>
            <button onClick={uploadToDrive} disabled={!googleApiState.initialized} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">☁️ Export Drive</button>
          </div>
          <div className="mt-4 text-sm">
            <span className={statusDisplay.color}>{statusDisplay.text}</span>
          </div>
        </div>

        <VehicleInfoForm headerInfo={headerInfo} updateHeaderInfo={updateHeaderInfo}
          toggleMoteur={toggleMoteur} toggleBoite={toggleBoite} toggleClim={toggleClim}
          toggleFreinParking={toggleFreinParking} toggleStartStop={toggleStartStop} />

        <MaintenanceHistory lastMaintenance={lastMaintenance} updateLastMaintenance={updateLastMaintenance} />
        <VehicleSummary headerInfo={headerInfo} oilInfo={oilInfo} lastMaintenance={lastMaintenance} />
        <div className="mb-8">
          <OilInfoForm oilInfo={oilInfo} updateOilInfo={updateOilInfo} />
        </div>

        {/* Entretien */}
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

        {/* Mécanique */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Mécanique</h2>
            <button onClick={() => toggleCategory('mecanique')}
              className="px-6 py-3 text-white rounded-full font-semibold"
              style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.mecanique ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.mecanique && (
            <>
              <ChecklistSection leftItems={LEFT_ITEMS_2} rightItems={RIGHT_ITEMS_2}
                itemStates={itemStates} itemNotes={itemNotes}
                onCycleState={cycleState} onUpdateNote={updateNote} />
              <ChecklistSection leftItems={TEXT_ITEMS_3} rightItems={TEXT_ITEMS_4}
                itemStates={itemStates} itemNotes={itemNotes}
                onCycleState={cycleState} onUpdateNote={updateNote} />
            </>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        {/* Pneus / Freins */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pneus et Freins</h2>
            <button onClick={() => toggleCategory('pneusFreins')}
              className="px-6 py-3 text-white rounded-full font-semibold"
              style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.pneusFreins ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.pneusFreins && (
            <ChecklistSection leftItems={LEFT_ITEMS_3} rightItems={RIGHT_ITEMS_3}
              itemStates={itemStates} itemNotes={itemNotes}
              onCycleState={cycleState} onUpdateNote={updateNote} />
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        {/* SMART DSP */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">SMART - DSP</h2>
            <button onClick={() => toggleCategory('dsp')}
              className="px-6 py-3 text-white rounded-full font-semibold"
              style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.dsp ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
          {expandedCategories.dsp && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DSP_ITEMS.map(item => {
                const state = itemStates[item.id];
                const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div key={item.id}
                    onClick={() => cycleState(item.id)}
                    className={`rounded-lg border-2 px-4 py-4 cursor-pointer ${bg} ${border} flex items-center justify-center text-center`}>
                    <span className={`text-sm font-medium ${txt}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SMART LUSTRAGE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">SMART - LUSTRAGE</h2>
            <button onClick={() => toggleCategory('lustrage')}
              className="px-6 py-3 text-white rounded-full font-semibold"
              style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.lustrage ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>
            {expandedCategories.lustrage && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LUSTRAGE_ITEMS.map(item => {
                const state = itemStates[item.id];
                const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
                return (
                  <div key={item.id}
                    onClick={() => cycleState(item.id)}
                    className={`rounded-lg border-2 px-4 py-4 cursor-pointer ${bg} ${border} flex items-center justify-center text-center`}>
                    <span className={`text-sm font-medium ${txt}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t-2 border-orange-400 my-8" />

        {/* Carrosserie */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 ">
            <h2 className="text-2xl font-bold text-orange-800">Carrosserie</h2>
            <button onClick={() => toggleCategory('carrosserie')}
              className="px-6 py-3 text-white rounded-full font-semibold"
              style={{ backgroundColor: '#FF6B35' }}>
              {expandedCategories.carrosserie ? 'Fermer' : 'Ouvrir'}
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
                    .filter(i => !LUSTRAGE_ITEMS.some(l => l.id === i.id))
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
