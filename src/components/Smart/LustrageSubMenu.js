import React from "react";

export default function LustrageSubMenu({
  forfaitData,
  addLustrage1Elem,
  removeLustrage1Elem,
  countL1
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <div className="flex items-center gap-2">
        <button
          className={`px-5 py-2 rounded-lg font-semibold shadow transition
            ${countL1 > 0 ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-800"}
          `}
          onClick={addLustrage1Elem}
        >
          + 1 Élément
          {countL1 > 0 && (
            <span className="ml-2 inline-block bg-white text-purple-700 rounded px-2 text-xs font-bold border border-purple-600">
              {countL1}
            </span>
          )}
        </button>
        {countL1 > 0 && (
          <button
            className="px-3 py-2 rounded-lg font-semibold bg-red-500 text-white shadow transition"
            onClick={removeLustrage1Elem}
            title="Retirer une occurrence"
          >
            –
          </button>
        )}
      </div>
    </div>
  );
}