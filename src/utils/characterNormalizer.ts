import { Character } from '@/types/character';

/**
 * Нормализует характеристики персонажа, обеспечивая совместимость 
 * между разными форматами (STR/strength, DEX/dexterity и т.д.)
 */
export const normalizeCharacterAbilities = (character: Character): Character => {
  try {
    // Создаем глубокую копию персонажа без циклических ссылок
    const cleanCharacter = JSON.parse(JSON.stringify(character));
    
    // Собираем значения характеристик из всех возможных источников
    const strength = cleanCharacter.strength || 
                     cleanCharacter.abilities?.strength || 
                     cleanCharacter.abilities?.STR || 
                     cleanCharacter.stats?.strength || 10;
                     
    const dexterity = cleanCharacter.dexterity || 
                     cleanCharacter.abilities?.dexterity || 
                     cleanCharacter.abilities?.DEX || 
                     cleanCharacter.stats?.dexterity || 10;
                     
    const constitution = cleanCharacter.constitution || 
                        cleanCharacter.abilities?.constitution || 
                        cleanCharacter.abilities?.CON || 
                        cleanCharacter.stats?.constitution || 10;
                        
    const intelligence = cleanCharacter.intelligence || 
                        cleanCharacter.abilities?.intelligence || 
                        cleanCharacter.abilities?.INT || 
                        cleanCharacter.stats?.intelligence || 10;
                        
    const wisdom = cleanCharacter.wisdom || 
                  cleanCharacter.abilities?.wisdom || 
                  cleanCharacter.abilities?.WIS || 
                  cleanCharacter.stats?.wisdom || 10;
                  
    const charisma = cleanCharacter.charisma || 
                    cleanCharacter.abilities?.charisma || 
                    cleanCharacter.abilities?.CHA || 
                    cleanCharacter.stats?.charisma || 10;

    // Возвращаем нормализованного персонажа
    return {
      ...cleanCharacter,
      // Основные поля характеристик
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      
      // Объект abilities с обоими форматами
      abilities: {
        STR: strength,
        DEX: dexterity,
        CON: constitution,
        INT: intelligence,
        WIS: wisdom,
        CHA: charisma,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
      },
      
      // Объект stats
      stats: {
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
      }
    };
  } catch (error) {
    console.error('characterNormalizer: Ошибка нормализации персонажа:', error);
    // Возвращаем исходного персонажа если нормализация не удалась
    return character;
  }
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