import React, { useState } from 'react';

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

function timeSince(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) return 'dans le futur';
  const days = Math.floor(diffMs / 86400000);
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0) return `${years} an${years > 1 ? 's' : ''}${months ? ` ${months} mois` : ''}`;
  if (months > 0) return `${months} mois`;
  return `${days} j`;
}

const MaintenanceHistory = ({ lastMaintenance = {}, updateLastMaintenance }) => {
  const [batchDate, setBatchDate] = useState('');
  const [batchKm, setBatchKm] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [inlineEdit, setInlineEdit] = useState(null);
  const [inlineDate, setInlineDate] = useState('');
  const [inlineKm, setInlineKm] = useState('');

  const toggleSelect = (field) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(field) ? next.delete(field) : next.add(field);
      return next;
    });
  };

  const allSelected = selected.size === maintenanceItems.length;

  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(maintenanceItems.map(i => i.field)));
  };

  const applyBatch = () => {
    if (!batchDate && !batchKm) return;
    selected.forEach(field => {
      const existing = lastMaintenance[field] || '';
      const [oldDate = '', oldKm = ''] = existing.split('|');
      const newDate = batchDate || oldDate;
      const newKm = batchKm || oldKm;
      updateLastMaintenance(field, `${newDate}|${newKm}`);
    });
    setBatchDate('');
    setBatchKm('');
    setSelected(new Set());
  };

  const canApply = selected.size > 0 && (batchDate || batchKm);

  const startInlineEdit = (field) => {
    setInlineEdit(field);
    const existing = lastMaintenance[field] || '';
    const [d = '', k = ''] = existing.split('|');
    setInlineDate(d);
    setInlineKm(k);
  };

  const cancelInlineEdit = () => {
    setInlineEdit(null);
    setInlineDate('');
    setInlineKm('');
  };

  const saveInlineEdit = () => {
    if (!inlineEdit) return;
    updateLastMaintenance(inlineEdit, `${inlineDate}|${inlineKm}`);
    cancelInlineEdit();
  };

  const handleRowKeyDown = (e, field) => {
    if (['Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (inlineEdit !== field) toggleSelect(field);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 p-6 shadow-sm" style={{ borderColor: '#FF6B35' }}>
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#FF6B35' }}>
        Derniers entretiens connus
      </h2>

      {/* Batch Update Section */}
      <div className="bg-orange-50 rounded-xl p-6 mb-6 border-2 border-orange-200">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={batchDate || ''}
              onChange={(e) => setBatchDate(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#FF6B35' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 uppercase tracking-wide">
              Kilométrage
            </label>
            <input
              type="text"
              value={batchKm || ''}
              onChange={(e) => setBatchKm(e.target.value)}
              placeholder="Ex: 15423"
              className="w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#FF6B35' }}
            />
          </div>
        </div>
        
        <button
          disabled={!canApply}
          onClick={applyBatch}
          className="w-full px-6 py-5 rounded-xl text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg mb-4"
          style={{
            backgroundColor: canApply ? '#FF6B35' : '#E5E7EB',
            color: canApply ? 'white' : '#6B7280'
          }}
        >
          Appliquer aux éléments cochés
        </button>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelected(new Set())}
            className="px-5 py-3 rounded-xl text-sm font-bold bg-white border-2 hover:bg-orange-50 transition-all shadow-sm"
            style={{ borderColor: '#FF6B35', color: '#FF6B35' }}
          >
            Réinitialiser sélection
          </button>
          <button
            onClick={toggleSelectAll}
            className="px-5 py-3 rounded-xl text-sm font-bold bg-white border-2 hover:bg-orange-50 transition-all shadow-sm"
            style={{ borderColor: '#FF6B35', color: '#FF6B35' }}
          >
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-3 italic">
          Laisser vide la date ou le kilométrage conserve la valeur existante.
        </p>
      </div>

      {/* Maintenance Items Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {maintenanceItems.map(({ field, label }) => {
          const raw = lastMaintenance[field] || '';
          const [d = '', k = ''] = raw.split('|');
          const age = timeSince(d);
          const isSelected = selected.has(field);
          const isEditing = inlineEdit === field;

          return (
            <div
              key={field}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => handleRowKeyDown(e, field)}
              onClick={(e) => {
                if (isEditing) return;
                if (e.target.closest('[data-row-action="true"]')) return;
                toggleSelect(field);
              }}
              className="rounded-xl p-6 cursor-pointer transition-all border-2 shadow-sm hover:shadow-lg"
              style={{
                backgroundColor: isSelected ? '#FFF4E6' : '#F9FAFB',
                borderColor: isSelected ? '#FF6B35' : '#D1D5DB',
                borderLeftWidth: isSelected ? '6px' : '2px',
                transform: isSelected ? 'translateX(2px)' : 'none'
              }}
            >
              {!isEditing && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-800">{label}</h3>
                    <button
                      data-row-action="true"
                      type="button"
                      onClick={() => startInlineEdit(field)}
                      className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90 shadow-sm"
                      style={{ backgroundColor: '#FF6B35', color: 'white' }}
                    >
                      Éditer
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-600 font-semibold text-sm">Date:</span>
                      <span className="text-gray-900 font-bold">{d || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-600 font-semibold text-sm">Km:</span>
                      <span className="text-gray-900 font-bold">{k || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg border-2" style={{ 
                      backgroundColor: '#FFF4E6',
                      borderColor: '#FF6B35'
                    }}>
                      <span className="text-gray-600 font-semibold text-sm">Âge:</span>
                      <span className="font-bold text-base" style={{ color: '#FF6B35' }}>
                        {age ? `il y a ${age}` : '—'}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {isEditing && (
                <div data-row-action="true" className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 pb-3 border-b-2" style={{ borderColor: '#FF6B35' }}>
                    {label}
                  </h3>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 uppercase tracking-wide">
                      Date
                    </label>
                    <input
                      type="date"
                      value={inlineDate || ''}
                      onChange={(e) => setInlineDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ borderColor: '#FF6B35' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 uppercase tracking-wide">
                      Kilométrage
                    </label>
                    <input
                      type="text"
                      value={inlineKm || ''}
                      onChange={(e) => setInlineKm(e.target.value)}
                      placeholder="Ex: 15423"
                      className="w-full px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ borderColor: '#FF6B35' }}
                    />
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={saveInlineEdit}
                      className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-md"
                      style={{ backgroundColor: '#FF6B35' }}
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelInlineEdit}
                      className="flex-1 px-5 py-3 rounded-xl text-sm font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaintenanceHistory;