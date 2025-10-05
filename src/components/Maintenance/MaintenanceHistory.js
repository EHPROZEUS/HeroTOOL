import React from 'react';

const MaintenanceHistory = ({ lastMaintenance, updateLastMaintenance }) => {
  const maintenanceItems = [
    { field: 'filtreHuile', label: 'Filtre à huile' },
    { field: 'filtrePollen', label: 'Filtre à pollen' },
    { field: 'filtreAir', label: 'Filtre à air' },
    { field: 'filtreCarburant', label: 'Filtre à carburant' },
    { field: 'bougies', label: 'Bougies' },
    { field: 'vidangeBoite', label: 'Vidange de boîte' },
    { field: 'liquideFrein', label: 'Liquide de frein' },
    { field: 'liquideRefroidissement', label: 'Liquide refroid.' },
    { field: 'courroieDistribution', label: 'Courroie distrib.' },
    { field: 'courroieAccessoire', label: 'Courroie access.' }
  ];

  return (
    <div className="mb-8 p-4 md:p-6 rounded-xl border-2" style={{ backgroundColor: '#FFFAF5', borderColor: '#F7931E' }}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Derniers entretiens connus</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {maintenanceItems.slice(0, 5).map(({ field, label }) => (
          <div key={field}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
            <input 
              type="date" 
              value={lastMaintenance[field]?.split('|')[0] || ''} 
              onChange={(e) => updateLastMaintenance(field, e.target.value + '|' + (lastMaintenance[field]?.split('|')[1] || ''))}
              className="w-full px-2 py-1 border-2 rounded text-xs mb-1 focus:outline-none focus:ring-2 focus:ring-orange-500" 
              style={{ borderColor: '#F7931E' }}
            />
            <input 
              type="text" 
              placeholder="Kilomètres..." 
              value={lastMaintenance[field]?.split('|')[1] || ''}
              onChange={(e) => updateLastMaintenance(field, (lastMaintenance[field]?.split('|')[0] || '') + '|' + e.target.value)}
              className="w-full px-2 py-1 border-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" 
              style={{ borderColor: '#F7931E' }}
            />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-4">
        {maintenanceItems.slice(5, 10).map(({ field, label }) => (
          <div key={field}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
            <input 
              type="date" 
              value={lastMaintenance[field]?.split('|')[0] || ''} 
              onChange={(e) => updateLastMaintenance(field, e.target.value + '|' + (lastMaintenance[field]?.split('|')[1] || ''))}
              className="w-full px-2 py-1 border-2 rounded text-xs mb-1 focus:outline-none focus:ring-2 focus:ring-orange-500" 
              style={{ borderColor: '#F7931E' }}
            />
            <input 
              type="text" 
              placeholder="Kilomètres..." 
              value={lastMaintenance[field]?.split('|')[1] || ''}
              onChange={(e) => updateLastMaintenance(field, (lastMaintenance[field]?.split('|')[0] || '') + '|' + e.target.value)}
              className="w-full px-2 py-1 border-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500" 
              style={{ borderColor: '#F7931E' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceHistory;
