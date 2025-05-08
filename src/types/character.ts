
import { CharacterSpell } from './spells';

export interface HitPointEvent {
  type: 'damage' | 'healing' | 'temp' | 'max';
  value: number;
  source?: string;
  timestamp: number;
}

// Добавляем константы для лимитов характеристик
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,        // Базовый максимум для характеристик
  EPIC_CAP: 22,        // Максимум для персонажей 10-15 уровня
  LEGENDARY_CAP: 24,   // Максимум для персонажей 16+ уровня
  ABSOLUTE_CAP: 30,    // Абсолютный максимум (только для особых случаев)
};

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

export interface Character {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  class: string;
  className?: string;
  subclass?: string;
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
  hitDice: { total: number; used: number; type: string; dieType?: string; };
  proficiencyBonus: number;
  proficiencies: string[] | {
    weapons?: string[];
    tools?: string[];
    languages?: string[];
  };
  skills: Record<string, boolean>;
  savingThrows: Record<string, boolean>;
  armorClass: number;
  initiative: number;
  speed: number;
  equipment: any[];
  features: string[] | {
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
  spells: (CharacterSpell | string)[];
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number; 
    wisdom: number;
    charisma: number;
    // Добавляем короткие названия для совместимости
    STR?: number;
    DEX?: number;
    CON?: number;
    INT?: number;
    WIS?: number;
    CHA?: number;
  };
  // Добавляем недостающие поля
  raceFeatures?: (string | { name: string; description: string; level: number; })[];
  classFeatures?: (string | { name: string; description: string; level: number; })[];
  backgroundFeatures?: (string | { name: string; description: string; level: number; })[];
  feats?: (string | { name: string; description: string; level: number; })[];
  expertise?: string[];
  skillBonuses?: Record<string, number>;
  appearance?: string;
  currency?: {
    cp?: number;
    sp?: number;
    gp?: number;
    pp?: number;
    ep?: number;
  };
  gold?: number;
  gender?: string;
  userId?: string;
  stats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  abilityPointsUsed?: number;
  spellcastingAbility?: string;
}
