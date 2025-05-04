
export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
  // Добавляем полные имена для совместимости
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Proficiencies {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
}

export interface SorceryPoints {
  max: number;
  used: number;
  current?: number; // Для совместимости с интерфейсами
}

export interface CharacterSpell {
  id?: string | number;
  name: string;
  level: number;
  school: string;
  description: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialComponents?: string;
  prepared: boolean;
  ritual?: boolean;
  concentration?: boolean;
  classes?: string | string[]; // Для совместимости с компонентами
  higherLevels?: string; // Для совместимости с компонентами
  higherLevel?: string; // Альтернативное имя поля в некоторых местах
}

export interface HitPointEvent {
  type: 'damage' | 'heal' | 'temp' | 'healing' | 'tempHP' | 'death-save';
  value: number;
  timestamp: number;
  source?: string;
  id?: string;
  amount?: number; // Псевдоним для value, используемый в некоторых компонентах
}

export interface CharacterSheet {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string; // для совместимости
  subclass?: string;
  level: number;
  abilities: AbilityScores;
  stats?: {  // Добавлено для совместимости
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: { [key: string]: { proficient: boolean; expertise: boolean; bonus?: number } };
  savingThrows?: { [key: string]: boolean };
  proficiencies: string[] | Proficiencies;  // Оба формата для обратной совместимости
  proficiencyBonus?: number;
  equipment: string[];
  spells: string[] | CharacterSpell[];  // Оба формата для обратной совместимости
  languages: string[];
  gender: string;
  alignment: string;
  background: string;
  backstory: string;
  maxHp?: number;
  currentHp?: number;
  temporaryHp?: number;
  hitDice?: {
    total: number;
    used: number;
    value: string;
  };
  deathSaves?: {
    successes: number;
    failures: number;
  };
  spellSlots?: {
    [level: string]: {
      max: number;
      used: number;
    };
  };
  sorceryPoints?: SorceryPoints;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  skillProficiencies?: { [skillName: string]: boolean };
  savingThrowProficiencies?: { [ability: string]: boolean };
  features?: string[]; // Добавлено для использования в LevelBasedFeatures.tsx
  personalityTraits?: string; // Добавлено для информации о предыстории
  ideals?: string; // Добавлено для информации о предыстории
  bonds?: string; // Добавлено для информации о предыстории
  flaws?: string; // Добавлено для информации о предыстории
  abilityPointsUsed?: number; // Добавлено для создания персонажа
}

export interface ClassRequirement {
  abilities: { 
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  description: string;
}

// Типы для расовых особенностей и черт
export interface RacialTraits {
  race: string;
  abilityScoreIncrease: string | number; // Обновлено для поддержки строк и чисел
  abilityBonuses?: any; // Добавлено для поддержки данных в racial traits
  age: string;
  alignment: string;
  size: string;
  speed: string | number; // Обновлено для поддержки строк и чисел
  languages: string[];
  features: { name: string; description: string }[];
}

// Типы для особенностей классов
export interface ClassFeatures {
  name: string;
  hitDice: string;
  primaryAbility: string[] | string; // Обновлено для поддержки строк и массивов строк
  savingThrowProficiencies: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: string[];
  numberOfSkillChoices: number;
  features: { name: string; level: number; description: string }[];
  spellcasting?: {
    ability: string;
    cantripsKnown?: number[];
    spellsKnown?: number[];
    spellSlots?: { [level: string]: number[] };
  };
}

// Типы для предысторий
export interface Background {
  name: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: string[];
  equipment: string[];
  feature: {
    name: string;
    description: string;
  };
  suggestedCharacteristics?: {
    personalityTraits?: string[]; // Обновлено для соответствия использованию
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  };
  personalityTraits?: string[]; // Добавлено для соответствия использованию в файлах данных
  ideals?: string[]; // Добавлено для соответствия использованию в файлах данных
  bonds?: string[]; // Добавлено для соответствия использованию в файлах данных
  flaws?: string[]; // Добавлено для соответствия использованию в файлах данных
}

// Пределы значений характеристик
export const ABILITY_SCORE_CAPS = {
  MIN: 1,
  DEFAULT: 10, 
  MAX: 20,
  ABSOLUTE_MAX: 30,
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24
};
