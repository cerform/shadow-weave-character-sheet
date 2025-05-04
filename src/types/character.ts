
// Добавляем базовые типы для персонажа
export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
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
}

// Определяем тип Character, реализующий CharacterSheet
export interface Character extends CharacterSheet {
  features?: string[]; // Добавляем поле features, которое может не существовать
  proficiencies: string[] | Proficiencies; // Поддержка обоих типов для совместимости
}

// Оставляем существующий тип CharacterSheet
export interface CharacterSheet {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  class: string;
  subclass?: string;
  level: number;
  background: string;
  alignment: string;
  experiencePoints: number;
  abilityScores: AbilityScores;
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
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  spells?: (string | CharacterSpell)[];
  equipment: string[];
  proficiencies: string[] | Proficiencies;
  features?: string[];
  traits: {
    personality: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
  backstory: string;
  appearance: {
    age: number;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
  };
  sorceryPoints?: SorceryPoints;
  spellSlots?: {
    [key: string]: {
      total: number;
      used: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// Тип для заклинания персонажа
export interface CharacterSpell extends SpellData {
  prepared: boolean; // Подготовлено ли заклинание
}
