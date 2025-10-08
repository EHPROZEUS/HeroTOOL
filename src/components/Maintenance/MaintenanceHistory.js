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

// Calcule "il y a ..." à partir d'une date (YYYY-MM-DD)
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
  if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ' ${months} mois' : ''}`;
  }
  if (months > 0) return `${months} mois`;
  return `${days} j`;
}

const MaintenanceHistory = ({ lastMaintenance, updateLastMaintenance }) => {
  const [batchDate, setBatchDate] = useState('');
  const [batchKm, setBatchKm] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [inlineEdit, setInlineEdit] = useState(null);
  const [inlineDate, setInlineDate] = useState('');
  const [inlineKm, setInlineKm] = useState('');

  const toggleSelect = (field) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field); else next.add(field);
      return next;
    });
  };

  const allSelected = selected.size === maintenanceItems.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(maintenanceItems.map(i => i.field)));
    }
  };

  const applyBatch = () => {
    if (selected.size === 0) return;
    selected.forEach(field => {
      const existing = lastMaintenance[field] || '';
      const [oldDate = '', oldKm = ''] = existing.split('|');
      const newDate = batchDate || oldDate;
      const newKm = batchKm || oldKm;
      updateLastMaintenance(field, `${newDate}|${newKm}`);
    });
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

  // Styles de boutons mis à jour pour correspondre à l'image 2
  const btnPrimary = "bg-[#FF6B35] text-white font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity";
  const btnOutline = "bg-white border-2 border-[#FF6B35] text-[#FF6B35] font-semibold px-4 py-2 rounded-full hover:bg-orange-50 transition-colors";
  const btnGhost = "text-[#FF6B35] hover:underline font-medium text-xs";

  return (
    <div
      className="mb-8 p-4 md:p-6 rounded-xl border-2"
      style={{ backgroundColor: '#FFFAF5', borderColor: '#F7931E' }}
    >
      <h2 className="text-lg font-bold text-gray-800 mb-4">Derniers entretiens connus</h2>

      {/* Bloc application groupée */}
      <div
        className="mb-6 border-2 rounded-lg p-4 md:p-5 bg-white space-y-4"
        style={{ borderColor: '#F7931E' }}
      >
        <h3 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">
          Application groupée
        </h3>

        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
              className="px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#F7931E' }}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Kilométrage</label>
            <input
              type="text"
              value={batchKm}
              placeholder="Ex: 15423"
              onChange={(e) => setBatchKm(e.target.value)}
              className="px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#F7931E' }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canApply}
              onClick={applyBatch}
              className={`${btnPrimary} ${!canApply ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Appliquer aux éléments cochés
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className={btnOutline}
            >
              Réinitialiser sélection
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          Laisser vide la date ou le kilométrage conserve la valeur existante correspondante.
        </p>
      </div>

      {/* Tableau mis à jour pour correspondre au style de l'image 2 */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 px-2 py-2 text-sm font-semibold text-gray-700">
          <div className="col-span-1"></div>
          <div className="col-span-3">Élément</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Km</div>
          <div className="col-span-2">Âge</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {maintenanceItems.map(({ field, label }, idx) => {
          const value = lastMaintenance[field] || '';
          const [d = '', k = ''] = value.split('|');
          const age = timeSince(d);
          const editing = inlineEdit === field;
          
          return (
            <div 
              key={field}
              className="grid grid-cols-12 gap-2 p-4 rounded-lg items-center bg-[#E9ECF2]"
            >
              <div className="col-span-1">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(field)}
                    onChange={() => toggleSelect(field)}
                    className="w-5 h-5 accent-[#F7931E] rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    aria-label={`Sélectionner ${label}`}
                  />
                </label>
              </div>
              <div className="col-span-3 font-medium text-gray-800">
                {label}
              </div>
              <div className="col-span-2">
                {!editing ? (
                  d || <span className="text-gray-400 italic">—</span>
                ) : (
                  <input
                    type="date"
                    value={inlineDate}
                    onChange={(e) => setInlineDate(e.target.value)}
                    className="px-2 py-1 border-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                    style={{ borderColor: '#F7931E' }}
                  />
                )}
              </div>
              <div className="col-span-2">
                {!editing ? (
                  k || <span className="text-gray-400 italic">—</span>
                ) : (
                  <input
                    type="text"
                    value={inlineKm}
                    placeholder="Km"
                    onChange={(e) => setInlineKm(e.target.value)}
                    className="px-2 py-1 border-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                    style={{ borderColor: '#F7931E' }}
                  />
                )}
              </div>
              <div className="col-span-2">
                {age ? (
                  <span className="text-gray-700">il y a {age}</span>
                ) : (
                  <span className="text-gray-400 italic">—</span>
                )}
              </div>
              <div className="col-span-2">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => startInlineEdit(field)}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1 rounded-md text-xs flex items-center"
                  >
                    <span className="mr-1">✏️</span> Éditer
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveInlineEdit}
                      className="text-green-600 hover:underline text-xs font-semibold"
                    >
                      Sauver
                    </button>
                    <button
                      type="button"
                      onClick={cancelInlineEdit}
                      className="text-gray-500 hover:underline text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {maintenanceItems.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 italic bg-[#E9ECF2] rounded-lg">
            Aucun élément d'entretien configuré.
          </div>
        )}
      </div>

      {/* Footer d'action rapide */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={applyBatch}
          disabled={!canApply}
          className={`${btnPrimary} ${!canApply ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Appliquer (rappel)
        </button>
        <button
          type="button"
          onClick={toggleSelectAll}
          className={btnOutline}
        >
          {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceHistory;
