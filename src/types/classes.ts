
export interface ClassData {
  name: string;
  hitDice: number;
  primaryAbility: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: string[];
  skillCount: number;
  spellcasting?: {
    ability: string;
    spellSlots?: Record<number | string, number[]>;
  };
  subclasses?: Record<string, SubclassData>;
  features?: Feature[]; // Добавляем поле features для более подробных описаний
  description?: string; // Добавляем отдельное поле для описания класса
  equipment?: string[]; // Добавляем поле для стартового снаряжения класса
}

export interface SubclassData {
  name: string;
  description: string;
  features: Feature[];
}

export interface Feature {
  name: string;
  level: number;
  description: string;
}

// Интерфейс для магических ресурсов (например, очков чародейства)
export interface MagicalResource {
  name: string;
  description: string;
  progression: number[];
}

// Добавляем дополнительные типы для классовых особенностей
export interface ClassFeature {
  name: string;
  level: number;
  description: string;
}

// Добавляем типы для расовых особенностей
export interface RacialFeature {
  name: string;
  description: string;
}

// Добавляем типы для особенностей предыстории
export interface BackgroundFeature {
  name: string;
  description: string;
}

// Расширение для умений/черт персонажа
export interface Feat {
  name: string;
  description: string;
  prerequisites?: string[];
}
