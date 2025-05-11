
import { Character, CharacterSpell } from '@/types/character';
import { slugify } from './stringUtils';

/**
 * Определяет базовую характеристику для заклинаний класса
 */
export const getDefaultCastingAbility = (characterClass: string): 'intelligence' | 'wisdom' | 'charisma' => {
  const classLower = characterClass?.toLowerCase() || '';
  
  if (['волшебник', 'wizard', 'artificer', 'артифайсер'].includes(classLower)) {
    return 'intelligence';
  } else if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(classLower)) {
    return 'wisdom';
  } else if (['бард', 'bard', 'чародей', 'sorcerer', 'колдун', 'warlock', 'паладин', 'paladin'].includes(classLower)) {
    return 'charisma';
  }
  
  // По умолчанию интеллект
  return 'intelligence';
};

/**
 * Рассчитывает модификатор базовой характеристики заклинаний
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  const ability = getDefaultCastingAbility(character.class);
  
  if (ability === 'intelligence') {
    return Math.floor((Number(character.abilities.INT || character.abilities.intelligence) - 10) / 2);
  } else if (ability === 'wisdom') {
    return Math.floor((Number(character.abilities.WIS || character.abilities.wisdom) - 10) / 2);
  } else {
    return Math.floor((Number(character.abilities.CHA || character.abilities.charisma) - 10) / 2);
  }
};

/**
 * Рассчитывает СЛ спасброска от заклинаний
 */
export const calculateSpellSaveDC = (character: Character): number => {
  const abilityMod = getSpellcastingAbilityModifier(character);
  return 8 + abilityMod + (character.proficiencyBonus || 2);
};

/**
 * Рассчитывает бонус атаки заклинанием
 */
export const calculateSpellAttackBonus = (character: Character): number => {
  const abilityMod = getSpellcastingAbilityModifier(character);
  return abilityMod + (character.proficiencyBonus || 2);
};

/**
 * Нормализует список заклинаний персонажа
 */
export const normalizeSpells = (spells: any[] | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${slugify(spell)}`,
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    } else if (typeof spell === 'object' && spell !== null) {
      return {
        ...spell,
        id: spell.id || `spell-${slugify(spell.name)}`,
        school: spell.school || 'Универсальная'
      };
    }
    
    // Если элемент не строка и не объект, возвращаем заглушку
    return {
      id: `spell-unknown-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Неизвестное заклинание',
      level: 0,
      school: 'Универсальная'
    };
  });
};

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spells) return true;
  
  const preparedSpells = normalizeSpells(character.spells).filter(spell => spell.prepared);
  const limit = getPreparedSpellsLimit(character);
  
  return preparedSpells.length < limit;
};

/**
 * Определяет максимальный уровень доступных заклинаний
 */
export const getMaxSpellLevel = (character: Character): number => {
  const level = character.level || 1;
  
  if (level === 1) return 1;
  if (level < 5) return 2;
  if (level < 9) return 3;
  if (level < 13) return 4;
  if (level < 17) return 5;
  if (level < 19) return 6;
  return 7; // 19-20 уровень
};

/**
 * Определяет максимальное количество подготовленных заклинаний
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  const spellAbility = getDefaultCastingAbility(character.class);
  let abilityMod = 0;
  
  if (spellAbility === 'intelligence') {
    abilityMod = Math.floor((Number(character.abilities.INT || character.abilities.intelligence) - 10) / 2);
  } else if (spellAbility === 'wisdom') {
    abilityMod = Math.floor((Number(character.abilities.WIS || character.abilities.wisdom) - 10) / 2);
  } else if (spellAbility === 'charisma') {
    abilityMod = Math.floor((Number(character.abilities.CHA || character.abilities.charisma) - 10) / 2);
  }
  
  return Math.max(1, abilityMod + (character.level || 1));
};

/**
 * Фильтрует заклинания по классу и уровню
 */
export const filterSpellsByClassAndLevel = (allSpells: CharacterSpell[], characterClass: string, maxLevel: number): CharacterSpell[] => {
  const classLower = characterClass?.toLowerCase() || '';
  
  return allSpells.filter(spell => {
    // Проверка уровня заклинания
    if (spell.level > maxLevel) return false;
    
    // Проверка класса
    if (!spell.classes || !Array.isArray(spell.classes)) return false;
    
    return spell.classes.some(spellClass => 
      spellClass.toLowerCase() === classLower
    );
  });
};
