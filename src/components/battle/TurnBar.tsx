// src/components/battle/TurnBar.tsx
import React from 'react';
import { useCombatStore } from '@/stores/combatStore';

export default function TurnBar() { 
  const order = useCombatStore(s => s.initiative); 
  const currentTurn = useCombatStore(s => s.currentTurn); 
  
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 flex gap-2">
      {order.map((e, i) => (
        <div 
          key={e.tokenId} 
          className={`px-2 py-1 rounded ${
            i === currentTurn ? 'bg-yellow-500 text-black' : 'bg-neutral-700 text-white'
          }`}
        >
          {e.name || String(e.tokenId).slice(0, 4)}
        </div>
      ))}
    </div>
  ); 
}