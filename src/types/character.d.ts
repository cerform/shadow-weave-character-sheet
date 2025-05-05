
import { SpellData } from './spells';

export interface Character {
  id: string;
  userId?: string;
  name: string;
  race?: string;
  className?: string;
  level?: number;
  subclass?: string;
  background?: string;
  alignment?: string;
  experience?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  hitDice?: {
    total?: number;
    used?: number;
    dieType?: string;
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  proficiencyBonus?: number;
  savingThrows?: {
    [key: string]: boolean;
  };
  skills?: {
    [key: string]: boolean | number;
  };
  proficiencies?: string[];
  languages?: string[];
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
  };
  spells?: SpellData[];
  spellSlots?: {
    [key: number]: {
      max: number;
      used: number;
    };
  };
  equipment?: string[] | {
    weapons?: string[];
    armor?: string;
    items?: string[];
  };
  features?: string[];
  traits?: string[];
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  appearance?: string;
  backstory?: string;
  notes?: string;
  money?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
}

export interface CharacterSheet extends Character {
  class?: string;
  gender?: string;
  subrace?: string;
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
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  additionalClasses?: ClassLevel[];
}

export interface ClassLevel {
  class: string;
  level: number;
  subclass?: string;
}

export interface SorceryPoints {
  max: number;
  current: number;
}
