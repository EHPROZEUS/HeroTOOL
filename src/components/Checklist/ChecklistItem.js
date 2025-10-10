import React from 'react';
import { Check, Clock } from 'lucide-react';

const ChecklistItem = ({ item, state, note, onCycleState, onUpdateNote }) => {
  const hasNote = item.hasNote;
  
  // Couleurs AutoHero
  const bgColor = state === 0 ? 'bg-gray-200' : state === 1 ? 'bg-orange-100' : 'bg-green-100';
  const borderColor = state === 0 ? 'border-gray-400' : state === 1 ? 'border-orange-500' : 'border-green-500';
  const textColor = state === 0 ? 'text-gray-600' : state === 1 ? 'text-orange-900' : 'text-green-800 line-through';
  
  const icon = state === 1 ? (
    <Clock className="w-4 h-4 text-white" strokeWidth={2.5} />
  ) : state === 2 ? (
    <Check className="w-4 h-4 text-white" strokeWidth={3} />
  ) : null;

  const iconBg = state === 1 ? 'bg-orange-500' : state === 2 ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div className={`rounded-xl border-2 transition-all ${bgColor} ${borderColor}`}>
      <div 
        onClick={() => onCycleState(item.id)} 
        className="flex items-center p-4 cursor-pointer hover:shadow-md"
      >
        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-4 ${iconBg}`}>
          {icon}
        </div>
        <span className={`text-base font-medium ${textColor}`}>{item.label}</span>
      </div>
      
      {hasNote && state === 1 && (
        <div className="px-4 pb-4">
          <input 
            type="text" 
            value={note} 
            onChange={(e) => onUpdateNote(item.id, e.target.value)}
            placeholder={item.id.includes('pneus') ? "Ex: 205/55R16 91W" : "Ajouter une note..."}
            className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
      
      {hasNote && state === 2 && note && (
        <div className="px-4 pb-4">
          <div className="text-sm text-gray-600 italic">{note}</div>
        </div>
      )}
    </div>
  );
};

export default ChecklistItem;
