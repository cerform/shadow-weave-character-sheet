
// Расширяем интерфейс Character, добавляя недостающие свойства
export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string; // Альтернативная запись для имени класса
  level: number;
  background: string;
  alignment: string;
  experience: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp: number;
  maxHp: number;
  currentHp?: number; // Добавляем для совместимости
  temporaryHp: number;
  hitPoints?: { // Добавляем для совместимости
    current: number;
    maximum: number;
    temporary?: number;
  };
  hitDice: {
    total: number;
    used: number;
    type: string;
    dieType?: string;
  };
  proficiencyBonus?: number;
  proficiencies: string[] | {
    weapons?: string[];
    tools?: string[];
    languages?: string[];
    skills?: string[]; // Добавляем навыки в proficiencies
  };
  skills: {
    [key: string]: boolean | number | null | { 
      bonus?: number; 
      value?: number; 
      proficient?: boolean; // Добавляем флаг владения навыком
    };
  };
  savingThrows: {
    [key: string]: boolean;
  };
  savingThrowProficiencies?: string[];
  skillProficiencies?: string[];
  armorClass: number;
  initiative: number;
  speed: number;
  equipment: string[] | Item[] | {
    weapons?: string[] | Item[];
    armor?: string | Item;
    items?: string[] | Item[];
  };
  features: {
    race: string[];
    class: string[];
    background: string[];
  } | string[];
  description: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  spellcasting?: {
    ability: string;
    saveDC?: number;
    attackBonus?: number;
    class?: string;
  };
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spellSlots?: Record<string, { max: number; used: number; available?: number }>;
  spells?: (CharacterSpell | string)[];
  // Новые поля, которые отсутствовали
  conditions?: string[];
  inventory?: Item[];
  languages?: string[];
  portrait?: string;
  notes?: string;
  gold?: number;
  silver?: number;
  copper?: number;
  platinum?: number;
  electrum?: number;
  userId?: string; // Добавлено для CharacterReview.tsx
  // Добавляем поля для совместимости с компонентами создания персонажа
  abilities?: {
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
  };
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  gender?: string;
  subclass?: string;
  abilityPointsUsed?: number;
  lastDiceRoll?: DiceResult;
  // Добавляем новое поле resources для управления ресурсами персонажа
  resources?: Record<string, {
    max: number;
    used: number;
    shortRestRecover?: boolean;
    longRestRecover?: boolean;
    description?: string;
  }>;
  // Добавляем поле для очков колдовства для чародея
  sorceryPoints?: {
    max: number;
    current: number;
  };
}

// Определение CharacterSpell, чтобы убрать ошибки импорта
export interface CharacterSpell {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  prepared?: boolean;
  alwaysPrepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  classes?: string[] | string;
  source?: string;
}

// Определение типа Item для оборудования
export interface Item {
  id?: string;
  name: string;
  type?: string;
  quantity?: number;
  weight?: number;
  description?: string;
  cost?: number;
  equipped?: boolean;
  properties?: string[];
  damage?: string;
  armorClass?: number;
  strengthRequired?: number;
  stealthDisadvantage?: boolean;
}

// Определение типа DiceResult для результатов бросков
export interface DiceResult {
  formula: string;
  rolls: number[];
  total: number;
  diceType?: string;
  count?: number;
  modifier?: number;
  label?: string;
  timestamp?: string | number | Date;
}

// Добавляем константы для лимитов характеристик, используемые в CharacterLevelSelection и других компонентах
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,        // Базовый максимум для характеристик
  EPIC_CAP: 22,        // Максимум для персонажей 10-15 уровня
  LEGENDARY_CAP: 24,   // Максимум для персонажей 16+ уровня
  ABSOLUTE_CAP: 30,    // Абсолютный максимум (только для особых случаев)
};

// Добавляем экспорт для типов, которые используются в других файлах
export type { CharacterSpell, Item, DiceResult };
