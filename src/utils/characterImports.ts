
// Re-export for easier imports across the project
import type { Character, CharacterSpell, Item, Feature } from '@/types/character';

// Use Character as CharacterSheet for backward compatibility
export type CharacterSheet = Character;

// Re-export other common character-related types
export { Character, CharacterSpell, Item, Feature };
