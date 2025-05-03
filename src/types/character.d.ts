
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

// Обновляем интерфейс CharacterSheet для использования в useCharacterCreation и генераторе PDF
export interface CharacterSheet {
  userId?: string; 
  id?: string; 
  name: string;
  gender: string; 
  race: string;
  subrace?: string; 
  class: string;
  subclass?: string;
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
