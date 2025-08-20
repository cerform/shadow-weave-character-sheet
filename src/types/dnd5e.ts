// src/types/dnd5e.ts
export type AbilityScore = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export interface Abilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  hitPoints: number;
  maxHitPoints: number;
  armorClass: number;
  speed: number;
  abilities: Abilities;
  proficiencyBonus: number;
  savingThrows: Partial<Record<AbilityScore, number>>;
  skills: Record<string, number>;
  conditions: Condition[];
  position: { x: number; y: number; z: number };
  initiative?: number;
  resources: {
    actionUsed: boolean;
    bonusActionUsed: boolean;
    reactionUsed: boolean;
    movement: number;
    spellSlots: Record<number, { used: number; max: number }>;
  };
}

export interface Weapon {
  name: string;
  damage: string;
  damageType: DamageType;
  properties: WeaponProperty[];
  range?: { normal: number; long?: number };
  attackBonus: number;
}

export type WeaponProperty = 'light' | 'finesse' | 'thrown' | 'two-handed' | 'versatile' | 'heavy' | 'reach' | 'loading' | 'ammunition';

export type DamageType = 'bludgeoning' | 'piercing' | 'slashing' | 'acid' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'poison' | 'psychic' | 'radiant' | 'thunder';

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  damage?: string;
  savingThrow?: AbilityScore;
  attackRoll?: boolean;
}

export interface Condition {
  name: string;
  description: string;
  duration: number; // in rounds, -1 for permanent
}

export type ActionType = 'action' | 'bonus-action' | 'reaction' | 'free';

export interface CombatAction {
  id: string;
  name: string;
  type: ActionType;
  description: string;
  execute: (character: Character, target?: Character) => CombatResult;
}

export interface CombatResult {
  success: boolean;
  damage?: number;
  healing?: number;
  effects?: string[];
  description: string;
}

export interface TurnOrder {
  characterId: string;
  initiative: number;
  hasActed: boolean;
}

export interface CombatState {
  isActive: boolean;
  round: number;
  turnOrder: TurnOrder[];
  currentTurnIndex: number;
  characters: Character[];
}