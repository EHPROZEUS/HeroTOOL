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
    return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mois` : ''}`;
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

  // Styles utilitaires partagés
  const btnBase = 'inline-flex items-center justify-center rounded font-semibold transition border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400';
  const btnPrimary = `${btnBase} bg-orange-500 border-orange-500 text-white hover:bg-orange-600 active:bg-orange-700`;
  const btnOutline = `${btnBase} bg-white border-orange-500 text-orange-600 hover:bg-orange-50 active:bg-orange-100`;
  const btnGhost = 'text-orange-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded';
  const inputStyle = 'px-2 py-1 border-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500';
  const orangeBorder = { borderColor: '#F7931E' };
  const orangeBg = { backgroundColor: '#FFFAF5', borderColor: '#F7931E' };

  return (
    <div className="mb-8 p-4 md:p-6 rounded-xl border-2" style={orangeBg}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Derniers entretiens connus</h2>

      {/* Bloc application groupée */}
      <div className="mb-6 border-2 rounded-lg p-4 md:p-5 bg-white space-y-4" style={orangeBorder}>
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
              className={inputStyle}
              style={orangeBorder}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Kilométrage</label>
            <input
              type="text"
              value={batchKm}
              placeholder="Ex: 15423"
              onChange={(e) => setBatchKm(e.target.value)}
              className={inputStyle}
              style={orangeBorder}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canApply}
              onClick={applyBatch}
              className={`${btnPrimary} px-4 py-2 text-sm ${!canApply ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Appliquer aux éléments cochés
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className={`${btnOutline} px-3 py-2 text-sm`}
            >
              Réinitialiser sélection
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          Laisser vide la date ou le kilométrage conserve la valeur existante correspondante.
        </p>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border-2" style={orangeBorder}>
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-orange-50/60">
            <tr className="text-left text-gray-700">
              <th className="py-2 pl-2 pr-2 align-middle">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#F7931E] rounded-sm border border-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    aria-label="Tout sélectionner"
                  />
                </label>
              </th>
              <th className="py-2 pr-4 font-semibold tracking-wide">Élément</th>
              <th className="py-2 pr-4 font-semibold tracking-wide">Date</th>
              <th className="py-2 pr-4 font-semibold tracking-wide">Km</th>
              <th className="py-2 pr-4 font-semibold tracking-wide">Âge</th>
              <th className="py-2 pr-4 font-semibold tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceItems.map(({ field, label }, idx) => {
              const value = lastMaintenance[field] || '';
              const [d = '', k = ''] = value.split('|');
              const age = timeSince(d);
              const editing = inlineEdit === field;
              const zebra = idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/30';

              return (
                <tr
                  key={field}
                  className={`${zebra} hover:bg-orange-50 transition-colors`}
                >
                  <td className="py-2 pl-2 pr-2 align-top">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.has(field)}
                        onChange={() => toggleSelect(field)}
                        className="w-4 h-4 accent-[#F7931E] rounded-sm border border-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                        aria-label={`Sélectionner ${label}`}
                      />
                    </label>
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
                        className={`${inputStyle} w-full text-xs md:text-sm`}
                        style={orangeBorder}
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
                        className={`${inputStyle} w-full text-xs md:text-sm`}
                        style={orangeBorder}
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
                        className={`${btnGhost} text-xs`}
                      >
                        ✏️ Éditer
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={saveInlineEdit}
                          className="text-green-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded text-xs font-semibold"
                        >
                          Sauver
                        </button>
                        <button
                          type="button"
                          onClick={cancelInlineEdit}
                          className="text-gray-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded text-xs"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {maintenanceItems.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-sm text-gray-500 italic"
                >
                  Aucun élément d'entretien configuré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer d'action rapide */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={applyBatch}
          disabled={!canApply}
          className={`${btnPrimary} px-3 py-2 text-xs md:text-sm ${!canApply ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Appliquer (rappel)
        </button>
        <button
          type="button"
          onClick={toggleSelectAll}
          className={`${btnOutline} px-3 py-2 text-xs md:text-sm`}
        >
          {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceHistory;
