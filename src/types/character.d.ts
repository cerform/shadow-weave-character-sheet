import { SpellData } from './spells';

// Consolidate character interfaces to avoid duplicate type errors
export interface Character {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  class?: string;
  className?: string;
  level: number;
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
    value?: string;
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  proficiencyBonus?: number;
  savingThrows?: {
    [key: string]: boolean;
  };
  savingThrowProficiencies?: {
    [ability: string]: boolean;
  };
  skills?: {
    [key: string]: boolean | number | { proficient: boolean; expertise: boolean; bonus?: number };
  };
  skillProficiencies?: {
    [skillName: string]: boolean;
  };
  proficiencies?: string[] | {
    armor?: string[];
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  languages?: string[];
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
    preparedSpellsLimit?: number;
  };
  spells?: (CharacterSpell | string)[];
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
  gender?: string;
  subrace?: string;
  abilityPointsUsed?: number;
  hitPoints?: {
    current: number;
    max: number;
    temporary: number;
  };
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  sorceryPoints?: SorceryPoints;
  playerName?: string;
}

// Forward the types for backward compatibility
export interface CharacterSheet extends Character {
  // Empty interface that extends Character for backward compatibility
}

export interface ClassLevel {
  class: string;
  subclass?: string;
  level: number;
}

export interface SorceryPoints {
  max: number;
  current: number;
}

export interface CharacterSpell {
  id?: number | string;
  name: string;
  level: number;
  description?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  school?: string;
  classes?: string[];
  subclasses?: string[];
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Short form aliases
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
}

// Added constants for ability score caps
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

// HitPointEvent for DamageLog
export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  amount: number;
  source?: string;
  timestamp: number | Date;
  previousHP?: number;
  newHP?: number;
}
