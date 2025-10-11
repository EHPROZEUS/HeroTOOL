import React from "react";

export default function PlumeSubMenu({
  forfaitData,
  addPlume1Elem,
  removePlume1Elem,
  countPlume1
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <div className="flex items-center gap-2">
        <button
          className={`px-5 py-2 rounded-lg font-semibold shadow transition
            ${countPlume1 > 0 ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-800"}
          `}
          onClick={addPlume1Elem}
        >
          + 1 Élément
          {countPlume1 > 0 && (
            <span className="ml-2 inline-block bg-white text-amber-700 rounded px-2 text-xs font-bold border border-amber-600">
              {countPlume1}
            </span>
          )}
        </button>
        {countPlume1 > 0 && (
          <button
            className="px-3 py-2 rounded-lg font-semibold bg-red-500 text-white shadow transition"
            onClick={removePlume1Elem}
            title="Retirer une occurrence"
          >
            –
          </button>
        )}
      </div>
    </div>
  );
}