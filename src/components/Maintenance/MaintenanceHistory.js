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
};

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

const colors = {
  brand: '#F7931E',
  brandHover: '#e07d06',
  text: '#1F2933',
  textMuted: '#5A6572',
  border: '#E2E8EE',
  borderStrong: '#D1D7DE',
  rowSelectedBg: '#FFF6EC',
  rowHoverBg: '#F9FBFC',
  page: '#F7F9FA',
  focus: '#2563EB'
};

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
    if (!batchDate && !batchKm) return;
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

  const handleRowKeyDown = (e, field) => {
    if (['Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (inlineEdit !== field) toggleSelect(field);
    }
  };

  return (
    <div className="space-y-8">
      <section
        className="rounded-lg border"
        style={{ borderColor: colors.border, backgroundColor: '#FFFFFF' }}
      >
        <header className="px-6 pt-5 pb-4 border-b" style={{ borderColor: colors.border }}>
          <h2 className="text-[18px] font-semibold" style={{ color: colors.text }}>
            Derniers entretiens connus
          </h2>
        </header>

        {/* Application groupée */}
        <div className="px-6 pt-6 pb-4 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
                Date
              </label>
              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${colors.border}`,
                  background: '#FFFFFF',
                  color: colors.text
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
                Kilométrage
              </label>
              <input
                type="text"
                value={batchKm}
                onChange={(e) => setBatchKm(e.target.value)}
                placeholder="Ex: 15423"
                className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
                style={{
                  border: `1px solid ${colors.border}`,
                  background: '#FFFFFF',
                  color: colors.text
                }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={!canApply}
                onClick={applyBatch}
                className="px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 disabled:opacity-40"
                style={{
                  background: canApply ? colors.brand : '#F1F4F6',
                  color: canApply ? '#FFFFFF' : colors.textMuted,
                  border: '1px solid ' + (canApply ? colors.brand : colors.border)
                }}
              >
                Appliquer aux éléments cochés
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                Réinitialiser sélection
              </button>
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
              >
                {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
          </div>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Laisser vide la date ou le kilométrage conserve la valeur existante.
          </p>
        </div>

        {/* Liste */}
        <div className="px-0">
          <div className="border-t" style={{ borderColor: colors.border }} />
          <ul className="divide-y" style={{ borderColor: colors.border }}>
            {maintenanceItems.map(({ field, label }) => {
              const raw = lastMaintenance[field] || '';
              const [d = '', k = ''] = raw.split('|');
              const age = timeSince(d);
              const isSelected = selected.has(field);
              const isEditing = inlineEdit === field;

              return (
                <li
                  key={field}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => handleRowKeyDown(e, field)}
                  onClick={(e) => {
                    if (isEditing) return;
                    // Empêcher toggle si click sur un bouton interne
                    if (e.target.closest('[data-row-action="true"]')) return;
                    toggleSelect(field);
                  }}
                  className="px-6 py-4 text-sm relative cursor-pointer focus:outline-none"
                  style={{
                    background: isSelected ? colors.rowSelectedBg : '#FFFFFF',
                    borderLeft: `4px solid ${isSelected ? colors.brand : 'transparent'}`
                  }}
                >
                  {!isEditing && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-medium" style={{ color: colors.text }}>
                          {label}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                          <span style={{ color: colors.textMuted }}>
                            Date: <span style={{ color: colors.text }}>{d || '—'}</span>
                          </span>
                          <span style={{ color: colors.textMuted }}>
                            Km: <span style={{ color: colors.text }}>{k || '—'}</span>
                          </span>
                          <span style={{ color: colors.textMuted }}>
                            Âge: <span style={{ color: colors.text }}>{age ? `il y a ${age}` : '—'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          data-row-action="true"
                          type="button"
                          onClick={() => startInlineEdit(field)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium focus:outline-none focus:ring-2"
                          style={{
                            background: '#FFFFFF',
                            border: `1px solid ${colors.border}`,
                            color: colors.brand
                          }}
                        >
                          Éditer
                        </button>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="mt-1 space-y-4" data-row-action="true">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
                            Date
                          </label>
                          <input
                            type="date"
                            value={inlineDate}
                            onChange={(e) => setInlineDate(e.target.value)}
                            className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
                            style={{
                              border: `1px solid ${colors.borderStrong}`,
                              background: '#FFFFFF',
                              color: colors.text
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
                            Kilométrage
                          </label>
                          <input
                            type="text"
                            value={inlineKm}
                            onChange={(e) => setInlineKm(e.target.value)}
                            placeholder="Km"
                            className="px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
                            style={{
                              border: `1px solid ${colors.borderStrong}`,
                              background: '#FFFFFF',
                              color: colors.text
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textMuted }}>
                            Aperçu âge
                          </span>
                          <div className="px-3 py-2 rounded-md text-sm"
                               style={{
                                 border: `1px solid ${colors.borderStrong}`,
                                 background: '#FAFAFA',
                                 color: colors.text
                               }}>
                            {inlineDate ? `il y a ${timeSince(inlineDate)}` : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={saveInlineEdit}
                          className="px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2"
                          style={{
                            background: colors.brand,
                            color: '#FFFFFF',
                            border: `1px solid ${colors.brand}`
                          }}
                        >
                          Sauver
                        </button>
                        <button
                          type="button"
                          onClick={cancelInlineEdit}
                          className="px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2"
                          style={{
                            background: '#FFFFFF',
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default MaintenanceHistory;
