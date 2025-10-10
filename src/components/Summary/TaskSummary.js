import React from 'react';

const TaskSummary = ({ allItems, itemStates, itemNotes, cycleState }) => {
  const filteredItems = allItems.filter(item => item.label !== "DSP");
  const inProgressItems = allItems.filter(item => itemStates[item.id] === 1);
  const completedItems = allItems.filter(item => itemStates[item.id] === 2);
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Résumé</h2>

      {inProgressItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#FF6B35' }}>
            En cours ({inProgressItems.length})
          </h3>
          <div className="space-y-2">
            {inProgressItems.map(item => (
              <div 
                key={item.id} 
                className="border rounded-lg p-3 flex justify-between" 
                style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B35' }}
              >
                <div>
                  <span className="font-medium">{item.label}</span>
                  {itemNotes[item.id] && (
                    <span className="ml-2 text-sm italic"> - {itemNotes[item.id]}</span>
                  )}
                </div>
                <button 
                  onClick={() => cycleState(item.id)} 
                  className="ml-4 px-4 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all"
                >
                  Valider
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-3">
            Terminé ({completedItems.length})
          </h3>
          <div className="space-y-2">
            {completedItems.map(item => (
              <div 
                key={item.id} 
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <span className="font-medium line-through">{item.label}</span>
                {itemNotes[item.id] && (
                  <span className="ml-2 text-sm italic"> - {itemNotes[item.id]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {inProgressItems.length === 0 && completedItems.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-gray-300">
          <p className="text-gray-500 italic">Aucune tâche sélectionnée</p>
        </div>
      )}
    </div>
  );
};

export default TaskSummary;
