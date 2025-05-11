
// Re-export types
export type { Character, CharacterSpell } from '@/types/character';
export type { SpellData } from '@/types/spells';
export type { Skill } from '@/types/constants';
// Add CharacterSheet type alias for backward compatibility
export type CharacterSheet = Character;

// Re-export utility functions
export { convertToCharacter } from './characterUtils';
export { calculateSpellSaveDC, calculateSpellAttackBonus } from './spellUtils';
export { getModifierString } from './characterUtils';
