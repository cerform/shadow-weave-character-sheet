
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
  equipment?: string[] | { weapons?: string[]; armor?: string; items?: string[] };
  features?: string[];
  spells?: any[];
  notes?: string;
  proficiencies?: string[];
  languages?: string[];
  gold?: number;
  backstory?: string;
  hitDice?: { total: number; used: number; dieType: string; value: string };
  deathSaves?: { successes: number; failures: number };
  resources?: { [key: string]: { total: number; used: number; name: string } };
  lastDiceRoll?: {
    diceType: string;
    count: number;
    modifier: number;
    rolls: number[];
    total: number;
    label: string;
    timestamp: string;
  };
  // Additional properties to support backward compatibility
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
  
  // Добавляем недостающие поля
  appearance?: string;
  sorceryPoints?: {
    max: number;
    current: number;
  };
  skillProficiencies?: {
    [skillName: string]: boolean;
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
  description?: string;
  classes?: string[] | string;
  source?: string;
  id?: string | number;
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

// Добавляем недостающий HitPointEvent для DamageLog
export interface HitPointEvent {
  id: string;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  amount: number;
  source?: string;
  timestamp: number | Date;
  previousHP?: number;
  newHP?: number;
}
