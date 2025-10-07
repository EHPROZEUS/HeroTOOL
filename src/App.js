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
  DSP_RIGHT_ITEMS
} from './config/constants';

import { formatTireSize } from './utils/formatters';
import { 
  calculateTotals, 
  calculateMOByCategory, 
  getPiecesListBySupplier 
} from './utils/calculations';

function App() {
  // États principaux
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

  // --- AUTO-SAVE ET GOOGLE DRIVE INIT ---
  useEffect(() => {
    // 1️⃣ Auto-save localStorage toutes les 10 secondes
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
        console.log('💾 Auto-save localStorage');
      }
    }, 10000); // toutes les 10 secondes

    // 2️⃣ Init Google Drive
    const initGapi = () => {
      gapi.load('client:auth2', () => {
        gapi.client
          .init({
            apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_API_KEY',
            clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
            scope: 'https://www.googleapis.com/auth/drive.file',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          })
          .then(() => {
            console.log('✅ Google API client initialized');
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) {
              console.log('ℹ️ Utilisateur non connecté à Google Drive');
            }
          })
          .catch(error => {
            console.error('❌ Erreur lors de l’initialisation de Google API:', error);
            alert('⚠️ Erreur lors de l’initialisation de Google Drive. Vérifiez votre clé API et ID client.');
          });
      });
    };

    initGapi();

    // 3️⃣ Cleanup de l’interval
    return () => clearInterval(interval);
  }, [headerInfo, itemStates, itemNotes, forfaitData, pieceLines, lastMaintenance, oilInfo, includeControleTechnique, includeContrevisite]);

  // États pour les catégories déroulantes - Fermées par défaut
  const [expandedCategories, setExpandedCategories] = useState({
    mecanique: false,
    pneusFreins: false,
    dsp: false,
    lustrage: false,
    carrosserie: false
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Fonctions de mise à jour header
  const updateHeaderInfo = (field, value) => setHeaderInfo(prev => ({ ...prev, [field]: value }));
  const toggleMoteur = (type) => setHeaderInfo(prev => ({ ...prev, moteur: prev.moteur === type ? '' : type }));
  const toggleBoite = (type) => setHeaderInfo(prev => ({ ...prev, boite: prev.boite === type ? '' : type }));
  const toggleClim = (type) => setHeaderInfo(prev => ({ ...prev, clim: prev.clim === type ? '' : type }));
  const toggleFreinParking = (type) => setHeaderInfo(prev => ({ ...prev, freinParking: prev.freinParking === type ? '' : type }));
  const toggleStartStop = () => setHeaderInfo(prev => ({ ...prev, startStop: !prev.startStop }));

  // Fonctions checklist
  const cycleState = (itemId) => setItemStates(prev => ({ ...prev, [itemId]: (prev[itemId] + 1) % 3 }));

  const updateNote = (itemId, value) => {
    if (itemId === 'pneusAvant' || itemId === 'pneusArriere' || itemId === 'pneus4') {
      setItemNotes(prev => ({ ...prev, [itemId]: formatTireSize(value) }));
    } else {
      setItemNotes(prev => ({ ...prev, [itemId]: value }));
    }
  };

  // Fonctions maintenance
  const updateLastMaintenance = (field, value) => {
    setLastMaintenance(prev => ({ ...prev, [field]: value }));
  };

  const updateOilInfo = (field, value) => {
    setOilInfo(prev => {
      const newOilInfo = { ...prev, [field]: value };

      if (newOilInfo.viscosity && newOilInfo.quantity) {
        const huileConfig = HUILES_CONFIG[newOilInfo.viscosity];
        
        if (huileConfig) {
          const quantity = parseFloat(newOilInfo.quantity) || 0;
          let quantiteCalculee = quantity;
          let prixUnitaire = huileConfig.prixUnitaire;
          let prixTotal = 0;
          
          if (huileConfig.unite === 'bidon5L') {
            const nombreBidons = Math.ceil(quantity / 5);
            quantiteCalculee = nombreBidons;
            prixTotal = nombreBidons * huileConfig.prixUnitaire;
          } else {
            prixTotal = quantity * huileConfig.prixUnitaire;
          }
          
          setForfaitData(prevForfait => ({
            ...prevForfait,
            filtreHuile: {
              ...prevForfait.filtreHuile,
              consommableReference: `Huile ${newOilInfo.viscosity}`,
              consommableDesignation: huileConfig.unite === 'bidon5L' ? `Huile moteur (bidon 5L)` : 'Huile moteur',
              consommableQuantity: quantiteCalculee.toString(),
              consommablePrixUnitaire: prixUnitaire.toFixed(2),
              consommablePrix: prixTotal.toFixed(2)
            }
          }));
        }
      }
      
      return newOilInfo;
    });
  };

  // Fonctions forfaits
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

  // Fonction d'import de pièces
  const parsePiecesText = () => {
    if (!importText.trim()) {
      setParsedPieces([]);
      return;
    }

    const lines = importText.split('\n').filter(line => line.trim());
    const pieces = [];

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('référence') || 
          line.toLowerCase().includes('fournisseur') ||
          line.toLowerCase().includes('désignation') ||
          line.toLowerCase().includes('total') ||
          line.toLowerCase().includes('préparation') ||
          line.toLowerCase().includes('pièce(s) disponible') ||
          line.toLowerCase().includes('livraison')) {
        return;
      }

      const xprPattern = /^(\d+)\s*([A-Z\s']+?)(W[A-Z]|G)\s*([\d,\.]+)?/i;
      const xprMatch = line.match(xprPattern);
      
      if (xprMatch) {
        const reference = xprMatch[1];
        let designation = xprMatch[2].trim();
        const quantity = xprMatch[4] ? xprMatch[4].replace(',', '.') : '1';
        
        const eurMatches = line.match(/(\d+[,\.]\d+)\s*EUR/g);
        let unitPrice = '';
        
        if (eurMatches && eurMatches.length > 0) {
          unitPrice = eurMatches[0].replace('EUR', '').replace(',', '.').trim();
        }
        
        pieces.push({
          id: `import_${index}_${Date.now()}`,
          reference: reference,
          designation: designation,
          quantity: quantity,
          unitPrice: unitPrice,
          fournisseur: 'XPR FIAT JEEP ALFA',
          targetForfait: ''
        });
        return;
      }

      const parts = line.split(/\t/).map(p => p.trim()).filter(p => p);
      
      if (parts.length === 0) return;

      let reference = '';
      let designation = '';
      let quantity = '1';
      let unitPrice = '';
      let fournisseur = '';

      if (parts.length >= 10 && parts.some(p => p.includes('EUR'))) {
        reference = parts[0];
        designation = parts[1];
        
        for (let i = 2; i < 5 && i < parts.length; i++) {
          const val = parts[i]?.replace(',', '.');
          if (val && !isNaN(parseFloat(val)) && !val.includes('EUR') && parseFloat(val) > 0 && parseFloat(val) < 1000) {
            quantity = val;
            break;
          }
        }
        
        const eurPrices = parts.map((p, i) => ({ val: p, idx: i }))
          .filter(obj => obj.val.includes('EUR'))
          .map(obj => ({ 
            price: parseFloat(obj.val.replace('EUR', '').replace(',', '.').trim()), 
            idx: obj.idx 
          }))
          .filter(obj => !isNaN(obj.price) && obj.price > 0);
        
        if (eurPrices.length >= 3) {
          unitPrice = eurPrices[2].price.toFixed(2);
        } else if (eurPrices.length >= 1) {
          unitPrice = eurPrices[0].price.toFixed(2);
        }
        
        fournisseur = 'XPR FIAT JEEP ALFA';
      }
      else if (parts.length >= 8) {
        reference = parts[0];
        
        const fournisseurText = parts[1]?.toUpperCase() || '';
        let detectedFournisseur = '';
        
        for (const f of FOURNISSEURS) {
          if (fournisseurText.includes(f.toUpperCase()) || 
              f.toUpperCase().includes(fournisseurText.split(' ')[0])) {
            detectedFournisseur = f;
            break;
          }
        }
        
        fournisseur = detectedFournisseur;
        designation = parts[2];
        quantity = parts[4]?.replace(',', '.') || '1';
        unitPrice = parts[5]?.replace(',', '.') || '';
      }
      else if (parts.length >= 3) {
        reference = parts[0];
        designation = parts[1];
        
        const qtyCandidate = parts[2]?.replace(',', '.');
        if (qtyCandidate && !isNaN(parseFloat(qtyCandidate))) {
          quantity = qtyCandidate;
          if (parts.length > 4) {
            unitPrice = parts[4]?.replace(',', '.').replace('EUR', '').trim() || '';
          }
        } else {
          unitPrice = parts[parts.length - 1]?.replace(',', '.').replace('EUR', '').trim() || '';
        }
      }
      else {
        const allParts = line.split(/[\t;,]|[ ]{2,}/).map(p => p.trim()).filter(p => p);
        reference = allParts[0] || '';
        designation = allParts[1] || '';
        quantity = allParts[2]?.replace(',', '.') || '1';
        unitPrice = allParts[3]?.replace(',', '.').replace('EUR', '').trim() || '';
      }

      if (reference) {
        pieces.push({
          id: `import_${index}_${Date.now()}`,
          reference: reference,
          designation: designation,
          quantity: quantity,
          unitPrice: unitPrice,
          fournisseur: fournisseur,
          targetForfait: ''
        });
      }
    });

    setParsedPieces(pieces);
  };

  const updateParsedPiece = (id, field, value) => {
    setParsedPieces(prev => prev.map(piece =>
      piece.id === id ? { ...piece, [field]: value } : piece
    ));
  };

  const removeParsedPiece = (id) => {
    setParsedPieces(prev => prev.filter(piece => piece.id !== id));
  };

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
                prixUnitaire: piece.unitPrice,
                prix: ((parseFloat(piece.quantity) || 0) * (parseFloat(piece.unitPrice) || 0)).toFixed(2)
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

  // Fonctions de sauvegarde/chargement
  const saveQuote = () => {
    if (!headerInfo.lead.trim()) {
      alert('⚠️ Veuillez renseigner un Lead avant de sauvegarder');
      return;
    }

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

    try {
      localStorage.setItem(`herotool_quote_${headerInfo.lead}`, JSON.stringify(quoteData));
      alert(`✅ Devis "${headerInfo.lead}" sauvegardé avec succès !`);
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde : ' + error.message);
    }
  };

  const loadQuote = (leadName) => {
    if (!leadName.trim()) {
      alert('⚠️ Veuillez entrer un nom de Lead');
      return;
    }

    try {
      const savedData = localStorage.getItem(`herotool_quote_${leadName}`);
      
      if (!savedData) {
        alert(`❌ Aucun devis trouvé pour "${leadName}"`);
        return;
      }

      const quoteData = JSON.parse(savedData);
      
      setHeaderInfo(quoteData.headerInfo);
      setItemStates(quoteData.itemStates);
      setItemNotes(quoteData.itemNotes);
      setForfaitData(quoteData.forfaitData);
      setPieceLines(quoteData.pieceLines);
      setLastMaintenance(quoteData.lastMaintenance);
      setOilInfo(quoteData.oilInfo);
      setIncludeControleTechnique(quoteData.includeControleTechnique);
      setIncludeContrevisite(quoteData.includeContrevisite);

      alert(`✅ Devis "${leadName}" chargé avec succès !`);
    } catch (error) {
      alert('❌ Erreur lors du chargement : ' + error.message);
    }
  };

  const uploadToDrive = async () => {
    if (!headerInfo.lead.trim()) {
      alert('⚠️ Veuillez renseigner un Lead avant de sauvegarder sur Google Drive');
      return;
    }

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

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

      const fileContent = JSON.stringify(quoteData, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });

      const metadata = {
        name: `${headerInfo.lead || 'Devis'}_${new Date().toISOString()}.json`,
        mimeType: 'application/json',
      };

      const accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${accessToken}` }),
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      alert('✅ Fichier sauvegardé sur Google Drive !');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde sur Google Drive:', error);
      alert('❌ Erreur lors de la sauvegarde sur Google Drive: ' + error.message);
    }
  };

  const autoSave = () => {
    if (!headerInfo.lead.trim()) return;

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
    console.log(`✅ Auto-save pour "${headerInfo.lead}"`);
  };
  
  useEffect(() => {
    autoSave();
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

  const getSavedQuotes = () => {
    const quotes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('herotool_quote_')) {
        const leadName = key.replace('herotool_quote_', '');
        const data = JSON.parse(localStorage.getItem(key));
        quotes.push({
          lead: leadName,
          savedAt: data.savedAt
        });
      }
    }
    return quotes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  };

  const deleteQuote = (leadName) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le devis "${leadName}" ?`)) {
      localStorage.removeItem(`herotool_quote_${leadName}`);
      alert(`✅ Devis "${leadName}" supprimé`);
      window.location.reload();
    }
  };

  // Fonctions d'impression
  const printOrdreReparation = () => {
    const printContent = document.getElementById('ordre-reparation-content');
    const fileName = headerInfo.lead ? `Ordre_Reparation_${headerInfo.lead}` : 'Ordre_Reparation';
    const printWindow = window.open('', '', 'height=800,width=1000');

    printWindow.document.write(`<html><head><title>${fileName}</title>`);
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin: 20px 0; }');
    printWindow.document.write('th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 12px; }');
    printWindow.document.write('th { background-color: #e5e7eb; font-weight: bold; }');
    printWindow.document.write('.text-right { text-align: right; }');
    printWindow.document.write('.font-bold { font-weight: bold; }');
    printWindow.document.write('h1 { color: #FF6B35; text-align: center; }');
    printWindow.document.write('h2 { color: #1f2937; background-color: #FFF0E6; padding: 10px; border-radius: 5px; }');
    printWindow.document.write('.print-button { display: none !important; }');
    printWindow.document.write('@media print { body { margin: 0; } .print-button { display: none !important; } }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const printListePieces = () => {
    const printContent = document.getElementById('liste-pieces-content');
    const fileName = headerInfo.lead ? `Liste_Pieces_${headerInfo.lead}` : 'Liste_Pieces';
    const printWindow = window.open('', '', 'height=800,width=1000');

    printWindow.document.write(`<html><head><title>${fileName}</title>`);
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin: 20px 0; }');
    printWindow.document.write('th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 12px; }');
    printWindow.document.write('th { background-color: #e5e7eb; font-weight: bold; }');
    printWindow.document.write('.text-right { text-align: right; }');
    printWindow.document.write('h1 { color: #27AE60; text-align: center; }');
    printWindow.document.write('.print-button { display: none !important; }');
    printWindow.document.write('@media print { body { margin: 0; } .print-button { display: none !important; } }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Calculs
  const activeItems = ALL_ITEMS.filter(item => itemStates[item.id] === 1 || itemStates[item.id] === 2);
  const activeMecaniqueItems = activeItems.filter(item => !DSP_ITEMS.some(dsp => dsp.id === item.id));
  const activeDSPItems = activeItems.filter(item => DSP_ITEMS.some(dsp => dsp.id === item.id));
  const totalActive = activeItems.length;
  const totalCompleted = ALL_ITEMS.filter(item => itemStates[item.id] === 2).length;
  const allCompleted = totalActive > 0 && totalActive === totalCompleted;

  const totals = calculateTotals(activeMecaniqueItems, forfaitData, pieceLines, includeControleTechnique, includeContrevisite, activeDSPItems);
  const moByCategory = calculateMOByCategory(activeMecaniqueItems, forfaitData, activeDSPItems);
  const piecesBySupplier = getPiecesListBySupplier(activeMecaniqueItems, forfaitData, pieceLines);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-8">
        {/* En-tête style AutoHero */}
        <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-center mb-3">
            <div style={{
              width: '60px',
              height: '60px',
              background: '#FF6B35',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
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

        {/* Module Sauvegarde/Chargement */}
        <div className="mb-8 p-6 rounded-xl border-2 border-green-200 bg-green-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sauvegardez votre progression</h2>
          <p className="text-sm text-gray-600 mb-4">Enregistrez et rechargez vos devis</p>
          
          <div className="flex gap-3">
            <button
              onClick={saveQuote}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              💾 Sauvegarder
            </button>
            
            <button
              onClick={() => {
                const leadName = prompt('Entrez le nom du Lead à charger:');
                if (leadName) loadQuote(leadName);
              }}
              className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#3B82F6' }}
            >
              📂 Charger
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => gapi.auth2.getAuthInstance().signIn()}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all"
          >
            🔐 Se connecter à Google Drive
          </button>

          <button
            onClick={uploadToDrive}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            ☁️ Sauvegarder sur Drive
          </button>
        </div>

        {/* Formulaire véhicule */}
        <VehicleInfoForm
          headerInfo={headerInfo}
          updateHeaderInfo={updateHeaderInfo}
          toggleMoteur={toggleMoteur}
          toggleBoite={toggleBoite}
          toggleClim={toggleClim}
          toggleFreinParking={toggleFreinParking}
          toggleStartStop={toggleStartStop}
        />
        {/* Module Maintenance */}
        <MaintenanceHistory
          lastMaintenance={lastMaintenance}
          updateLastMaintenance={updateLastMaintenance}
        />
        {/* Récapitulatif véhicule */}
        <VehicleSummary
          headerInfo={headerInfo}
          oilInfo={oilInfo}
          lastMaintenance={lastMaintenance}
        />

        {/* Informations huile */}
        <div className="mb-8">
          <OilInfoForm
            oilInfo={oilInfo}
            updateOilInfo={updateOilInfo}
          />
        </div>

        {/* Catégorie Entretien - Toujours ouverte */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-">
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
        {/* Trait de séparation ORANGE avant SMART */}
        <div className="border-t-2 border-orange-400 my-8"></div>
        {/* Catégorie Mécanique - Déroulante */}
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
        {/* Trait de séparation ORANGE avant SMART */}
        <div className="border-t-2 border-orange-400 my-8"></div>
        {/* Catégorie Pneus et Freins - Déroulante */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 pb-2 border-b-">
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

        {/* Trait de séparation ORANGE avant SMART */}
        <div className="border-t-2 border-orange-400 my-8"></div>

        {/* Section DSP */}
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
          {/* Trait de séparation ORANGE avant SMART */}
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

        {/* Section LUSTRAGE - Dans SMART */}
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
            <div className="text-center py-8 text-gray-500 italic">
              Section en préparation
            </div>
          )}
        </div>

        {/* Trait de séparation ORANGE avant Carrosserie */}
        <div className="border-t-2 border-orange-400 my-8"></div>

        {/* Catégorie Carrosserie */}
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
        {/* Trait de séparation ORANGE avant SMART */}
        <div className="border-t-2 border-orange-400 my-8"></div>
        {/* Message de completion */}
        {allCompleted && (
          <div className="mt-6 p-4 bg-green-100 rounded-xl text-center">
            <p className="text-green-800 font-semibold">Bravo ! Entretien terminé</p>
          </div>
        )}

        {/* Section forfaits et rapports (seulement si des items actifs) */}
        {totalActive > 0 && (
          <>
            {/* Module d'import */}
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

            {/* Résumé des tâches */}
            <TaskSummary
              allItems={ALL_ITEMS}
              itemStates={itemStates}
              itemNotes={itemNotes}
              cycleState={cycleState}
            />

            {/* Forfaits */}
            <div className="mt-8 border-t-2 border-gray-300 pt-8">
              <h2 className="text-2xl font-bold mb-6">Forfaits</h2>
              
              {activeMecaniqueItems.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Mécanique</h3>
                  {activeMecaniqueItems.map(item => (
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

            {/* Ordre de réparation */}
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

            {/* Liste des pièces */}
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