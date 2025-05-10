
// Константы для максимальных значений характеристик
export const ABILITY_SCORE_CAPS = {
  BASE_CAP: 20,       // Базовый максимум для характеристик (1-10 уровень)
  EPIC_CAP: 22,       // Эпический максимум (10-15 уровень)
  LEGENDARY_CAP: 24,  // Легендарный максимум (16+ уровень)
  ABSOLUTE_CAP: 30    // Абсолютный максимум (боги и артефакты)
};

// Константы для типов отдыха
export const REST_TYPES = {
  SHORT: 'short',
  LONG: 'long',
  DAILY: 'daily',
  OTHER: 'other'
};

// Константы для источников заклинаний
export const SPELL_SOURCES = {
  CLASS: 'class',
  RACE: 'race',
  BACKGROUND: 'background',
  FEAT: 'feat',
  ITEM: 'item'
};

// Константы для игровой механики
export const GAME_MECHANICS = {
  ADVANTAGE: 'advantage',
  DISADVANTAGE: 'disadvantage',
  NORMAL: 'normal'
};
