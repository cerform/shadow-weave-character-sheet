// src/types/monsters.ts
import type { AbilityScore, Abilities } from './dnd5e';

export type MonsterSize = 'Крошечный' | 'Маленький' | 'Средний' | 'Большой' | 'Огромный' | 'Гигантский';
export type MonsterType = 'Аберрация' | 'Зверь' | 'Небожитель' | 'Конструкт' | 'Дракон' | 'Элементаль' | 'Фея' | 'Исчадие' | 'Великан' | 'Гуманоид' | 'Нежить' | 'Растение' | 'Слизь' | 'Чудовище';
export type ChallengeRating = '0' | '1/8' | '1/4' | '1/2' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30';

export interface MonsterAction {
  name: string;
  description: string;
  attackBonus?: number;
  damage?: string;
  damageType?: string;
  savingThrow?: {
    ability: AbilityScore;
    dc: number;
  };
  recharge?: string; // например "5-6" для перезарядки на 5-6
}

export interface MonsterLegendaryAction {
  name: string;
  description: string;
  cost: number; // сколько очков действий тратит
}

export interface MonsterSenses {
  blindsight?: number;
  darkvision?: number;
  tremorsense?: number;
  truesight?: number;
  passivePerception: number;
}

export interface Monster {
  id: string;
  name: string;
  nameEn?: string; // английское название для поиска моделей
  size: MonsterSize;
  type: MonsterType;
  alignment: string;
  
  // Основные характеристики
  armorClass: number;
  hitPoints: number;
  hitDice: string; // например "8d8+16"
  speed: {
    walk?: number;
    fly?: number;
    swim?: number;
    climb?: number;
    burrow?: number;
  };
  
  // Характеристики
  abilities: Abilities;
  
  // Спасброски
  savingThrows?: Partial<Record<AbilityScore, number>>;
  
  // Навыки
  skills?: Record<string, number>;
  
  // Сопротивления и иммунитеты
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  
  // Чувства
  senses: MonsterSenses;
  
  // Языки
  languages: string[];
  
  // Уровень опасности
  challengeRating: ChallengeRating;
  experiencePoints: number;
  proficiencyBonus: number;
  
  // Особые способности
  traits?: MonsterAction[];
  
  // Действия
  actions: MonsterAction[];
  
  // Легендарные действия
  legendaryActions?: MonsterLegendaryAction[];
  legendaryActionsPerTurn?: number;
  
  // 3D модель и визуал
  modelUrl?: string;
  iconUrl?: string;
  tokenSize?: number; // размер токена на карте (1 = 1 клетка)
  
  // Метаданные
  source: string; // источник (Monster Manual, etc.)
  environment?: string[]; // среда обитания
  tags?: string[]; // теги для поиска
}

export interface MonsterFilter {
  size?: MonsterSize[];
  type?: MonsterType[];
  challengeRating?: {
    min: number;
    max: number;
  };
  environment?: string[];
  search?: string;
}

export interface MonsterEncounter {
  id: string;
  name: string;
  description?: string;
  monsters: {
    monsterId: string;
    count: number;
    position?: [number, number, number];
  }[];
  difficulty: 'Легкий' | 'Средний' | 'Сложный' | 'Смертельный';
  environment: string;
  notes?: string;
}