import React from "react";
import { PEINTURE_FORFAITS } from "../../config/constants";

// Map des ids vers labels courts pour boutons
const COURT_LABELS = {
  "R-P1": "1 Élément",
  "R-PAARD": "Aile ARD",
  "R-PAARG": "Aile ARG",
  "R-PAAVD": "Aile AVD",
  "R-PAAVG": "Aile AVG",
  "R-PAVILLON": "Pavillon",
  "R-PCP": "Capot",
  "R-PCRD": "Coque rétro droite",
  "R-PCRG": "Coque rétro gauche",
  "R-PH": "Hayon"
};

export default function ReparationPeintureSubMenu({
  forfaitData,
  addPeintureForfait,
  removePeintureForfait,
  countRP1
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {PEINTURE_FORFAITS.map(forfait => {
        // R-P1: multi-ajout, autres: toggle unique
        if (forfait.id === "R-P1") {
          return (
            <div key="R-P1" className="flex items-center gap-2">
              <button
                className={`px-5 py-2 rounded-lg font-semibold shadow transition
                  ${countRP1 > 0 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"}
                `}
                onClick={() => addPeintureForfait("R-P1")}
              >
                + {COURT_LABELS["R-P1"]}
                {countRP1 > 0 && (
                  <span className="ml-2 inline-block bg-white text-green-700 rounded px-2 text-xs font-bold border border-green-600">
                    {countRP1}
                  </span>
                )}
              </button>
              {countRP1 > 0 && (
                <button
                  className="px-3 py-2 rounded-lg font-semibold bg-red-500 text-white shadow transition"
                  onClick={() => removePeintureForfait("R-P1")}
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
              forfaitData[key]?.peintureForfait === forfait.id
          );
          return (
            <button
              key={forfait.id}
              className={`px-5 py-2 rounded-lg font-semibold shadow transition
                ${actif ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"}
              `}
              onClick={() =>
                actif
                  ? removePeintureForfait(forfait.id)
                  : addPeintureForfait(forfait.id)
              }
            >
              {COURT_LABELS[forfait.id] || forfait.label.replace(/^RÉPARATION\s*\+\s*PEINTURE\s*/i, "")}
            </button>
          );
        }
      })}
    </div>
  );
}
