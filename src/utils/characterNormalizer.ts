import { Character } from '@/types/character';

/**
 * Нормализует характеристики персонажа, обеспечивая совместимость 
 * между разными форматами (STR/strength, DEX/dexterity и т.д.)
 */
export const normalizeCharacterAbilities = (character: Character): Character => {
  // Собираем значения характеристик из всех возможных источников
  const strength = character.strength || 
                  character.abilities?.strength || 
                  character.abilities?.STR || 
                  character.stats?.strength || 10;
                  
  const dexterity = character.dexterity || 
                   character.abilities?.dexterity || 
                   character.abilities?.DEX || 
                   character.stats?.dexterity || 10;
                   
  const constitution = character.constitution || 
                      character.abilities?.constitution || 
                      character.abilities?.CON || 
                      character.stats?.constitution || 10;
                      
  const intelligence = character.intelligence || 
                      character.abilities?.intelligence || 
                      character.abilities?.INT || 
                      character.stats?.intelligence || 10;
                      
  const wisdom = character.wisdom || 
                character.abilities?.wisdom || 
                character.abilities?.WIS || 
                character.stats?.wisdom || 10;
                
  const charisma = character.charisma || 
                  character.abilities?.charisma || 
                  character.abilities?.CHA || 
                  character.stats?.charisma || 10;

  // Возвращаем нормализованного персонажа со всеми форматами
  return {
    ...character,
    // Основные поля характеристик
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
    
    // Объект abilities с обоими форматами
    abilities: {
      ...character.abilities,
      // Формат с сокращениями
      STR: strength,
      DEX: dexterity,
      CON: constitution,
      INT: intelligence,
      WIS: wisdom,
      CHA: charisma,
      // Полные названия
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    },
    
    // Объект stats
    stats: {
      ...character.stats,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    }
  };
};

/**
 * Получает значение характеристики из персонажа, 
 * проверяя все возможные источники
 */
export const getAbilityScore = (character: Character, ability: string): number => {
  const abilityMap: Record<string, string[]> = {
    strength: ['strength', 'STR'],
    dexterity: ['dexterity', 'DEX'],
    constitution: ['constitution', 'CON'],
    intelligence: ['intelligence', 'INT'],
    wisdom: ['wisdom', 'WIS'],
    charisma: ['charisma', 'CHA']
  };

  const possibleKeys = abilityMap[ability] || [ability];
  
  // Проверяем основные поля
  for (const key of possibleKeys) {
    if (character[key as keyof Character] && typeof character[key as keyof Character] === 'number') {
      return character[key as keyof Character] as number;
    }
  }
  
  // Проверяем abilities
  if (character.abilities) {
    for (const key of possibleKeys) {
      if (character.abilities[key] && typeof character.abilities[key] === 'number') {
        return character.abilities[key];
      }
    }
  }
  
  // Проверяем stats
  if (character.stats) {
    for (const key of possibleKeys) {
      if (character.stats[key as keyof typeof character.stats] && 
          typeof character.stats[key as keyof typeof character.stats] === 'number') {
        return character.stats[key as keyof typeof character.stats] as number;
      }
    }
  }
  
  // Значение по умолчанию
  return 10;
};

/**
 * Обновляет характеристику персонажа во всех форматах
 */
export const updateAbilityScore = (character: Character, ability: string, value: number): Character => {
  const abilityMap: Record<string, string> = {
    strength: 'STR',
    dexterity: 'DEX', 
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA'
  };

  const shortForm = abilityMap[ability];
  
  return {
    ...character,
    // Обновляем основное поле
    [ability]: value,
    
    // Обновляем abilities
    abilities: {
      ...character.abilities,
      [ability]: value,
      ...(shortForm && { [shortForm]: value })
    },
    
    // Обновляем stats
    stats: {
      ...character.stats,
      [ability]: value
    }
  };
};