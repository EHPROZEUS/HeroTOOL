import React from "react";
import { PEINTURE_SEULE_FORFAITS } from "../../config/constants";

// Map des ids vers labels courts (utilise directement les labels des forfaits)
const getShortLabel = (forfait) => {
  // Les labels sont déjà courts dans PEINTURE_SEULE_FORFAITS
  return forfait.label;
};

export default function PeintureSubMenu({
  forfaitData,
  addPeintureSeuleForfait,
  removePeintureSeuleForfait,
  countP1Elem
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {PEINTURE_SEULE_FORFAITS.map(forfait => {
        // P-1ELEM: multi-ajout, autres: toggle unique
        if (forfait.id === "P-1ELEM") {
          return (
            <div key="P-1ELEM" className="flex items-center gap-2">
              <button
                className={`px-5 py-2 rounded-lg font-semibold shadow transition
                  ${countP1Elem > 0 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}
                `}
                onClick={() => addPeintureSeuleForfait("P-1ELEM")}
              >
                + {getShortLabel(forfait)}
                {countP1Elem > 0 && (
                  <span className="ml-2 inline-block bg-white text-blue-700 rounded px-2 text-xs font-bold border border-blue-600">
                    {countP1Elem}
                  </span>
                )}
              </button>
              {countP1Elem > 0 && (
                <button
                  className="px-3 py-2 rounded-lg font-semibold bg-red-500 text-white shadow transition"
                  onClick={() => removePeintureSeuleForfait("P-1ELEM")}
                  title="Retirer une occurrence"
                >
                  –
                </button>
              )}
            </div>
          );
        } else {
          const actif = Object.keys(forfaitData).some(
            key =>
              key.startsWith(forfait.id) &&
              forfaitData[key]?.peintureSeuleForfait === forfait.id
          );
          return (
            <button
              key={forfait.id}
              className={`px-5 py-2 rounded-lg font-semibold shadow transition
                ${actif ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}
              `}
              onClick={() =>
                actif
                  ? removePeintureSeuleForfait(forfait.id)
                  : addPeintureSeuleForfait(forfait.id)
              }
            >
              {getShortLabel(forfait)}
            </button>
          );
        }
      })}
    </div>
  );
}