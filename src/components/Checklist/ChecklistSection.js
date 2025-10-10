import React from 'react';
import ChecklistItem from './ChecklistItem';

const ChecklistSection = ({ 
  leftItems, 
  rightItems, 
  itemStates, 
  itemNotes, 
  onCycleState, 
  onUpdateNote 
}) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          {leftItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              state={itemStates[item.id]}
              note={itemNotes[item.id] || ''}
              onCycleState={onCycleState}
              onUpdateNote={onUpdateNote}
            />
          ))}
        </div>
        <div className="space-y-4">
          {rightItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              state={itemStates[item.id]}
              note={itemNotes[item.id] || ''}
              onCycleState={onCycleState}
              onUpdateNote={onUpdateNote}
            />
          ))}
        </div>
      </div>
      <div className="my-8 border-t-2 border-gray-300"></div>
    </>
  );
};

export default ChecklistSection;
