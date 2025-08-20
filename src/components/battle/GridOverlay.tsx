// src/components/battle/GridOverlay.tsx
import React from 'react';
import { useCombatStore } from '@/stores/combatStore';

export default function GridOverlay() { 
  const cfg = useCombatStore(s => s.cfg); 
  return (
    <div 
      className="pointer-events-none fixed inset-0 opacity-40" 
      aria-label={`grid-${cfg.tileSize}`}
    />
  ); 
}