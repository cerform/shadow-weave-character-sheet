
import { Character } from '@/types/character';

/**
 * Вычисляет бонус мастерства на основе уровня
 */
export const calculateProficiencyBonus = (level: number): number => {
  if (level < 1) return 2;
  return Math.floor((level - 1) / 4) + 2;
};

/**
 * Получает модификатор характеристики на основе значения
 */
export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Альтернативное имя для getAbilityModifier для обратной совместимости
 */
export const getModifierFromAbilityScore = getAbilityModifier;

/**
 * Альтернативное имя для getAbilityModifier для обратной совместимости
 */
export const getNumericModifier = getAbilityModifier;

/**
 * Создаёт персонажа по умолчанию
 */
export const createDefaultCharacter = (): Character => {
  const id = Date.now().toString();
  
  return {
    id,
    name: 'Новый персонаж',
    race: '',
    class: '',
    level: 1,
    experience: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    maxHp: 10,
    currentHp: 10,
    proficiencyBonus: 2,
    skillProficiencies: [],
    expertise: [],
    savingThrowProficiencies: [],
    skills: {},
    spells: [],
    features: []
  };
};

/**
 * Получает модификатор характеристики персонажа
 */
export const getCharacterAbilityModifier = (character: Character, ability: string): number => {
  const abilityScore = character[ability.toLowerCase() as keyof Character] as number || 10;
  return getAbilityModifier(abilityScore);
};

/**
 * Вычисляет бонус атаки оружия
 */
export const calculateAttackBonus = (
  character: Character, 
  weaponType: 'melee' | 'ranged' | 'finesse' | 'spell', 
  isProficient: boolean = false
): number => {
  let abilityModifier = 0;
  
  if (weaponType === 'melee') {
    abilityModifier = getAbilityModifier(character.strength || 10);
  } else if (weaponType === 'ranged') {
    abilityModifier = getAbilityModifier(character.dexterity || 10);
  } else if (weaponType === 'finesse') {
    // Для finesse weapons используем лучший модификатор
    const strMod = getAbilityModifier(character.strength || 10);
    const dexMod = getAbilityModifier(character.dexterity || 10);
    abilityModifier = Math.max(strMod, dexMod);
  } else if (weaponType === 'spell') {
    // Для заклинаний используем основную характеристику заклинателя
    const classLower = character.class?.toLowerCase() || '';
    
    if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
      abilityModifier = getAbilityModifier(character.wisdom || 10);
    } else if (['волшебник', 'wizard'].includes(classLower)) {
      abilityModifier = getAbilityModifier(character.intelligence || 10);
    } else {
      abilityModifier = getAbilityModifier(character.charisma || 10);
    }
  }
  
  const profBonus = isProficient ? calculateProficiencyBonus(character.level || 1) : 0;
  return abilityModifier + profBonus;
};

/**
 * Вычисляет модификатор характеристики
 * Это функция-алиас для getAbilityModifier для обеспечения совместимости
 */
export const calculateModifier = (score: number): number => {
  return getAbilityModifier(score);
};
