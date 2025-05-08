
// Расширяем интерфейс Character, добавляя недостающие свойства
export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
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
  temporaryHp: number;
  hitDice: {
    total: number;
    used: number;
    type: string;
  };
  proficiencies: string[];
  skills: {
    [key: string]: boolean;
  };
  savingThrows: {
    [key: string]: boolean;
  };
  armorClass: number;
  initiative: number;
  speed: number;
  equipment: string[];
  features: {
    race: string[];
    class: string[];
    background: string[];
  };
  description: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spellSlots?: Record<string, { max: number; used: number; available?: number }>;
  spells?: CharacterSpell[];
  // Новые поля, которые отсутствовали
  conditions?: string[];
  inventory?: any[];
  languages?: string[];
  portrait?: string;
  notes?: string;
  gold?: number;
  silver?: number;
  copper?: number;
  platinum?: number;
  electrum?: number;
  // Добавляем поля для совместимости с компонентами создания персонажа
  abilities?: {
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
  description: string;
  prepared?: boolean;
  alwaysPrepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  classes?: string[];
  source?: string;
}

// Добавляем константы для лимитов характеристик, используемые в CharacterLevelSelection и других компонентах
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,        // Базовый максимум для характеристик
  EPIC_CAP: 22,        // Максимум для персонажей 10-15 уровня
  LEGENDARY_CAP: 24,   // Максимум для персонажей 16+ уровня
  ABSOLUTE_CAP: 30,    // Абсолютный максимум (только для особых случаев)
};
