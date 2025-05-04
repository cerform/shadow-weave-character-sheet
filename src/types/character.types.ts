
// Shared types for character data
export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
  [key: string]: number | undefined;
}

export interface HitPoints {
  current: number;
  maximum: number;
  temporary?: number;
}

export interface Proficiencies {
  weapons?: string[];
  armor?: string[];
  tools?: string[];
  languages?: string[];
  savingThrows?: string[];
  skills?: string[];
  [key: string]: string[] | undefined;
}

export interface SpellSlots {
  1: { max: number; current: number };
  2: { max: number; current: number };
  3: { max: number; current: number };
  4: { max: number; current: number };
  5: { max: number; current: number };
  6: { max: number; current: number };
  7: { max: number; current: number };
  8: { max: number; current: number };
  9: { max: number; current: number };
  [key: number]: { max: number; current: number };
  [key: string]: { max: number; current: number };
}

export interface Equipment {
  name: string;
  quantity: number;
  weight?: number;
  value?: number;
  description?: string;
  equipped?: boolean;
  toString?: () => string;
}

export interface Feature {
  name: string;
  source: string;
  description: string;
  level?: number;
  toString?: () => string;
}

// Complete character sheet data structure
export interface CharacterSheet {
  id?: string;
  name: string;
  level: number;
  race?: string;
  subrace?: string;
  class?: string;
  className?: string;
  subclass?: string;
  background?: string;
  alignment?: string;
  abilities?: AbilityScores;
  hitPoints?: {
    current: number;
    maximum: number;
    temporary?: number;
  };
  hitDice?: {
    total: number;
    current?: number;
    value?: string;
    used?: number;
  };
  proficiencies?: Proficiencies;
  equipment?: Equipment[];
  features?: (Feature | string)[];
  spells?: (string | any)[];
  personalityTraits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  backstory?: string;
  userId?: string;
  // Дополнительные поля
  experience?: number;
  experiencePoints?: number;
  proficiencyBonus?: number;
  inspiration?: boolean;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  tempHp?: number;
  deathSaves?: {
    successes: number;
    failures: number;
  };
  savingThrows?: any;
  skills?: any;
  passivePerception?: number;
  languages?: string[];
  conditions?: string[];
  resources?: any[];
  notes?: string;
  coins?: {
    copper?: number;
    silver?: number;
    electrum?: number;
    gold?: number;
    platinum?: number;
  };
  // Дополнительные данные для рас
  size?: string;
  gender?: string;
  age?: number;
  // Внешний вид
  appearance?: {
    age: number;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
  };
  // Характеристики для заклинателей
  spellcastingAbility?: 'intelligence' | 'wisdom' | 'charisma';
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spellSlots?: SpellSlots;
  spellsKnown?: number;
  // Для отслеживания мультиклассирования
  classes?: { class: string, level: number }[];
  // Очки колдовства для чародеев
  sorceryPoints?: any;
  // Дополнительные поля, которые могут пригодиться
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}
