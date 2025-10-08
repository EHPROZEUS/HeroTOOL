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
    return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ' ' + months + ' mois' : ''}`;
  }
  if (months > 0) return `${months} mois`;
  return `${days} j`;
}

const MaintenanceHistory = ({ lastMaintenance, updateLastMaintenance }) => {
  // Valeurs batch
  const [batchDate, setBatchDate] = useState('');
  const [batchKm, setBatchKm] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [inlineEdit, setInlineEdit] = useState(null); // field en édition ponctuelle
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
    // On ne vide pas les champs batch pour pouvoir réappliquer si besoin
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

  return (
    <div className="mb-8 p-4 md:p-6 rounded-xl border-2"
         style={{ backgroundColor: '#FFFAF5', borderColor: '#F7931E' }}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Derniers entretiens connus</h2>

      {/* Zone d'application multiple */}
      <div className="mb-6 border-2 rounded-lg p-4 bg-white"
           style={{ borderColor: '#F7931E' }}>
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Application groupée</h3>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
              className="px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#F7931E' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kilométrage</label>
            <input
              type="text"
              value={batchKm}
              placeholder="Ex: 15423"
              onChange={(e) => setBatchKm(e.target.value)}
              className="px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ borderColor: '#F7931E' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canApply}
              onClick={applyBatch}
              className={`px-4 py-2 rounded text-sm font-semibold border-2 transition ${
                canApply
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{ borderColor: '#F7931E' }}
            >
              Appliquer aux éléments cochés
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="px-3 py-2 rounded text-sm font-medium border-2 bg-white hover:bg-orange-50"
              style={{ borderColor: '#F7931E' }}
            >
              Réinitialiser sélection
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Laisser vide la date ou le kilométrage signifie : conserver la valeur existante pour ce champ.
        </p>
      </div>

      {/* Liste des éléments */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="text-left text-gray-700">
              <th className="py-2 pr-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </th>
              <th className="py-2 pr-4 font-semibold">Élément</th>
              <th className="py-2 pr-4 font-semibold">Date</th>
              <th className="py-2 pr-4 font-semibold">Km</th>
              <th className="py-2 pr-4 font-semibold">Âge</th>
              <th className="py-2 pr-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceItems.map(({ field, label }) => {
              const value = lastMaintenance[field] || '';
              const [d = '', k = ''] = value.split('|');
              const age = timeSince(d);
              const editing = inlineEdit === field;

              return (
                <tr key={field} className="border-t border-orange-200">
                  <td className="py-2 pr-2 align-top">
                    <input
                      type="checkbox"
                      checked={selected.has(field)}
                      onChange={() => toggleSelect(field)}
                      aria-label={`Sélectionner ${label}`}
                    />
                  </td>
                  <td className="py-2 pr-4 font-medium text-gray-800 align-top">
                    {label}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {!editing ? (
                      d || <span className="text-gray-400 italic">—</span>
                    ) : (
                      <input
                        type="date"
                        value={inlineDate}
                        onChange={(e) => setInlineDate(e.target.value)}
                        className="px-2 py-1 border-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{ borderColor: '#F7931E' }}
                      />
                    )}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {!editing ? (
                      k || <span className="text-gray-400 italic">—</span>
                    ) : (
                      <input
                        type="text"
                        value={inlineKm}
                        placeholder="Km"
                        onChange={(e) => setInlineKm(e.target.value)}
                        className="px-2 py-1 border-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{ borderColor: '#F7931E' }}
                      />
                    )}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {age ? (
                      <span className="text-gray-700">il y a {age}</span>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {!editing ? (
                      <button
                        type="button"
                        onClick={() => startInlineEdit(field)}
                        className="text-orange-600 hover:underline text-xs"
                      >
                        ✏️ Éditer
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveInlineEdit}
                          className="text-green-600 hover:underline text-xs"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default MaintenanceHistory;
