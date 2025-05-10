
// Re-export for easier imports across the project
import type { Character, CharacterSpell, Feature, AbilityScores, Item } from '@/types/character';
import { ABILITY_SCORE_CAPS, REST_TYPES, SPELL_SOURCES, GAME_MECHANICS } from '@/types/constants';

// Use Character as CharacterSheet for backward compatibility
export type CharacterSheet = Character;

// Re-export other common character-related types
export { 
  Character, 
  CharacterSpell, 
  Feature,
  AbilityScores,
  Item,
  ABILITY_SCORE_CAPS,
  REST_TYPES,
  SPELL_SOURCES,
  GAME_MECHANICS
};
