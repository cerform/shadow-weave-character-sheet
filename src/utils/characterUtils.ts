
/**
 * Получение модификатора из значения характеристики
 * @param score Значение характеристики (от 1 до 30)
 * @returns Строка модификатора с + или - (например, "+3" или "-1")
 */
export const getModifierFromAbilityScore = (score: number): string => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

/**
 * Получение числового значения модификатора из значения характеристики
 * @param score Значение характеристики (от 1 до 30)
 * @returns Числовое значение модификатора (например, 3 или -1)
 */
export const getNumericModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Расчет максимальных хитов персонажа на основе класса, уровня и телосложения
 * @param className Название класса
 * @param level Уровень персонажа
 * @param constitutionScore Значение характеристики Телосложение
 * @returns Количество максимальных хитов
 */
export const calculateMaxHitPoints = (className: string, level: number, constitutionScore: number): number => {
  // Базовое значение в зависимости от класса
  const baseHpByClass: {[key: string]: number} = {
    "Варвар": 12,
    "Воин": 10,
    "Паладин": 10,
    "Следопыт": 10,
    "Монах": 8,
    "Плут": 8,
    "Бард": 8,
    "Жрец": 8,
    "Друид": 8,
    "Волшебник": 6,
    "Чародей": 6,
    "Колдун": 8
  };
  
  const baseHp = baseHpByClass[className] || 8; // По умолчанию 8, если класс не найден
  const constitutionMod = getNumericModifier(constitutionScore);
  
  // HP первого уровня = максимум хитов кости + модификатор телосложения
  let maxHp = baseHp + constitutionMod;
  
  // Для каждого уровня выше первого добавляем среднее значение кости хитов + модификатор телосложения
  if (level > 1) {
    maxHp += ((baseHp / 2 + 1) + constitutionMod) * (level - 1);
  }
  
  return Math.max(1, Math.round(maxHp)); // Минимум 1 хит
};

/**
 * Определяет, является ли класс магическим
 * @param className Название класса
 * @returns true если класс является заклинателем
 */
export const isMagicClass = (className: string): boolean => {
  const magicClasses = [
    "Бард", "Волшебник", "Жрец", "Друид", "Чародей", "Колдун", "Чернокнижник",
    "Паладин", "Следопыт"
  ];
  
  return magicClasses.includes(className);
};
