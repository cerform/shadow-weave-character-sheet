
// Re-export all the types from character.d.ts
import { Character, CharacterSpell, ABILITY_SCORE_CAPS } from './character.d';

export type { Character, CharacterSpell };
export { ABILITY_SCORE_CAPS };

// Adding this to the character.ts file if it doesn't already have these definitions
export interface Item {
  id?: string;
  name: string;
  quantity: number;
  type?: 'weapon' | 'armor' | 'misc' | string;
  description?: string;
  weight?: number;
  value?: number;
}

export interface Character {
  id: string;
  userId?: string;
  name: string;
  gender?: string;
  race: string;
  subrace?: string; // Добавляем поддержку подрасы
  class: string;
  subclass?: string;
  additionalClasses?: Array<{ class: string; level: number; subclass?: string }>;
  level: number;
  background?: string;
  alignment?: string;
  experience?: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHp: number;
  currentHp: number;
  tempHp?: number;
  temporaryHp?: number; // Добавляем для совместимости
  hitDice?: {
    total: number;
    used: number;
    type?: string;
    dieType?: string;
    value?: string;
  };
  abilities?: {
    STR?: number;
    DEX?: number;
    CON?: number;
    INT?: number;
    WIS?: number;
    CHA?: number;
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: Record<string, boolean>;
  savingThrows?: Record<string, boolean>;
  proficiencies?: {
    languages?: string[];
    tools?: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  };
  languages?: string[];
  equipment?: string[] | Item[] | { 
    weapons?: string[]; 
    armor?: string; 
    items?: string[];
  };
  spells?: any[];
  features?: any[];
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;
  notes?: string;
  appearance?: string;
  className?: string;
  inspiration?: boolean;
  proficiencyBonus?: number;
  ac?: number;
  initiative?: number;
  speed?: number;
  armorClass?: number;
  deathSaves?: {
    successes: number;
    failures: number;
  };
  spellSlots?: Record<number | string, {
    max: number;
    used: number;
    current?: number;
  }>;
  resources?: Record<string, {
    max: number;
    used: number;
    current?: number;
    recoveryType?: 'short' | 'short-rest' | 'long' | 'long-rest' | string;
  }>;
  sorceryPoints?: {
    max: number;
    used: number;
    current: number;
  };
  currency?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
  money?: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  skillBonuses?: Record<string, number>;
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
    preparedSpellsLimit?: number;
  };
  abilityPointsUsed?: number; // Добавляем для отслеживания использования очков
  hitPoints?: number; // Добавляем для совместимости
  lastDiceRoll?: {
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
}
