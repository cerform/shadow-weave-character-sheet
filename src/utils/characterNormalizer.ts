import { Character } from '@/types/character';

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface Skills {
  [key: string]: {
    ability: string;
    proficient: boolean;
    bonus?: number;
  };
}

interface Money {
  cp?: number;
  sp?: number;
  ep?: number;
  gp?: number;
  pp?: number;
}

/**
 * Нормализует объект персонажа, заполняя отсутствующие поля значениями по умолчанию.
 * @param character - Объект персонажа для нормализации.
 * @returns - Нормализованный объект персонажа или null, если входной объект равен null.
 */
export const normalizeCharacter = (character: Character) => {
  if (!character) return null;
  
  // Ensure required objects exist
  const normalizedChar: Character = {
    ...character,
    abilities: character.abilities || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    skills: character.skills || {},
    equipment: character.equipment || [],
    money: character.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    level: character.level || 1,
    maxHp: character.maxHp || 1,
    currentHp: character.currentHp || 1,
    tempHp: character.tempHp || 0,
    armorClass: character.armorClass || 10,
    initiative: character.initiative || 0,
    speed: character.speed || 30,
    conditions: character.conditions || [],
    inspiration: character.inspiration || false,
    deathSaves: character.deathSaves || {
      successes: 0,
      failures: 0
    },
    spellSlots: character.spellSlots || {},
    spells: character.spells || [],
    notes: character.notes || '',
    characterAppearance: character.characterAppearance || '',
    characterBackstory: character.characterBackstory || '',
    alignment: character.alignment || 'neutral',
    raceFeatures: character.raceFeatures || [],
    classFeatures: character.classFeatures || [],
    backgroundFeatures: character.backgroundFeatures || [],
    feats: character.feats || [],
    additionalClasses: character.additionalClasses || [],
    preparedSpellsLimit: character.preparedSpellsLimit || 0
  };
  
  return normalizedChar;
};

/**
 * Проверяет, является ли переданный объект валидным объектом способностей.
 * @param obj - Объект для проверки.
 * @returns - True, если объект является валидным объектом способностей, иначе false.
 */
function isValidAbilityScores(obj: any): obj is AbilityScores {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.strength === 'number' &&
    typeof obj.dexterity === 'number' &&
    typeof obj.constitution === 'number' &&
    typeof obj.intelligence === 'number' &&
    typeof obj.wisdom === 'number' &&
    typeof obj.charisma === 'number'
  );
}

/**
 * Проверяет, является ли переданный объект валидным объектом навыков.
 * @param obj - Объект для проверки.
 * @returns - True, если объект является валидным объектом навыков, иначе false.
 */
function isValidSkills(obj: any): obj is Skills {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.values(obj).every(
      (skill) =>
        typeof skill === 'object' &&
        skill !== null &&
        typeof skill.ability === 'string' &&
        typeof skill.proficient === 'boolean'
    )
  );
}

/**
 * Проверяет, является ли переданный объект валидным объектом денег.
 * @param obj - Объект для проверки.
 * @returns - True, если объект является валидным объектом денег, иначе false.
 */
function isValidMoney(obj: any): obj is Money {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (obj.cp === undefined || typeof obj.cp === 'number') &&
    (obj.sp === undefined || typeof obj.sp === 'number') &&
    (obj.ep === undefined || typeof obj.ep === 'number') &&
    (obj.gp === undefined || typeof obj.gp === 'number') &&
    (obj.pp === undefined || typeof obj.pp === 'number')
  );
}
