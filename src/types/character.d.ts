
export interface CharacterSpell {
  id?: number;
  name: string;
  level: number;
  description: string;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  prepared?: boolean;
}

export interface ClassFeature {
  name: string;
  description: string;
  level: number;
}

export interface ClassLevel {
  class: string;
  level: number;
  features?: ClassFeature[];
  subclass?: string;
}

// Интерфейс для очков чародея
export interface SorceryPoints {
  current: number;
  max: number;
}

// Обновляем интерфейс CharacterSheet для использования в useCharacterCreation и генераторе PDF
export interface CharacterSheet {
  userId?: string;
  id?: string;
  img?: string;
  name: string;
  class?: string;
  subclass?: string;
  classes?: ClassLevel[];
  level: number;
  race?: string;
  subrace?: string;
  background?: string;
  alignment?: string;
  experience?: number;
  abilities?: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  skills?: {
    [key: string]: {
      proficient: boolean;
      expertise: boolean;
      bonus?: number;
    }
  };
  savingThrows?: {
    [key: string]: boolean;
  };
  proficiencies?: {
    armor?: string[];
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  spells?: CharacterSpell[];
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
  };
  equipment?: string[];
  features?: string[];
  traits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
  backstory: string;
  xp?: number;
  inspiration?: boolean;
  maxHp?: number;  // Максимальные хиты
  currentHp?: number;  // Текущие хиты
  temporaryHp?: number; // Временные хиты
  hitDice?: {  // Кубики хитов
    total: number;  // Всего кубиков
    used: number;   // Использовано кубиков
    value: string;  // Тип кубика (например, "d8")
  };
  abilityPointsUsed?: number; // Отслеживание использованных очков характеристик
  abilityBonuses?: { // Бонусы к характеристикам
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
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
}

// Определяем доступные классы и их подклассы
