
import type { Character, CharacterSpell, CharacterFeature, DiceResult, HitPointEvent, Item } from '@/types/character';

// Реэкспортируем типы для удобного импорта
export type { Character, CharacterSpell, CharacterFeature, DiceResult, HitPointEvent, Item };

// Алиасы для обратной совместимости со старым кодом
export type CharacterSheet = Character;
export type SpellData = CharacterSpell;

// Дополнительные константы и утилиты
export const DEFAULT_PROFICIENCY_BONUS = 2;
export const DEFAULT_ABILITY_SCORE = 10;

/**
 * Проверяет, имеет ли персонаж спеллкастинг
 */
export function hasSpellcasting(character?: Character): boolean {
  if (!character) return false;
  
  const spellcastingClasses = [
    'бард', 'жрец', 'друид', 'паладин', 'следопыт', 'чародей', 'колдун', 'волшебник', 
    'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'
  ];
  
  return spellcastingClasses.includes((character.class || '').toLowerCase());
}

