/**
 * Базовые правила D&D 5e для боевой системы
 * Константы размеров, правил обзора, очков действия
 */

// Размеры сетки и карты
export const GRID_CONFIG = {
  CELL_SIZE: 1, // 1 unit = 5 feet в D&D
  MAP_WIDTH: 24, // клетки
  MAP_HEIGHT: 24, // клетки
  WORLD_SIZE: 24, // размер мира в units
} as const;

// Правила движения
export const MOVEMENT_RULES = {
  BASE_SPEED: 6, // базовая скорость в клетках (30 feet)
  DIAGONAL_COST: 1.5, // стоимость диагонального движения
  DIFFICULT_TERRAIN_MULTIPLIER: 2,
} as const;

// Правила обзора (Line of Sight)
export const VISION_RULES = {
  DEFAULT_VISION_RANGE: 12, // клетки (60 feet)
  DARKVISION_RANGE: 12, // клетки (60 feet)
  BRIGHT_LIGHT_RANGE: 4, // клетки (20 feet)
  DIM_LIGHT_RANGE: 8, // клетки (40 feet)
} as const;

// Правила инициативы
export const INITIATIVE_RULES = {
  BASE_DICE: 20,
  TIE_BREAKER_STAT: 'dexterity',
} as const;

// Правила действий
export const ACTION_RULES = {
  ACTIONS_PER_TURN: 1,
  BONUS_ACTIONS_PER_TURN: 1,
  REACTIONS_PER_ROUND: 1,
  FREE_ACTIONS_UNLIMITED: true,
} as const;

// Размеры существ
export const CREATURE_SIZES = {
  Tiny: 0.5,
  Small: 1,
  Medium: 1,
  Large: 2,
  Huge: 3,
  Gargantuan: 4,
} as const;

export type CreatureSize = keyof typeof CREATURE_SIZES;

// Типы действий
export enum ActionType {
  Action = 'action',
  BonusAction = 'bonus_action',
  Reaction = 'reaction',
  Free = 'free',
  Movement = 'movement',
}

// Состояния существа
export enum Condition {
  Blinded = 'blinded',
  Charmed = 'charmed',
  Deafened = 'deafened',
  Frightened = 'frightened',
  Grappled = 'grappled',
  Incapacitated = 'incapacitated',
  Invisible = 'invisible',
  Paralyzed = 'paralyzed',
  Petrified = 'petrified',
  Poisoned = 'poisoned',
  Prone = 'prone',
  Restrained = 'restrained',
  Stunned = 'stunned',
  Unconscious = 'unconscious',
}

// Помощники для расчетов
export const calculateDistance = (
  pos1: [number, number, number],
  pos2: [number, number, number]
): number => {
  const dx = pos1[0] - pos2[0];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dz * dz);
};

export const isWithinRange = (
  pos1: [number, number, number],
  pos2: [number, number, number],
  range: number
): boolean => {
  return calculateDistance(pos1, pos2) <= range;
};

export const getProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};

export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};