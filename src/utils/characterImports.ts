
// Re-export types
import { Character, CharacterSpell } from '@/types/character';
export type { Character, CharacterSpell } from '@/types/character';
export type { SpellData } from '@/types/spells';
export type { Skill } from '@/types/constants';
// Add CharacterSheet type alias for backward compatibility
export type CharacterSheet = Character;

// Re-export utility functions
export { convertToCharacter, getModifier, getModifierString, getNumericModifier, getAbilityModifier, getModifierFromAbilityScore, calculateAbilityModifier, calculateInitiative, calculateArmorClass, calculateMaxHP } from './characterUtils';
export { calculateSpellSaveDC, calculateSpellAttackBonus } from './spellUtils';
