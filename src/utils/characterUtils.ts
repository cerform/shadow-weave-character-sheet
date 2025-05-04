
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
export const getHitDieType = (characterClass: string): "d4" | "d6" | "d8" | "d10" | "d12" => {
  const hitDice: Record<string, "d4" | "d6" | "d8" | "d10" | "d12"> = {
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
