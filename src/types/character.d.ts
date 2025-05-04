export interface SorceryPoints {
  max: number;
  current: number;
}

export interface CharacterSheet {
  id?: string;
  userId?: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string;
  subclass?: string;
  level: number;
  abilities: AbilityScores;
  proficiencies: string[];
  equipment: string[];
  spells: string[];
  features?: string[];
  languages: string[];
  gender: string;
  alignment: string;
  background: string;
  backstory?: string;
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
  [key: string]: number; // Индексная сигнатура для доступа к свойствам по имени
}

export interface CharacterSpell {
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
  higherLevel?: string;
  classes?: string[] | string;
  prepared?: boolean;
  concentration?: boolean;
  ritual?: boolean;
  duration?: string;
  [key: string]: any;
}
