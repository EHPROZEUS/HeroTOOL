/**
 * COMPOSANT PRINCIPAL: Ordre de Réparation (Refactorisé)
 * Version modulaire et maintenable avec sous-composants
 */
import React, { useState } from 'react';
import ORHeader from './ORHeader';
import ORVehicleInfo from './ORVehicleInfo';
import ORVentilation from './ORVentilation';
import OROperationsTable from './OROperationsTable';
import ORTotals from './ORTotals';
import { useOrdreReparation } from '../../hooks/useOrdreReparation';
import ORSuppliers from './ORSuppliers';
import { getDossierStatus, calculateTotalMOMecanique } from '../../utils/dossierStatus';



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
  updateForfaitField,
  printOrdreReparation,
  itemStates
}) => {

  

const [editMode, setEditMode] = useState(false);
  // Utilisation du hook personnalisé pour la logique métier
const {
  activeLustrageItems,
  activePlumeItems,  // ✅ AJOUTÉ
  pureActiveMecaniqueItems,
  ventilation,
  finalTotals
} = useOrdreReparation({
    activeMecaniqueItems,
    activeDSPItems,
    forfaitData,
    pieceLines,
    moByCategory,
    totals,
    includeControleTechnique,
    includeContrevisite
  });

    // ✅ NOUVEAU : Calcul du statut du dossier
  const obligatoryMO = 0.50; // Total des prestations obligatoires (0.10 × 5)
  const totalMOMeca = calculateTotalMOMecanique(moByCategory, obligatoryMO);
  const dossierStatus = getDossierStatus(totalMOMeca, parseFloat(totals?.totalPieces || 0));

  // ✅ NOUVEAU : Gestion de l'édition des forfaits
  const handleEditForfait = (id, field, value) => {
    updateForfaitField(id, field, value);
  };

  return (
    <div>
      {/* En-tête avec boutons de contrôle */}
      <ORHeader
        showOrdreReparation={showOrdreReparation}
        setShowOrdreReparation={setShowOrdreReparation}
        includeControleTechnique={includeControleTechnique}
        setIncludeControleTechnique={setIncludeControleTechnique}
        includeContrevisite={includeContrevisite}
        setIncludeContrevisite={setIncludeContrevisite}
        editMode={editMode}
        setEditMode={setEditMode}
      />

{/* Contenu de l'ordre (affiché conditionnellement) */}
{showOrdreReparation && (
  <div id="ordre-reparation-content" className="bg-gray-50 rounded-lg p-6 shadow-lg"
       style={{ borderColor: dossierStatus.borderColor }}
  >
{/* Logo AutoHero centré avec titre */}
<div className="flex flex-col items-center mb-6 pb-4 border-b-2 border-gray-300">
  <img 
    src="/logo.png" 
    alt="AutoHero Logo" 
    style={{ height: '30px' }}
  />
   <img 
    src="/logohero.png" 
    alt="AutoHero Logo" 
    style={{ height: '25px' }}
  />
  {/* Titre centré et date à droite */}
  <div className="w-full flex justify-between items-center">
    <div className="w-1/3"></div> {/* Espace vide à gauche */}
    <h1 className="text-2xl font-bold text-gray-800 w-1/3 text-center">
      Ordre de Réparation
    </h1>
    <p className="text-sm text-gray-500 w-1/3 text-right">
      {new Date().toLocaleDateString('fr-FR')}
    </p>
  </div>
</div>

{/* ✅ Badges de statut */}
<div className="mb-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    {/* Statut dossier */}
    <div 
      className="px-4 py-2 rounded-lg font-bold text-sm"
      style={{ 
        backgroundColor: dossierStatus.bg, 
        color: dossierStatus.color,
        border: `2px solid ${dossierStatus.color}`
      }}
    >
      📋 STATUT DU DOSSIER : {dossierStatus.label}
    </div>
    
    {/* Contre-visite */}
    {includeContrevisite && (
      <div 
        className="px-4 py-2 rounded-lg font-bold text-sm"
        style={{ 
          backgroundColor: '#FFF3CD', 
          color: '#856404',
          border: '2px solid #856404'
        }}
      >
        ⚠️ CONTRE-VISITE
      </div>
    )}
  </div>
  
  <div className="text-sm text-gray-600">
    <span className="font-semibold">MO Méca :</span> {totalMOMeca.toFixed(2)}h
  </div>
</div>
    
    {/* Infos véhicule + Ventilation côte à côte */}
    <div className="grid grid-cols-2 mb-4" style={{ gap: '5rem' }}>
      {/* Colonne gauche : Informations du véhicule */}
      <div>
        <ORVehicleInfo headerInfo={headerInfo} />
        
        {/* ✅ NOUVEAU : Affichage des fournisseurs */}
        <ORSuppliers 
          activeMecaniqueItems={activeMecaniqueItems}
          forfaitData={forfaitData}
          pieceLines={pieceLines}
        />
      </div>

      {/* Colonne droite : Ventilation comptable */}
      <div>
        <ORVentilation ventilation={ventilation} />
      </div>
    </div>
    

    {/* Tableau détaillé des opérations (pleine largeur) */}
    <OROperationsTable
      pureActiveMecaniqueItems={pureActiveMecaniqueItems}
      activeDSPItems={activeDSPItems}
      activeLustrageItems={activeLustrageItems}
      activePlumeItems={activePlumeItems}
      forfaitData={forfaitData}
      includeControleTechnique={includeControleTechnique}
      includeContrevisite={includeContrevisite}
     editMode={editMode}  
     updateForfaitField={updateForfaitField}
     itemStates={itemStates}
    />

    {/* Récapitulatif des totaux */}
    <ORTotals
      totals={finalTotals}
      includeControleTechnique={includeControleTechnique}
      includeContrevisite={includeContrevisite}
    />
  </div>
)}
    </div>
  );
};

export default OrdreReparation;