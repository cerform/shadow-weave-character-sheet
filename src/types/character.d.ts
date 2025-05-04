
// Use proper export syntax without declare module
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
  spells?: (string | CharacterSpell)[];
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
  savingThrows?: SaveProficiencies;
  skills?: SkillProficiencies;
  passivePerception?: number;
  languages?: string[];
  conditions?: string[];
  resources?: Resource[];
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
  spellsKnown?: number; // для колдунов и чародеев
  // Для отслеживания мультиклассирования
  classes?: { class: string, level: number }[];
  // Очки колдовства для чародеев
  sorceryPoints?: SorceryPoints;
  // Дополнительные поля, которые могут пригодиться
  createdAt?: string;
  updatedAt?: string;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  STR?: number;
  DEX?: number;
  CON?: number;
  INT?: number;
  WIS?: number;
  CHA?: number;
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

export interface CharacterSpell {
  id?: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  duration?: string;
  description?: string;
  classes?: string[] | string;
  prepared: boolean;
  concentration?: boolean;
  ritual?: boolean;
  higherLevels?: string;
  higherLevel?: string;
  [key: string]: any;
}

export interface SpellData {
  id?: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
  description?: string;
  higherLevels?: string;
  higherLevel?: string;
  classes?: string[] | string;
  prepared?: boolean;
  concentration?: boolean;
  ritual?: boolean;
  duration?: string;
  [key: string]: any;
}

export interface SaveProficiencies {
  strength?: boolean;
  dexterity?: boolean;
  constitution?: boolean;
  intelligence?: boolean;
  wisdom?: boolean;
  charisma?: boolean;
}

export interface SkillProficiencies {
  acrobatics?: boolean;
  animalHandling?: boolean;
  arcana?: boolean;
  athletics?: boolean;
  deception?: boolean;
  history?: boolean;
  insight?: boolean;
  intimidation?: boolean;
  investigation?: boolean;
  medicine?: boolean;
  nature?: boolean;
  perception?: boolean;
  performance?: boolean;
  persuasion?: boolean;
  religion?: boolean;
  sleightOfHand?: boolean;
  stealth?: boolean;
  survival?: boolean;
}

export interface Resource {
  name: string;
  max: number;
  current: number;
  shortRest?: boolean;
  longRest?: boolean;
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
  [key: string]: { max: number; current: number };
}

export interface SorceryPoints {
  total: number;
  used: number;
  max?: number;
  current?: number;
}

export interface Character extends CharacterSheet {
  features: (Feature | string)[];
}

export interface ClassRequirement {
  abilityRequirements?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  abilityScore?: keyof AbilityScores;
  minValue?: number;
  description?: string;
}

export interface Background {
  name: string;
  description: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: string[];
  equipment: string[];
  feature: {
    name: string;
    description: string;
  };
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
  suggestedCharacteristics?: string;
}

export interface ClassFeatures {
  [level: string]: {
    features: { name: string; description: string; }[];
    spellsKnown?: number;
    cantripsKnown?: number;
    spellSlots?: {
      1?: number;
      2?: number;
      3?: number;
      4?: number;
      5?: number;
      6?: number;
      7?: number;
      8?: number;
      9?: number;
    };
  };
}

export interface HitPointEvent {
  id?: string | number;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  value?: number;
  amount?: number;
  source?: string;
  timestamp: number;
}

export interface RacialTraits {
  race: string;
  abilityBonuses: {
    [key: string]: number;
  };
  traits: string[];
  languages: string[];
  speed: number;
  size: string;
  subRaces?: {
    name: string;
    abilityBonuses: {
      [key: string]: number;
    };
    traits: string[];
    [key: string]: any;
  }[];
  specialAbilities?: {
    name: string;
    description: string;
  }[];
  [key: string]: any;
}

export const ABILITY_SCORE_CAPS = {
  DEFAULT: 10,
  BASE_CAP: 20,
  RACIAL_CAP: 17,
  ASI_CAP: 20,
  MAGIC_CAP: 30,
  MIN: 1,
  MAX: 20,
  ABSOLUTE_MAX: 30,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24,
};
