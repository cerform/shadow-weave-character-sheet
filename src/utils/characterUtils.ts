
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
