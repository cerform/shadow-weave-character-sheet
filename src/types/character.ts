
import { CharacterSheet, SpellSlots, Proficiencies, AbilityScores } from './character.types';

export type { CharacterSheet, SpellSlots, Proficiencies, AbilityScores };

// Экспортируем константы для ограничений характеристик
export const ABILITY_SCORE_CAPS = {
  MIN: 3,
  MAX: 18
};

// Character interface
export interface Character {
  id: string;
  userId?: string;
  name: string;
  race: string;
  subrace?: string;
  className: string;
  class: string;
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
  spells?: string[];
  spellSlots?: SpellSlots;
  gender?: string;
  alignment?: string;
  background?: string;
  equipment?: any[];
  languages?: string[];
  proficiencies?: Proficiencies;
  features?: any[];
  maxHp?: number;
  currentHp?: number;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
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
  duration?: string;
  description?: string;
  classes?: string[] | string;
  prepared: boolean;
  concentration?: boolean;
  ritual?: boolean;
  higherLevels?: string;
  higherLevel?: string;
  [key: string]: any;
}

// Дополнительные типы, необходимые для работы с заклинаниями
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
  higherLevel?: string;
  classes?: string[] | string;
  prepared?: boolean;
  concentration?: boolean;
  ritual?: boolean;
  duration?: string;
  [key: string]: any;
}
