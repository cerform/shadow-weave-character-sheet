
// Добавляем базовые типы для персонажа
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
  [key: string]: number | undefined; // Добавляем индексную сигнатуру для совместимости
}

export interface HitPoints {
  current: number;
  maximum: number; // Исправляем на maximum вместо max для совместимости
  temporary?: number;
}

export interface Proficiencies {
  weapons?: string[];
  armor?: string[];
  tools?: string[];
  languages?: string[];
  savingThrows?: string[];
  skills?: string[];
  [key: string]: string[] | undefined; // Индексная сигнатура для доступа по строковому ключу
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
  higherLevel?: string; // Альтернативное имя в некоторых структурах данных
  classes?: string[] | string;
  prepared?: boolean;
  concentration?: boolean;
  ritual?: boolean;
  duration?: string;
  [key: string]: any; // Индексная сигнатура для совместимости
}

export interface SorceryPoints {
  total: number;
  used: number;
  max?: number; // Добавляем для совместимости
  current?: number; // Добавляем для совместимости
}

// Определяем константы для ограничений характеристик
export const ABILITY_SCORE_CAPS = {
  MIN: 1,
  DEFAULT: 10, 
  MAX: 20,
  ABSOLUTE_MAX: 30,
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24,
  RACIAL_CAP: 17,
  ASI_CAP: 20,
  MAGIC_CAP: 30
};

// Оставляем существующий тип CharacterSheet
export interface CharacterSheet {
  id?: string;
  userId?: string;
  name: string;
  race?: string;
  subrace?: string;
  class?: string;
  className?: string; // Альтернативное название для class
  subclass?: string;
  level: number;
  background?: string;
  alignment?: string;
  experiencePoints?: number;
  experience?: number; // Альтернативное название 
  abilities?: AbilityScores; // Добавил ? для совместимости
  abilityScores?: AbilityScores; // Альтернативное название для abilities
  proficiencyBonus?: number;
  inspiration?: boolean;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  hitPoints?: HitPoints;
  maxHp?: number; // Добавляем для совместимости
  currentHp?: number; // Добавляем для совместимости
  temporaryHp?: number; // Добавляем для совместимости
  tempHp?: number; // Альтернативное название
  hitDice?: {
    total: number;
    current?: number;
    value?: string; // Добавляем для совместимости
    used?: number; // Добавляем для совместимости
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  spells?: (string | CharacterSpell)[];
  equipment?: string[] | Equipment[];
  proficiencies?: string[] | Proficiencies;
  features?: string[] | Feature[];
  traits?: {
    personality: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
  personalityTraits?: string[]; // Добавляем для совместимости
  ideals?: string[]; // Добавляем для совместимости
  bonds?: string[]; // Добавляем для совместимости
  flaws?: string[]; // Добавляем для совместимости
  backstory?: string;
  appearance?: {
    age: number;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
  };
  age?: number; // Для совместимости
  gender?: string; // Добавляем для совместимости
  languages?: string[]; // Добавляем для совместимости
  skillProficiencies?: {[skillName: string]: boolean}; // Добавляем для совместимости
  savingThrowProficiencies?: {[ability: string]: boolean}; // Добавляем для совместимости
  sorceryPoints?: SorceryPoints;
  spellSlots?: {
    [key: string]: {
      total?: number;
      used?: number;
      max?: number; // Добавляем для совместимости
      current?: number; // Для совместимости
    };
  };
  createdAt?: string;
  updatedAt?: string;
  image?: string; // Добавляем для совместимости
}

// Тип для заклинания персонажа
export interface CharacterSpell extends SpellData {
  id?: string | number;
  prepared: boolean; // Подготовлено ли заклинание
}

// Определяем тип Character, расширяющий CharacterSheet
export interface Character extends CharacterSheet {
  features: (string | Feature)[]; // Обновляем для совместимости
}

export interface ClassRequirement {
  abilityScore?: keyof AbilityScores;
  minValue?: number;
  abilityRequirements?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  description?: string;
}

export interface HitPointEvent {
  id?: string | number;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  value?: number;
  amount?: number;
  source?: string;
  timestamp: number;
}

// Экспортируем всё из character.d.ts
export * from '@/types/character.d';
