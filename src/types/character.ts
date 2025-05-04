
import { CharacterSheet, SpellSlots, Proficiencies, AbilityScores } from './character.types';

export type { CharacterSheet, SpellSlots, Proficiencies, AbilityScores };

// Экспортируем константы для ограничений характеристик
export const ABILITY_SCORE_CAPS = {
  DEFAULT: 10,
  MIN: 3,
  MAX: 18,
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24,
  RACIAL_CAP: 17,
  ASI_CAP: 20,
  MAGIC_CAP: 30,
  ABSOLUTE_MAX: 30
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
  spells?: string[];
  spellSlots?: SpellSlots;
  hitPoints?: {
    current: number;
    maximum: number;
    temporary?: number;
  };
  hitDice?: {
    total: number;
    current?: number;
    value?: string;
    used?: number;
  };
  temporaryHp?: number;
  gender?: string;
  alignment?: string;
  background?: string;
  equipment?: Equipment[];
  languages?: string[];
  proficiencies?: Proficiencies;
  features?: Feature[];
  maxHp?: number;
  currentHp?: number;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}

export interface Equipment {
  name: string;
  quantity: number;
  weight?: number;
  value?: number;
  description?: string;
  equipped?: boolean;
  toString?: () => string;
}

export interface Feature {
  name: string;
  source: string;
  description: string;
  level?: number;
  toString?: () => string;
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

export interface HitPointEvent {
  id?: string | number;
  type: 'damage' | 'healing' | 'temp' | 'heal' | 'tempHP' | 'death-save';
  value?: number;
  amount?: number;
  source?: string;
  timestamp: number;
}
