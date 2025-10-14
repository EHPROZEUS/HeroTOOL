import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

const QuoteManager = ({ 
  headerInfo, 
  itemStates, 
  itemNotes, 
  forfaitData, 
  pieceLines, 
  lastMaintenance, 
  oilInfo,
  includeControleTechnique,
  includeContrevisite,
  onLoadQuote 
}) => {
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [existingQuotes, setExistingQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuoteList, setShowQuoteList] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // 📊 Charger la liste des devis existants
  const loadQuotesList = async () => {
    try {
      const quotesRef = collection(db, 'herotoolQuotes');
      const q = query(quotesRef, orderBy('updatedAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const quotes = [];
      querySnapshot.forEach((doc) => {
        quotes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setExistingQuotes(quotes);
    } catch (error) {
      console.error('Erreur chargement liste:', error);
    }
  };

  // 💾 Sauvegarder le devis
  const saveQuote = async (isManual = false) => {
    if (!headerInfo.lead?.trim()) {
      if (isManual) {
        alert('⚠️ Veuillez renseigner un LEAD avant de sauvegarder');
      }
      return;
    }

    try {
      setSaveStatus('saving');
      
      const quoteData = {
        // Données du devis
        headerInfo,
        itemStates,
        itemNotes,
        forfaitData,
        pieceLines,
        lastMaintenance,
        oilInfo,
        includeControleTechnique,
        includeContrevisite,
        
        // Métadonnées
        lead: headerInfo.lead,
        immatriculation: headerInfo.immatriculation || '',
        updatedAt: serverTimestamp(),
        lastModifiedBy: 'current-user', // À remplacer par l'utilisateur connecté
      };

      // Créer ou mettre à jour le document avec l'ID basé sur le LEAD
      const safeLeadId = headerInfo.lead.replace(/[^a-zA-Z0-9]/g, '_');
      const docRef = doc(db, 'herotoolQuotes', safeLeadId);
      
      await setDoc(docRef, quoteData, { merge: true });
      
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      
      if (isManual) {
        alert('✅ Devis sauvegardé avec succès !');
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setSaveStatus('error');
      
      if (isManual) {
        alert('❌ Erreur lors de la sauvegarde: ' + error.message);
      }
    }
  };

  // 📂 Charger un devis
  const loadQuote = async (leadId) => {
    try {
      const safeLeadId = leadId.replace(/[^a-zA-Z0-9]/g, '_');
      const docRef = doc(db, 'herotoolQuotes', safeLeadId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        onLoadQuote(data);
        alert(`✅ Devis "${leadId}" chargé avec succès !`);
        setShowQuoteList(false);
      } else {
        alert('❌ Aucun devis trouvé pour ce LEAD');
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  // 🔄 Sauvegarde automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (headerInfo.lead?.trim()) {
        saveQuote(false);
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [headerInfo, itemStates, itemNotes, forfaitData, pieceLines, lastMaintenance, oilInfo, includeControleTechnique, includeContrevisite]);

  // Charger la liste au montage
  useEffect(() => {
    loadQuotesList();
  }, []);

  // Filtrer les devis par recherche
  const filteredQuotes = existingQuotes.filter(q => 
    q.lead?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-8 p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          💾 Gestion des Devis
        </h2>
        
        {/* Indicateur de sauvegarde */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="text-sm text-blue-600 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Sauvegarde...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 flex items-center gap-2">
              ✅ Sauvegardé
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 flex items-center gap-2">
              ❌ Erreur
            </span>
          )}
          {lastSaveTime && (
            <span className="text-xs text-gray-500">
              {lastSaveTime.toLocaleTimeString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bouton Sauvegarder */}
        <button
          onClick={() => saveQuote(true)}
          disabled={!headerInfo.lead?.trim()}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          💾 Sauvegarder maintenant
        </button>

        {/* Bouton Charger */}
        <button
          onClick={() => setShowQuoteList(!showQuoteList)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          📂 {showQuoteList ? 'Masquer' : 'Charger un devis'}
        </button>

        {/* Bouton Rafraîchir la liste */}
        <button
          onClick={loadQuotesList}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          🔄 Rafraîchir la liste
        </button>
      </div>

      {/* Liste des devis */}
      {showQuoteList && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-300">
          <h3 className="font-bold text-gray-800 mb-4">📋 Devis existants</h3>
          
          {/* Barre de recherche */}
          <input
            type="text"
            placeholder="🔍 Rechercher par LEAD ou immatriculation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredQuotes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun devis trouvé</p>
            ) : (
              filteredQuotes.map(quote => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                  onClick={() => loadQuote(quote.lead)}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{quote.lead}</p>
                    {quote.immatriculation && (
                      <p className="text-sm text-gray-600">{quote.immatriculation}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {quote.updatedAt?.toDate?.()?.toLocaleString('fr-FR') || 'Date inconnue'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadQuote(quote.lead);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                  >
                    Charger
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 mt-4">
        💡 Sauvegarde automatique toutes les 30 secondes si un LEAD est renseigné
      </p>
    </div>
  );
};

export default QuoteManager;
