// src/components/battle/EventLog.tsx
import React, { useEffect, useState } from 'react';
import { useCombatStore } from '@/stores/combatStore';

export default function EventLog() { 
  const combatLog = useCombatStore(s => s.combatLog);
  const [lines, setLines] = useState<string[]>([]); 
  
  useEffect(() => {
    // Convert combat log to display lines
    const logLines = combatLog.flatMap(log => 
      log.actions.map(action => 
        `R${log.round}T${log.turn}: ${action.actor} ${action.type}${action.target ? ` → ${action.target}` : ''}`
      )
    );
    setLines(logLines);
  }, [combatLog]); 
  
  return (
    <div className="fixed right-2 bottom-2 w-64 max-h-64 overflow-auto bg-black/60 text-white p-2 rounded-xl text-sm">
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  ); 
}