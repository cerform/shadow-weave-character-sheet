
import { Character, CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";
import { componentsToString } from "./spellProcessors";
import { getNumericModifier as baseGetNumericModifier } from "./abilityScoreUtils";

/**
 * Преобразует заклинание из базы данных в формат для персонажа
 */
export const convertSpellToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components || componentsToString({
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      materials: spell.materials
    }),
    duration: spell.duration,
    description: spell.description,
    prepared: false,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    classes: spell.classes,
    source: spell.source,
    higherLevels: spell.higherLevels
  };
};

/**
 * Считает количество подготовленных заклинаний
 */
export const countPreparedSpells = (spells: CharacterSpell[]): number => {
  return spells.filter(spell => spell.prepared && spell.level > 0).length;
};

/**
 * Группирует заклинания по уровням
 */
export const groupSpellsByLevel = (spells: CharacterSpell[]): Record<number, CharacterSpell[]> => {
  const grouped: Record<number, CharacterSpell[]> = {};
  
  spells.forEach(spell => {
    if (!grouped[spell.level]) {
      grouped[spell.level] = [];
    }
    grouped[spell.level].push(spell);
  });
  
  return grouped;
};

/**
 * Сортирует заклинания по имени и по уровню
 */
export const sortSpells = (spells: CharacterSpell[]): CharacterSpell[] => {
  return [...spells].sort((a, b) => {
    // Сначала сортируем по уровню
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    
    // Затем по имени
    return a.name.localeCompare(b.name);
  });
};

// Дополнительные утилиты и совместимость экспорта
export const getNumericModifier = baseGetNumericModifier;

export const getModifierFromAbilityScore = (score: number | undefined): number => {
  return baseGetNumericModifier(score ?? 10);
};

export const createDefaultCharacter = (): Character => {
  return {
    name: "",
    level: 1,
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skills: {},
    hitPoints: {
      current: 10,
      maximum: 10,
      temporary: 0,
    },
    currentHp: 10,
    maxHp: 10,
    tempHp: 0,
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
    deathSaves: { successes: 0, failures: 0 },
    inspiration: false,
    equipment: [],
    features: [],
    spells: [],
    spellSlots: {},
    money: { gp: 0 },
    gold: 0,
    resources: {},
    languages: [],
  };
};
