/**
 * COMPOSANT: En-tête de l'Ordre de Réparation
 * Gère l'affichage des informations véhicule et des checkboxes (CT, contre-visite)
 */
import React from 'react';

const ORHeader = ({
  showOrdreReparation,
  setShowOrdreReparation,
  includeControleTechnique,
  setIncludeControleTechnique,
  includeContrevisite,
  setIncludeContrevisite,
  editMode,
  setEditMode
}) => {
  return (
    <div className="mt-8 border-t-2 border-gray-300 pt-8">
      {/* Titre et contrôles */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ordre de réparation</h2>
        
        <div className="flex items-center gap-4">
          {/* Bouton Mode Édition - affiché seulement si l'ordre est visible */}
          {showOrdreReparation && (
            <button
              //onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: editMode ? '#FF6B35' : '#E5E7EB',
                color: editMode ? 'white' : '#374151'
              }}
            >
              {editMode ? '✏️ Mode Édition' : '🔒 Lecture seule'}
            </button>
          )}

          {/* Checkbox Contrôle Technique */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!includeControleTechnique}
              onChange={e => setIncludeControleTechnique && setIncludeControleTechnique(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contrôle Technique (42€)</span>
          </label>

          {/* Checkbox Contre-visite */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!includeContrevisite}
              onChange={e => setIncludeContrevisite && setIncludeContrevisite(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">Contre-visite (+10€)</span>
          </label>

          {/* Bouton Toggle affichage */}
          <button
            onClick={() => setShowOrdreReparation && setShowOrdreReparation(!showOrdreReparation)}
            className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {showOrdreReparation ? 'Masquer' : 'Afficher'} l'ordre
          </button>
        </div>
      </div>
    </div>
  );
};

export default ORHeader;