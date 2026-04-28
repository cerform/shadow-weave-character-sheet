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

export type CombatActionType = 
  | 'weapon_attack' 
  | 'spell_attack' 
  | 'saving_throw_spell' 
  | 'healing' 
  | 'condition_apply' 
  | 'condition_remove' 
  | 'manual_damage' 
  | 'manual_heal';

export interface CombatAction {
  actionId: string;
  sessionId: string;
  actorTokenId: string;
  targetTokenIds: string[];
  actionType: CombatActionType;
  sourceName: string; // The physical name of the weapon/spell used
  rollFormula?: string;
  damageFormula?: string;
  healingFormula?: string;
  damageType?: string;
  saveDC?: number;
  saveAbility?: string;
  spellSlotLevel?: number;
  timestamp: string;
  createdBy: string; // userID of who initiated it
}

export interface CombatResult {
  targetTokenId: string;
  isHit?: boolean;
  isCritical?: boolean;
  savePassed?: boolean;
  damageApplied: number;
  healingApplied: number;
  tempHpReduced: number;
  hpReduced: number;
  isDefeated: boolean;
}