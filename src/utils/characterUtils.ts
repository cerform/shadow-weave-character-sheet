
/**
 * Converts an ability score to its modifier
 */
export const getNumericModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Formats a modifier as a string with a + sign for positive values
 */
export const getModifierString = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Calculates the proficiency bonus based on character level
 */
export const getProficiencyBonus = (level: number): number => {
  return Math.ceil(1 + (level / 4));
};

/**
 * Gets the hit die type based on character class
 */
export const getHitDieType = (characterClass: string): string => {
  const hitDice: Record<string, string> = {
    "Варвар": "d12",
    "Воин": "d10",
    "Паладин": "d10",
    "Следопыт": "d10",
    "Монах": "d8",
    "Плут": "d8",
    "Бард": "d8",
    "Жрец": "d8",
    "Друид": "d8",
    "Колдун": "d8",
    "Чернокнижник": "d8",
    "Волшебник": "d6",
    "Чародей": "d6"
  };
  
  return hitDice[characterClass] || "d8";
};

/**
 * Gets the hit die value based on character class
 */
export const getHitDieValue = (characterClass: string): number => {
  const hitDieType = getHitDieType(characterClass);
  const dieValue = parseInt(hitDieType.substring(1), 10);
  return dieValue;
};

/**
 * Converts an ability score to its modifier with string formatting
 */
export const getModifierFromAbilityScore = (score: number): string => {
  const modifier = getNumericModifier(score);
  return getModifierString(modifier);
};

/**
 * Checks if a character class is a magical class
 */
export const isMagicClass = (characterClass: string): boolean => {
  const magicalClasses = [
    "Волшебник", "Жрец", "Друид", "Бард", "Колдун", 
    "Чернокнижник", "Чародей", "Паладин", "Следопыт"
  ];
  
  return magicalClasses.includes(characterClass);
};

/**
 * Calculates the maximum hit points for a character
 */
export const calculateMaxHitPoints = (
  level: number, 
  characterClass: string, 
  constitutionModifier: number
): number => {
  // Получаем значение кубика хитов для класса
  const hitDieValue = getHitDieValue(characterClass);
  
  // Первый уровень: максимальное значение кубика + модификатор телосложения
  let maxHp = hitDieValue + constitutionModifier;
  
  // Для каждого уровня после первого: среднее значение кубика + модификатор телосложения
  if (level > 1) {
    const averageRoll = Math.floor(hitDieValue / 2) + 1;
    maxHp += (level - 1) * (averageRoll + constitutionModifier);
  }
  
  return Math.max(1, maxHp); // Минимум 1 хит-поинт
};

/**
 * Получает значение характеристики с учетом разных форматов данных
 */
export const getAbilityScore = (character: any, abilityKey: string): number => {
  if (!character) return 10;
  
  // Проверяем новый формат abilities
  if (character.abilities) {
    // Пробуем получить по полному имени (strength, dexterity, etc)
    if (character.abilities[abilityKey] !== undefined) {
      return character.abilities[abilityKey];
    }
    
    // Пробуем получить по сокращению (STR, DEX, etc)
    const abbreviation = getAbbreviationFromKey(abilityKey);
    if (abbreviation && character.abilities[abbreviation] !== undefined) {
      return character.abilities[abbreviation];
    }
  }
  
  // Проверяем старый формат stats
  if (character.stats) {
    if (character.stats[abilityKey] !== undefined) {
      return character.stats[abilityKey];
    }
    
    const abbreviation = getAbbreviationFromKey(abilityKey);
    if (abbreviation && character.stats[abbreviation] !== undefined) {
      return character.stats[abbreviation];
    }
  }
  
  return 10; // Значение по умолчанию
};

/**
 * Преобразует полное имя характеристики в сокращение и наоборот
 */
export const getAbbreviationFromKey = (key: string): string | null => {
  const mapping: Record<string, string> = {
    'strength': 'STR',
    'dexterity': 'DEX',
    'constitution': 'CON',
    'intelligence': 'INT',
    'wisdom': 'WIS',
    'charisma': 'CHA',
    'STR': 'strength',
    'DEX': 'dexterity',
    'CON': 'constitution',
    'INT': 'intelligence',
    'WIS': 'wisdom',
    'CHA': 'charisma'
  };
  
  return mapping[key] || null;
};

/**
 * Преобразует характеристики из одного формата в другой
 */
export const normalizeAbilities = (abilities: any): any => {
  if (!abilities) return null;
  
  // Если есть STR, DEX и т.д., преобразуем в полные имена
  if (abilities.STR !== undefined) {
    return {
      strength: abilities.STR,
      dexterity: abilities.DEX,
      constitution: abilities.CON,
      intelligence: abilities.INT,
      wisdom: abilities.WIS,
      charisma: abilities.CHA,
      // Сохраняем оригинальные для обратной совместимости
      STR: abilities.STR,
      DEX: abilities.DEX,
      CON: abilities.CON,
      INT: abilities.INT,
      WIS: abilities.WIS,
      CHA: abilities.CHA
    };
  }
  
  // Если есть strength, dexterity и т.д., преобразуем в сокращения
  if (abilities.strength !== undefined) {
    return {
      STR: abilities.strength,
      DEX: abilities.dexterity,
      CON: abilities.constitution,
      INT: abilities.intelligence,
      WIS: abilities.wisdom,
      CHA: abilities.charisma,
      // Сохраняем оригинальные для обратной совместимости
      strength: abilities.strength,
      dexterity: abilities.dexterity,
      constitution: abilities.constitution,
      intelligence: abilities.intelligence,
      wisdom: abilities.wisdom,
      charisma: abilities.charisma
    };
  }
  
  return abilities; // Возвращаем как есть, если формат неизвестен
};

/**
 * Gets character's constitution modifier
 */
export const getConstitutionModifier = (character: any): number => {
  if (!character || !character.abilities) return 0;
  
  // Try to get from full name first
  if (character.abilities.constitution !== undefined) {
    return getNumericModifier(character.abilities.constitution);
  }
  
  // Try abbreviation
  if (character.abilities.CON !== undefined) {
    return getNumericModifier(character.abilities.CON);
  }
  
  // Try old stats format
  if (character.stats) {
    if (character.stats.constitution !== undefined) {
      return getNumericModifier(character.stats.constitution);
    }
    if (character.stats.CON !== undefined) {
      return getNumericModifier(character.stats.CON);
    }
  }
  
  return 0;
};
