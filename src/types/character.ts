
// Import necessary types
import { Feature } from './character';

// Define Character interface
export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  subclass?: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  abilities: AbilityScores;
  savingThrows: AbilityScores;
  skills: Record<string, { proficient: boolean; expertise: boolean; value: number }>;
  hp: number;
  maxHp: number;
  temporaryHp: number; 
  ac: number;
  proficiencyBonus: number;
  speed: number;
  initiative: number; 
  inspiration: boolean;
  hitDice: {
    total: number;
    used: number;
    dieType: string;
  };
  resources: Record<string, {
    max: number;
    used: number;
    name: string;
    recoveryType?: 'short-rest' | 'long-rest' | 'short' | 'long';
  }>;
  deathSaves: {
    successes: number;
    failures: number;
  };
  spellcasting?: {
    ability: string;
    dc: number;
    attack: number;
    preparedSpellsLimit?: number;
  };
  spellSlots?: Record<string, { max: number; used: number }>;
  sorceryPoints?: {
    max: number;
    current?: number;
    used?: number;
  }; 
  spells: (CharacterSpell | string)[];
  equipment: {
    weapons: string[];
    armor: string;
    items: string[];
    gold: number;
  };
  proficiencies: {
    languages: string[];
    tools: string[];
    weapons?: string[];
    armor?: string[];
    skills?: string[];
  };
  features: (Feature | string)[];
  notes?: string;
  lastDiceRoll?: {
    type: string;
    result: number | number[];
    modifier: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
    timestamp: number;
  };
  // Additional properties
  currentHp?: number;
  gender?: string;
  additionalClasses?: string[];
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  expertise?: string[];
  skillBonuses?: Record<string, number>;
  languages?: string[];
}

// Define Character Spell interface
export interface CharacterSpell {
  id?: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string | string[];
  classes?: string[] | string;
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
}

// Define Feature interface if it doesn't exist elsewhere
export interface Feature {
  id?: string;
  name: string;
  source?: string;
  description: string;
  level?: number;
  active?: boolean;
  uses?: {
    max: number;
    current: number;
    recharge: 'short' | 'long' | 'daily' | 'other';
  };
}

// Define AbilityScores interface if it doesn't exist elsewhere
export interface AbilityScores {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  [key: string]: number | undefined;
}

// Define Item interface for equipment
export interface Item {
  id?: string;
  name: string;
  type?: string;
  description?: string;
  weight?: number;
  cost?: number;
  equipped?: boolean;
  quantity?: number;
}
