
/**
 * Calculates the proficiency bonus based on character level.
 * @param {number} level - The character's level.
 * @returns {number} The proficiency bonus.
 */
export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

/**
 * Get maximum spell slots per level based on character level and class.
 * @param {number} characterLevel - Character level
 * @param {string} characterClass - Character class
 * @param {number} spellLevel - Spell level to check
 * @returns {number} Number of spell slots available
 */
export const getSpellSlots = (
  characterLevel: number,
  characterClass: string,
  spellLevel: number
): number => {
  // Default case returns 0
  if (spellLevel < 1 || spellLevel > 9 || characterLevel < 1) return 0;
  
  // Simplification for half-casters like Paladins and Rangers
  const effectiveLevel = ['Паладин', 'Следопыт', 'Paladin', 'Ranger'].includes(characterClass)
    ? Math.floor(characterLevel / 2)
    : characterLevel;
  
  // Basic spell slot progression for full casters
  const spellSlotTable: Record<number, number[]> = {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
    4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
  };
  
  // For characters above level 20 (epic levels)
  const level = Math.min(20, effectiveLevel);
  
  // Return the number of slots for the given spell level
  return spellSlotTable[level] ? (spellSlotTable[level][spellLevel - 1] || 0) : 0;
};

/**
 * Determine whether a specific character level grants an Ability Score Improvement
 * @param {number} level - The character level
 * @param {string} characterClass - The character's class
 * @returns {boolean} Whether this level grants an ASI
 */
export const isAbilityScoreImprovementLevel = (level: number, characterClass: string): boolean => {
  const standardASILevels = [4, 8, 12, 16, 19];
  const fighterASILevels = [4, 6, 8, 12, 14, 16, 19];
  const rogueASILevels = [4, 8, 10, 12, 16, 19];
  
  if (characterClass === 'Воин' || characterClass === 'Fighter') {
    return fighterASILevels.includes(level);
  } else if (characterClass === 'Плут' || characterClass === 'Rogue') {
    return rogueASILevels.includes(level);
  } else {
    return standardASILevels.includes(level);
  }
};

/**
 * Calculate the effective caster level for multiclass spellcasting
 * @param {Array<{class: string, level: number}>} classes - Array of character classes
 * @returns {number} - Effective caster level
 */
export const calculateMulticlassCasterLevel = (classes: Array<{class: string, level: number}>): number => {
  let totalLevel = 0;
  
  for (const cls of classes) {
    const className = cls.class.toLowerCase();
    const level = cls.level;
    
    // Full casters
    if (['волшебник', 'wizard', 'чародей', 'sorcerer', 'бард', 'bard', 'жрец', 'cleric', 'друид', 'druid'].includes(className)) {
      totalLevel += level;
    }
    // Half casters
    else if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(className)) {
      totalLevel += Math.floor(level / 2);
    }
    // Third casters
    else if (['рыцарь-маг', 'eldritch knight', 'мистический ловкач', 'arcane trickster'].includes(className)) {
      totalLevel += Math.floor(level / 3);
    }
  }
  
  return totalLevel;
};
