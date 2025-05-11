
// Re-export for easier imports across the project
import Character, { CharacterSpell, Feature, AbilityScores, Item, HitPointEvent } from '@/types/character';
import { ABILITY_SCORE_CAPS, REST_TYPES, SPELL_SOURCES, GAME_MECHANICS } from '@/types/constants';
import { calculateAbilityModifier } from './characterUtils';

// Use Character as CharacterSheet for backward compatibility
export type CharacterSheet = Character;

// Re-export other common character-related types
export { Character };
export type { CharacterSpell, Feature, AbilityScores, Item, HitPointEvent };
export { ABILITY_SCORE_CAPS, REST_TYPES, SPELL_SOURCES, GAME_MECHANICS, calculateAbilityModifier };
