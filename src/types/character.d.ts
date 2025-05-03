export interface CharacterSpell {
  id?: number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels?: string;
  concentration?: boolean;
  ritual?: boolean;
  classes?: string[];
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
}

// Обновляем интерфейс для поддержки мультиклассирования
export interface ClassLevel {
  class: string;
  level: number;
  subclass?: string;
}

// Обновляем интерфейс CharacterSheet для использования в useCharacterCreation и генераторе PDF
export interface CharacterSheet {
  userId?: string; 
  id?: string; 
  name: string;
  gender: string; 
  race: string;
  subrace?: string; 
  class: string; // Основной класс
  subclass?: string; // Основной подкласс
  additionalClasses?: ClassLevel[]; // Дополнительные классы для мультиклассирования
  level: number;
  background: string;
  alignment: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  stats?: {  // Поле stats для совместимости
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  languages: string[];
  equipment: string[];
  spells: string[];
  proficiencies: string[];
  features: string[];
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  appearance: string;
  backstory: string;
  xp?: number;
  inspiration?: boolean;
  maxHp?: number;  // Добавляем максимальные хиты
  currentHp?: number;  // Добавляем текущие хиты
  abilityPointsUsed?: number; // Добавляем отслеживание использованных очков характеристик
  abilityBonuses?: { // Добавляем бонусы к характеристикам
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

// Интерфейс для подклассов персонажей
export interface CharacterSubclass {
  name: string;
  className: string;
  description: string;
  features: {
    level: number;
    name: string;
    description: string;
  }[];
}

// Определяем доступные классы и их подклассы
export interface CharacterClassData {
  name: string;
  description: string;
  hitDie: string;
  primaryAbility: string;
  savingThrows: string;
  proficiencies: string;
  subclasses: CharacterSubclass[];
  features: {
    level: number;
    name: string;
    description: string;
  }[];
}

// Тип для выбора метода распределения характеристик
export type AbilityScoreMethod = "pointbuy" | "standard" | "roll" | "manual";

// Интерфейс для расовых черт и бонусов
export interface RaceTraits {
  name: string;
  description: string;
}

// Интерфейс для рас
export interface CharacterRace {
  name: string;
  description: string;
  abilityScoreIncrease: {
    [key: string]: number;  // "strength": 2, "dexterity": 1, etc.
  };
  age: string;
  alignment: string;
  size: string;
  speed: number;
  languages: string[];
  traits: RaceTraits[];
  subraces?: {
    name: string;
    description: string;
    abilityScoreIncrease: {
      [key: string]: number;
    };
    traits: RaceTraits[];
  }[];
}

// Минимальные требования для мультиклассирования
export interface MulticlassRequirements {
  [className: string]: {
    [ability: string]: number;  // Например, { "strength": 13, "charisma": 13 }
  };
}

// Константы для ограничений характеристик в зависимости от уровня
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,       // Базовое максимальное значение характеристики
  EPIC_CAP: 22,       // Для персонажей 10+ уровня
  LEGENDARY_CAP: 24,  // Для персонажей 16+ уровня
  MYTHIC_CAP: 30      // Абсолютный максимум (для особых случаев)
};
