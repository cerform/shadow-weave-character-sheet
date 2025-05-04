
// Импортируем всё из character.d.ts
import {
  CharacterSheet,
  AbilityScores,
  HitPoints,
  Proficiencies,
  Equipment,
  Feature,
  SpellData,
  CharacterSpell,
  SaveProficiencies,
  SkillProficiencies,
  Resource,
  SpellSlots,
  SorceryPoints,
  Character,
  ClassRequirement,
  HitPointEvent,
  ClassFeatures,
  Background,
  RacialTraits,
  ABILITY_SCORE_CAPS
} from './character.d';

// Реэкспортируем всё
export {
  CharacterSheet,
  AbilityScores,
  HitPoints,
  Proficiencies,
  Equipment,
  Feature,
  SpellData,
  CharacterSpell,
  SaveProficiencies,
  SkillProficiencies,
  Resource,
  SpellSlots,
  SorceryPoints,
  Character,
  ClassRequirement,
  HitPointEvent,
  ClassFeatures,
  Background,
  RacialTraits,
  ABILITY_SCORE_CAPS
};

// Определение констант для ограничений характеристик (уже есть в character.d.ts, но оставим для совместимости)
export const ABILITY_SCORE_CAPS_CONSTANTS = {
  MIN: 1,
  DEFAULT: 10, 
  MAX: 20,
  ABSOLUTE_MAX: 30,
  BASE_CAP: 20,
  EPIC_CAP: 22,
  LEGENDARY_CAP: 24,
  RACIAL_CAP: 17,
  ASI_CAP: 20,
  MAGIC_CAP: 30
};
