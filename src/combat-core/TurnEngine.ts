// src/combat-core/TurnEngine.ts
import type { TurnEntry } from '@/types/combat';

export function nextTurnIndex(order: TurnEntry[], idx: number) { 
  return order.length ? (idx + 1) % order.length : 0; 
}