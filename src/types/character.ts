export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  experience: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHp: number;
  currentHp: number;
  temporaryHp?: number;
  armorClass?: number;
  initiative?: string | number;
  speed?: string | number;
  inspiration?: boolean;
  proficiencyBonus?: number;
  skills?: { [key: string]: number | boolean | { proficient: boolean; expertise: boolean; bonus?: number } };
  savingThrows?: { [key: string]: boolean };
  equipment?: string[] | { weapons?: string[]; armor?: string; items?: string[]; };
  features?: string[];
  spells?: any[];
  notes?: string;
  proficiencies?: string[] | {
    armor?: string[];
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  languages?: string[];
  gold?: number;
  backstory?: string;
  hitDice?: { total: number; used: number; dieType: string; value: string };
  deathSaves?: { successes: number; failures: number };
  resources?: { [key: string]: { total: number; used: number; name: string; recoveryType?: string } };
  lastDiceRoll?: {
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
  // Additional properties
  gender?: string;
  className?: string;
  subclass?: string;
  userId?: string;
  stats?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
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
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
    preparedSpellsLimit?: number;
  };
  spellSlots?: {
    [key: number]: {
      max: number;
      used: number;
    };
  };
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  abilityPointsUsed?: number;
  additionalClasses?: ClassLevel[];
  appearance?: string;
  sorceryPoints?: {
    max: number;
    current: number;
  };
  skillProficiencies?: string[];
  expertise?: string[];
  skillBonuses?: { [key: string]: number };
  savingThrowProficiencies?: string[];
  feats?: {
    name: string;
    description: string;
  }[];
  classFeatures?: {
    name: string;
    description: string;
  }[];
  raceFeatures?: {
    name: string;
    description: string;
  }[];
  backgroundFeatures?: {
    name: string;
    description: string;
  }[];
  currency?: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
}

export interface CharacterSpell {
  name: string;
  level: number;
  prepared?: boolean;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  school?: string;
  description?: string | string[]; // Updating to match .d.ts file
  classes?: string[] | string;
  source?: string;
  id?: string | number;
  // Additional properties needed for spells
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  ritual?: boolean;
  concentration?: boolean;
  higherLevel?: string;
  higherLevels?: string;
}

export interface ClassLevel {
  class: string;
  subclass?: string;
  level: number;
}

// Define ability score caps to be used in character creation
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};

// Add HitPointEvent for DamageLog
export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  amount: number;
  source?: string;
  timestamp: number | Date;
  previousHP?: number;
  newHP?: number;
}

// Add LevelFeature interface for useLevelFeatures hook
export interface LevelFeature {
  id: string;
  level: number;
  name: string;
  description: string;
  type: string;
  class?: string;
  required?: boolean;
}
