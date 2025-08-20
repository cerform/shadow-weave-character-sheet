// src/systems/actions/ActionSystem.ts
import type { TokenID } from '@/types/combat';

type ActionKind = 'Move' | 'Attack' | 'Overwatch' | 'Dash' | 'Hide' | 'Ready' | 'EndTurn';

export interface ActionDef { 
  kind: ActionKind; 
  label: string; 
  requiresTarget?: boolean; 
}

export const ACTIONS: ActionDef[] = [
  { kind: 'Move', label: 'Move' },
  { kind: 'Attack', label: 'Attack', requiresTarget: true },
  { kind: 'Overwatch', label: 'Overwatch' },
  { kind: 'Dash', label: 'Dash' },
  { kind: 'Hide', label: 'Hide' },
  { kind: 'Ready', label: 'Ready' },
  { kind: 'EndTurn', label: 'End Turn' },
];

export interface SelectionState { 
  selected?: TokenID; 
  target?: TokenID; 
  action?: ActionKind; 
}