
/**
 * Converts an ability score to its modifier
 */
export const getNumericModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
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
export const isMagicClass = (className: string): boolean => {
  const magicClasses = [
    'Бард', 'Волшебник', 'Жрец', 'Друид', 'Колдун', 'Паладин', 'Следопыт', 'Чародей',
    'Bard', 'Wizard', 'Cleric', 'Druid', 'Warlock', 'Paladin', 'Ranger', 'Sorcerer'
  ];
  
  return magicClasses.includes(className);
};

/**
 * Calculates the maximum hit points for a character based on class, level, and constitution modifier
 */
export const calculateMaxHitPoints = (
  level: number,
  characterClass: string,
  constitutionModifier: number
): number => {
  // Get the hit die value based on character class
  const hitDie = getHitDieForClass(characterClass);
  
  // For first level, we use maximum hit die value + constitution modifier
  let maxHp = hitDie + constitutionModifier;
  
  // For levels 2+, we add average hit die roll (hitDie/2 + 1) + constitution modifier per level
  if (level > 1) {
    const averageHitDieRoll = Math.floor(hitDie / 2) + 1;
    maxHp += (averageHitDieRoll + constitutionModifier) * (level - 1);
  }
  
  // Minimum HP is 1
  return Math.max(1, maxHp);
};

/**
 * Returns the hit die value for a given class
 */
export const getHitDieForClass = (characterClass: string): number => {
  const hitDiceByClass: Record<string, number> = {
    'Варвар': 12,
    'Воин': 10,
    'Паладин': 10,
    'Следопыт': 10,
    'Монах': 8,
    'Плут': 8,
    'Друид': 8,
    'Бард': 8,
    'Жрец': 8,
    'Колдун': 8,
    'Волшебник': 6,
    'Чародей': 6,
    // English class names
    'Barbarian': 12,
    'Fighter': 10,
    'Paladin': 10,
    'Ranger': 10,
    'Monk': 8,
    'Rogue': 8,
    'Druid': 8,
    'Bard': 8,
    'Cleric': 8,
    'Warlock': 8,
    'Wizard': 6,
    'Sorcerer': 6,
  };

  return hitDiceByClass[characterClass] || 8; // Default to d8 if class not found
};

/**
 * Gets the ability score from a character object
 */
export const getAbilityScore = (character: any, abilityKey: string): number => {
  if (!character) return 10;
  
  // Check for new abilities format
  if (character.abilities) {
    if (character.abilities[abilityKey] !== undefined) {
      return character.abilities[abilityKey];
    }
    
    const abbreviation = getAbbreviationFromKey(abilityKey);
    if (abbreviation && character.abilities[abbreviation] !== undefined) {
      return character.abilities[abbreviation];
    }
  }
  
  // Check for old stats format
  if (character.stats) {
    if (character.stats[abilityKey] !== undefined) {
      return character.stats[abilityKey];
    }
    
    const abbreviation = getAbbreviationFromKey(abilityKey);
    if (abbreviation && character.stats[abbreviation] !== undefined) {
      return character.stats[abbreviation];
    }
  }
  
  return 10; // Default value
};

/**
 * Converts a full ability name to its abbreviation
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
 * Converts abilities from one format to another
 */
export const normalizeAbilities = (abilities: any): any => {
  if (!abilities) return null;
  
  // If there are STR, DEX, etc., convert to full names
  if (abilities.STR !== undefined) {
    return {
      strength: abilities.STR,
      dexterity: abilities.DEX,
      constitution: abilities.CON,
      intelligence: abilities.INT,
      wisdom: abilities.WIS,
      charisma: abilities.CHA,
      // Save original for backward compatibility
      STR: abilities.STR,
      DEX: abilities.DEX,
      CON: abilities.CON,
      INT: abilities.INT,
      WIS: abilities.WIS,
      CHA: abilities.CHA
    };
  }
  
  // If there are strength, dexterity, etc., convert to abbreviations
  if (abilities.strength !== undefined) {
    return {
      STR: abilities.strength,
      DEX: abilities.dexterity,
      CON: abilities.constitution,
      INT: abilities.intelligence,
      WIS: abilities.wisdom,
      CHA: abilities.charisma,
      // Save original for backward compatibility
      strength: abilities.strength,
      dexterity: abilities.dexterity,
      constitution: abilities.constitution,
      intelligence: abilities.intelligence,
      wisdom: abilities.wisdom,
      charisma: abilities.charisma
    };
  }
  
  return abilities; // Return as is if format is unknown
};

/**
 * Gets the constitution modifier from a character object
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
