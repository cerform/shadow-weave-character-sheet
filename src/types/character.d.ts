/**
 * @deprecated This file is a compatibility shim.
 *
 * All types have been consolidated into `src/types/character.ts`.
 * Update your imports to use:
 *   import { Character, CharacterSpell, Item, Feature } from '@/types/character';
 *
 * This file will be removed in Phase 9 cleanup.
 */
export type {
  Character,
  CharacterSpell,
  Item,
  Feature,
  PlayerCharacter,
  HitPointEvent,
  LevelFeature,
} from '@/types/character';

export { ABILITY_SCORE_CAPS } from '@/types/character';
