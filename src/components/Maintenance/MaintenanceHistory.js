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

const color = {
  orange: '#F7931E',
  grayBg: '#E5E7EB',
  grayBorder: '#CBD0D6',
  grayText: '#374151',
  grayMuted: '#6B7280',
  grayInputBg: '#F8F9FA'
};

// Calcule "il y a ..."
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

  const btnBase = 'inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed';
  const btnPrimary = `${btnBase} px-4 py-2 text-sm text-white`;
  const btnOutline = `${btnBase} px-4 py-2 text-sm`;

  return (
    <div
      className="mb-8 p-5 md:p-6 rounded-2xl border"
      style={{ borderColor: color.orange, backgroundColor: '#FFFAF5' }}
    >
      <h2 className="text-xl font-bold mb-6" style={{ color: color.grayText }}>
        Derniers entretiens connus
      </h2>

      {/* Application groupée */}
      <div
        className="mb-8 rounded-2xl p-5 space-y-4"
        style={{
          backgroundColor: '#FFFFFF',
          border: `2px solid ${color.orange}`
        }}
      >
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ color: color.grayText }}>
          Application groupée
        </h3>

        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1" style={{ color: color.grayMuted }}>Date</label>
            <input
              type="date"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: color.grayInputBg,
                border: `2px solid ${color.orange}`,
                color: color.grayText
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1" style={{ color: color.grayMuted }}>Kilométrage</label>
            <input
              type="text"
              value={batchKm}
              placeholder="Ex: 15423"
              onChange={(e) => setBatchKm(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: color.grayInputBg,
                border: `2px solid ${color.orange}`,
                color: color.grayText
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canApply}
              onClick={applyBatch}
              className={btnPrimary}
              style={{
                backgroundColor: canApply ? color.orange : '#F3F4F6',
                border: `2px solid ${color.orange}`,
                boxShadow: canApply ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Appliquer aux éléments cochés
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className={btnOutline}
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${color.orange}`,
                color: color.grayText
              }}
            >
              Réinitialiser sélection
            </button>
            <button
              type="button"
              onClick={toggleSelectAll}
              className={btnOutline}
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${color.orange}`,
                color: color.grayText
              }}
            >
              {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: color.grayMuted }}>
          Laisser vide la date ou le kilométrage conserve la valeur existante pour ce champ.
        </p>
      </div>

      {/* Grille cartes */}
      <div className="grid gap-5 md:gap-6"
           style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {maintenanceItems.map(({ field, label }) => {
          const value = lastMaintenance[field] || '';
            const [d = '', k = ''] = value.split('|');
          const age = timeSince(d);
          const isSelected = selected.has(field);
          const editing = inlineEdit === field;

          return (
            <div
              key={field}
              className="relative group"
            >
              <div
                className="h-full flex flex-col gap-3 p-4 rounded-3xl transition"
                style={{
                  backgroundColor: color.grayBg,
                  border: `2px solid ${isSelected ? color.orange : color.grayBorder}`,
                  boxShadow: isSelected
                    ? '0 4px 10px -2px rgba(247,147,30,0.25)'
                    : '0 2px 4px rgba(0,0,0,0.06)'
                }}
              >
                {/* Ligne du haut : Sélecteur arrondi + label */}
                <div className="flex items-center gap-4">
                  {/* CHANGED: suppression de la case carrée, ajout d'un cercle sélection */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(field)}
                    aria-pressed={isSelected}
                    aria-label={`Sélectionner ${label}`}
                    className="relative inline-flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '9999px',
                      border: `2px solid ${isSelected ? color.orange : '#9CA3AF'}`,
                      background: isSelected ? color.orange : '#FFFFFF',
                      color: '#FFFFFF',
                      boxShadow: isSelected ? '0 0 0 3px rgba(247,147,30,0.25)' : 'none'
                    }}
                  >
                    {isSelected && (
                      <span
                        className="text-sm"
                        style={{ fontWeight: 700, lineHeight: 1 }}
                      >
                        ✓
                      </span>
                    )}
                  </button>

                  <span
                    className="font-semibold text-sm md:text-base leading-snug"
                    style={{ color: color.grayText }}
                  >
                    {label}
                  </span>
                </div>

                {/* Contenu / édition */}
                {!editing && (
                  <div className="pl-1 space-y-1 text-xs md:text-sm">
                    <div className="flex gap-2">
                      <span className="font-medium" style={{ color: color.grayMuted }}>Date :</span>
                      <span style={{ color: color.grayText }}>{d || <span className="italic text-gray-500">—</span>}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium" style={{ color: color.grayMuted }}>Km :</span>
                      <span style={{ color: color.grayText }}>{k || <span className="italic text-gray-500">—</span>}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium" style={{ color: color.grayMuted }}>Âge :</span>
                      <span style={{ color: color.grayText }}>{age ? `il y a ${age}` : <span className="italic text-gray-500">—</span>}</span>
                    </div>
                  </div>
                )}

                {editing && (
                  <div className="pl-1 space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium" style={{ color: color.grayMuted }}>Date</label>
                      <input
                        type="date"
                        value={inlineDate}
                        onChange={(e) => setInlineDate(e.target.value)}
                        className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: color.grayInputBg,
                          border: `2px solid ${color.orange}`,
                          color: color.grayText
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium" style={{ color: color.grayMuted }}>Kilométrage</label>
                      <input
                        type="text"
                        value={inlineKm}
                        placeholder="Km"
                        onChange={(e) => setInlineKm(e.target.value)}
                        className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: color.grayInputBg,
                          border: `2px solid ${color.orange}`,
                          color: color.grayText
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="button"
                        onClick={saveInlineEdit}
                        className="px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          backgroundColor: color.orange,
                          border: `2px solid ${color.orange}`,
                          color: '#FFFFFF'
                        }}
                      >
                        Sauver
                      </button>
                      <button
                        type="button"
                        onClick={cancelInlineEdit}
                        className="px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: `2px solid ${color.orange}`,
                          color: color.grayText
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Bouton éditer */}
                {!editing && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => startInlineEdit(field)}
                      className="text-xs font-semibold flex items-center gap-1 px-4 py-2 rounded-2xl transition"
                      style={{
                        color: color.orange,
                        backgroundColor: '#FFFFFF',
                        border: `2px solid ${color.orange}`
                      }}
                    >
                      ✏️ Éditer
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaintenanceHistory;
