export interface CharacterSpell {
  id?: number;
  name: string;
  level: number;
  description?: string;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  prepared?: boolean;
  // Добавим недостающие поля для совместимости с существующим кодом
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  higherLevels?: string;
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  // Вместо прототипа, добавляем функцию как опциональное свойство
  toString?: () => string;
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

// Константы для ограничений значений характеристик
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,      // Базовый максимум (уровни 1-9)
  EPIC_CAP: 22,      // Эпический максимум (уровни 10-15)
  LEGENDARY_CAP: 24  // Легендарный максимум (уровни 16+)
} as const;

// Интерфейс для очков чародея
export interface SorceryPoints {
  current: number;
  max: number;
}

// Обновляем интерфейс MulticlassRequirements
export interface MulticlassRequirements {
  [key: string]: {
    [key: string]: number;
    description: string;
  }
}

// Обновляем, чтобы требования к мультиклассам были более конкретными
export interface ClassRequirement {
  abilities: {[key: string]: number};
  description: string;
}

export interface MulticlassRequirements {
  [key: string]: ClassRequirement;
}

// Обновляем интерфейс CharacterSheet для использования в useCharacterCreation и генераторе PDF
export interface CharacterSheet {
  userId?: string;
  id?: string;
  img?: string;
  name: string; // Обязательное поле
  class?: string;
  subclass?: string;
  classes?: ClassLevel[];
  additionalClasses?: ClassLevel[]; // Для мультиклассирования
  className?: string; // Для обратной совместимости
  level: number;
  race?: string;
  subrace?: string;
  background: string;  // Теперь обязательное поле
  alignment?: string;
  experience?: number;
  gender?: string; // Поле для гендера персонажа
  appearance?: string; // Описание внешности персонажа
  personalityTraits?: string; // Черты личности персонажа
  ideals?: string; // Изменено с string[] на string
  bonds?: string; // Изменено с string[] на string
  flaws?: string; // Изменено с string[] на string
  abilities?: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
    // Для обратной совместимости добавляем новые имена
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
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
  languages?: string[]; // Для обратной совместимости
  spells?: CharacterSpell[];
  spellcasting?: {
    ability?: string;
    saveDC?: number;
    attackBonus?: number;
  };
  equipment?: string[];
  features?: string[];
  traits?: string[];
  backstory: string;  // Теперь обязательное поле
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

// Расширяем интерфейс для Character в контексте персонажей
export interface Character {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string;
  subclass?: string;
  level: number;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  proficiencies: string[];
  equipment: string[];
  spells: CharacterSpell[] | string[]; // Разрешаем оба типа для обратной совместимости
  languages: string[];
  gender: string;
  alignment: string;
  background: string;
  backstory: string;  // Добавляем обязательное поле
  appearance?: string;  // Добавляем
  personalityTraits?: string;  // Добавляем
  ideals?: string;  // Добавляем
  bonds?: string;  // Добавляем
  flaws?: string;  // Добавляем
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
  skillProficiencies?: {[skillName: string]: boolean};
  savingThrowProficiencies?: {[ability: string]: boolean};
  image?: string;
}

// Обновляем интерфейс для событий изменения хит-поинтов
export interface HitPointEvent {
  id: string;
  // Обновляем типы для совместимости с компонентом DamageLog
  type: 'damage' | 'healing' | 'tempHP' | 'heal' | 'temp' | 'death-save';
  amount: number;
  source: string;
  timestamp: Date;
}

// Добавляем интерфейс ResourcePanelProps для улучшения типизации
export interface ResourcePanelProps {
  character: Character | null;
  onUpdate: (character: Partial<Character>) => void;
  isDM?: boolean;
}
