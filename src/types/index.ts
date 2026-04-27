/**
 * Central type barrel for Shadow Weave Character Sheet.
 *
 * Import shared types from here instead of individual type files:
 *   import { Character, CharacterSpell, Session } from '@/types';
 */

// ── Character (canonical) ──────────────────────────────────────────────────
export type {
  Character,
  CharacterSpell,
  Item,
  Feature,
  PlayerCharacter,
  HitPointEvent,
  LevelFeature,
} from './character';
export { ABILITY_SCORE_CAPS } from './character';

// ── Session ────────────────────────────────────────────────────────────────
export type {
  Session,
  SessionUser,
  User,            // legacy alias
  CharacterStorage,
} from './session';

// ── Spells ─────────────────────────────────────────────────────────────────
export type { SpellData } from './spells';
export {
  convertCharacterSpellToSpellData,
  convertSpellDataToCharacterSpell,
  convertSpellArray,
  createEmptySpell,
} from './spells';

// ── Auth ───────────────────────────────────────────────────────────────────
export type * from './auth';

// ── D&D 5e primitives (combat engine — keep separate to avoid circular deps) ─
// Do NOT re-export dnd5e.Character here — it is scoped to the combat engine.
export type {
  AbilityScore,
  Abilities,
  Weapon,
  WeaponProperty,
  DamageType,
  Spell,
  Condition,
  ActionType,
  CombatAction,
  CombatResult,
  TurnOrder,
  CombatState,
} from './dnd5e';
