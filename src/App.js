import React, { useState, useEffect, useCallback } from 'react';
// imports restent inchangés...

// Ajout des constantes pour les options de carrosserie
const PEINTURE_ITEMS = [
  { id: 'peintureParechocAv', label: 'Peinture pare-choc AV', price: 150 },
  { id: 'peintureParechocAr', label: 'Peinture pare-choc AR', price: 150 },
  { id: 'peintureAileAv', label: 'Peinture aile AV', price: 120 },
  { id: 'peintureAileAr', label: 'Peinture aile AR', price: 120 },
  { id: 'peinturePorteAv', label: 'Peinture porte AV', price: 140 },
  { id: 'peinturePorteAr', label: 'Peinture porte AR', price: 140 }
];

const REPARATION_PEINTURE_ITEMS = [
  { id: 'repParechocAv', label: 'Réparation pare-choc AV', price: 100 },
  { id: 'repParechocAr', label: 'Réparation pare-choc AR', price: 100 },
  { id: 'repAileAv', label: 'Réparation aile AV', price: 80 },
  { id: 'repAileAr', label: 'Réparation aile AR', price: 80 },
  { id: 'repPorteAv', label: 'Réparation porte AV', price: 90 },
  { id: 'repPorteAr', label: 'Réparation porte AR', price: 90 }
];

// Composant modifié pour les sous-menus Carrosserie
const CarrosserieSubMenus = ({ toggleSubMenu, subMenuStates, itemStates, cycleState }) => {
  return (
    <div className="section-carrosserie mb-6 flex justify-end">
      <div className="sous-menus space-y-4">
        <div className="submenu flex flex-col items-end">
          <button
            className="px-6 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600"
            onClick={() => toggleSubMenu('reparation-peinture')}
          >
            Réparation peinture {subMenuStates['reparation-peinture'] ? '▲' : '▼'}
          </button>
          {subMenuStates['reparation-peinture'] && (
            <div className="submenu-content mt-4 space-y-3 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {REPARATION_PEINTURE_ITEMS.map(item => {
                  const state = itemStates[item.id] ?? 0;
                  const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                  const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                  const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800';
                  return (
                    <div
                      key={item.id}
                      onClick={() => cycleState(item.id)}
                      className={`rounded-lg border-2 px-4 py-3 cursor-pointer ${bg} ${border} flex items-center justify-center text-center`}
                    >
                      <span className={`text-sm font-medium ${txt}`}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="submenu flex flex-col items-end">
          <button
            className="px-6 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600"
            onClick={() => toggleSubMenu('peinture')}
          >
            Peinture {subMenuStates['peinture'] ? '▲' : '▼'}
          </button>
          {subMenuStates['peinture'] && (
            <div className="submenu-content mt-4 space-y-3 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PEINTURE_ITEMS.map(item => {
                  const state = itemStates[item.id] ?? 0;
                  const bg = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
                  const border = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-400' : 'border-green-500';
                  const txt = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800';
                  return (
                    <div
                      key={item.id}
                      onClick={() => cycleState(item.id)}
                      className={`rounded-lg border-2 px-4 py-3 cursor-pointer ${bg} ${border} flex items-center justify-center text-center`}
                    >
                      <span className={`text-sm font-medium ${txt}`}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  // États existants...
  
  // Ajoutez ces items aux ALL_ITEMS dans votre état initial
  // Si cette ligne cause des problèmes, vous pouvez l'ajouter au niveau de la définition de ALL_ITEMS dans constants.js
  const allCarrosserieItems = [...PEINTURE_ITEMS, ...REPARATION_PEINTURE_ITEMS];
  
  // Le reste du code reste inchangé jusqu'à la partie Forfaits...

  // Dans la partie de rendu où se trouvent les forfaits, ajoutez ceci après la section "Mécanique"
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 md:p-8">
      {/* ... code existant ... */}
      
      {/* Dans la section Carrosserie */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-orange-800">Carrosserie</h2>
          <button
            onClick={() => toggleCategory('carrosserie')}
            className="px-6 py-3 text-white rounded-full font-semibold hover:opacity-90"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {expandedCategories.carrosserie ? 'Fermer' : 'Ouvrir'}
          </button>
        </div>
        {expandedCategories.carrosserie && (
          <>
            <CarrosserieSubMenus
              toggleSubMenu={toggleSubMenu}
              subMenuStates={subMenuStates}
              itemStates={itemStates}
              cycleState={cycleState}
            />
            <div className="main-menu flex justify-end space-x-4 mb-6">
              <button className="px-6 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600">
                REP
              </button>
              <button className="px-6 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600">
                REMP
              </button>
            </div>
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

      {/* ... autres sections ... */}

      {totalActive > 0 && (
        <>
          {/* ... code existant ... */}
          
          <div className="mt-8 border-t-2 border-gray-300 pt-8">
            <h2 className="text-2xl font-bold mb-6">Forfaits</h2>
            
            {/* Section Forfaits Mécanique existante */}
            {activeMecaniqueItems.length > 0 && (
              <div className="mb-8">
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
            
            {/* Nouvelle section Forfaits Carrosserie */}
            {allCarrosserieItems.some(item => itemStates[item.id] === 1 || itemStates[item.id] === 2) && (
              <div>
                <h3 className="text-xl font-bold text-orange-800 mb-4">Carrosserie</h3>
                {allCarrosserieItems
                  .filter(item => itemStates[item.id] === 1 || itemStates[item.id] === 2)
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

          {/* ... reste du code ... */}
        </>
      )}
    </div>
  );
}

export default App;
