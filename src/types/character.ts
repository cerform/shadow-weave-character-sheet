
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
  hitDice?: {
    total: number;
    used: number;
    type?: string;
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
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: Record<string, boolean>;
  savingThrows?: Record<string, boolean>;
  proficiencies?: string[];
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
  appearance?: string;
  backstory?: string;
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
  spellSlots?: Record<number, {
    max: number;
    used: number;
    current?: number;
  }>;
  resources?: Record<string, {
    max: number;
    used: number;
    current?: number;
    recoveryType?: string;
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
  skillBonuses?: Record<string, number>;
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
    preparedSpellsLimit?: number;
  };
}
