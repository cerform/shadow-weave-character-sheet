
// Re-export all the types from character.d.ts
import { Character, CharacterSpell, ABILITY_SCORE_CAPS, HitPointEvent } from './character.d';

export type { Character, CharacterSpell, HitPointEvent };
export { ABILITY_SCORE_CAPS };

// Adding this to the character.ts file if it doesn't already have these definitions
export interface Item {
  id?: string;
  name: string;
  quantity: number;
  type?: 'weapon' | 'armor' | 'misc' | string;
  description?: string;
  weight?: number;
  value?: number;
}
