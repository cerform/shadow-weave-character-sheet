
// Добавляем базовые типы для персонажа
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
  [key: string]: number; // Добавляем индексную сигнатуру для совместимости
}

export interface Proficiencies {
  weapons: string[];
  armor: string[];
  tools: string[];
  languages: string[];
  savingThrows: string[];
  skills: string[];
  [key: string]: string[] | undefined; // Индексная сигнатура для доступа по строковому ключу
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
  LEGENDARY_CAP: 24
};

// Оставляем существующий тип CharacterSheet
export interface CharacterSheet {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string; // Альтернативное название для class
  subclass?: string;
  level: number;
  background: string;
  alignment: string;
  experiencePoints: number;
  abilities?: AbilityScores; // Добавил ? для совместимости
  abilityScores?: AbilityScores; // Альтернативное название для abilities
  proficiencyBonus: number;
  inspiration: boolean;
  armorClass: number;
  initiative: number;
  speed: number;
  hitPoints: {
    current: number;
    maximum: number;
    temporary: number;
  };
  hitDice: {
    total: number;
    current: number;
    value?: string; // Добавляем для совместимости
    used?: number; // Добавляем для совместимости
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  spells?: (string | CharacterSpell)[];
  equipment: string[];
  proficiencies: string[] | Proficiencies;
  features?: string[];
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
  backstory: string;
  appearance: {
    age: number;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
  };
  gender?: string; // Добавляем для совместимости
  languages?: string[]; // Добавляем для совместимости
  maxHp?: number; // Добавляем для совместимости
  currentHp?: number; // Добавляем для совместимости
  temporaryHp?: number; // Добавляем для совместимости
  skillProficiencies?: {[skillName: string]: boolean}; // Добавляем для совместимости
  savingThrowProficiencies?: {[ability: string]: boolean}; // Добавляем для совместимости
  sorceryPoints?: SorceryPoints;
  spellSlots?: {
    [key: string]: {
      total?: number;
      used?: number;
      max?: number; // Добавляем для совместимости
    };
  };
  createdAt?: string;
  updatedAt?: string;
  image?: string; // Добавляем для совместимости
}

// Тип для заклинания персонажа
export interface CharacterSpell extends SpellData {
  prepared: boolean; // Подготовлено ли заклинание
}

// Определяем тип Character, реализующий CharacterSheet
export interface Character extends CharacterSheet {
  features: string[]; // Обязательное поле features
}

export interface ClassRequirement {
  abilityScore: keyof AbilityScores;
  minValue: number;
}
