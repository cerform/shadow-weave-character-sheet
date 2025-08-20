// src/components/battle/ActionBar.tsx
import React from 'react';
import { ACTIONS } from '@/systems/actions/ActionSystem';

export default function ActionBar() { 
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
      {ACTIONS.map(a => (
        <button 
          key={a.kind} 
          className="px-3 py-2 rounded-2xl shadow bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
        >
          {a.label}
        </button>
      ))}
    </div>
  ); 
}