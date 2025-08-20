// src/combat-core/Initiative.ts
import type { CombatToken, TurnEntry } from '@/types/combat';
import { roll } from '@/utils/dice';

export function buildInitiative(tokens: CombatToken[]): TurnEntry[] { 
  return tokens.map(t => ({ 
    tokenId: parseInt(t.id), 
    initiative: roll('d20').total, 
    acted: false 
  })).sort((a,b) => b.initiative - a.initiative); 
}