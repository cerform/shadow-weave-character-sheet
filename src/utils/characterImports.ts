
// Re-export for easier imports across the project
import Character, { CharacterSpell, Feature, AbilityScores, Item, HitPointEvent } from '@/types/character';
import { ABILITY_SCORE_CAPS } from '@/types/constants';
import { calculateAbilityModifier } from './characterUtils';

// Use Character as CharacterSheet for backward compatibility
export type CharacterSheet = Character;

// Re-export other common character-related types
export { Character };
export type { CharacterSpell, Feature, AbilityScores, Item, HitPointEvent };
export { ABILITY_SCORE_CAPS, calculateAbilityModifier };

// Экспортируем константы REST_TYPES, SPELL_SOURCES, GAME_MECHANICS если они нужны
// export { REST_TYPES, SPELL_SOURCES, GAME_MECHANICS };
