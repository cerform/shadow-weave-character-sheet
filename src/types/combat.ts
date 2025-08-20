// src/types/combat.ts
export type TokenID = string;

export interface CombatToken {
  id: string;
  name: string;
  pos: { x: number; y: number; z: number };
  hp: number;
  ac: number;
  speed: number;
}

export interface TurnEntry {
  tokenId: number;
  initiative: number;
  acted: boolean;
}

export interface AttackContext {
  attacker: string;
  target: string;
  mode: 'normal' | 'advantage' | 'disadvantage';
  weapon: {
    formula: string;
  };
}

export interface MoveContext {
  token: string;
  path: Array<{ x: number; y: number; z: number }>;
}